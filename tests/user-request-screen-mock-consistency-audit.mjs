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
    const pairs = sections
      .map((section) => section.querySelector(":scope > .feature-pair"))
      .filter(Boolean);
    const diagramStacks = pairs.map((pair) => pair.querySelector(":scope > .feature-diagram-stack"));
    const diagrams = diagramStacks.flatMap((stack) => stack ? [...stack.querySelectorAll(":scope > .feature-diagram")] : []);
    const leftColumns = pairs.map((pair) => pair.querySelector(":scope > .feature-copy-column"));
    const narratives = leftColumns.map((left) => left?.querySelector(":scope > .feature-narrative")).filter(Boolean);
    const rects = diagrams.map((diagram) => diagram.getBoundingClientRect());
    const alignedStacks = diagramStacks.every((stack) => {
      if (!stack) return false;
      const children = [...stack.querySelectorAll(":scope > .feature-diagram")];
      if (children.length < 2) return true;
      const lefts = children.map((el) => el.getBoundingClientRect().left);
      return Math.max(...lefts) - Math.min(...lefts) < 1;
    });
    const specPlacement = pairs.every((pair) => {
      const left = pair.querySelector(":scope > .feature-copy-column");
      const narrative = left?.querySelector(":scope > .feature-narrative");
      const spec = left?.querySelector(":scope > .spec-grid");
      if (!left || !narrative || !spec) return false;
      const nr = narrative.getBoundingClientRect();
      const sr = spec.getBoundingClientRect();
      const lr = left.getBoundingClientRect();
      return Math.abs(sr.left - lr.left) < 1 && Math.abs(sr.width - lr.width) < 1 && sr.top >= nr.bottom && sr.top - nr.bottom < 50;
    });
    const widget = document.querySelector("#widget .fd-widget-grid");
    const widgetTiles = widget ? [...widget.querySelectorAll(":scope > .fd-widget-tile")].map((el) => el.getBoundingClientRect()) : [];
    const widgetHealthy = widgetTiles.length === 3 && widgetTiles.every((r) => r.width > 70 && r.height >= 90 && r.height < 180);
    const hydrated = {
      drawing: !!document.querySelector("#drawing .feature-diagram-stack > .fd-canvas-screen"),
      animation: !!document.querySelector("#animation .feature-diagram-stack > .fd-timeline-screen"),
      editing: !!document.querySelector("#editing .feature-diagram-stack > .fd-canvas-screen .fd-layer-panel-overlay"),
      advanced: !!document.querySelector("#advanced .feature-diagram-stack > .fd-canvas-screen .fd-app-onion-panel"),
      audio: !!document.querySelector("#audio .feature-diagram-stack > .fd-audio-screen"),
      save: !!document.querySelector("#save .feature-diagram-stack > .fd-route-screen"),
      workspace: !!document.querySelector("#workspace .feature-diagram-stack > .fd-workspace-screen"),
      export: !!document.querySelector("#export .feature-diagram-stack > .fd-route-screen"),
    };
    return {
      sectionCount: sections.length,
      pairCount: pairs.length,
      diagramCount: diagrams.length,
      narrativeCount: narratives.length,
      alignedStacks,
      specPlacement,
      widgetHealthy,
      hydrated,
      minWidth: rects.length ? Math.min(...rects.map((rect) => rect.width)) : 0,
      visibleCount: rects.filter((rect) => rect.width > 0 && rect.height > 0).length,
    };
  });
  if (!state.pairCount || state.narrativeCount !== state.pairCount)
    failures.push("each feature pair must keep one whole narrative in its left column");
  if (!state.alignedStacks) failures.push("multiple feature diagrams must share one aligned right-hand stack");
  if (!state.specPlacement) failures.push("spec grid must sit directly below narrative at the same left-column width");
  if (!state.widgetHealthy) failures.push("widget reconstruction tiles are stretched or collapsed");
  if (!state.diagramCount || state.visibleCount !== state.diagramCount)
    failures.push("every feature diagram must keep visible geometry");
  if (state.minWidth < 420)
    failures.push(`feature diagram collapsed below 420px: ${state.minWidth}`);
  const unhydrated = Object.entries(state.hydrated)
    .filter(([, ok]) => !ok)
    .map(([name]) => name);
  if (unhydrated.length)
    failures.push(`feature mocks were not hydrated: ${unhydrated.join(", ")}`);

  await page.goto(baseURL, { waitUntil: "networkidle" });
  const mock = await page.evaluate(() => {
    const canvas = document.querySelector(".hero-visual.fd-canvas-screen");
    const topbar = canvas?.querySelector(":scope > .fd-topbar");
    const slider = canvas?.querySelector(":scope > .fd-brush-slider");
    const toolbar = canvas?.querySelector(":scope > .fd-toolbar");
    return {
      topbarHeight: topbar?.getBoundingClientRect().height || 0,
      sliderHeight: slider?.getBoundingClientRect().height || 0,
      toolbarHeight: toolbar?.getBoundingClientRect().height || 0,
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
