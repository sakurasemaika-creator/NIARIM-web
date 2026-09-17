import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const browser = await chromium.launch(launchOptions());
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const failures = [];

try {
  await page.goto(`${baseURL}/features/`, { waitUntil: "networkidle" });
  const state = await page.evaluate(() => {
    const sections = [...document.querySelectorAll(".feature-section")];
    const diagrams = sections
      .map((section) => section.querySelector(":scope > .feature-diagram"))
      .filter(Boolean);
    const rects = diagrams.map((diagram) => diagram.getBoundingClientRect());
    return {
      sectionCount: sections.length,
      diagramCount: diagrams.length,
      wrappedPairCount: document.querySelectorAll(".feature-pair").length,
      minWidth: rects.length ? Math.min(...rects.map((rect) => rect.width)) : 0,
      maxWidth: rects.length ? Math.max(...rects.map((rect) => rect.width)) : 0,
      visibleCount: rects.filter((rect) => rect.width > 0 && rect.height > 0).length,
    };
  });
  if (state.wrappedPairCount)
    failures.push("feature diagrams must remain direct section children");
  if (!state.diagramCount || state.visibleCount !== state.diagramCount)
    failures.push("every feature diagram must keep visible geometry");
  if (state.minWidth < 420)
    failures.push(`feature diagram collapsed below 420px: ${state.minWidth}`);

  await page.goto(baseURL, { waitUntil: "networkidle" });
  const mock = await page.evaluate(() => {
    const canvas = document.querySelector(".hero-visual.fd-canvas-screen");
    const topbar = canvas?.querySelector(":scope > .fd-topbar");
    const slider = canvas?.querySelector(":scope > .fd-brush-slider");
    const toolbar = canvas?.querySelector(":scope > .fd-toolbar");
    const timeline = document.querySelector(
      ".fd-timeline-screen .fd-timeline-topbar",
    );
    return {
      topbarHeight: topbar?.getBoundingClientRect().height || 0,
      sliderHeight: slider?.getBoundingClientRect().height || 0,
      toolbarHeight: toolbar?.getBoundingClientRect().height || 0,
      timelineTopbarHeight: timeline?.getBoundingClientRect().height || 0,
    };
  });
  if (!mock.topbarHeight) failures.push("canvas top bar lost geometry");
  if (!mock.sliderHeight) failures.push("canvas slider area lost geometry");
  if (!mock.toolbarHeight) failures.push("canvas tool bar lost geometry");
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("user-request screen mock geometry: OK");
