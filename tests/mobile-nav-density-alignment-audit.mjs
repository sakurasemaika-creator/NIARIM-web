import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const browser = await chromium.launch(launchOptions);
const issues = [];

for (const width of [320, 390, 768, 1024, 1180]) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(baseURL + "/", { waitUntil: "networkidle" });
  const toggle = page.locator(".nav-toggle");
  if (await toggle.isVisible()) await toggle.click();
  const state = await page.locator(".main-nav").evaluate((nav) => {
    const links = [...nav.querySelectorAll(":scope > ul > li > a")].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 1 && r.height > 1;
    });
    return {
      links: links.map((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return { left: r.left, height: r.height, textAlign: cs.textAlign, justifyContent: cs.justifyContent };
      }),
      nav: (() => { const r=nav.getBoundingClientRect(); return { left:r.left,right:r.right,width:r.width }; })(),
    };
  });
  state.links.forEach((link, index) => {
    if (link.textAlign !== "left" || link.justifyContent !== "flex-start")
      issues.push({ width, index, kind: "mobile-nav-not-left-aligned", link });
    if (link.height > 50)
      issues.push({ width, index, kind: "mobile-nav-row-too-tall", link });
  });
  if (state.links.length > 1) {
    const left = state.links[0].left;
    state.links.forEach((link, index) => {
      if (Math.abs(link.left - left) > 2)
        issues.push({ width, index, kind: "mobile-nav-left-axis-drift", link, expectedLeft: left });
    });
  }
  await context.close();
}
await browser.close();
console.log(JSON.stringify({ issues: issues.length, details: issues }, null, 2));
if (issues.length) process.exit(1);
