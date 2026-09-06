import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const outDir = process.env.AUDIT_FULLPAGE_DIR || "artifacts/fullpage-multilang";
const routes = [
  "/",
  "/about/",
  "/features/",
  "/premium/",
  "/community/",
  "/help/",
  "/faq/",
  "/news/",
  "/contact/",
  "/privacy/",
  "/terms/",
  "/404.html",
];
const langs = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"];
const viewports = [
  { name: "sp", width: 390, height: 844 },
  { name: "pc", width: 1440, height: 1000 },
];
const slug = (route) =>
  route.replace(/^\//, "").replace(/[^a-zA-Z0-9_-]+/g, "-") || "home";

await fs.mkdir(outDir, { recursive: true });
const browser = await chromium.launch(launchOptions());
const manifest = [];

for (const vp of viewports) {
  for (const lang of langs) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      locale: lang === "ja" ? "ja-JP" : lang,
    });
    await context.addInitScript((value) => {
      localStorage.setItem("niarim_lang", value);
    }, lang);
    const page = await context.newPage();

    for (const route of routes) {
      await page.goto(baseURL + route, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(900);

      const max = await page.evaluate(() =>
        Math.max(0, document.documentElement.scrollHeight - innerHeight),
      );
      for (let y = 0; y < max; y += Math.max(300, Math.round(vp.height * 0.65))) {
        await page.evaluate((top) => scrollTo({ top, behavior: "auto" }), y);
        await page.waitForTimeout(80);
      }
      await page.evaluate((top) => scrollTo({ top, behavior: "auto" }), max);
      await page.waitForTimeout(250);
      await page.evaluate(() => {
        document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
        document.querySelectorAll(".stagger-grid > *").forEach((el) => el.classList.add("is-visible"));
        scrollTo(0, 0);
      });
      await page.waitForTimeout(180);

      const file = path.join(outDir, `${lang}__${vp.name}__${slug(route)}.png`);
      await page.screenshot({ path: file, fullPage: true, animations: "disabled" });
      const metrics = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        height: document.documentElement.scrollHeight,
      }));
      manifest.push({ lang, viewport: vp.name, route, file, metrics });
      console.log(`${lang} ${vp.name} ${route} -> ${file}`);
    }
    await context.close();
  }
}

await browser.close();
await fs.writeFile(
  path.join(outDir, "manifest.json"),
  JSON.stringify({ expected: routes.length * langs.length * viewports.length, captures: manifest }, null, 2),
);

if (manifest.length !== routes.length * langs.length * viewports.length) {
  throw new Error(`capture count mismatch: ${manifest.length}`);
}
