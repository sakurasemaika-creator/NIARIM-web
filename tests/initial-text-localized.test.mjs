import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Text a script replaces right after the page loads was sent in Japanese to
// every language (the Worker translates only [data-i18n] text it has a value
// for). On English, French and Spanish pages that one Japanese line made the
// browser fetch the Japanese text font on its first layout (/contact/'s file
// status, /community/'s loading message). The Worker now sends it translated;
// the scripts still set the same text afterwards.
const root = path.resolve(import.meta.dirname, "..");
const langs = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"];
const japanese = /[぀-ヿ一-鿿]/;

async function translations(page) {
  execFileSync(process.execPath, ["tools/generate-seo-i18n.mjs"], {
    cwd: root,
    stdio: "ignore",
  });
  const { PAGE_TRANSLATIONS } = await import(
    path.join(root, "src", "generated", "seo-i18n.js")
  );
  return PAGE_TRANSLATIONS[page];
}

function elementText(html, attribute) {
  const match = html.match(
    new RegExp(`<(\\w+)[^>]*${attribute}[^>]*>([^<]*)</\\1`),
  );
  assert.ok(match, `no element with ${attribute}`);
  return match[2].trim();
}

for (const [page, key, marker] of [
  ["contact", "contact.form.attachmentsEmpty", 'id="attachments-status"'],
  ["community", "communityLive.loading", "data-community-message"],
]) {
  test(`/${page}/ sends ${key} in the page's language`, async () => {
    const html = fs.readFileSync(
      path.join(root, "public", page, "index.html"),
      "utf8",
    );
    assert.equal(
      elementText(html, marker),
      elementText(html, `data-i18n="${key}"`),
      "the text carries the key",
    );
    const table = await translations(page);
    assert.equal(table.ja[key], elementText(html, marker));
    for (const lang of langs.filter((l) => l !== "ja")) {
      assert.ok(table[lang][key], `${lang} ${key}`);
      if (!lang.startsWith("zh"))
        assert.doesNotMatch(table[lang][key], japanese, `${lang} ${key}`);
    }
  });
}
