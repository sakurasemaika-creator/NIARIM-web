import fs from "node:fs/promises";
import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const widths = [320,339,360,375,390,414,480,520,543,559,560,600,640,641,642,700,732,733,759,760,768,834,900,901,1023,1024,1100,1199,1200,1279,1280,1366,1440,1600,1920];
const outDir = "artifacts/hero-polish-ja";
await fs.mkdir(outDir, { recursive: true });
const browser = await chromium.launch(launchOptions());
for (const width of widths) {
  const context = await browser.newContext({ viewport: { width, height: width <= 414 ? 667 : 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(baseURL + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => { window.NIARIM_I18N?.applyLang?.("ja", { persist: false }); scrollTo(0, 0); });
  await page.waitForTimeout(180);
  const hero = page.locator(".hero").first();
  await hero.screenshot({ path: `${outDir}/${width}px-ja-home-hero-section.png` });
  await context.close();
}
await browser.close();
console.log(`Captured ${widths.length} Japanese Hero widths.`);
