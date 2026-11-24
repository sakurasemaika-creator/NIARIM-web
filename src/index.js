/**
 * NIARIM公式サイト Workerエントリポイント
 *
 * API処理に加え、静的HTMLを公開サイトの正規URL・選択言語へ正規化して配信する。
 * 翻訳辞書由来のSEO metadataはWrangler custom buildで生成するため、Web本文と
 * title/descriptionの文言が別管理にならない。
 */
import { localizedCaptureUrl } from "./capture-url.js";
import {
  PAGE_TRANSLATIONS,
  SEO_I18N,
  SEO_LANGS,
} from "./generated/seo-i18n.js";
import {
  DEFAULT_LANG,
  escapeXml,
  localizedUrl,
  robotsTxt,
  sitemapXml,
} from "./seo.js";
import { handleContact } from "./contact.js";
import { handleAccountDeletion } from "./account-deletion.js";
import { handleCommunityFeed } from "./community-feed.js";
import { jsonResponse } from "./utils.js";
import { canonicalRedirect } from "./canonical-host.js";

const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: https://i.ytimg.com https://img.youtube.com",
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
  ["/font-licenses/", "font-licenses"],
  ["/help/", "help"],
  ["/news/", "news"],
  ["/opals/", "opals"],
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

function explicitLang(url) {
  const lang = url.searchParams.get("lang");
  return SEO_LANGS.includes(lang) ? lang : null;
}

function preferredLang(request) {
  const cookie = (request.headers.get("Cookie") || "").match(
    /(?:^|;\s*)niarim_lang=([^;]*)/,
  )?.[1];
  if (SEO_LANGS.includes(cookie)) return cookie;

  const accepted = (request.headers.get("Accept-Language") || "")
    .split(",")
    .map((entry) => {
      const [tag, weight] = entry
        .trim()
        .toLowerCase()
        .split(/;\s*q\s*=\s*/);
      return {
        tag: tag.trim(),
        quality: weight === undefined ? 1 : Number(weight),
      };
    })
    .filter(({ quality }) => quality > 0 && quality <= 1)
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of accepted) {
    const [language, ...subtags] = tag.split("-");
    if (language === "zh") {
      if (subtags.includes("hans")) return "zh-Hans";
      return subtags.some((part) => ["hant", "tw", "hk", "mo"].includes(part))
        ? "zh-Hant"
        : "zh-Hans";
    }
    if (SEO_LANGS.includes(language)) return language;
  }
  return DEFAULT_LANG;
}

function normalizedPagePath(pathname) {
  const path = pathname.replace(/\/index\.html$/, "/");
  if (PAGE_KEYS.has(path)) return path;
  return PAGE_KEYS.has(path + "/") ? path + "/" : path;
}

function canonicalUrl(request, env, lang) {
  const requestUrl = new URL(request.url);
  const pathname = normalizedPagePath(requestUrl.pathname);
  return localizedUrl(siteOrigin(request, env), pathname, lang);
}

function absoluteAssetUrl(value, env, request) {
  if (!value || !value.startsWith("/")) return value;
  return `${siteOrigin(request, env)}${value}`;
}

function pageMetadata(request) {
  const url = new URL(request.url);
  const pathname = normalizedPagePath(url.pathname);
  const page = PAGE_KEYS.get(pathname);
  if (!page) return null;
  const explicit = explicitLang(url);
  const lang = explicit || preferredLang(request);
  const table = SEO_I18N[lang] || SEO_I18N.ja || {};
  const fallback = SEO_I18N.ja || {};
  const titleKey = `meta.${page}.title`;
  const descriptionKey = `meta.${page}.description`;
  return {
    page,
    lang,
    negotiated: !explicit,
    title: table[titleKey] || fallback[titleKey] || "NIARIM",
    description: table[descriptionKey] || fallback[descriptionKey] || "",
  };
}

function performanceHeadMarkup(page, lang) {
  const hasScreenMocks = page === "features";
  const fontPreloadMarkup =
    page === "home" && ["en", "fr", "es"].includes(lang)
      ? [
          '<link rel="preload" href="/assets/fonts/HakkouMincho-latin.woff2" as="font" type="font/woff2" crossorigin fetchpriority="high">',
          '<link rel="preload" href="/assets/fonts/Kuramubon-latin.woff2" as="font" type="font/woff2" crossorigin fetchpriority="high">',
        ].join("")
      : "";
  // The page's stylesheets (site.css and its own file) are already in the
  // <head>; only the scripts are preloaded here.
  const runtime = hasScreenMocks ? "/js/main.js" : "/js/common-ui.js";
  const scriptPreloads =
    `<link rel="preload" href="/js/generated/i18n-${page}.js" as="script">` +
    `<link rel="preload" href="${runtime}" as="script">`;
  return fontPreloadMarkup + scriptPreloads;
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
        operatingSystem: "Android",
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
          "Community gallery",
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
    `<link rel="alternate" hreflang="x-default" href="${canonicalUrl(request, env)}">`,
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

function localizeElement(element, translations) {
  const richKey = element.getAttribute("data-i18n-html");
  const textKey = element.getAttribute("data-i18n");
  if (richKey && Object.hasOwn(translations, richKey)) {
    // These values come from the same source-controlled dictionary as the
    // browser's rich translations.
    element.setInnerContent(translations[richKey], { html: true });
  } else if (textKey && Object.hasOwn(translations, textKey)) {
    const content = translations[textKey]
      .split(/(<br\s*\/?>|<\/?em>|<\/?strong>)/gi)
      .map((part) =>
        /^<(?:br\s*\/?|\/?em|\/?strong)>$/i.test(part) ? part : escapeXml(part),
      )
      .join("");
    element.setInnerContent(content, { html: true });
  }

  for (const pair of (element.getAttribute("data-i18n-attr") || "").split(
    "|",
  )) {
    const [attribute, key] = pair.split(":");
    if (attribute && key && Object.hasOwn(translations, key)) {
      element.setAttribute(attribute, translations[key]);
    }
  }
}

function rewriteSeoHtml(response, request, env, metadata) {
  const type = response.headers.get("content-type") || "";
  if (response.status !== 200 || !type.includes("text/html")) return response;

  if (!metadata) return response;

  const translations = PAGE_TRANSLATIONS[metadata.page][metadata.lang];

  const canonical = canonicalUrl(request, env, metadata.lang);
  const schema = structuredData(request, env, metadata);
  const alternates = hreflangMarkup(request, env);
  const headPerformance = performanceHeadMarkup(metadata.page, metadata.lang);
  const useLightweightRuntime = metadata.page !== "features";
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
        element.setAttribute("data-niarim-locale", metadata.lang);
        if (metadata.page === "help") {
          element.setAttribute("data-help-locale", metadata.lang);
        }
        if (["en", "fr", "es"].includes(metadata.lang)) {
          element.setAttribute("data-latin-only", "");
        }
      },
    })
    .on("[data-i18n], [data-i18n-html], [data-i18n-attr]", {
      element(element) {
        localizeElement(element, translations);
      },
    })
    // The app captures in the page's language, before the browser asks for
    // the Japanese ones.
    .on('img[src*="/app-captures/"], source[srcset*="/app-captures/"]', {
      element(element) {
        const attribute = element.tagName === "source" ? "srcset" : "src";
        const value = element.getAttribute(attribute);
        const next = localizedCaptureUrl(value, metadata.lang);
        if (next !== value) element.setAttribute(attribute, next);
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
        if (/^\/js\/i18n-dict(?:-[\w-]+)?\.js(?:[?#].*)?$/.test(src)) {
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
  // The asset's validators describe the template, not the translated HTML.
  headers.delete("ETag");
  headers.delete("Last-Modified");
  if (metadata.negotiated) {
    headers.append("Vary", "Accept-Language, Cookie");
    headers.set("Cache-Control", "private, no-store");
  }
  return new Response(transformed.body, {
    status: transformed.status,
    statusText: transformed.statusText,
    headers,
  });
}

function withSecurityHeaders(response, accountDeletionPage = false) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }
  if (accountDeletionPage) {
    headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    headers.set(
      "Content-Security-Policy",
      CSP.replace(
        "script-src 'self'",
        "script-src 'self' https://accounts.google.com/gsi/client",
      )
        .replace(
          "style-src 'self' 'unsafe-inline'",
          "style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style",
        )
        .replace(
          "connect-src 'self'",
          "connect-src 'self' https://accounts.google.com/gsi/",
        ) + "; frame-src https://accounts.google.com/gsi/",
    );
    headers.set("X-Robots-Tag", "noindex");
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
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      const canonical = canonicalRedirect(request, env);
      if (canonical) return withSecurityHeaders(canonical);

      if (
        url.pathname === "/coins" ||
        url.pathname === "/coins/" ||
        url.pathname === "/coins/index.html"
      ) {
        url.pathname = "/opals/";
        return withSecurityHeaders(Response.redirect(url, 308));
      }

      if (url.pathname === "/api/community") {
        return withSecurityHeaders(await handleCommunityFeed(request, env));
      }
      if (url.pathname === "/api/contact") {
        const response = await handleContact(request, env);
        return withSecurityHeaders(response);
      }
      if (url.pathname.startsWith("/api/account-deletion/")) {
        const action = url.pathname.slice("/api/account-deletion/".length);
        return withSecurityHeaders(
          await handleAccountDeletion(request, env, action),
        );
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

      const metadata = pageMetadata(request);
      const assetRequest = metadata ? new Request(request) : request;
      if (metadata) {
        assetRequest.headers.delete("If-None-Match");
        assetRequest.headers.delete("If-Modified-Since");
      }
      const assetResponse = await env.ASSETS.fetch(assetRequest);
      const seoResponse = rewriteSeoHtml(assetResponse, request, env, metadata);
      return withSecurityHeaders(
        seoResponse,
        /^\/account-deletion\/(?:index\.html)?$/.test(url.pathname),
      );
    } catch (err) {
      console.error("Unhandled error", err);
      return withSecurityHeaders(
        jsonResponse(500, { error: "internal_error" }),
      );
    }
  },
};
