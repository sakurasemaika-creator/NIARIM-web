import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

// The terms and privacy pages carry the Japanese text in the HTML (before the
// script runs, and for crawlers). It must be the dictionary's Japanese text
// exactly, line breaks included: the paragraphs keep their line breaks
// (white-space: pre-line), so any difference would move the text when the
// script replaces it.
const root = path.resolve(import.meta.dirname, "..");

function japanese() {
  const window = { NIARIM_I18N_DICT: {} };
  const context = vm.createContext({ window });
  for (const file of ["i18n-dict.js", "i18n-dict-legal.js"]) {
    vm.runInContext(
      fs.readFileSync(path.join(root, "public", "js", file), "utf8"),
      context,
    );
  }
  return window.NIARIM_I18N_DICT.ja;
}

const decode = (text) =>
  text
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&");

for (const page of ["terms", "privacy"]) {
  test(`static ${page} text is the dictionary's Japanese text`, () => {
    const ja = japanese();
    const html = fs.readFileSync(
      path.join(root, "public", page, "index.html"),
      "utf8",
    );
    const stale = [];
    let count = 0;
    for (const match of html.matchAll(
      /<(p|h2)[^>]*data-i18n(-html)?="(legal\.[^"]+)"[^>]*>([\s\S]*?)<\/\1>/g,
    )) {
      const [, tag, isHtml, key, inner] = match;
      count++;
      const expected = ja[key];
      assert.equal(typeof expected, "string", `${key} has no Japanese text`);
      const actual = isHtml ? inner : decode(inner);
      const same =
        tag === "p" &&
        !key.startsWith("legal.notice") &&
        key !== "legal.updated"
          ? actual === expected
          : actual.replace(/\s+/g, " ").trim() ===
            expected.replace(/\s+/g, " ").trim();
      if (!same) stale.push(key);
    }
    assert.ok(count > 20, `only ${count} legal elements on /${page}/`);
    assert.deepEqual(stale, []);
  });
}

// The notice under the Specified Commercial Transactions Act (/tokushoho/):
// the static Japanese text is the dictionary's, every language has every
// item, the representative, address and telephone number are all "disclosed
// on request" (owner, 2026-11-25), and the prices are the ones /premium/
// shows.
function tokushoho() {
  const window = { NIARIM_I18N_DICT: {} };
  const context = vm.createContext({ window });
  for (const file of [
    "i18n-dict-nav-extra.js",
    "i18n-dict-tokushoho.js",
    "i18n-dict-premium.js",
  ]) {
    vm.runInContext(
      fs.readFileSync(path.join(root, "public", "js", file), "utf8"),
      context,
    );
  }
  return window.NIARIM_I18N_DICT;
}

test("static tokushoho text is the dictionary's Japanese text", () => {
  const ja = tokushoho().ja;
  const html = fs.readFileSync(
    path.join(root, "public", "tokushoho", "index.html"),
    "utf8",
  );
  const keys = [];
  for (const match of html.matchAll(
    /<(h1|p|dt|dd|span)[^>]*data-i18n="(tokushoho\.[^"]+|footer\.tokushoho)"[^>]*>([\s\S]*?)<\/\1\s*>/g,
  )) {
    const [, , key, inner] = match;
    keys.push(key);
    assert.equal(typeof ja[key], "string", `${key} has no Japanese text`);
    assert.equal(
      decode(inner).replace(/\s+/g, " ").trim(),
      ja[key].replace(/\s+/g, " ").trim(),
      key,
    );
  }
  assert.ok(keys.length >= 28, `only ${keys.length} items on /tokushoho/`);
  for (const address of [
    "support@miranima-studio.com",
    "contact@miranima-studio.com",
  ]) {
    assert.ok(html.includes(`href="mailto:${address}"`), address);
  }
});

test("tokushoho has every item in every language", () => {
  const dict = tokushoho();
  const keys = Object.keys(dict.ja).filter(
    (key) => key.startsWith("tokushoho.") || key === "footer.tokushoho",
  );
  for (const lang of ["en", "zh-Hans", "zh-Hant", "ko", "fr", "es"]) {
    for (const key of keys) {
      assert.ok(dict[lang]?.[key], `${lang} ${key}`);
      if (!/\.seller\.value$/.test(key))
        assert.notEqual(dict[lang][key], dict.ja[key], `${lang} ${key}`);
    }
    for (const field of ["title", "description"])
      assert.ok(dict[lang][`meta.tokushoho.${field}`], `${lang} meta ${field}`);
  }
  for (const [lang, table] of Object.entries(dict)) {
    if (!table["tokushoho.representative.value"]) continue;
    for (const item of ["address", "phone"])
      assert.equal(
        table[`tokushoho.${item}.value`],
        table["tokushoho.representative.value"],
        `${lang} ${item} is disclosed on request`,
      );
  }
});

test("tokushoho prices are the prices /premium/ shows", () => {
  const dict = tokushoho();
  for (const [lang, table] of Object.entries(dict)) {
    const price = table["tokushoho.price.value"];
    if (!price) continue;
    for (const plan of ["monthly", "yearly"]) {
      const shown = table[`premiumPage.premium.${plan}.price`]
        .replace(/[¥円日元圓엔\s]/g, "")
        .replace(/[,.]/g, "");
      const digits = price.replace(/\s/g, "").replace(/(\d)[,.](\d)/g, "$1$2");
      assert.ok(digits.includes(shown), `${lang} ${plan} ${shown}`);
    }
  }
});

test("privacy page describes the website's own handling of information", () => {
  const html = fs.readFileSync(
    path.join(root, "public", "privacy", "index.html"),
    "utf8",
  );
  for (const key of ["legal.privacy.site.title", "legal.privacy.site.body"]) {
    assert.match(html, new RegExp(`data-i18n="${key.replaceAll(".", "\\.")}"`));
  }
  const ja = japanese();
  for (const word of ["Resend", "niarim_lang", "YouTube", "Cloudflare"]) {
    assert.ok(ja["legal.privacy.site.body"].includes(word), word);
  }
});
