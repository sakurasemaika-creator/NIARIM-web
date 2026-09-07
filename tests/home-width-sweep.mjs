import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const widths = [640, 700, 760, 820, 900, 960, 1024, 1100, 1200, 1280, 1366, 1440];
const height = 628;
const outDir = path.resolve("artifacts/autonomous-browser-audit/home-width-sweep");
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ locale: "ja-JP" });
const page = await context.newPage();
const metrics = [];

for (const width of widths) {
  await page.setViewportSize({ width, height });
  await page.goto("http://127.0.0.1:8787/", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.documentElement.lang = "ja";
    localStorage.setItem("niarim-lang", "ja");
    window.dispatchEvent(new Event("resize"));
  });
  await page.waitForTimeout(450);

  const row = await page.evaluate(() => {
    const box = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        left: Math.round(r.left * 10) / 10,
        top: Math.round(r.top * 10) / 10,
        width: Math.round(r.width * 10) / 10,
        height: Math.round(r.height * 10) / 10,
        right: Math.round(r.right * 10) / 10,
        bottom: Math.round(r.bottom * 10) / 10,
      };
    };
    return {
      header: box(".site-header"),
      hero: box(".hero"),
      container: box(".hero .container"),
      copy: box(".hero-copy"),
      visual: box(".hero-visual"),
      marquee: box(".marquee-section"),
      viewportHeight: window.innerHeight,
    };
  });

  row.width = width;
  row.marqueeFullyVisible = Boolean(
    row.marquee && row.marquee.top >= 0 && row.marquee.bottom <= height,
  );
  metrics.push(row);

  await page.screenshot({
    path: path.join(outDir, `home-${width}x${height}.png`),
    fullPage: false,
  });
}

await fs.writeFile(
  path.join(outDir, "metrics.json"),
  JSON.stringify(metrics, null, 2) + "\n",
);

const failures = metrics.filter((row) => !row.marqueeFullyVisible);
if (failures.length) {
  console.error(
    "Marquee is not fully inside the initial 628px viewport at widths:",
    failures.map((row) => row.width).join(", "),
  );
  process.exitCode = 1;
}

await browser.close();
