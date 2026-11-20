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
        await priceLink.click();
        await page.waitForURL(url => url.pathname === "/premium/" && url.hash === "#premium-plan");
        assert.equal(await page.locator("html").getAttribute("lang"), language);
        assert.ok(await page.locator("#premium-plan").isVisible());
        const prices = page.getByRole("group", { name: await page.locator("#premium-plan").innerText() });
        assert.equal(await prices.locator("[data-plan-block]").count(), 2);
        const terms = page.locator("#premium-store-terms");
        const termsText = await page.evaluate(lang => window.NIARIM_I18N_DICT[lang]["premiumPage.priceNote"], language);
        assert.equal(await terms.innerText(), termsText);
        assert.equal(await prices.getAttribute("aria-describedby"), "premium-store-terms");
        assert.ok(await terms.evaluate(el =>
          el.previousElementSibling.matches(".pricing-plan-compare") &&
          el.getBoundingClientRect().right <= innerWidth + 1 && el.scrollWidth <= el.clientWidth + 1
        ));
        await page.goBack();
        const link = guide.getByRole("link");
        await link.focus();
        await link.press("Enter");
        await page.waitForURL(url => url.pathname === "/help/" && url.hash === "#help-export");
        assert.equal(await page.locator("html").getAttribute("lang"), language);
        assert.ok(await page.locator("#help-export h2").isVisible());
        await page.goBack();
        const sharing = page.locator("#export .export-sharing-link");
        const filename = page.locator(".export-filename-example");
        const expectedName = await page.evaluate(lang =>
          window.NIARIM_I18N_DICT[lang]["featuresPage.export.filenameExample"], language);
        assert.equal(await filename.innerText(), expectedName);
        assert.match(expectedName, / 20261120-143000\.gif$/);
        const card = sharing.locator("xpath=ancestor::*[contains(@class,'spec-item')][1]");
        await card.scrollIntoViewIfNeeded();
        assert.ok(await filename.evaluate(el => el.scrollWidth <= el.clientWidth + 1));
        if (language === "ja") {
          await card.screenshot({ path: output + "/export-filename-" + width + ".png" });
        }
        await sharing.focus();
        await sharing.press("Enter");
        await page.waitForURL(url => url.pathname === "/help/" && url.hash === "#help-export-sharing");
        const topic = page.locator("#help-export-sharing");
        await topic.locator("..").locator("p").waitFor({ state: "visible" });
        assert.ok(await topic.evaluate(el => el.parentElement.open && document.activeElement === el));
        const description = topic.locator("..").locator("p");
        await page.waitForFunction(lang => document.documentElement.lang === lang &&
          !!window.NIARIM_I18N_DICT[lang]?.["help.entry60.desc"], language);
        const expectedText = await page.evaluate(lang =>
          window.NIARIM_I18N_DICT[lang]["help.entry60.desc"], language);
        assert.equal(await description.innerText(), expectedText);
        assert.ok(await topic.evaluate(el => el.getBoundingClientRect().right <= innerWidth + 1));
        if (language === "ja") {
          await topic.locator("..").screenshot({ path: output + "/export-sharing-" + width + ".png" });
        }
      } finally {
        await page.close();
      }
    }
  }
  console.log("Passed export format comparison and guide navigation in 7 languages at 2 widths.");
} finally {
  await browser.close();
}
