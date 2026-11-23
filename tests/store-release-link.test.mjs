import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

const read = (path) =>
  readFileSync(new URL("../public/" + path, import.meta.url), "utf8");
const html = read("index.html");
const script = read("js/store-release-link.js");
const dictionaries = [
  "i18n-dict",
  "i18n-dict-intl",
  "i18n-dict-nav-extra",
  "i18n-dict-refresh-2026",
].map((name) => read("js/" + name + ".js"));
const listing =
  "https://play.google.com/store/apps/details?id=com.niarim.niarim";

function storefront(configuredUrl, lang) {
  const fields = Array.from(
    html.matchAll(/data-i18n="([^"]+)"\s+data-play-release-i18n="([^"]+)"/g),
    ([, pendingKey, playReleaseI18n]) => ({
      key: pendingKey,
      dataset: { playReleaseI18n },
      setAttribute(name, value) {
        assert.equal(name, "data-i18n");
        this.key = value;
      },
    }),
  );
  const links = Array.from(
    html.matchAll(/<a\b[^>]*\bdata-play-store-link\b[^>]*>([\s\S]*?)<\/a\s*>/g),
    ([tag, inner]) => {
      const badge = /<img\b[^>]*\bdata-play-badge\b/.test(inner)
        ? {
            src: "",
            alt: "",
            listeners: {},
            addEventListener(type, listener) {
              this.listeners[type] = listener;
            },
          }
        : null;
      return {
        hidden: /\bhidden\b/.test(tag.slice(0, tag.indexOf(">"))),
        href: tag.match(/\bhref="([^"]+)"/)?.[1],
        badge,
        querySelector: (selector) =>
          selector === "img[data-play-badge]" ? badge : null,
      };
    },
  );
  const confirmation = { hidden: /data-play-release-only\s+hidden/.test(html) };
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
  for (const dictionary of dictionaries)
    runInNewContext(dictionary, { window });
  window.NIARIM_I18N = {
    translate: (locale, key) => window.NIARIM_I18N_DICT[locale][key],
  };
  runInNewContext(script, { document, window, URL });
  return {
    fields,
    links,
    confirmation,
    translate: window.NIARIM_I18N.translate,
  };
}

test("missing or incorrect store URLs keep both links hidden and show pending copy", () => {
  for (const url of [
    "",
    "https://play.google.com.example.invalid/store/apps/details?id=com.niarim.niarim",
    "https://play.google.com/store/apps/details?id=com.example.other",
  ]) {
    const { fields, links, confirmation } = storefront(url, "en");
    assert.equal(fields.length, 5);
    assert.equal(links.length, 2);
    assert.ok(fields.some(({ key }) => key === "nav.releaseInfo"));
    assert.equal(
      fields.filter(({ key }) => key.startsWith("refresh.release.pending."))
        .length,
      4,
    );
    assert.ok(links.every(({ hidden, href }) => hidden && !href));
    assert.equal(confirmation.hidden, true);
  }
});

test("a valid listing shows localized release copy and keeps the locale keys active", () => {
  for (const lang of ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"]) {
    const { fields, links, confirmation, translate } = storefront(
      listing,
      lang,
    );
    assert.ok(
      fields.every(({ key, textContent, dataset }) => {
        return (
          key === dataset.playReleaseI18n &&
          typeof textContent === "string" &&
          textContent.length > 0 &&
          textContent === translate(lang, key)
        );
      }),
    );
    // Each link carries Google's official badge for the language and is
    // shown only once the badge image has loaded.
    assert.ok(links.every(({ badge }) => badge));
    for (const link of links) {
      assert.equal(link.badge.src, `/assets/badges/google-play/${lang}.png`);
      assert.equal(link.badge.alt, translate(lang, "refresh.playBadge.alt"));
      assert.ok(link.badge.alt.includes("Google Play"));
      assert.equal(link.hidden, true);
      link.badge.listeners.load();
    }
    assert.ok(
      links.every(({ hidden, href, target, rel }) => {
        return (
          !hidden &&
          href === listing &&
          target === "_blank" &&
          rel === "noopener noreferrer"
        );
      }),
    );
    assert.equal(confirmation.hidden, false);
    assert.ok(
      translate(lang, "refresh.playBadge.trademark").includes("Google LLC"),
    );
  }
});

test("a missing badge image keeps the link hidden instead of a broken image", () => {
  const { links } = storefront(listing, "ja");
  for (const link of links) {
    link.badge.listeners.error();
    assert.equal(link.hidden, true);
  }
});

test("the store link is Google's badge, not an imitation of it", () => {
  assert.doesNotMatch(html, /nr-play-mark|▶/);
  for (const [, inner] of html.matchAll(
    /<a\b[^>]*\bdata-play-store-link\b[^>]*>([\s\S]*?)<\/a\s*>/g,
  )) {
    assert.match(inner, /<img\b[^>]*\bdata-play-badge\b/);
    assert.doesNotMatch(inner.replace(/<img\b[^>]*>/g, ""), /\S/);
  }
  assert.match(
    html,
    /data-play-release-only\s+hidden\s+data-i18n="refresh\.playBadge\.trademark"/,
  );
});
