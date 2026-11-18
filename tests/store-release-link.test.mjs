import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

const read = (path) => readFileSync(new URL("../public/" + path, import.meta.url), "utf8");
const html = read("index.html");
const script = read("js/store-release-link.js");
const dictionary = read("js/i18n-dict-refresh-2026.js");
const listing = "https://play.google.com/store/apps/details?id=com.niarim.niarim";

function storefront(configuredUrl, lang) {
  const fields = Array.from(html.matchAll(/data-i18n="([^"]+)" data-play-release-i18n="([^"]+)"/g),
    ([, pendingKey, playReleaseI18n]) => ({
      key: pendingKey,
      dataset: { playReleaseI18n },
      setAttribute(name, value) {
        assert.equal(name, "data-i18n");
        this.key = value;
      },
    }));
  const links = Array.from(html.matchAll(/<a\b[^>]*\bdata-play-store-link\b[^>]*>/g),
    ([tag]) => ({ hidden: /\bhidden\b/.test(tag), href: tag.match(/\bhref="([^"]+)"/)?.[1] }));
  const confirmation = { hidden: /data-play-release-only hidden/.test(html) };
  const document = {
    readyState: "complete",
    documentElement: { lang },
    querySelectorAll(selector) {
      return {
        "[data-play-release-i18n]": fields,
        "[data-play-store-link]": links,
        "[data-play-release-only]": [confirmation],
      }[selector];
    },
  };
  const window = { NIARIM_CONFIG: { GOOGLE_PLAY_URL: configuredUrl } };
  runInNewContext(dictionary, { window });
  window.NIARIM_I18N = { translate: (locale, key) => window.NIARIM_I18N_DICT[locale][key] };
  runInNewContext(script, { document, window, URL });
  return { fields, links, confirmation, translate: window.NIARIM_I18N.translate };
}

test("missing or incorrect store URLs keep both links hidden and show pending copy", () => {
  for (const url of [
    "",
    "https://play.google.com.example.invalid/store/apps/details?id=com.niarim.niarim",
    "https://play.google.com/store/apps/details?id=com.example.other",
  ]) {
    const { fields, links, confirmation } = storefront(url, "en");
    assert.equal(fields.length, 4);
    assert.equal(links.length, 2);
    assert.ok(fields.every(({ key }) => key.startsWith("refresh.release.pending.")));
    assert.ok(links.every(({ hidden, href }) => hidden && !href));
    assert.equal(confirmation.hidden, true);
  }
});

test("a valid listing shows localized release copy and keeps the locale keys active", () => {
  for (const lang of ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"]) {
    const { fields, links, confirmation, translate } = storefront(listing, lang);
    assert.ok(fields.every(({ key, textContent, dataset }) => {
      return key === dataset.playReleaseI18n && textContent === translate(lang, key);
    }));
    assert.ok(links.every(({ hidden, href, target, rel }) => {
      return !hidden && href === listing && target === "_blank" && rel === "noopener noreferrer";
    }));
    assert.equal(confirmation.hidden, false);
  }
});
