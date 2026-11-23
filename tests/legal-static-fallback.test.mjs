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
