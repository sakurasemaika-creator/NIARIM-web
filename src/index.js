/**
 * NIARIM公式サイト Workerエントリポイント
 *
 * API処理に加え、静的HTMLを公開サイトの正規URL・選択言語へ正規化して配信する。
 * 翻訳辞書由来のSEO metadataはWrangler custom buildで生成するため、Web本文と
 * title/descriptionの文言が別管理にならない。
 */
import { SEO_I18N, SEO_LANGS } from "./generated/seo-i18n.js";
import { robotsTxt, sitemapXml } from "./seo.js";
import { handleContact } from "./contact.js";
import { jsonResponse } from "./utils.js";

const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data:",
  "connect-src 'self'",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": CSP,
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Permissions-Policy":
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  "Cross-Origin-Opener-Policy": "same-origin",
};

const PAGE_KEYS = new Map([
  ["/", "home"],
  ["/index.html", "home"],
  ["/about/", "about"],
  ["/community/", "community"],
  ["/contact/", "contact"],
  ["/faq/", "faq"],
  ["/features/", "features"],
  ["/help/", "help"],
  ["/news/", "news"],
  ["/premium/", "premium"],
  ["/privacy/", "privacy"],
  ["/terms/", "terms"],
]);

const OG_LOCALES = {
  ja: "ja_JP",
  en: "en_US",
  "zh-Hans": "zh_CN",
  "zh-Hant": "zh_TW",
  ko: "ko_KR",
  fr: "fr_FR",
  es: "es_ES",
};

const COMMON_STYLE_PRELOADS = [
  "/css/common-base.css",
  "/css/reference-polish.css",
  "/css/responsive-foundation.css",
];

const MOCK_STYLE_PRELOADS = [
  "/css/screen-mock-accuracy-base.css",
  "/css/visual-finish.css",
  "/css/screen-mock-fidelity.css",
];

const HOME_REPLACED_MEDIA_SELECTORS = [
  '#features .feature-row[data-mock-theme="row1"] .feature-media',
  '#features .feature-row[data-mock-theme="row2"] .feature-media',
  '#features .feature-row[data-mock-theme="row3"] .feature-media',
  '#features .feature-row[data-mock-theme="row4"] .feature-media',
  '#features .feature-row[data-mock-theme="row5"] .feature-media',
];

const FEATURES_REPLACED_MOCK_SELECTORS = [
  "#drawing > .feature-diagram",
  "#animation > .feature-diagram",
  "#editing > .feature-diagram",
  "#advanced > .feature-diagram",
  "#audio > .feature-diagram",
  "#save > .feature-diagram",
  "#workspace > .feature-diagram",
  '#workspace [data-mock-screen="theme"]',
  "#export > .feature-diagram",
];

function siteOrigin(request, env) {
  return String(env.SITE_ORIGIN || new URL(request.url).origin).replace(
    /\/$/,
    "",
  );
}

function selectedLang(request) {
  const raw = new URL(request.url).searchParams.get("lang");
  return SEO_LANGS.includes(raw) ? raw : "ja";
}

function normalizedPagePath(pathname) {
  const value = String(pathname || "/");
  return value.endsWith("/index.html")
    ? value.slice(0, -"index.html".length)
    : value;
}

function canonicalUrl(request, env, lang = selectedLang(request)) {
  const requestUrl = new URL(request.url);
  const pathname = normalizedPagePath(requestUrl.pathname);
  const url = new URL(`${siteOrigin(request, env)}${pathname}`);
  if (lang !== "ja") url.searchParams.set("lang", lang);
  return url.toString();
}

function absoluteAssetUrl(value, env, request) {
  if (!value || !value.startsWith("/")) return value;
  return `${siteOrigin(request, env)}${value}`;
}

function pageMetadata(request) {
  const pathname = normalizedPagePath(new URL(request.url).pathname);
  const page = PAGE_KEYS.get(pathname);
  if (!page) return null;
  const lang = selectedLang(request);
  const table = SEO_I18N[lang] || SEO_I18N.ja || {};
  const fallback = SEO_I18N.ja || {};
  const titleKey = `meta.${page}.title`;
  const descriptionKey = `meta.${page}.description`;
  return {
    page,
    lang,
    title: table[titleKey] || fallback[titleKey] || "NIARIM",
    description: table[descriptionKey] || fallback[descriptionKey] || "",
  };
}

function performanceHeadMarkup(page) {
  const hasScreenMocks = page === "home" || page === "features";
  const preloads = hasScreenMocks
    ? COMMON_STYLE_PRELOADS.concat(MOCK_STYLE_PRELOADS)
    : COMMON_STYLE_PRELOADS;
  const preloadMarkup = preloads
    .map((href) => `<link rel="preload" href="${href}" as="style">`)
    .join("");
  const runtime = hasScreenMocks ? "/js/main.js" : "/js/common-ui.js";
  const scriptPreloads =
    `<link rel="preload" href="/js/generated/i18n-${page}.js" as="script">` +
    `<link rel="preload" href="${runtime}" as="script">`;

  const globalLayers =
    '<link rel="stylesheet" href="/css/polish.css" data-niarim-polish>' +
    '<link rel="stylesheet" href="/css/responsive-consistency.css" data-niarim-responsive-consistency>' +
    '<link rel="stylesheet" href="/css/line-break.css" data-niarim-line-break>';

  if (!hasScreenMocks) {
    return (
      preloadMarkup +
      scriptPreloads +
      globalLayers +
      '<link data-niarim-screen-mock-accuracy>' +
      '<link data-niarim-mock-palette>' +
      '<link data-niarim-mock-layout>'
    );
  }

  return (
    preloadMarkup +
    scriptPreloads +
    globalLayers +
    '<link rel="stylesheet" href="/css/screen-mock-accuracy.css" data-niarim-screen-mock-accuracy>' +
    '<link rel="stylesheet" href="/css/screen-mock-palette.css" data-niarim-mock-palette>' +
    '<link rel="stylesheet" href="/css/screen-mock-layout-fix.css" data-niarim-mock-layout>'
  );
}

function structuredData(request, env, metadata) {
  if (!metadata) return null;
  const origin = siteOrigin(request, env);
  const canonical = canonicalUrl(request, env, metadata.lang);
  const organizationId = `${origin}/#organization`;
  const websiteId = `${origin}/#website`;
  const graph = [
    {
      "@type": "WebPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: metadata.title,
      description: metadata.description,
      inLanguage: metadata.lang,
      isPartOf: { "@id": websiteId },
      about: { "@id": `${origin}/#software` },
      primaryImageOfPage: { "@id": `${origin}/#primaryimage` },
    },
  ];

  if (metadata.page === "home") {
    graph.unshift(
      {
        "@type": "Organization",
        "@id": organizationId,
        name: "NIARIM",
        url: `${origin}/`,
        logo: {
          "@type": "ImageObject",
          url: `${origin}/assets/images/logo/app_logo.svg`,
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: `${origin}/`,
        name: "NIARIM",
        publisher: { "@id": organizationId },
        inLanguage: SEO_LANGS,
      },
      {
        "@type": "ImageObject",
        "@id": `${origin}/#primaryimage`,
        url: `${origin}/assets/images/ogp-default.png`,
        contentUrl: `${origin}/assets/images/ogp-default.png`,
        representativeOfPage: true,
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${origin}/#software`,
        name: "NIARIM",
        alternateName: "ニアリム",
        url: `${origin}/`,
        applicationCategory: "MultimediaApplication",
        applicationSubCategory: "Animation creation",
        operatingSystem: "Android, iOS",
        description: metadata.description,
        image: { "@id": `${origin}/#primaryimage` },
        publisher: { "@id": organizationId },
        inLanguage: SEO_LANGS,
        featureList: [
          "Hand-drawn animation",
          "Keyframe motion animation",
          "Stop-motion animation",
          "Drawing and layers",
          "Timeline editing",
          "Audio editing",
          "Animation export",
          "Community作品広場",
        ],
      },
    );
  }

  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
}

function hreflangMarkup(request, env) {
  const links = SEO_LANGS.map((lang) => {
    const href = canonicalUrl(request, env, lang);
    return `<link rel="alternate" hreflang="${lang}" href="${href}">`;
  });
  links.push(
    `<link rel="alternate" hreflang="x-default" href="${canonicalUrl(request, env, "ja")}">`,
  );
  return links.join("");
}

function registerDiscardedMockContent(rewriter, page) {
  if (page === "home") {
    for (const selector of HOME_REPLACED_MEDIA_SELECTORS) {
      rewriter.on(selector, {
        element(element) {
          element.setInnerContent("");
        },
      });
    }
  }

  if (page === "features") {
    for (const selector of FEATURES_REPLACED_MOCK_SELECTORS) {
      rewriter.on(selector, {
        element(element) {
          element.setInnerContent("");
        },
      });
    }
  }

  return rewriter;
}

function rewriteSeoHtml(response, request, env) {
  const type = response.headers.get("content-type") || "";
  if (response.status !== 200 || !type.includes("text/html")) return response;

  const metadata = pageMetadata(request);
  if (!metadata) return response;

  const canonical = canonicalUrl(request, env, metadata.lang);
  const schema = structuredData(request, env, metadata);
  const alternates = hreflangMarkup(request, env);
  const headPerformance = performanceHeadMarkup(metadata.page);
  const useLightweightRuntime =
    metadata.page !== "home" && metadata.page !== "features";
  const ogLocale = OG_LOCALES[metadata.lang] || OG_LOCALES.ja;
  const alternateLocales = SEO_LANGS.filter((lang) => lang !== metadata.lang)
    .map(
      (lang) =>
        `<meta property="og:locale:alternate" content="${OG_LOCALES[lang]}">`,
    )
    .join("");
  let pageBundleInjected = false;

  const rewriter = new HTMLRewriter()
    .on("html", {
      element(element) {
        element.setAttribute("lang", metadata.lang);
      },
    })
    .on("title", {
      text(text) {
        if (text.lastInTextNode) text.replace(metadata.title);
        else text.remove();
      },
    })
    .on('meta[name="description"]', {
      element(element) {
        element.setAttribute("content", metadata.description);
      },
    })
    .on('link[rel="canonical"]', {
      element(element) {
        element.setAttribute("href", canonical);
      },
    })
    .on('meta[property="og:title"], meta[name="twitter:title"]', {
      element(element) {
        element.setAttribute("content", metadata.title);
      },
    })
    .on('meta[property="og:description"], meta[name="twitter:description"]', {
      element(element) {
        element.setAttribute("content", metadata.description);
      },
    })
    .on('meta[property="og:url"]', {
      element(element) {
        element.setAttribute("content", canonical);
      },
    })
    .on('meta[property="og:locale"]', {
      element(element) {
        element.setAttribute("content", ogLocale);
      },
    })
    .on('meta[property="og:image"], meta[name="twitter:image"]', {
      element(element) {
        const value = element.getAttribute("content");
        const absolute = absoluteAssetUrl(value, env, request);
        if (absolute) element.setAttribute("content", absolute);
      },
    })
    .on('meta[name="robots"]', {
      element(element) {
        element.setAttribute(
          "content",
          "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
        );
      },
    })
    .on("script[src]", {
      element(element) {
        const src = element.getAttribute("src") || "";
        if (/^\/js\/i18n-dict(?:-[\w-]+)?\.js$/.test(src)) {
          if (!pageBundleInjected) {
            element.setAttribute(
              "src",
              `/js/generated/i18n-${metadata.page}.js`,
            );
            pageBundleInjected = true;
          } else {
            element.remove();
          }
          return;
        }
        if (useLightweightRuntime && src === "/js/main.js") {
          element.setAttribute("src", "/js/common-ui.js");
        }
      },
    })
    .on("head", {
      element(element) {
        element.append(headPerformance, { html: true });
        element.append('<script src="/js/lang-query-bridge.js"></script>', {
          html: true,
        });
        element.append(alternates, { html: true });
        element.append(alternateLocales, { html: true });
        if (schema) {
          element.append(
            `<script type="application/ld+json">${schema.replace(/</g, "\\u003c")}</script>`,
            { html: true },
          );
        }
      },
    });

  registerDiscardedMockContent(rewriter, metadata.page);

  const transformed = rewriter.transform(response);
  const headers = new Headers(transformed.headers);
  headers.set("Content-Language", metadata.lang);
  return new Response(transformed.body, {
    status: transformed.status,
    statusText: transformed.statusText,
    headers,
  });
}

function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }
  if (response.status >= 400) {
    headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    try {
      if (url.pathname === "/api/contact") {
        const response = await handleContact(request, env, ctx);
        return withSecurityHeaders(response);
      }

      if (url.pathname.startsWith("/api/")) {
        return withSecurityHeaders(jsonResponse(404, { error: "not_found" }));
      }

      const origin = siteOrigin(request, env);
      if (url.pathname === "/robots.txt") {
        return withSecurityHeaders(
          new Response(robotsTxt(origin), {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "public, max-age=3600",
            },
          }),
        );
      }

      if (url.pathname === "/sitemap.xml") {
        return withSecurityHeaders(
          new Response(sitemapXml(origin, SEO_LANGS), {
            headers: {
              "Content-Type": "application/xml; charset=utf-8",
              "Cache-Control": "public, max-age=3600",
            },
          }),
        );
      }

      const assetResponse = await env.ASSETS.fetch(request);
      const seoResponse = rewriteSeoHtml(assetResponse, request, env);
      return withSecurityHeaders(seoResponse);
    } catch (err) {
      console.error("Unhandled error", err);
      return withSecurityHeaders(
        jsonResponse(500, { error: "internal_error" }),
      );
    }
  },
};
