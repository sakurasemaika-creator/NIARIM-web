import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const base = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const output = "artifacts/refresh-2026";
const browser = await chromium.launch(launchOptions());
try {
  await mkdir(output, { recursive: true });
  for (const language of ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"]) {
    for (const width of [320, 1280]) {
      const page = await browser.newPage({
        viewport: { width, height: 900 }, locale: language, reducedMotion: "reduce",
      });
      try {
        await page.goto(base + "/features/?lang=" + language + "#export");
        await page.waitForFunction(lang => document.documentElement.lang === lang, language);
        const guide = page.locator("#export .export-format-guide");
        await guide.scrollIntoViewIfNeeded();
        await page.evaluate(() => document.fonts.ready);
        const expected = await page.evaluate(lang => ["Mp4", "Gif", "Webm", "Avi"].map(
          format => window.NIARIM_I18N_DICT[lang]["fd.format" + format + "Subtitle"]
        ), language);
        assert.deepEqual(await guide.locator("dd").allTextContents(), expected);
        assert.equal(await guide.locator("dt").count(), 4);
        const columns = await guide.locator("dl").evaluate(el =>
          getComputedStyle(el).gridTemplateColumns.split(/\s+/).length
        );
        assert.equal(columns, width === 320 ? 1 : 2);
        for (const row of await guide.locator("dl > div").all()) {
          assert.ok(await row.isVisible());
          assert.ok(await row.evaluate(el => {
            const rect = el.getBoundingClientRect();
            return rect.left >= 0 && rect.right <= innerWidth + 1 && el.scrollWidth <= el.clientWidth + 1;
          }), language + "/" + width + " format overflow");
        }
        if (language === "ja") {
          await guide.screenshot({ path: output + "/export-formats-" + width + ".png" });
        }
        const limit = page.locator('#export [data-i18n="featuresPage.export.item5.body"]');
        assert.match(await limit.innerText(), /90/);
        assert.match(await limit.innerText(), /2/);
        const priceLink = page.locator("#export .export-plan-link");
        const priceUrl = new URL(await priceLink.getAttribute("href"), base);
        assert.equal(priceUrl.pathname, "/premium/");
        assert.equal(priceUrl.hash, "#premium-plan");
        assert.equal(priceUrl.searchParams.get("lang") || "ja", language);
        const link = guide.getByRole("link");
        await link.focus();
        await link.press("Enter");
        await page.waitForURL(url => url.pathname === "/help/" && url.hash === "#help-export");
        assert.equal(await page.locator("html").getAttribute("lang"), language);
        assert.ok(await page.locator("#help-export h2").isVisible());
      } finally {
        await page.close();
      }
    }
  }
  console.log("Passed export format comparison and guide navigation in 7 languages at 2 widths.");
} finally {
  await browser.close();
}
