import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const widths = [
  320, 339, 360, 390, 520, 543, 559, 560, 600, 640, 641, 642, 700, 732, 759,
  760, 900, 901, 1023, 1024,
];
const languages = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"];
const captureWidths = new Set([
  320, 360, 390, 520, 543, 559, 560, 600, 640, 641, 642, 700, 732, 759, 760,
  900,
]);
const outDir =
  process.env.AUDIT_HERO_DIR || "artifacts/intermediate-width-home";
const failures = [];
const screenshots = [];
await fs.mkdir(outDir, { recursive: true });
const browser = await chromium.launch(launchOptions());

function overlaps(a, b, tolerance = 2) {
  if (!a || !b) return false;
  return (
    a.left < b.right - tolerance &&
    a.right > b.left + tolerance &&
    a.top < b.bottom - tolerance &&
    a.bottom > b.top + tolerance
  );
}

function horizontalGap(a, b) {
  if (!a || !b) return null;
  return b.left - a.right;
}

function verticalGap(a, b) {
  if (!a || !b) return null;
  return b.top - a.bottom;
}

for (const width of widths) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();

  for (const language of languages) {
    await page.goto(baseURL + "/", { waitUntil: "networkidle" });
    await page.evaluate((lang) => {
      window.NIARIM_I18N?.applyLang?.(lang, { persist: false });
      scrollTo(0, 0);
    }, language);
    await page.waitForTimeout(180);

    const state = await page.evaluate(() => {
      const rectOf = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          left: r.left,
          right: r.right,
          top: r.top,
          bottom: r.bottom,
          width: r.width,
          height: r.height,
          centerX: r.left + r.width / 2,
          centerY: r.top + r.height / 2,
        };
      };
      const rect = (selector) => rectOf(document.querySelector(selector));
      const hero = document.querySelector(".hero");
      const container = document.querySelector(".hero .container");
      const copy = document.querySelector(".hero-copy");
      const showcase = container?.querySelector(":scope > .hero-showcase");
      const legacyVisual = container?.querySelector(":scope > .hero-visual");
      const visual = showcase || legacyVisual;
      const visibleCards = showcase
        ? Array.from(showcase.querySelectorAll(":scope > .hero-preview-card"))
            .filter((card) => {
              const style = getComputedStyle(card);
              const r = card.getBoundingClientRect();
              return style.display !== "none" && r.width > 0 && r.height > 0;
            })
            .map(rectOf)
        : [];
      const de = document.documentElement;
      return {
        hero: rectOf(hero),
        container: rectOf(container),
        copy: rectOf(copy),
        title: rect(".hero-title"),
        subtitle: rect(".hero-subtitle"),
        lead: rect(".hero-lead"),
        actions: rect(".hero-actions"),
        bridge: rect(".hero-bridge"),
        visual: rectOf(visual),
        visibleCards,
        visualOwner: showcase
          ? "showcase"
          : legacyVisual
            ? "legacy"
            : "missing",
        marquee: rect(".marquee-section"),
        columns: getComputedStyle(container).gridTemplateColumns,
        copyDisplay: getComputedStyle(copy).display,
        visualMaxWidth: visual ? getComputedStyle(visual).maxWidth : null,
        styleSheets: Array.from(
          document.styleSheets,
          (sheet) => sheet.href,
        ).filter(Boolean),
        paddingTop: parseFloat(getComputedStyle(hero).paddingTop),
        paddingBottom: parseFloat(getComputedStyle(hero).paddingBottom),
        clientWidth: de.clientWidth,
        scrollWidth: Math.max(de.scrollWidth, document.body.scrollWidth),
      };
    });

    if (language === "ja" && captureWidths.has(width)) {
      const hero = page.locator(".hero").first();
      if (await hero.isVisible()) {
        const file = `${width}px-ja-home-hero-section.png`;
        await hero.screenshot({
          path: path.join(outDir, file),
          animations: "disabled",
        });
        screenshots.push(file);
      }
    }

    const id = `${width}px/${language}`;
    if (state.scrollWidth > state.clientWidth + 2) {
      failures.push({ id, kind: "horizontal-overflow", state });
    }
    if (!state.hero || !state.copy || !state.visual || !state.marquee) {
      failures.push({ id, kind: "missing-hero-part", state });
      continue;
    }
    if (Math.abs(state.marquee.top - state.hero.bottom) > 2) {
      failures.push({ id, kind: "hero-marquee-gap", state });
    }

    const trackCount = state.columns.trim().split(/\s+/).length;
    const copyVisualGap = horizontalGap(state.copy, state.visual);

    if (width <= 559) {
      const stackGap = verticalGap(state.copy, state.visual);
      if (trackCount !== 1) {
        failures.push({ id, kind: "sp-hero-not-stacked", state });
      }
      if (state.visual.top < state.copy.bottom - 2) {
        failures.push({ id, kind: "sp-copy-phone-overlap", state });
      }
      if (stackGap < 12 || stackGap > 40) {
        failures.push({
          id,
          kind: "sp-stack-density-outlier",
          stackGap,
          state,
        });
      }
      if (state.visual.width < 175 || state.visual.width > 245) {
        failures.push({ id, kind: "sp-phone-size-outlier", state });
      }
      if (state.visualOwner === "showcase" && state.visibleCards.length !== 1) {
        failures.push({ id, kind: "sp-showcase-card-count", state });
      }
      if (state.paddingTop > 34 || state.paddingBottom > 32) {
        failures.push({ id, kind: "sp-padding-too-loose", state });
      }
    } else if (width <= 759) {
      if (trackCount < 2) {
        failures.push({
          id,
          kind: "compact-hero-lost-two-column-layout",
          state,
        });
      }
      if (overlaps(state.copy, state.visual)) {
        failures.push({ id, kind: "compact-columns-collision", state });
      }
      if (copyVisualGap !== null && copyVisualGap < 12) {
        failures.push({
          id,
          kind: "compact-columns-too-tight",
          copyVisualGap,
          state,
        });
      }
      if (state.visual.width < 145 || state.visual.width > 205) {
        failures.push({ id, kind: "compact-visual-size-outlier", state });
      }
      if (state.visualOwner === "showcase" && state.visibleCards.length !== 1) {
        failures.push({ id, kind: "compact-showcase-card-count", state });
      }
      if (state.paddingTop > 38 || state.paddingBottom > 36) {
        failures.push({ id, kind: "compact-padding-too-loose", state });
      }
    } else if (width <= 1023) {
      if (trackCount < 2) {
        failures.push({
          id,
          kind: "tablet-hero-lost-two-column-layout",
          state,
        });
      }
      if (overlaps(state.copy, state.visual)) {
        failures.push({ id, kind: "tablet-columns-collision", state });
      }
      if (copyVisualGap !== null && copyVisualGap < 16) {
        failures.push({
          id,
          kind: "tablet-columns-too-tight",
          copyVisualGap,
          state,
        });
      }
      if (state.visualOwner === "showcase") {
        if (state.visual.width < 320 || state.visual.width > 430) {
          failures.push({ id, kind: "tablet-showcase-size-outlier", state });
        }
        if (state.visibleCards.length !== 2) {
          failures.push({ id, kind: "tablet-showcase-card-count", state });
        }
        for (const card of state.visibleCards) {
          if (card.width < 145 || card.width > 210) {
            failures.push({
              id,
              kind: "tablet-showcase-card-size-outlier",
              card,
              state,
            });
          }
        }
      } else if (state.visual.width < 205 || state.visual.width > 290) {
        failures.push({ id, kind: "tablet-phone-size-outlier", state });
      }
      if (state.paddingTop > 50 || state.paddingBottom > 46) {
        failures.push({ id, kind: "tablet-padding-too-loose", state });
      }
    } else {
      if (trackCount < 2) {
        failures.push({
          id,
          kind: "desktop-hero-lost-two-column-layout",
          state,
        });
      }
      if (overlaps(state.copy, state.visual)) {
        failures.push({ id, kind: "desktop-columns-collision", state });
      }
    }
  }

  await context.close();
}

await browser.close();
const report = { findings: failures.length, screenshots, details: failures };
await fs.writeFile(
  path.join(outDir, "report.json"),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exit(1);
