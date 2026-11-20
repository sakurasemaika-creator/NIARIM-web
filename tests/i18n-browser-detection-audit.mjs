import assert from "node:assert/strict";
import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const browser = await chromium.launch(launchOptions());

try {
  for (const [locale, automaticLang] of [
    ["ja-JP", "ja"],
    ["fr-FR", "fr"],
    ["zh-TW", "zh-Hant"],
    ["de-DE", "en"],
  ]) {
    const context = await browser.newContext({ locale });
    const page = await context.newPage();

    for (const [path, lang] of [
      ["/", automaticLang],
      ["/opals/", automaticLang],
      ["/opals/?lang=de", automaticLang],
      ["/opals/?lang=ja", "ja"],
      ["/opals/?lang=en", "en"],
      ["/?lang=zh-Hant", "zh-Hant"],
    ]) {
      await page.goto(baseURL + path);
      await page.waitForFunction(() => window.NIARIM_I18N);
      assert.equal(await page.locator("html").getAttribute("lang"), lang);
      assert.equal(
        await page.locator("html").getAttribute("data-latin-only"),
        ["en", "fr", "es"].includes(lang) ? "" : null,
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
    assert.equal(new URL(page.url()).searchParams.get("lang"), "en");
    await page.goto(baseURL + "/opals/");
    assert.equal(await page.locator("html").getAttribute("lang"), "en");
    assert.equal(new URL(page.url()).searchParams.get("lang"), null);
    await page.goto(baseURL + "/opals/?lang=ja");
    assert.equal(await page.locator("html").getAttribute("lang"), "ja");
    await page.goto(baseURL + "/");
    assert.equal(await page.locator("html").getAttribute("lang"), "en");
    await context.close();
  }
} finally {
  await browser.close();
}
