import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const languages = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"];
const viewports = [
  { name: "sp360", width: 360, height: 800 },
  { name: "sp390", width: 390, height: 844 },
  { name: "pc", width: 1440, height: 1000 },
];
// The canonical Timeline capture lives in the Animation section. Home may not
// render that card in every responsive/localized composition, so audit the
// source-of-truth placement rather than requiring an unrelated Home slot.
const routes = ["/features/"];
const failures = [];

const browser = await chromium.launch(launchOptions());

for (const viewport of viewports) {
  for (const language of languages) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();

    for (const route of routes) {
      await page.goto(baseURL + route, { waitUntil: "networkidle" });
      await page.evaluate((lang) => {
        if (window.NIARIM_I18N?.applyLang) {
          window.NIARIM_I18N.applyLang(lang, { persist: false });
        } else {
          document.documentElement.lang = lang;
        }
      }, language);
      await page.waitForTimeout(220);
      const timelineImages = page.locator(
        '.real-app-capture img[src*="/assets/images/app-captures/timeline."]',
      );
      const timelineCount = await timelineImages.count();
      for (let index = 0; index < timelineCount; index += 1) {
        const image = timelineImages.nth(index);
        // Some localized/carousel clones are intentionally hidden. Lazy images
        // only need to be forced for the visible capture under test.
        if (!(await image.isVisible())) continue;
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((img) => {
          if (img.complete && img.naturalWidth > 0) return;
          return new Promise((resolve) => {
            const done = () => resolve();
            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", done, { once: true });
          });
        });
      }

      const timelines = await page.evaluate(() =>
        [...document.querySelectorAll(".real-app-capture img")]
          .filter(
            (img) =>
              (img.currentSrc || img.src).includes(
                "/assets/images/app-captures/timeline.",
              ) &&
              img.getClientRects().length > 0 &&
              getComputedStyle(img).visibility !== "hidden" &&
              img.getBoundingClientRect().width > 0 &&
              img.getBoundingClientRect().height > 0,
          )
          .map((img) => {
            const rect = img.getBoundingClientRect();
            return {
              src: img.currentSrc || img.src,
              width: rect.width,
              height: rect.height,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight,
            };
          }),
      );

      const id = `${viewport.name}/${language}${route}`;
      if (!timelines.length) {
        failures.push({ id, kind: "timeline-capture-missing" });
        continue;
      }
      for (const timeline of timelines) {
        if (
          timeline.naturalWidth <= 0 ||
          timeline.naturalHeight <= 0 ||
          timeline.width <= 0 ||
          timeline.height <= 0
        ) {
          failures.push({ id, kind: "timeline-capture-collapsed", timeline });
        }
      }
    }

    await context.close();
  }
}

await browser.close();

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      combinations: routes.length * languages.length * viewports.length,
      checks: [
        "real timeline capture is present",
        "AVIF/WebP capture decodes successfully",
        "timeline capture keeps non-zero rendered geometry",
      ],
    },
    null,
    2,
  ),
);