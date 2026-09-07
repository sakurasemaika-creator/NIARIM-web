import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const widths = [640, 700, 760, 820, 900, 960, 1024, 1100, 1200, 1280, 1366, 1440];
const outDir = path.resolve("artifacts/autonomous-browser-audit/home-width-sweep");
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ locale: "ja-JP" });
const page = await context.newPage();

for (const width of widths) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("http://127.0.0.1:8787/", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.documentElement.lang = "ja";
    localStorage.setItem("niarim-lang", "ja");
    window.dispatchEvent(new Event("resize"));
  });
  await page.waitForTimeout(350);
  await page.screenshot({
    path: path.join(outDir, `home-${width}x900.png`),
    fullPage: false,
  });
}

await browser.close();
