import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
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
const widths = [320, 360, 375, 390, 430, 480, 520, 559, 560, 600, 640, 641, 700, 759, 760, 834, 900, 1024, 1180, 1280, 1366, 1440, 1600, 1920];
const findings = [];
const browser = await chromium.launch(launchOptions());

for (const width of widths) {
  const height = width <= 430 ? 844 : width <= 759 ? 900 : width <= 1024 ? 1112 : 1000;
  const context = await browser.newContext({ viewport: { width, height }, locale: "ja-JP" });
  const page = await context.newPage();

  for (const route of routes) {
    await page.goto(baseURL + route, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(120);
    const state = await page.evaluate(() => {
      const root = document.documentElement;
      const visible = (el) => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return cs.display !== "none" && cs.visibility !== "hidden" && Number(cs.opacity) > 0 && r.width > 0 && r.height > 0;
      };
      const selectors = "h1,h2,h3,p,a,button,input,textarea,select,img,svg,.card,.feature-row,.screenshot-card,.section-title,.container";
      const elements = [...document.querySelectorAll(selectors)].filter(visible);
      const outside = [];
      const tinyTargets = [];
      for (const el of elements) {
        const r = el.getBoundingClientRect();
        if (r.right > innerWidth + 2 || r.left < -2) {
          outside.push({ tag: el.tagName, cls: el.className?.toString().slice(0, 100) || "", left: r.left, right: r.right, width: r.width });
        }
        if (el.matches("a,button,input,select") && r.width > 0 && r.height > 0 && (r.width < 36 || r.height < 36)) {
          tinyTargets.push({ tag: el.tagName, text: (el.textContent || "").trim().slice(0, 60), width: r.width, height: r.height });
        }
      }
      const headings = [...document.querySelectorAll("h1,h2,h3")].filter(visible).map((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return { text: (el.textContent || "").trim().slice(0, 80), width: r.width, fontSize: parseFloat(cs.fontSize), lineHeight: parseFloat(cs.lineHeight) || null, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth };
      });
      return {
        scrollWidth: root.scrollWidth,
        clientWidth: root.clientWidth,
        outside: outside.slice(0, 20),
        tinyTargets: tinyTargets.slice(0, 20),
        headingOverflow: headings.filter((h) => h.scrollWidth > h.clientWidth + 2),
      };
    });
    if (state.scrollWidth > state.clientWidth + 2) findings.push({ width, route, kind: "page-horizontal-overflow", state });
    if (state.outside.length) findings.push({ width, route, kind: "visible-element-outside-viewport", elements: state.outside });
    if (state.headingOverflow.length) findings.push({ width, route, kind: "heading-overflow", headings: state.headingOverflow });
    // Tiny inline text links are allowed; flag only control-like targets with non-trivial boxes.
    const badTargets = state.tinyTargets.filter((x) => x.tag !== "A" || x.height >= 28 || x.width >= 28);
    if (badTargets.length) findings.push({ width, route, kind: "undersized-control", controls: badTargets });
  }
  await context.close();
}

await browser.close();
console.log(JSON.stringify({ combinations: widths.length * routes.length, findings: findings.length, details: findings }, null, 2));
if (findings.length) process.exit(1);
