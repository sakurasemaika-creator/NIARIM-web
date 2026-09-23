import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const browser = await chromium.launch(launchOptions);
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
const page = await context.newPage();
await page.goto(baseURL + "/", { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => document.querySelectorAll(".real-app-capture img").length > 0);

const result = await page.locator(".real-app-capture img").evaluateAll((imgs) =>
  imgs.map((img) => {
    const r = img.getBoundingClientRect();
    return {
      loading: img.loading,
      decoding: img.decoding,
      widthAttr: img.getAttribute("width"),
      heightAttr: img.getAttribute("height"),
      complete: img.complete,
      top: r.top,
      bottom: r.bottom,
    };
  }),
);

const issues = [];
for (const [index, img] of result.entries()) {
  if (img.loading !== "lazy") issues.push({ index, kind: "not-lazy", img });
  if (img.decoding !== "async") issues.push({ index, kind: "not-async-decoding", img });
  if (img.widthAttr !== "320" || img.heightAttr !== "569")
    issues.push({ index, kind: "missing-intrinsic-geometry", img });
}

await page.goto(baseURL + "/features/", { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => document.querySelectorAll(".real-app-capture img").length > 0);
const featureImages = await page.locator(".real-app-capture img").evaluateAll((imgs) =>
  imgs.map((img) => ({ loading: img.loading, width: img.getAttribute("width"), height: img.getAttribute("height") })),
);
featureImages.forEach((img, index) => {
  if (img.loading !== "lazy") issues.push({ page: "features", index, kind: "not-lazy", img });
  if (img.width !== "320" || img.height !== "569")
    issues.push({ page: "features", index, kind: "missing-intrinsic-geometry", img });
});

await context.close();
await browser.close();
console.log(JSON.stringify({ homeCaptures: result.length, featureCaptures: featureImages.length, issues: issues.length, details: issues }, null, 2));
if (issues.length) process.exit(1);
