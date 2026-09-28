import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const baseCaptureNames = ["canvas", "timeline", "layers", "onion-skin", "export", "audio-editor", "save-tree", "workspace", "widget"];
const expectedGeometry = Object.fromEntries(
  baseCaptureNames.flatMap((name) =>
    ["", "-v2", "-v3", "-v4"].map((suffix) => [name + suffix + ".webp", ["320", "569"]]),
  ),
);
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
      file: img.src.split("/").pop().split("?")[0],
      top: r.top,
      bottom: r.bottom,
      renderedWidth: r.width,
      renderedHeight: r.height,
      frame: (() => {
        const frame = img.closest(
          ".feature-diagram--real, .hero-visual--real, .screenshot-card, .feature-media",
        );
        if (!frame) return null;
        const fr = frame.getBoundingClientRect();
        const cs = getComputedStyle(frame);
        return {
          width: fr.width,
          height: fr.height,
          contentWidth: fr.width - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth),
          contentHeight: fr.height - parseFloat(cs.borderTopWidth) - parseFloat(cs.borderBottomWidth),
        };
      })(),
    };
  }),
);

const expectedFrames = {
  canvas: "rgb(58, 166, 255)",
  timeline: "rgb(46, 155, 79)",
  layers: "rgb(255, 138, 61)",
  "onion-skin": "rgb(232, 93, 117)",
  "audio-editor": "rgb(75, 143, 220)",
  "save-tree": "rgb(193, 95, 53)",
  workspace: "rgb(230, 95, 43)",
  export: "rgb(0, 134, 201)",
  widget: "rgb(0, 121, 107)",
};

const issues = [];
for (const [index, img] of result.entries()) {
  // The three Hero images are above-the-fold/LCP candidates and intentionally
  // use the browser default eager loading. All remaining Home captures are lazy.
  if (index >= 3 && img.loading !== "lazy") issues.push({ index, kind: "not-lazy", img });
  if (img.decoding !== "async") issues.push({ index, kind: "not-async-decoding", img });
  const expected = expectedGeometry[img.file];
  if (!expected || img.widthAttr !== expected[0] || img.heightAttr !== expected[1])
    issues.push({ index, kind: "wrong-intrinsic-geometry", expected, img });
  if (
    img.frame &&
    (Math.abs(img.frame.contentWidth - img.renderedWidth) > 1 ||
      Math.abs(img.frame.contentHeight - img.renderedHeight) > 1)
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
const featureCaptureLocator = page.locator(".real-app-capture img");
for (let i = 0; i < await featureCaptureLocator.count(); i++) {
  await featureCaptureLocator.nth(i).scrollIntoViewIfNeeded();
  await featureCaptureLocator.nth(i).evaluate((img) => img.decode?.().catch(() => {}));
}
await page.evaluate(() => scrollTo(0, 0));
const featureImages = await page.locator(".real-app-capture img").evaluateAll((imgs) =>
  imgs.map((img) => {
    const ir = img.getBoundingClientRect();
    const frame = img.closest(".feature-diagram--real");
    const fr = frame?.getBoundingClientRect();
    const cs = frame ? getComputedStyle(frame) : null;
    return {
      loading: img.loading,
      file: img.src.split("/").pop().split("?")[0],
      width: img.getAttribute("width"),
      height: img.getAttribute("height"),
      renderedWidth: ir.width,
      renderedHeight: ir.height,
      frameTheme: frame?.dataset.captureTheme || "",
      frameColor: frame ? getComputedStyle(frame).borderTopColor : "",
      frame: fr ? {
        width: fr.width,
        height: fr.height,
        contentWidth: fr.width - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth),
        contentHeight: fr.height - parseFloat(cs.borderTopWidth) - parseFloat(cs.borderBottomWidth),
      } : null,
    };
  }),
);
// The Home hero capture is also discovered by the generic Home selector.
// Deduplicate the same DOM image before checking cross-placement theme reuse.
const allPlacementFiles = [...new Set(result.map((img) => img.file))]
  .concat(featureImages.map((img) => img.file));
const duplicatePlacementFiles = allPlacementFiles.filter(
  (file, index) => allPlacementFiles.indexOf(file) !== index,
);
// A filename variant maps 1:1 to an App theme accent. Reusing any filename
// therefore means reusing a theme, which is forbidden across the website.
const placementBaseNames = allPlacementFiles.map((file) => file.replace(/\.webp$/, ""));
const uniquePlacementNames = new Set(placementBaseNames);
if (duplicatePlacementFiles.length || uniquePlacementNames.size !== placementBaseNames.length) {
  issues.push({
    kind: "duplicate-capture-theme-placement",
    files: [...new Set(duplicatePlacementFiles)],
  });
}
const featureFiles = new Set(featureImages.map((img) => img.file));
baseCaptureNames.forEach((name) => {
  const file = name + ".webp";
  if (!featureFiles.has(file)) issues.push({ page: "features", kind: "missing-capture", file });
});
featureImages.forEach((img, index) => {
  if (img.frameTheme && img.frameColor !== expectedFrames[img.frameTheme])
    issues.push({ page: "features", index, kind: "capture-frame-theme-mismatch", expected: expectedFrames[img.frameTheme], img });
  if (img.loading !== "lazy") issues.push({ page: "features", index, kind: "not-lazy", img });
  const expected = expectedGeometry[img.file];
  if (!expected || img.width !== expected[0] || img.height !== expected[1])
    issues.push({ page: "features", index, kind: "wrong-intrinsic-geometry", expected, img });
  if (
    img.frame &&
    (Math.abs(img.frame.contentWidth - img.renderedWidth) > 1 ||
      Math.abs(img.frame.contentHeight - img.renderedHeight) > 1)
  )
    issues.push({ page: "features", index, kind: "capture-frame-size-mismatch", img });
});

await context.close();
await browser.close();
console.log(JSON.stringify({ homeCaptures: result.length, featureCaptures: featureImages.length, issues: issues.length, details: issues }, null, 2));
if (issues.length) process.exit(1);
