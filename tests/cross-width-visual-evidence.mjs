import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const outDir =
  process.env.AUDIT_CROSS_WIDTH_DIR ||
  "artifacts/autonomous-browser-audit/cross-width-eye-review";
const widths = [
  320, 360, 375, 390, 430, 480, 520, 559, 560, 600, 640, 641, 700, 759, 760,
  834, 900, 1024, 1180, 1280, 1366, 1440, 1600, 1920,
];
const targets = [
  { route: "/", name: "home-hero", selector: ".hero" },
  {
    route: "/",
    name: "home-gallery",
    selector: ".screenshot-scroller",
  },
  {
    route: "/",
    name: "home-final-cta",
    selector: ".final-cta .container",
  },
  { route: "/features/", name: "features-drawing", selector: "#drawing" },
  {
    route: "/features/",
    name: "features-workspace",
    selector: "#workspace",
  },
  { route: "/premium/", name: "premium-pricing", selector: ".pricing-grid" },
  {
    route: "/community/",
    name: "community-gallery",
    selector: ".community-gallery",
  },
  {
    route: "/help/",
    name: "help-category",
    selector: "[data-help-category]",
  },
  { route: "/about/", name: "about-name", selector: ".about-name" },
  { route: "/contact/", name: "contact-panel", selector: ".contact-panel" },
];

await fs.mkdir(outDir, { recursive: true });
const browser = await chromium.launch(launchOptions());
const manifest = [];
const missing = [];

for (const width of widths) {
  const height =
    width <= 430 ? 844 : width <= 759 ? 900 : width <= 1024 ? 1112 : 1000;
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    locale: "ja-JP",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  let currentRoute = null;

  for (const target of targets) {
    if (target.route !== currentRoute) {
      await page.goto(baseURL + target.route, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => {
        document.documentElement.style.scrollBehavior = "auto";
        document.body.style.scrollBehavior = "auto";
      });
      currentRoute = target.route;
    }

    const locator = page.locator(target.selector).first();
    if (!(await locator.count()) || !(await locator.isVisible())) {
      missing.push({ width, ...target });
      continue;
    }

    await locator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(140);
    const box = await locator.boundingBox();
    if (!box || box.width < 1 || box.height < 1) {
      missing.push({ width, ...target, reason: "zero-geometry" });
      continue;
    }

    const fileName = `${String(width).padStart(4, "0")}px__${target.name}.jpg`;
    await locator.screenshot({
      path: path.join(outDir, fileName),
      type: "jpeg",
      quality: 84,
      animations: "disabled",
    });
    manifest.push({
      width,
      height,
      route: target.route,
      selector: target.selector,
      name: target.name,
      fileName,
      box,
    });
  }

  await context.close();
}

await browser.close();
await fs.writeFile(
  path.join(outDir, "manifest.json"),
  JSON.stringify({ widths, targets, captures: manifest, missing }, null, 2),
);
console.log(
  JSON.stringify(
    {
      widths: widths.length,
      targets: targets.length,
      captures: manifest.length,
      missing: missing.length,
      outDir,
    },
    null,
    2,
  ),
);
if (missing.length) process.exit(1);
