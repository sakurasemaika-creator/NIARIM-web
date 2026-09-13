import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const outDir = "artifacts/autonomous-browser-audit/mock-frame-quality";
const widths = [320, 360, 390, 430, 520, 640, 760, 834, 1024, 1280, 1440, 1920];
const routes = ["/", "/features/"];
const findings = [];

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch(launchOptions());

for (const width of widths) {
  const height = width <= 430 ? 844 : width <= 834 ? 1112 : 1000;
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
      const frameSelector = ".feature-diagram, .fd-app-screen, .fd-route-screen";
      const frames = [...document.querySelectorAll(frameSelector)]
        .filter(visible)
        .map((el, index) => {
          const cs = getComputedStyle(el);
          const outer = rect(el);
          const directChildren = [...el.children]
            .filter(visible)
            .map((child) => ({
              className: child.className?.toString().slice(0, 100) || child.tagName,
              ...rect(child),
            }));
          const wideChildren = directChildren.filter(
            (child) => child.width >= outer.width * 0.7,
          );
          const widest = wideChildren.sort((a, b) => b.width - a.width)[0] || null;
          return {
            index,
            className: el.className?.toString().slice(0, 140) || "",
            sectionId: el.closest("section")?.id || null,
            outer,
            border: {
              top: px(cs.borderTopWidth),
              right: px(cs.borderRightWidth),
              bottom: px(cs.borderBottomWidth),
              left: px(cs.borderLeftWidth),
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
            radius: px(cs.borderTopLeftRadius),
            overflowX: cs.overflowX,
            overflowY: cs.overflowY,
            boxShadow: cs.boxShadow,
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
            overflowY: cs.overflowY,
            scrollWidth: card.scrollWidth,
            clientWidth: card.clientWidth,
          };
        });

      const cards = [
        ...document.querySelectorAll(".feature-row, .spec-item, .screenshot-card"),
      ]
        .filter(visible)
        .map((card, index) => {
          const cs = getComputedStyle(card);
          return {
            index,
            className: card.className?.toString().slice(0, 120) || "",
            rect: rect(card),
            radius: px(cs.borderTopLeftRadius),
            scrollWidth: card.scrollWidth,
            clientWidth: card.clientWidth,
          };
        });

      return { frames, galleryCards, cards };
    });

    const id = `${width}px${route}`;
    const before = findings.length;

    for (const frame of state.frames) {
      const borderVisible =
        frame.border.styles.every((style) => style !== "none") &&
        [frame.border.top, frame.border.right, frame.border.bottom, frame.border.left].every(
          (value) => value >= 0.75,
        );
      const shadowVisible = frame.boxShadow && frame.boxShadow !== "none";
      if (!borderVisible && !shadowVisible) {
        findings.push({ id, kind: "mock-outer-edge-missing", frame });
      }
      if (frame.radius < 8) {
        findings.push({ id, kind: "mock-radius-too-small", frame });
      }

      for (const child of frame.directChildren) {
        if (child.width < frame.outer.width * 0.2) continue;
        if (
          child.left < frame.outer.left - 2.5 ||
          child.right > frame.outer.right + 2.5
        ) {
          findings.push({ id, kind: "mock-child-horizontal-escape", frame, child });
        }
      }

      if (frame.widest) {
        const delta = frame.widest.centerX - frame.outer.centerX;
        const tolerance = Math.max(2.5, frame.outer.width * 0.01);
        if (Math.abs(delta) > tolerance) {
          findings.push({
            id,
            kind: "mock-inner-center-drift",
            delta,
            tolerance,
            frame,
          });
        }
      }
    }

    for (const item of state.galleryCards) {
      if (item.radius < 14) {
        findings.push({ id, kind: "gallery-card-radius-regression", item });
      }
      if (!["hidden", "clip"].includes(item.overflowX)) {
        findings.push({ id, kind: "gallery-card-not-clipped", item });
      }
      if (item.scrollWidth > item.clientWidth + 2) {
        findings.push({ id, kind: "gallery-card-inner-overflow", item });
      }
      if (item.mock) {
        const delta = item.mock.centerX - item.card.centerX;
        if (Math.abs(delta) > 2.5) {
          findings.push({ id, kind: "gallery-mock-center-drift", delta, item });
        }
        if (
          item.mock.left < item.card.left - 2.5 ||
          item.mock.right > item.card.right + 2.5
        ) {
          findings.push({ id, kind: "gallery-mock-outside-card", item });
        }
      }
    }

    for (const card of state.cards) {
      if (card.radius < 8) {
        findings.push({ id, kind: "section-card-radius-regression", card });
      }
      if (card.scrollWidth > card.clientWidth + 2) {
        findings.push({ id, kind: "section-card-content-overflow", card });
      }
    }

    if (findings.length > before) {
      const slug = route === "/" ? "home" : "features";
      const screenshot = path.join(outDir, `${width}px__${slug}.png`);
      await page.screenshot({ path: screenshot, fullPage: true, animations: "disabled" });
      findings.slice(before).forEach((finding) => {
        finding.screenshot = screenshot;
      });
    }
  }

  await context.close();
}

await browser.close();

const report = {
  widths,
  routes,
  combinations: widths.length * routes.length,
  findings: findings.length,
  details: findings,
};
await fs.writeFile(
  path.join(outDir, "report.json"),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
if (findings.length) process.exit(1);
