import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

// The page bundles carry the keys that scripts choose at runtime, too.
//
// The menu button's accessible name is picked in common-ui.js with
// `var key = open ? "common.menuClose" : "common.menuOpen"` and looked up
// with `translate(lang, key)`. The generator only collected keys written next
// to `translate(…, "…")`, so the bundles had neither key and the button was
// named 「メニューを開く／閉じる」 in every language.
const root = path.resolve(import.meta.dirname, "..");
const generatedDir = path.join(root, "public", "js", "generated");

function bundleOf(page) {
  const code = fs.readFileSync(
    path.join(generatedDir, `i18n-${page}.js`),
    "utf8",
  );
  const window = { NIARIM_I18N_DICT: {} };
  vm.runInContext(code, vm.createContext({ window }));
  return window.NIARIM_I18N_DICT;
}

test("every page bundle names the menu button in each language", () => {
  execFileSync(process.execPath, ["tools/generate-seo-i18n.mjs"], {
    cwd: root,
    stdio: "ignore",
  });
  const pages = fs
    .readdirSync(generatedDir)
    .filter((file) => /^i18n-[\w-]+\.js$/.test(file))
    .map((file) => file.slice("i18n-".length, -".js".length));
  assert.ok(pages.length >= 13, `only ${pages.length} bundles`);
  for (const page of pages) {
    const dict = bundleOf(page);
    for (const key of ["common.menuOpen", "common.menuClose"]) {
      const ja = dict.ja?.[key];
      assert.ok(ja, `${page}: ja ${key}`);
      for (const lang of ["en", "fr", "es", "ko", "zh-Hans", "zh-Hant"]) {
        const value = dict[lang]?.[key];
        assert.ok(value, `${page}: ${lang} ${key} missing`);
        assert.notEqual(value, ja, `${page}: ${lang} ${key} is Japanese`);
      }
    }
  }
});
