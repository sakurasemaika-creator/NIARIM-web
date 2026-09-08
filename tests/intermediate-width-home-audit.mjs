import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const widths = [320, 339, 543, 560, 640, 642, 732, 760, 900];
const languages = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"];
const failures = [];
const browser = await chromium.launch(launchOptions());

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
      const de = document.documentElement;
      return {
        hero: rect(".hero"),
        copy: rect(".hero-copy"),
        visual: rect(".hero-visual"),
        marquee: rect(".marquee-section"),
        columns: getComputedStyle(container).gridTemplateColumns,
        paddingTop: parseFloat(getComputedStyle(hero).paddingTop),
        paddingBottom: parseFloat(getComputedStyle(hero).paddingBottom),
        clientWidth: de.clientWidth,
        scrollWidth: Math.max(de.scrollWidth, document.body.scrollWidth),
      };
    });

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
    if (width >= 641) {
      if (state.visual.left < state.copy.right - 2) {
        failures.push({ id, kind: "intermediate-columns-overlap", state });
      }
      if (state.visual.width > 232) {
        failures.push({ id, kind: "intermediate-phone-too-large", state });
      }
      if (state.paddingTop > 50 || state.paddingBottom > 46) {
        failures.push({ id, kind: "intermediate-padding-too-loose", state });
      }
    } else {
      if (state.visual.top < state.copy.bottom - 2) {
        failures.push({ id, kind: "sp-stack-overlap", state });
      }
      if (state.visual.width > 252) {
        failures.push({ id, kind: "sp-phone-too-large", state });
      }
      if (state.paddingTop > 38 || state.paddingBottom > 34) {
        failures.push({ id, kind: "sp-padding-too-loose", state });
      }
    }
  }

  await context.close();
}

await browser.close();
console.log(JSON.stringify({ findings: failures.length, details: failures }, null, 2));
if (failures.length) process.exit(1);
