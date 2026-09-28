import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const expectedGeometry = {
  "canvas.webp": ["320", "554"],
  "timeline.webp": ["316", "561"],
  "layers.webp": ["320", "561"],
  "onion-skin.webp": ["320", "542"],
  "export.webp": ["320", "543"],
  "audio-editor.webp": ["320", "487"],
  "save-tree.webp": ["320", "561"],
  "workspace.webp": ["316", "561"],
};
const browser = await chromium.launch(launchOptions);
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
const page = await context.newPage();
await page.goto(baseURL + "/", { waitUntil: "networkidle" });
await page.waitForFunction(
  () =>
    [...document.scripts].some((script) =>
      script.src.includes("/js/user-request-fixes.js"),
    ),
);
await page.waitForFunction(
  () => typeof window.__niarimInstallRealAppCaptures === "function",
  null,
  { timeout: 10000 },
);
await page.evaluate(() => window.__niarimInstallRealAppCaptures(document));
await page.waitForFunction(
  () => document.querySelectorAll(".real-app-capture img").length > 0,
  null,
  { timeout: 10000 },
);

const result = await page.locator(".real-app-capture img").evaluateAll((imgs) =>
  imgs.map((img) => {
    const r = img.getBoundingClientRect();
    return {
      loading: img.loading,
      decoding: img.decoding,
      widthAttr: img.getAttribute("width"),
      heightAttr: img.getAttribute("height"),
      complete: img.complete,
      file: img.src.split("/").pop(),
      top: r.top,
      bottom: r.bottom,
      renderedWidth: r.width,
      renderedHeight: r.height,
      frame: (() => {
        const frame = img.closest(".feature-diagram--real");
        if (!frame) return null;
        const fr = frame.getBoundingClientRect();
        return { width: fr.width, height: fr.height };
      })(),
    };
  }),
);

const issues = [];
for (const [index, img] of result.entries()) {
  if (img.loading !== "lazy") issues.push({ index, kind: "not-lazy", img });
  if (img.decoding !== "async") issues.push({ index, kind: "not-async-decoding", img });
  const expected = expectedGeometry[img.file];
  if (!expected || img.widthAttr !== expected[0] || img.heightAttr !== expected[1])
    issues.push({ index, kind: "wrong-intrinsic-geometry", expected, img });
  if (
    img.frame &&
    (Math.abs(img.frame.width - img.renderedWidth) > 1 ||
      Math.abs(img.frame.height - img.renderedHeight) > 1)
  )
    issues.push({ index, kind: "capture-frame-size-mismatch", img });
}

await page.goto(baseURL + "/features/", { waitUntil: "networkidle" });
await page.waitForFunction(
  () => typeof window.__niarimInstallRealAppCaptures === "function",
  null,
  { timeout: 10000 },
);
await page.evaluate(() => window.__niarimInstallRealAppCaptures(document));
await page.waitForFunction(
  () => document.querySelectorAll(".real-app-capture img").length > 0,
  null,
  { timeout: 10000 },
);
const featureImages = await page.locator(".real-app-capture img").evaluateAll((imgs) =>
  imgs.map((img) => ({ loading: img.loading, file: img.src.split("/").pop(), width: img.getAttribute("width"), height: img.getAttribute("height") })),
);
featureImages.forEach((img, index) => {
  if (img.loading !== "lazy") issues.push({ page: "features", index, kind: "not-lazy", img });
  const expected = expectedGeometry[img.file];
  if (!expected || img.width !== expected[0] || img.height !== expected[1])
    issues.push({ page: "features", index, kind: "wrong-intrinsic-geometry", expected, img });
});

await context.close();
await browser.close();
console.log(JSON.stringify({ homeCaptures: result.length, featureCaptures: featureImages.length, issues: issues.length, details: issues }, null, 2));
if (issues.length) process.exit(1);
