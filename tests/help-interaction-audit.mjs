import assert from "node:assert/strict";
import { chromium } from "playwright";

const base = process.env.NIARIM_AUDIT_BASE_URL || "http://127.0.0.1:8787";
const languages = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"];
const browser = await chromium.launch({ headless: true });
let passed = 0;

try {
  for (const language of languages) {
    for (const mode of ["pc", "sp"]) {
      const context = await browser.newContext({
        viewport: { width: mode === "pc" ? 1280 : 390, height: 900 },
        isMobile: mode === "sp",
        hasTouch: mode === "sp",
        locale: language,
        reducedMotion: "reduce",
      });
      try {
        const page = await context.newPage();
        await page.goto(`${base}/help/?lang=${language}`, {
          waitUntil: "networkidle",
        });
        await page.waitForFunction(
          (lang) => document.documentElement.lang === lang,
          language,
        );
        const input = page.locator("#help-search-input");
        const category = page.locator("#help-save");
        const title = (
          await category.locator("[data-help-card] h3").first().textContent()
        ).trim();
        assert.ok(title.length > 0);

        await input.fill(title);
        assert.ok(
          await category.isVisible(),
          `${language}/${mode}: localized search`,
        );
        await input.fill("zz-niarim-audit-no-match");
        assert.equal(
          await page.locator("[data-help-category]:visible").count(),
          0,
        );
        assert.ok(await page.locator("#help-no-results").isVisible());

        const link = page.locator('.feature-nav a[href="#help-save"]');
        if (mode === "sp") await link.tap();
        else await link.press("Enter");
        assert.equal(
          await input.inputValue(),
          "",
          `${language}/${mode}: category clears search`,
        );
        assert.ok(await category.isVisible());
        assert.equal(await page.locator("#help-no-results").isVisible(), false);
        await page.waitForFunction(() => {
          const heading = document.querySelector("#help-save h2");
          const rect = heading.getBoundingClientRect();
          return rect.top >= 0 && rect.bottom <= window.innerHeight;
        });
        assert.equal(new URL(page.url()).hash, "#help-save");
        passed++;
        console.log(
          `PASS help search and category navigation: ${language}/${mode}`,
        );
      } finally {
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}

assert.equal(passed, 14);
console.log(`Help interaction audit passed: ${passed}/14`);
