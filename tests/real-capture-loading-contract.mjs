import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const expectedGeometry = {
  "canvas.webp": ["320", "569"],
  "timeline.webp": ["320", "569"],
  "layers.webp": ["320", "569"],
  "onion-skin.webp": ["320", "569"],
  "export.webp": ["320", "569"],
  "audio-editor.webp": ["320", "569"],
  "save-tree.webp": ["320", "569"],
  "workspace.webp": ["320", "569"],
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
  timeline: "rgb(242, 185, 15)",
  layers: "rgb(177, 92, 255)",
  "onion-skin": "rgb(16, 185, 129)",
  "audio-editor": "rgb(255, 138, 61)",
  "save-tree": "rgb(92, 107, 255)",
  workspace: "rgb(216, 160, 166)",
  export: "rgb(141, 169, 196)",
};
const issues = [];
for (const [index, img] of result.entries()) {
  if (img.loading !== "lazy") issues.push({ index, kind: "not-lazy", img });
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
const featureFiles = new Set(featureImages.map((img) => img.file));
Object.keys(expectedGeometry).forEach((file) => {
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
