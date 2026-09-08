import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const findings = [];
const origin = "https://niarim-web.niarim.workers.dev";
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
  'application/ld+json',
  'X-Robots-Tag',
]) {
  expect(worker.includes(needle), "edge-seo-rewriter", needle);
}

const robots = read("public/robots.txt");
expect(robots.includes(`Sitemap: ${origin}/sitemap.xml`), "robots-sitemap", null);
expect(!robots.includes("example.com"), "robots-placeholder", null);

const sitemap = read("public/sitemap.xml");
expect(!sitemap.includes("example.com"), "sitemap-placeholder", null);
for (const [, route] of routes) {
  expect(sitemap.includes(`<loc>${origin}${route}</loc>`), "sitemap-route", route);
}

for (const [file, route] of routes) {
  const html = read(file);
  for (const needle of [
    '<meta name="description"',
    '<meta name="robots"',
    '<link rel="canonical"',
    '<meta property="og:title"',
    '<meta property="og:description"',
    '<meta property="og:url"',
    '<meta property="og:image"',
    '<meta name="twitter:card"',
    '<meta name="twitter:title"',
    '<meta name="twitter:description"',
    '<meta name="twitter:image"',
  ]) {
    expect(html.includes(needle), "page-metadata", `${route} ${needle}`);
  }
}

const notFound = read("public/404.html");
expect(
  /<meta\s+name="robots"\s+content="[^"]*noindex/i.test(notFound),
  "404-noindex",
  null,
);

const lineart = read("public/js/auto-lineart-phone.js");
const stabilizer = lineart.match(/row\(c\[3\],\s*"([0-9.]+)"/);
const stabilizationValue = stabilizer ? Number(stabilizer[1]) : NaN;
expect(
  Number.isFinite(stabilizationValue) &&
    stabilizationValue >= 0 &&
    stabilizationValue <= 10,
  "auto-lineart-stabilization-scale",
  stabilizationValue,
);
expect(!lineart.includes('row(c[3], "58"'), "auto-lineart-stale-value", 58);

console.log(JSON.stringify({ findings: findings.length, details: findings }, null, 2));
if (findings.length) process.exit(1);
