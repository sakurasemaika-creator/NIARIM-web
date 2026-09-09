import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const findings = [];
const origin = "https://niarim-web.niarim.workers.dev";
const languages = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"];
const routes = [
  ["public/index.html", "/"],
  ["public/about/index.html", "/about/"],
  ["public/community/index.html", "/community/"],
  ["public/contact/index.html", "/contact/"],
  ["public/faq/index.html", "/faq/"],
  ["public/features/index.html", "/features/"],
  ["public/help/index.html", "/help/"],
  ["public/news/index.html", "/news/"],
  ["public/premium/index.html", "/premium/"],
  ["public/privacy/index.html", "/privacy/"],
  ["public/terms/index.html", "/terms/"],
];

function expect(condition, kind, detail) {
  if (!condition) findings.push({ kind, detail });
}

const wrangler = read("wrangler.jsonc");
expect(wrangler.includes(`"SITE_ORIGIN": "${origin}"`), "site-origin", origin);
expect(wrangler.includes('"run_worker_first": true'), "worker-first", null);

const worker = read("src/index.js");
for (const needle of [
  'link[rel="canonical"]',
  'meta[property="og:url"]',
  'meta[property="og:image"], meta[name="twitter:image"]',
  "application/ld+json",
  '"@type": "SoftwareApplication"',
  '"@type": "Organization"',
  '"@type": "WebSite"',
  "og:locale:alternate",
  "max-image-preview:large",
  "X-Robots-Tag",
]) {
  expect(worker.includes(needle), "edge-seo-rewriter", needle);
}
expect(
  worker.includes('value.endsWith("/index.html")'),
  "index-html-normalization",
  "suffix",
);
expect(
  worker.includes("normalizedPagePath(requestUrl.pathname)"),
  "index-html-normalization",
  "canonical",
);
expect(
  worker.includes("normalizedPagePath(new URL(request.url).pathname)"),
  "index-html-normalization",
  "metadata",
);
for (const lang of languages) {
  expect(
    worker.includes(`${lang}:`) || worker.includes(`"${lang}"`),
    "worker-language",
    lang,
  );
  expect(
    worker.includes(`hreflang=\"${lang}\"`) || worker.includes("SEO_LANGS.map"),
    "worker-hreflang",
    lang,
  );
}
expect(worker.includes('hreflang="x-default"'), "worker-hreflang", "x-default");

const robots = read("public/robots.txt");
expect(
  robots.includes(`Sitemap: ${origin}/sitemap.xml`),
  "robots-sitemap",
  null,
);
expect(!robots.includes("example.com"), "robots-placeholder", null);

const sitemap = read("public/sitemap.xml");
expect(!sitemap.includes("example.com"), "sitemap-placeholder", null);
for (const [, route] of routes) {
  expect(
    sitemap.includes(`<loc>${origin}${route}</loc>`),
    "sitemap-route",
    route,
  );
  for (const lang of languages) {
    expect(
      sitemap.includes(`hreflang="${lang}"`),
      "sitemap-hreflang",
      `${route} ${lang}`,
    );
  }
}
expect(
  sitemap.includes('hreflang="x-default"'),
  "sitemap-hreflang",
  "x-default",
);

const metadata = [
  ["description", /<meta\s+name=["']description["']/i],
  ["robots", /<meta\s+name=["']robots["']/i],
  ["canonical", /<link\s+rel=["']canonical["']/i],
  ["og:title", /<meta\s+property=["']og:title["']/i],
  ["og:description", /<meta\s+property=["']og:description["']/i],
  ["og:url", /<meta\s+property=["']og:url["']/i],
  ["og:image", /<meta\s+property=["']og:image["']/i],
  ["twitter:card", /<meta\s+name=["']twitter:card["']/i],
  ["twitter:title", /<meta\s+name=["']twitter:title["']/i],
  ["twitter:description", /<meta\s+name=["']twitter:description["']/i],
  ["twitter:image", /<meta\s+name=["']twitter:image["']/i],
];

for (const [file, route] of routes) {
  const html = read(file);
  for (const [name, pattern] of metadata) {
    expect(pattern.test(html), "page-metadata", `${route} ${name}`);
  }
}

const notFound = read("public/404.html");
expect(
  /<meta\s+name="robots"\s+content="[^"]*noindex/i.test(notFound),
  "404-noindex",
  null,
);

// The rendered parameter values are checked in page-heading-signature-audit.
// A COPY array offset is not a parameter identity: c[3] is now taper length.

console.log(
  JSON.stringify({ findings: findings.length, details: findings }, null, 2),
);
if (findings.length) process.exit(1);
