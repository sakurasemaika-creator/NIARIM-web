import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const browser = await chromium.launch(launchOptions());
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const failures = [];

try {
  await page.goto(`${baseURL}/features/`, { waitUntil: "networkidle" });
  const state = await page.evaluate(() => {
    const first = document.querySelector(".feature-section");
    const narrative = first?.querySelector(":scope > .feature-narrative");
    const diagram = first?.querySelector(":scope > .feature-diagram");
    const nr = narrative?.getBoundingClientRect();
    const dr = diagram?.getBoundingClientRect();
    return {
      sideBySide: Boolean(nr && dr && dr.left > nr.left && Math.abs(dr.top - nr.top) < 3),
    };
  });
  if (!state.sideBySide) failures.push("features narrative and diagram are not side-by-side");

  await page.goto(baseURL, { waitUntil: "networkidle" });
  const mock = await page.evaluate(() => {
    const canvas = document.querySelector(".hero-visual.fd-canvas-screen");
    const topbar = canvas?.querySelector(":scope > .fd-topbar");
    const slider = canvas?.querySelector(":scope > .fd-brush-slider");
    const toolbar = canvas?.querySelector(":scope > .fd-toolbar");
    const timeline = document.querySelector(".fd-timeline-screen .fd-timeline-topbar");
    const transparent = (el) => el && getComputedStyle(el).backgroundColor === "rgba(0, 0, 0, 0)";
    return {
      topbarTransparent: transparent(topbar),
      sliderTransparent: transparent(slider),
      toolbarTransparent: transparent(toolbar),
      canvasTopbarHeight: topbar?.getBoundingClientRect().height || 0,
      timelineTopbarHeight: timeline?.getBoundingClientRect().height || 0,
    };
  });
  if (!mock.topbarTransparent) failures.push("canvas top bar is not transparent");
  if (!mock.sliderTransparent) failures.push("canvas slider area is not transparent");
  if (!mock.toolbarTransparent) failures.push("canvas tool bar is not transparent");
  if (mock.timelineTopbarHeight && Math.abs(mock.canvasTopbarHeight - mock.timelineTopbarHeight) > 1)
    failures.push(`canvas/timeline top bars differ: ${mock.canvasTopbarHeight}/${mock.timelineTopbarHeight}`);
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("user-request screen mock consistency: OK");
