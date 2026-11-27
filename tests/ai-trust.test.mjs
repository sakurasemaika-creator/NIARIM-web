import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// The AI/privacy reassurance used to be one script with all seven languages,
// loaded by config-links.js on every page, where only /faq/ and /about/ show
// it. Its text is now a dictionary those two pages list (the Worker sends the
// page language's values in the page's dictionary bundle) and ai-trust.js puts
// it on the page through NIARIM_I18N.translate.
const root = path.resolve(import.meta.dirname, "..");
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), "utf8");
const keys = ["faq.q10", "faq.a10", "about.aiStance.body", "aiTrust.privacy"];

test("only the pages that show it load the AI reassurance", () => {
  assert.doesNotMatch(read("public", "js", "config-links.js"), /ai-trust/);
  for (const page of ["faq", "about"]) {
    const html = read("public", page, "index.html");
    assert.ok(
      html.indexOf('src="/js/i18n-dict-ai-trust.js"') <
        html.indexOf('src="/js/i18n.js"'),
      `${page}: the dictionary comes before i18n.js`,
    );
    assert.match(html, /src="\/js\/ai-trust\.js"/, page);
  }
  const logic = read("public", "js", "ai-trust.js");
  for (const key of keys) assert.ok(logic.includes(`"${key}"`), key);
  assert.doesNotMatch(logic, /var COPY/);
});

test("each language's page bundle carries the text", async () => {
  execFileSync(process.execPath, ["tools/generate-seo-i18n.mjs"], {
    cwd: root,
    stdio: "ignore",
  });
  const { PAGE_TRANSLATIONS } = await import(
    path.join(root, "src", "generated", "seo-i18n.js")
  );
  const source = read("public", "js", "i18n-dict-ai-trust.js");
  for (const page of ["faq", "about"]) {
    for (const lang of ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"]) {
      const bundle = read(
        "public",
        "js",
        "generated",
        `i18n-${page}.${lang}.js`,
      );
      for (const key of keys)
        assert.ok(bundle.includes(`"${key}":`), `${page} ${lang} ${key}`);
    }
  }
  // About sends the reassurance itself, as the script used to put it there.
  const about = PAGE_TRANSLATIONS.about.en["about.aiStance.body"];
  assert.ok(about.length > 60 && source.includes(about.slice(0, 40)));
});
