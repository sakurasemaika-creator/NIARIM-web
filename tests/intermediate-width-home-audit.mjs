import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const widths = [
  320, 339, 360, 390, 520, 543, 559, 560, 600, 640, 641, 642, 700, 732, 759,
  760, 900,
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
      const rect = (selector) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          left: r.left,
          right: r.right,
          top: r.top,
          bottom: r.bottom,
          width: r.width,
          height: r.height,
        };
      };
      const hero = document.querySelector(".hero");
      const container = document.querySelector(".hero .container");
      const copy = document.querySelector(".hero-copy");
      const visual = document.querySelector(".hero-visual");
      const de = document.documentElement;
      return {
        hero: rect(".hero"),
        copy: rect(".hero-copy"),
        title: rect(".hero-title"),
        subtitle: rect(".hero-subtitle"),
        lead: rect(".hero-lead"),
        actions: rect(".hero-actions"),
        visual: rect(".hero-visual"),
        marquee: rect(".marquee-section"),
        columns: getComputedStyle(container).gridTemplateColumns,
        copyDisplay: getComputedStyle(copy).display,
        visualMaxWidth: getComputedStyle(visual).maxWidth,
        compactMedia: matchMedia("(max-width: 759px)").matches,
        intermediateMedia: matchMedia(
          "(min-width: 641px) and (max-width: 759px)",
        ).matches,
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

    if (width <= 759) {
      const trackCount = state.columns.trim().split(/\s+/).length;
      if (trackCount < 2) {
        failures.push({
          id,
          kind: "compact-hero-lost-two-column-layout",
          state,
        });
      }
      if (overlaps(state.lead, state.visual)) {
        failures.push({ id, kind: "compact-lead-phone-collision", state });
      }
      if (overlaps(state.actions, state.visual)) {
        failures.push({ id, kind: "compact-actions-phone-collision", state });
      }
      if (state.visual.width > 200) {
        failures.push({ id, kind: "compact-phone-too-large", state });
      }
      if (state.paddingTop > 38 || state.paddingBottom > 34) {
        failures.push({ id, kind: "compact-padding-too-loose", state });
      }
    } else {
      if (overlaps(state.copy, state.visual)) {
        failures.push({ id, kind: "wide-hero-columns-collision", state });
      }
      if (state.paddingTop > 50 || state.paddingBottom > 46) {
        failures.push({ id, kind: "wide-padding-too-loose", state });
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
