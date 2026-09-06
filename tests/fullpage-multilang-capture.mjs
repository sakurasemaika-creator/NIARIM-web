import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import pngjs from "pngjs";
import { launchOptions } from "./browser-launch.mjs";

const { PNG } = pngjs;
const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const outDir =
  process.env.AUDIT_FULLPAGE_DIR || "artifacts/fullpage-multilang";
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
const allLangs = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"];
const allViewports = [
  { name: "sp", width: 390, height: 844 },
  { name: "pc", width: 1440, height: 1000 },
];
const requestedLangs = (process.env.AUDIT_LANGS || allLangs.join(","))
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const requestedViewports = (process.env.AUDIT_VIEWPORTS || "sp,pc")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const langs = allLangs.filter((lang) => requestedLangs.includes(lang));
const viewports = allViewports.filter((vp) =>
  requestedViewports.includes(vp.name),
);
const slug = (route) =>
  route.replace(/^\//, "").replace(/[^a-zA-Z0-9_-]+/g, "-") || "home";

if (!langs.length || !viewports.length) {
  throw new Error("No valid language or viewport selected");
}

async function stitchFullPage(page, file) {
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";
  });

  const metrics = await page.evaluate(() => ({
    docHeight: document.documentElement.scrollHeight,
    viewportHeight: innerHeight,
  }));
  const max = Math.max(0, metrics.docHeight - metrics.viewportHeight);
  const positions = [];
  for (let y = 0; y < max; y += metrics.viewportHeight) positions.push(y);
  if (!positions.length || positions.at(-1) !== max) positions.push(max);

  await page.evaluate(() => {
    document
      .querySelectorAll(".reveal")
      .forEach((el) => el.classList.add("is-visible"));
    document
      .querySelectorAll(".stagger-grid > *")
      .forEach((el) => el.classList.add("is-visible"));
    let style = document.querySelector("style[data-fullpage-eye-review]");
    if (!style) {
      style = document.createElement("style");
      style.setAttribute("data-fullpage-eye-review", "");
      document.head.appendChild(style);
    }
    style.textContent = `
      .reveal,
      .stagger-grid > * {
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
        animation-delay: 0s !important;
      }
      .reveal h2 { clip-path: none !important; }
      html.eye-review-tail .site-header,
      html.eye-review-tail .scroll-top-btn,
      html.eye-review-tail .cursor-orbit,
      html.eye-review-tail .feature-nav {
        visibility: hidden !important;
      }
    `;
  });

  let output = null;
  for (let i = 0; i < positions.length; i++) {
    const y = positions[i];
    await page.evaluate(
      ({ top, hideChrome }) => {
        document.documentElement.classList.toggle(
          "eye-review-tail",
          hideChrome,
        );
        scrollTo(0, top);
      },
      { top: y, hideChrome: i > 0 },
    );
    await page.waitForTimeout(80);
    const actualY = await page.evaluate(() => Math.round(scrollY));
    if (Math.abs(actualY - y) > 2) {
      throw new Error(`scroll position mismatch: wanted ${y}, got ${actualY}`);
    }

    const buffer = await page.screenshot({
      fullPage: false,
      animations: "disabled",
    });
    const slice = PNG.sync.read(buffer);
    if (!output) {
      output = new PNG({ width: slice.width, height: metrics.docHeight });
    }
    const copyHeight = Math.max(
      0,
      Math.min(slice.height, metrics.docHeight - actualY),
    );
    if (copyHeight > 0) {
      PNG.bitblt(
        slice,
        output,
        0,
        0,
        slice.width,
        copyHeight,
        0,
        actualY,
      );
    }
  }

  await page.evaluate(() => {
    document.documentElement.classList.remove("eye-review-tail");
    scrollTo(0, 0);
  });
  await fs.writeFile(file, PNG.sync.write(output));
}

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

      const file = path.join(
        outDir,
        `${lang}__${vp.name}__${slug(route)}.png`,
      );
      await stitchFullPage(page, file);
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
const expected = routes.length * langs.length * viewports.length;
await fs.writeFile(
  path.join(outDir, "manifest.json"),
  JSON.stringify({ expected, captures: manifest }, null, 2),
);

if (manifest.length !== expected) {
  throw new Error(`capture count mismatch: ${manifest.length}/${expected}`);
}
