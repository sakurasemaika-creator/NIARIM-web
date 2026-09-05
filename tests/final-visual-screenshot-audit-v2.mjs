import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";
import fs from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const outDir = process.env.AUDIT_SCREENSHOT_DIR || "artifacts/final-visual-screenshots-v2";
const languages = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"];
const viewports = [
  { name: "sp360", width: 360, height: 800 },
  { name: "sp390", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "pc", width: 1440, height: 1000 },
];
const featureIds = ["drawing", "animation", "editing", "advanced", "audio", "save", "workspace", "widget", "export"];

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

async function shot(locator, file) {
  if (!(await locator.count()) || !(await locator.first().isVisible())) return;
  await locator.first().screenshot({ path: path.join(outDir, file), animations: "disabled" });
  screenshots.push(file);
}

async function inspectSurface(page, selector) {
  return page.locator(selector).first().evaluate((surface) => {
    const sr = surface.getBoundingClientRect();
    const bad = [];
    const isVisible = (el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return cs.display !== "none" && cs.visibility !== "hidden" && Number(cs.opacity || 1) !== 0 && r.width > 0 && r.height > 0;
    };
    const hasClippingAncestor = (el) => {
      let p = el.parentElement;
      while (p && p !== surface) {
        const cs = getComputedStyle(p);
        const ox = cs.overflowX;
        const oy = cs.overflowY;
        if (["auto", "scroll", "hidden", "clip"].includes(ox) || ["auto", "scroll", "hidden", "clip"].includes(oy)) return true;
        p = p.parentElement;
      }
      return false;
    };
    for (const el of surface.querySelectorAll("*")) {
      if (!isVisible(el)) continue;
      const r = el.getBoundingClientRect();
      const outside = r.left < sr.left - 2 || r.right > sr.right + 2 || r.top < sr.top - 2 || r.bottom > sr.bottom + 2;
      if (!outside || hasClippingAncestor(el)) continue;
      bad.push({
        tag: el.tagName,
        className: typeof el.className === "string" ? el.className : el.getAttribute("class") || "",
        text: (el.textContent || "").trim().slice(0, 80),
        left: r.left, right: r.right, top: r.top, bottom: r.bottom,
      });
      if (bad.length >= 20) break;
    }
    return { surface: { left: sr.left, right: sr.right, top: sr.top, bottom: sr.bottom }, descendants: bad };
  });
}

for (const vp of viewports) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  for (const language of languages) {
    const prefix = `${vp.name}__${safe(language)}`;

    await page.goto(baseURL + "/", { waitUntil: "networkidle" });
    await setLanguage(page, language);
    await page.screenshot({ path: path.join(outDir, `${prefix}__home__full.png`), fullPage: true, animations: "disabled" });
    screenshots.push(`${prefix}__home__full.png`);
    await shot(page.locator(".hero-visual"), `${prefix}__home__hero.png`);
    const cards = page.locator(".screenshot-scroller > .screenshot-card");
    const cardCount = await cards.count();
    if (cardCount !== 6) failures.push({ kind: "gallery-card-count", viewport: vp.name, language, actual: cardCount });
    for (let i = 0; i < cardCount; i++) await shot(cards.nth(i), `${prefix}__home__gallery-card-${i + 1}.png`);
    const scroller = page.locator(".screenshot-scroller");
    if (await scroller.count()) {
      await scroller.evaluate((el) => { el.scrollLeft = 0; });
      await page.waitForTimeout(80);
      await shot(scroller, `${prefix}__home__gallery-start.png`);
      await scroller.evaluate((el) => { el.scrollTo({ left: el.scrollWidth, behavior: "instant" }); });
      await page.waitForTimeout(180);
      const end = await scroller.evaluate((s) => {
        const last = s.querySelector(":scope > .screenshot-card:last-of-type");
        if (!last) return null;
        const sr = s.getBoundingClientRect();
        const lr = last.getBoundingClientRect();
        return { scrollLeft: s.scrollLeft, maxScrollLeft: s.scrollWidth - s.clientWidth, scrollerLeft: sr.left, scrollerRight: sr.right, lastLeft: lr.left, lastRight: lr.right };
      });
      if (end && (end.maxScrollLeft - end.scrollLeft > 2 || end.lastLeft < end.scrollerLeft - 2 || end.lastRight > end.scrollerRight + 2)) failures.push({ kind: "gallery-last-card-clipped", viewport: vp.name, language, end });
      await shot(scroller, `${prefix}__home__gallery-end.png`);
    }

    await page.goto(baseURL + "/features/", { waitUntil: "networkidle" });
    await setLanguage(page, language);
    await page.screenshot({ path: path.join(outDir, `${prefix}__features__full.png`), fullPage: true, animations: "disabled" });
    screenshots.push(`${prefix}__features__full.png`);
    for (const id of featureIds) {
      const section = page.locator(`#${id}`);
      if (!(await section.count())) {
        failures.push({ kind: "feature-missing", viewport: vp.name, language, id });
        continue;
      }
      await shot(section, `${prefix}__features__feature-${id}.png`);
      const surface = section.locator(":scope > .feature-diagram, :scope > .fd-app-screen, :scope > .fd-route-screen").first();
      if (!(await surface.count())) continue;
      const inspection = await inspectSurface(page, `#${id} > .feature-diagram, #${id} > .fd-app-screen, #${id} > .fd-route-screen`);
      if (inspection.descendants.length) failures.push({ kind: "feature-internal-overflow", viewport: vp.name, language, id, ...inspection });
    }
  }
  await context.close();
}
await browser.close();

const manifest = { generatedAt: new Date().toISOString(), screenshots, failures };
await fs.writeFile(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ ok: failures.length === 0, screenshots: screenshots.length, failures: failures.length, byKind: failures.reduce((a, x) => ((a[x.kind] = (a[x.kind] || 0) + 1), a), {}) }, null, 2));
if (failures.length) process.exitCode = 1;
