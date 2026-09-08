import assert from "node:assert/strict";
import {
  SEO_PAGE_PATHS,
  applicationSchema,
  localizedUrl,
  ogLocaleAlternateMarkup,
  robotsTxt,
  sitemapXml,
} from "../src/seo.js";

const langs = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"];
const origin = "https://example.test";

assert.equal(localizedUrl(origin, "/features/", "ja"), `${origin}/features/`);
assert.equal(
  localizedUrl(origin, "/features/", "en"),
  `${origin}/features/?lang=en`,
);

const robots = robotsTxt(origin);
assert.match(robots, /User-agent: \*/);
assert.match(robots, /Disallow: \/api\//);
assert.match(robots, /Sitemap: https:\/\/example\.test\/sitemap\.xml/);

const sitemap = sitemapXml(origin, langs);
assert.match(sitemap, /xmlns:xhtml=/);
assert.match(sitemap, /hreflang="x-default"/);
assert.equal(
  (sitemap.match(/<url>/g) || []).length,
  SEO_PAGE_PATHS.length * langs.length,
);
for (const pathname of SEO_PAGE_PATHS) {
  for (const lang of langs) {
    const url = localizedUrl(origin, pathname, lang);
    assert.ok(sitemap.includes(`<loc>${url.replaceAll("&", "&amp;")}</loc>`));
    assert.ok(
      sitemap.includes(
        `hreflang="${lang}" href="${url.replaceAll("&", "&amp;")}"`,
      ),
    );
  }
}

const app = applicationSchema(origin, langs);
assert.deepEqual(app["@type"], ["SoftwareApplication", "MobileApplication"]);
assert.deepEqual(app.operatingSystem, ["Android", "iOS"]);
assert.deepEqual(app.inLanguage, langs);

const alternate = ogLocaleAlternateMarkup(
  { ja: "ja_JP", en: "en_US", fr: "fr_FR" },
  "en",
);
assert.ok(alternate.includes("ja_JP"));
assert.ok(alternate.includes("fr_FR"));
assert.ok(!alternate.includes("en_US"));

console.log("SEO contract audit passed");
