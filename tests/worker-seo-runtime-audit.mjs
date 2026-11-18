import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PAGE_TRANSLATIONS, SEO_LANGS } from "../src/generated/seo-i18n.js";
import { escapeXml, SEO_PAGE_PATHS } from "../src/seo.js";

const base = String(
  process.env.NIARIM_WORKER_ORIGIN || "http://127.0.0.1:8790",
).replace(/\/$/, "");
const siteOrigin = String(process.env.NIARIM_SITE_ORIGIN || base).replace(
  /\/$/,
  "",
);

async function fetchText(pathname) {
  const response = await fetch(`${base}${pathname}`, { redirect: "follow" });
  const text = await response.text();
  assert.equal(response.status, 200, `${pathname}: expected HTTP 200`);
  return { response, text };
}

function attr(html, pattern, label) {
  const match = html.match(pattern);
  assert.ok(match, `missing ${label}`);
  return match[1];
}

for (const testCase of [
  { path: "/index.html?lang=en", lang: "en", canonical: "/?lang=en" },
  {
    path: "/features/index.html?lang=fr",
    lang: "fr",
    canonical: "/features/?lang=fr",
  },
  {
    path: "/features/?lang=zh-Hant",
    lang: "zh-Hant",
    canonical: "/features/?lang=zh-Hant",
  },
]) {
  const { response, text } = await fetchText(testCase.path);
  assert.equal(
    response.headers.get("content-language"),
    testCase.lang,
    `${testCase.path}: Content-Language`,
  );
  assert.equal(
    attr(text, /<html[^>]*\blang="([^"]+)"/i, "html lang"),
    testCase.lang,
    `${testCase.path}: html lang`,
  );

  const canonical = attr(
    text,
    /<link\s+rel="canonical"\s+href="([^"]+)"/i,
    "canonical",
  );
  assert.equal(canonical, `${siteOrigin}${testCase.canonical}`);
  assert.ok(
    !canonical.includes("index.html"),
    `${testCase.path}: canonical must not expose index.html`,
  );
  assert.ok(
    !canonical.includes("niarim.example.com"),
    `${testCase.path}: canonical must not expose placeholder origin`,
  );

  const ogUrl = attr(
    text,
    /<meta\s+property="og:url"\s+content="([^"]+)"/i,
    "og:url",
  );
  assert.equal(
    ogUrl,
    canonical,
    `${testCase.path}: og:url must match canonical`,
  );

  const alternates = [
    ...text.matchAll(
      /<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/gi,
    ),
  ];
  assert.equal(
    alternates.length,
    8,
    `${testCase.path}: expected 7 languages plus x-default`,
  );
  for (const [, hreflang, href] of alternates) {
    assert.ok(
      !href.includes("index.html"),
      `${testCase.path}: ${hreflang} alternate exposes index.html`,
    );
    assert.ok(
      href.startsWith(siteOrigin),
      `${testCase.path}: ${hreflang} alternate uses wrong origin`,
    );
  }

  assert.match(
    text,
    /<script\s+type="application\/ld\+json">/i,
    `${testCase.path}: JSON-LD missing`,
  );
  assert.match(
    text,
    /<meta\s+name="robots"\s+content="[^"]*max-image-preview:large/i,
    `${testCase.path}: enhanced robots metadata missing`,
  );
}

const robots = await fetchText("/robots.txt");
assert.match(
  robots.text,
  new RegExp(
    `Sitemap: ${siteOrigin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/sitemap\\.xml`,
  ),
);
assert.match(robots.text, /Disallow: \/api\//);

const sitemap = await fetchText("/sitemap.xml");
assert.ok(
  !sitemap.text.includes("index.html"),
  "sitemap must not expose index.html URLs",
);
assert.ok(
  !sitemap.text.includes("niarim.example.com"),
  "sitemap must not expose placeholder origin",
);
assert.ok(
  sitemap.text.includes(`${siteOrigin}/features/?lang=fr`),
  "sitemap missing localized feature URL",
);
assert.ok(
  sitemap.text.includes('hreflang="x-default"'),
  "sitemap missing x-default alternate",
);

// Fetch the Worker response directly so no browser script can translate it.
for (const pathname of SEO_PAGE_PATHS) {
  const template = readFileSync(
    new URL(`../public${pathname}index.html`, import.meta.url),
    "utf8",
  );
  const main = template.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  assert.ok(main, pathname);
  const heading = main.match(/<h1\b[^>]*data-i18n="([^"]+)"/i)?.[1];
  const lead =
    pathname === "/"
      ? "refresh.hero.lead"
      : main.match(/<p\b[^>]*data-i18n="([^"]+)"/i)?.[1];
  assert.ok(lead, `${pathname}: translatable paragraph`);
  const page = pathname.split("/")[1] || "home";

  for (const lang of SEO_LANGS) {
    const path = lang === "ja" ? pathname : `${pathname}?lang=${lang}`;
    const { response, text } = await fetchText(path);
    assert.equal(response.headers.get("content-language"), lang, path);
    if (page === "font-licenses") {
      const license = /<pre[^>]*lang="en"[^>]*>([\s\S]*?)<\/pre\s*>/i;
      assert.match(text, /<a[^>]*class="skip-link"[^>]*href="#main"/i);
      assert.match(text, /<nav[^>]*id="main-nav"/i);
      assert.ok(license.test(template));
      assert.equal(text.match(license)?.[1], template.match(license)[1], path);
    }
    const translations = PAGE_TRANSLATIONS[page][lang];
    for (const key of [heading, lead].filter(Boolean)) {
      const value = translations[key];
      assert.ok(value, `${path}: dictionary entry ${key}`);
      const bodies = [
        ...text.matchAll(
          /<(h1|p)\b[^>]*data-i18n="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/gi,
        ),
      ];
      const expected = escapeXml(
        value.replace(/<br\s*\/?>|<\/?(?:em|strong)>/gi, ""),
      );
      const rendered = bodies
        .filter(([, , id]) => id === key)
        .map(([, , , body]) =>
          body.replace(/<br\s*\/?>|<\/?(?:em|strong)>/gi, ""),
        );
      assert.ok(
        rendered.includes(expected),
        `${path}: server did not render ${key}`,
      );
    }
  }
}

console.log(
  `Worker SEO runtime audit passed (${SEO_PAGE_PATHS.length * SEO_LANGS.length} page-language responses)`,
);
