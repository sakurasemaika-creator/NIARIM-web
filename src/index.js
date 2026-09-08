/**
 * NIARIM公式サイト Workerエントリポイント
 *
 * API処理に加え、静的HTMLを公開サイトの正規URLへ正規化して配信する。
 */
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

function canonicalUrl(request, env) {
  const requestUrl = new URL(request.url);
  const origin = String(env.SITE_ORIGIN || requestUrl.origin).replace(/\/$/, "");
  return `${origin}${requestUrl.pathname}`;
}

function absoluteAssetUrl(value, env, request) {
  if (!value || !value.startsWith("/")) return value;
  const origin = String(env.SITE_ORIGIN || new URL(request.url).origin).replace(
    /\/$/,
    "",
  );
  return `${origin}${value}`;
}

function structuredData(env) {
  const origin = String(env.SITE_ORIGIN || "").replace(/\/$/, "");
  if (!origin) return null;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${origin}/#organization`,
        name: "NIARIM",
        url: `${origin}/`,
        logo: `${origin}/assets/images/logo/app_logo.svg`,
      },
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: `${origin}/`,
        name: "NIARIM",
        publisher: { "@id": `${origin}/#organization` },
        inLanguage: ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"],
      },
    ],
  });
}

function rewriteSeoHtml(response, request, env) {
  const type = response.headers.get("content-type") || "";
  if (response.status !== 200 || !type.includes("text/html")) return response;

  const canonical = canonicalUrl(request, env);
  const schema = new URL(request.url).pathname === "/" ? structuredData(env) : null;

  let rewriter = new HTMLRewriter()
    .on('link[rel="canonical"]', {
      element(element) {
        element.setAttribute("href", canonical);
      },
    })
    .on('meta[property="og:url"]', {
      element(element) {
        element.setAttribute("content", canonical);
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
    });

  if (schema) {
    rewriter = rewriter.on("head", {
      element(element) {
        element.append(
          `<script type="application/ld+json">${schema.replace(/</g, "\\u003c")}</script>`,
          { html: true },
        );
      },
    });
  }

  return rewriter.transform(response);
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
