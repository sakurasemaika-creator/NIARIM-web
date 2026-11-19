import assert from "node:assert/strict";
import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const browser = await chromium.launch(launchOptions());

try {
  for (const locale of ["ja-JP", "fr-FR", "de-DE"]) {
    const context = await browser.newContext({ locale });
    await context.addInitScript(() => localStorage.setItem("niarim_lang", "ja"));
    const page = await context.newPage();

    for (const [query, lang] of [
      ["", "en"],
      ["?lang=de", "en"],
      ["?lang=ja", "ja"],
      ["?lang=zh-Hant", "zh-Hant"],
    ]) {
      await page.goto(baseURL + "/" + query);
      await page.waitForFunction(() => window.NIARIM_I18N);
      assert.equal(await page.locator("html").getAttribute("lang"), lang);
      assert.equal(
        await page.locator("html").getAttribute("data-latin-only"),
        lang === "en" ? "" : null,
      );
    }

    await page.locator("[data-lang-switch=ja]").evaluate((button) => button.click());
    assert.equal(new URL(page.url()).searchParams.get("lang"), "ja");
    assert.equal(
      await page.locator('a[data-i18n="nav.features"]').first().getAttribute("href"),
      "/features/?lang=ja",
    );
    await page.reload();
    assert.equal(await page.locator("html").getAttribute("lang"), "ja");
    await page.locator("[data-lang-switch=en]").evaluate((button) => button.click());
    assert.equal(new URL(page.url()).searchParams.get("lang"), null);
    await context.close();
  }
} finally {
  await browser.close();
}
