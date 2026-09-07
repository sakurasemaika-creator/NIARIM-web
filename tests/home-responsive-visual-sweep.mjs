import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const widths = [
  320, 360, 375, 390, 430, 520, 559, 560, 600, 640, 641, 700, 759, 760, 900,
  1024, 1280, 1440,
];
const viewportHeight = 844;
const outDir = path.resolve(
  "artifacts/autonomous-browser-audit/home-width-sweep/responsive",
);

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ locale: "ja-JP" });
const page = await context.newPage();
const metrics = [];

for (const width of widths) {
  await page.setViewportSize({ width, height: viewportHeight });
  await page.goto("http://127.0.0.1:8787/", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    window.NIARIM_I18N?.applyLang?.("ja", { persist: false });
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";
    scrollTo(0, 0);
  });
  await page.waitForTimeout(400);

  const metric = await page.evaluate(() => {
    const box = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        left: r.left,
        right: r.right,
        top: r.top,
        bottom: r.bottom,
        width: r.width,
        height: r.height,
      };
    };
    return {
      hero: box(".hero"),
      container: box(".hero > .container"),
      copy: box(".hero-copy"),
      showcase: box(".hero-showcase"),
      title: box(".hero-title"),
      actions: box(".hero-actions"),
      horizontalOverflow:
        Math.max(
          document.documentElement.scrollWidth,
          document.body?.scrollWidth || 0,
        ) - document.documentElement.clientWidth,
    };
  });

  metrics.push({ width, ...metric });
  await page.locator(".hero").screenshot({
    path: path.join(outDir, `home-hero-${width}x${viewportHeight}.png`),
    animations: "disabled",
  });
}

await fs.writeFile(
  path.join(outDir, "metrics.json"),
  `${JSON.stringify(metrics, null, 2)}\n`,
);

await browser.close();
console.log(
  JSON.stringify({ ok: true, widths, screenshots: widths.length }, null, 2),
);