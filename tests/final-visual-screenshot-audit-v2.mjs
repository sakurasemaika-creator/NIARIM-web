import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";
import fs from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const outDir =
  process.env.AUDIT_SCREENSHOT_DIR || "artifacts/final-visual-screenshots-v2";
const languages = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"];
const viewports = [
  { name: "sp360", width: 360, height: 800 },
  { name: "sp390", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "pc", width: 1440, height: 1000 },
];
const featureIds = [
  "drawing",
  "animation",
  "editing",
  "advanced",
  "audio",
  "save",
  "workspace",
  "widget",
  "export",
];
const expectedGalleryCards = 7;

await fs.mkdir(outDir, { recursive: true });
const browser = await chromium.launch(launchOptions());
const failures = [];
const screenshots = [];
const safe = (s) => String(s).replace(/[^a-zA-Z0-9_-]+/g, "-");

async function setLanguage(page, language) {
  await page.evaluate((lang) => {
    window.NIARIM_I18N?.applyLang?.(lang, { persist: false });
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";
    scrollTo(0, 0);
  }, language);
  await page.waitForTimeout(220);
}

async function settleFullPage(page) {
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";
    const style = document.createElement("style");
    style.id = "audit-fullpage-paint";
    style.textContent = `
      .section,.feature-section,.screenshot-card{content-visibility:visible!important}
      .reveal,.stagger-grid{opacity:1!important;transform:none!important;visibility:visible!important}
    `;
    document.head.appendChild(style);
  });

  let previousHeight = -1;
  for (let round = 0; round < 3; round++) {
    const state = await page.evaluate(() => ({
      height: document.documentElement.scrollHeight,
      viewportHeight: innerHeight,
    }));
    const max = Math.max(0, state.height - state.viewportHeight);
    const step = Math.max(300, Math.round(state.viewportHeight * 0.65));
    for (let y = 0; y < max; y += step) {
      await page.evaluate((top) => scrollTo(0, top), y);
      await page.waitForTimeout(55);
    }
    await page.evaluate((top) => scrollTo(0, top), max);
    await page.waitForTimeout(100);
    const currentHeight = await page.evaluate(
      () => document.documentElement.scrollHeight,
    );
    if (currentHeight === previousHeight) break;
    previousHeight = currentHeight;
  }

  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(140);
}

async function shot(locator, file) {
  if (!(await locator.count()) || !(await locator.first().isVisible())) return;
  const target = locator.first();
  await target.scrollIntoViewIfNeeded();
  await target.page().waitForTimeout(120);
  await target.screenshot({
    path: path.join(outDir, file),
    animations: "disabled",
  });
  screenshots.push(file);
}

async function inspectSurface(page, selector) {
  return page
    .locator(selector)
    .first()
    .evaluate((surface) => {
      const sr = surface.getBoundingClientRect();
      const bad = [];
      const isVisible = (el) => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return (
          cs.display !== "none" &&
          cs.visibility !== "hidden" &&
          Number(cs.opacity || 1) !== 0 &&
          r.width > 0 &&
          r.height > 0
        );
      };
      const hasClippingAncestor = (el) => {
        let p = el.parentElement;
        while (p && p !== surface) {
          const cs = getComputedStyle(p);
          const ox = cs.overflowX;
          const oy = cs.overflowY;
          if (
            ["auto", "scroll", "hidden", "clip"].includes(ox) ||
            ["auto", "scroll", "hidden", "clip"].includes(oy)
          )
            return true;
          p = p.parentElement;
        }
        return false;
      };
      for (const el of surface.querySelectorAll("*")) {
        if (!isVisible(el)) continue;
        const r = el.getBoundingClientRect();
        const outside =
          r.left < sr.left - 2 ||
          r.right > sr.right + 2 ||
          r.top < sr.top - 2 ||
          r.bottom > sr.bottom + 2;
        if (!outside || hasClippingAncestor(el)) continue;
        bad.push({
          tag: el.tagName,
          className:
            typeof el.className === "string"
              ? el.className
              : el.getAttribute("class") || "",
          text: (el.textContent || "").trim().slice(0, 80),
          left: r.left,
          right: r.right,
          top: r.top,
          bottom: r.bottom,
        });
        if (bad.length >= 20) break;
      }
      return {
        surface: {
          left: sr.left,
          right: sr.right,
          top: sr.top,
          bottom: sr.bottom,
        },
        descendants: bad,
      };
    });
}

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  for (const language of languages) {
    const prefix = `${vp.name}__${safe(language)}`;
    await page.goto(baseURL + "/", { waitUntil: "networkidle" });
    await setLanguage(page, language);
    await settleFullPage(page);
    await page.screenshot({
      path: path.join(outDir, `${prefix}__home__full.png`),
      fullPage: true,
      animations: "disabled",
    });
    screenshots.push(`${prefix}__home__full.png`);
    await shot(page.locator(".hero-visual"), `${prefix}__home__hero.png`);
    const cards = page.locator(".screenshot-scroller > .screenshot-card");
    const cardCount = await cards.count();
    if (cardCount !== expectedGalleryCards)
      failures.push({
        kind: "gallery-card-count",
        viewport: vp.name,
        language,
        actual: cardCount,
        expected: expectedGalleryCards,
      });
    await shot(
      page.locator(".screenshot-scroller"),
      `${prefix}__home__gallery-start.png`,
    );
    for (let i = 0; i < cardCount; i++) {
      await shot(cards.nth(i), `${prefix}__home__gallery-card-${i + 1}.png`);
    }
    if (cardCount) {
      await cards.last().scrollIntoViewIfNeeded();
      await page.waitForTimeout(100);
      const end = await page
        .locator(".screenshot-scroller")
        .evaluate((scroller) => {
          scroller.scrollLeft = scroller.scrollWidth;
          const last = scroller.lastElementChild?.getBoundingClientRect();
          const sr = scroller.getBoundingClientRect();
          return {
            lastLeft: last?.left,
            lastRight: last?.right,
            scrollerLeft: sr.left,
            scrollerRight: sr.right,
          };
        });
      await page.waitForTimeout(100);
      await shot(
        page.locator(".screenshot-scroller"),
        `${prefix}__home__gallery-end.png`,
      );
      if (
        Number.isFinite(end.lastLeft) &&
        Number.isFinite(end.lastRight) &&
        (end.lastLeft < end.scrollerLeft - 2 ||
          end.lastRight > end.scrollerRight + 2)
      )
        failures.push({
          kind: "gallery-last-card-clipped",
          viewport: vp.name,
          language,
          end,
        });
    }

    await page.goto(baseURL + "/features/", { waitUntil: "networkidle" });
    await setLanguage(page, language);
    await settleFullPage(page);
    await page.screenshot({
      path: path.join(outDir, `${prefix}__features__full.png`),
      fullPage: true,
      animations: "disabled",
    });
    screenshots.push(`${prefix}__features__full.png`);
    for (const id of featureIds) {
      const section = page.locator(`#${id}`);
      if (!(await section.count())) continue;
      await shot(
        section.locator(".feature-diagram"),
        `${prefix}__features__feature-${id}.png`,
      );
      const diagram = section.locator(".feature-diagram");
      if (await diagram.count()) {
        const inspection = await inspectSurface(
          page,
          `#${id} .feature-diagram`,
        );
        if (inspection.descendants.length)
          failures.push({
            kind: "feature-diagram-overflow",
            viewport: vp.name,
            language,
            feature: id,
            inspection,
          });
      }
    }
  }
  await context.close();
}

await browser.close();
await fs.writeFile(
  path.join(outDir, "manifest.json"),
  JSON.stringify({ screenshots, failures }, null, 2),
);
const byKind = failures.reduce(
  (acc, failure) => ((acc[failure.kind] = (acc[failure.kind] || 0) + 1), acc),
  {},
);
console.log(
  JSON.stringify(
    {
      ok: failures.length === 0,
      screenshots: screenshots.length,
      failures: failures.length,
      byKind,
    },
    null,
    2,
  ),
);
process.exitCode = failures.length ? 1 : 0;
