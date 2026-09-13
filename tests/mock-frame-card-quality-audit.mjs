import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const outDir = "artifacts/autonomous-browser-audit/mock-frame-quality";
const widths = [
  320, 360, 375, 390, 430, 480, 520, 559, 560, 600, 640, 641, 700, 759, 760,
  834, 900, 1024, 1180, 1280, 1366, 1440, 1600, 1920,
];
const routes = ["/", "/features/"];
const findings = [];
const screenshots = [];

await fs.mkdir(outDir, { recursive: true });
const browser = await chromium.launch(launchOptions());

for (const width of widths) {
  const height =
    width <= 430 ? 844 : width <= 759 ? 900 : width <= 1024 ? 1112 : 1000;
  const context = await browser.newContext({
    viewport: { width, height },
    locale: "ja-JP",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();

  for (const route of routes) {
    await page.goto(baseURL + route, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(160);

    const state = await page.evaluate(() => {
      const visible = (el) => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return (
          cs.display !== "none" &&
          cs.visibility !== "hidden" &&
          Number(cs.opacity) > 0 &&
          r.width > 1 &&
          r.height > 1
        );
      };
      const rect = (el) => {
        const r = el.getBoundingClientRect();
        return {
          left: r.left,
          right: r.right,
          top: r.top,
          bottom: r.bottom,
          width: r.width,
          height: r.height,
          centerX: r.left + r.width / 2,
        };
      };
      const px = (value) => Number.parseFloat(value) || 0;
      const frameSelector =
        ".feature-diagram, .fd-app-screen, .fd-route-screen";
      const frames = [...document.querySelectorAll(frameSelector)]
        .filter(visible)
        .map((el, index) => {
          const cs = getComputedStyle(el);
          const outer = rect(el);
          const isEmbeddedHeroSource = el.matches(
            ".hero-preview-card > .hero-app-preview-source",
          );
          const isPresentationSurface = el.matches(
            ".feature-diagram, .hero-visual-reuse",
          );
          const heroHost = isEmbeddedHeroSource
            ? el.closest(".hero-preview-card")
            : null;
          const heroHostAfter = heroHost
            ? getComputedStyle(heroHost, "::after")
            : null;
          const directChildren = [...el.children]
            .filter(visible)
            .map((child) => ({
              className:
                child.className?.toString().slice(0, 100) || child.tagName,
              position: getComputedStyle(child).position,
              ...rect(child),
            }));
          const widest =
            directChildren
              .filter(
                (child) =>
                  child.width >= outer.width * 0.7 &&
                  !["absolute", "fixed"].includes(child.position),
              )
              .sort((a, b) => b.width - a.width)[0] || null;
          return {
            index,
            kind: isEmbeddedHeroSource
              ? "hero-embedded-source"
              : isPresentationSurface
                ? "presentation-surface"
                : "app-screen",
            className: el.className?.toString().slice(0, 140) || "",
            outer,
            border: {
              widths: [
                px(cs.borderTopWidth),
                px(cs.borderRightWidth),
                px(cs.borderBottomWidth),
                px(cs.borderLeftWidth),
              ],
              styles: [
                cs.borderTopStyle,
                cs.borderRightStyle,
                cs.borderBottomStyle,
                cs.borderLeftStyle,
              ],
              colors: [
                cs.borderTopColor,
                cs.borderRightColor,
                cs.borderBottomColor,
                cs.borderLeftColor,
              ],
            },
            heroHostEdge: heroHostAfter
              ? {
                  width: px(heroHostAfter.borderTopWidth),
                  style: heroHostAfter.borderTopStyle,
                  color: heroHostAfter.borderTopColor,
                  radius: px(heroHostAfter.borderTopLeftRadius),
                }
              : null,
            radius: px(cs.borderTopLeftRadius),
            overflowX: cs.overflowX,
            overflowY: cs.overflowY,
            backgroundColor: cs.backgroundColor,
            directChildren,
            widest,
          };
        });
      const galleryCards = [...document.querySelectorAll(".screenshot-card")]
        .filter(visible)
        .map((card, index) => {
          const cardRect = rect(card);
          const cs = getComputedStyle(card);
          const mock = card.querySelector(frameSelector);
          return {
            index,
            card: cardRect,
            mock: mock && visible(mock) ? rect(mock) : null,
            radius: px(cs.borderTopLeftRadius),
            overflowX: cs.overflowX,
            scrollWidth: card.scrollWidth,
            clientWidth: card.clientWidth,
          };
        });
      const cards = [
        ...document.querySelectorAll(
          ".feature-row, .spec-item, .screenshot-card",
        ),
      ]
        .filter(visible)
        .map((card, index) => {
          const cs = getComputedStyle(card);
          const cardRect = rect(card);
          const children = [...card.children]
            .filter(visible)
            .map((child) => ({
              className:
                child.className?.toString().slice(0, 100) || child.tagName,
              ...rect(child),
            }));
          return {
            index,
            className: card.className?.toString().slice(0, 120) || "",
            rect: cardRect,
            radius: px(cs.borderTopLeftRadius),
            scrollWidth: card.scrollWidth,
            clientWidth: card.clientWidth,
            children,
          };
        });
      return { frames, galleryCards, cards };
    });

    const id = `${width}px${route}`;
    const colorVisible = (value) =>
      value && value !== "transparent" && !value.endsWith(", 0)");

    for (const frame of state.frames) {
      if (frame.kind === "app-screen") {
        const hasBorder =
          frame.border.styles.every((style) => style === "solid") &&
          frame.border.widths.every((value) => value >= 2.5) &&
          frame.border.colors.every(colorVisible);
        if (!hasBorder)
          findings.push({
            id,
            kind: "app-screen-outer-border-regression",
            frame,
          });
        const spread =
          Math.max(...frame.border.widths) - Math.min(...frame.border.widths);
        if (spread > 0.25)
          findings.push({
            id,
            kind: "app-screen-border-thickness-drift",
            spread,
            frame,
          });
        if (!["hidden", "clip"].includes(frame.overflowX))
          findings.push({ id, kind: "app-screen-clipping-regression", frame });
        if (frame.radius < 12)
          findings.push({ id, kind: "app-screen-radius-regression", frame });
      } else if (frame.kind === "hero-embedded-source") {
        const edge = frame.heroHostEdge;
        if (
          !edge ||
          edge.style !== "solid" ||
          edge.width < 2.5 ||
          !colorVisible(edge.color)
        )
          findings.push({ id, kind: "hero-preview-bezel-regression", frame });
      } else {
        if (!colorVisible(frame.backgroundColor))
          findings.push({ id, kind: "presentation-surface-missing", frame });
        if (!["hidden", "clip"].includes(frame.overflowX))
          findings.push({
            id,
            kind: "presentation-surface-clipping-regression",
            frame,
          });
        if (frame.radius < 12)
          findings.push({
            id,
            kind: "presentation-surface-radius-regression",
            frame,
          });
      }

      const target = 320 / 569;
      const ratio = frame.outer.height
        ? frame.outer.width / frame.outer.height
        : null;
      if (ratio === null || Math.abs(ratio - target) > 0.02)
        findings.push({
          id,
          kind: "app-screen-aspect-ratio-regression",
          ratio,
          target,
          frame,
        });

      for (const child of frame.directChildren) {
        if (child.width < frame.outer.width * 0.2) continue;
        if (
          child.left < frame.outer.left - 2.5 ||
          child.right > frame.outer.right + 2.5
        )
          findings.push({
            id,
            kind: "mock-child-horizontal-escape",
            frame,
            child,
          });
      }
      if (frame.widest) {
        const delta = frame.widest.centerX - frame.outer.centerX;
        const tolerance = Math.max(2.5, frame.outer.width * 0.01);
        if (Math.abs(delta) > tolerance)
          findings.push({
            id,
            kind: "mock-inner-center-drift",
            delta,
            tolerance,
            frame,
          });
      }
    }

    for (const item of state.galleryCards) {
      if (item.radius < 14)
        findings.push({ id, kind: "gallery-card-radius-regression", item });
      if (!["hidden", "clip"].includes(item.overflowX))
        findings.push({ id, kind: "gallery-card-not-clipped", item });
      if (item.scrollWidth > item.clientWidth + 2)
        findings.push({ id, kind: "gallery-card-inner-overflow", item });
      if (item.mock) {
        const delta = item.mock.centerX - item.card.centerX;
        if (Math.abs(delta) > 2.5)
          findings.push({ id, kind: "gallery-mock-center-drift", delta, item });
        if (
          item.mock.left < item.card.left - 2.5 ||
          item.mock.right > item.card.right + 2.5
        )
          findings.push({ id, kind: "gallery-mock-outside-card", item });
      }
    }

    for (const card of state.cards) {
      if (card.radius < 8)
        findings.push({ id, kind: "section-card-radius-regression", card });
      if (card.scrollWidth > card.clientWidth + 2)
        findings.push({ id, kind: "section-card-content-overflow", card });
      for (const child of card.children) {
        if (child.width < card.rect.width * 0.15) continue;
        if (
          child.left < card.rect.left - 2.5 ||
          child.right > card.rect.right + 2.5
        )
          findings.push({ id, kind: "section-card-child-escape", card, child });
      }
    }

    const slug = route === "/" ? "home" : "features";
    const screenshot = path.join(outDir, `${width}px__${slug}.png`);
    await page.screenshot({
      path: screenshot,
      fullPage: true,
      animations: "disabled",
    });
    screenshots.push(screenshot);
  }
  await context.close();
}

await browser.close();
const report = {
  widths,
  routes,
  combinations: widths.length * routes.length,
  screenshots,
  findings: findings.length,
  details: findings,
};
await fs.writeFile(
  path.join(outDir, "report.json"),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
if (findings.length) process.exit(1);
