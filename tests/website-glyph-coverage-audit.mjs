/**
 * Checks Japanese copy on every public route against the actual shipped WOFF2
 * unicode-range sets and the font-family computed by Chromium. No screenshots
 * or backend calls are required. Set FONT_AUDIT_STRICT=1 to fail on findings.
 */
import fs from "node:fs";
import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const CSS = fs.readFileSync("public/css/common-base.css", "utf8");
const glyphs = { Kuramubon: new Set(), HakkouMincho: new Set() };
for (const face of CSS.matchAll(/@font-face\s*\{([\s\S]*?)\}/g)) {
  const src = face[1];
  const name = src.match(/font-family:\s*"([^"]+)"/)?.[1] || "";
  const target = name.startsWith("Kuramubon") ? "Kuramubon" :
    name.startsWith("HakkouMincho") ? "HakkouMincho" : null;
  if (!target) continue;
  const ranges = src.match(/unicode-range:\s*([\s\S]*?);/)?.[1] || "";
  for (const range of ranges.matchAll(/U\+([0-9a-f]{4,6})(?:-([0-9a-f]{4,6}))?/gi)) {
    const lo = parseInt(range[1], 16);
    const hi = parseInt(range[2] || range[1], 16);
    for (let point = lo; point <= hi; point++) glyphs[target].add(point);
  }
}
for (const [name, chars] of Object.entries(glyphs)) {
  if (chars.size < 500) throw Error(name + " CSS glyph range is incomplete");
}
const routes = [
  "/", "/about/", "/features/", "/help/", "/premium/", "/coins/",
  "/community/", "/faq/", "/contact/", "/privacy/", "/terms/", "/news/",
  "/font-licenses/"
];
const base = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const browser = await chromium.launch(launchOptions());
const findings = [];
const routeReports = [];
try {
  for (const route of routes) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const response = await page.goto(base + route + "?lang=ja", { waitUntil: "networkidle" });
    if (!response || response.status() !== 200) throw Error("Unavailable page: " + route);
    await page.evaluate(async () => {
      document.querySelectorAll("details").forEach(d => { d.open = true; });
      await document.fonts.ready;
    });
    const result = await page.evaluate(({ h, b }) => {
      const families = { Kuramubon: new Set(h), HakkouMincho: new Set(b) };
      const discovered = [];
      const totals = { Kuramubon: 0, HakkouMincho: 0, unknown: 0 };
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (!node.textContent?.trim()) continue;
        const el = node.parentElement;
        if (!el || el.closest("script,style,noscript,template,[hidden],[aria-hidden='true'],[data-community-gallery]")) continue;
        const style = getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;
        const firstFont = style.fontFamily.split(",")[0].trim().replace(/^["']|["']$/g, "");
        const family = firstFont.startsWith("Kuramubon") ? "Kuramubon" :
          firstFont.startsWith("HakkouMincho") ? "HakkouMincho" : null;
        if (!family) { totals.unknown++; continue; }
        totals[family]++;
        const missing = [...new Set([...node.textContent].filter(c =>
          c.trim() && !families[family].has(c.codePointAt(0))))].join("");
        if (!missing) continue;
        const ref = el.closest("[data-i18n],[data-i18n-html]") ||
          el.closest("h1,h2,h3,h4,h5,h6,button,summary,a") || el;
        const attr = ref.getAttribute("data-i18n") || ref.getAttribute("data-i18n-html");
        discovered.push({
          family,
          chars: missing,
          where: attr || (ref.tagName.toLowerCase() + (ref.className && typeof ref.className === "string" ? "." + ref.className.slice(0,60).replaceAll(" ", ".") : "")),
          text: node.textContent.trim().slice(0,100)
        });
      }
      return { discovered, totals };
    }, { h: [...glyphs.Kuramubon], b: [...glyphs.HakkouMincho] });
    const unique = new Map();
    for (const f of result.discovered) {
      const key = f.family + ":" + f.where + ":" + f.chars;
      if (!unique.has(key)) unique.set(key, { route, ...f });
    }
    findings.push(...unique.values());
    routeReports.push({ route, ...result.totals, missingGroups: unique.size });
    console.log("FONT_ROUTE", JSON.stringify(routeReports.at(-1)));
    await page.close();
  }
} finally {
  await browser.close();
}
console.log("FONT_FINDINGS", JSON.stringify(findings.slice(0, 150)));
console.log("FONT_SUMMARY", JSON.stringify({ missingGroups: findings.length, routes: routes.length, headGlyphs: glyphs.Kuramubon.size, bodyGlyphs: glyphs.HakkouMincho.size }));
if (findings.length && process.env.FONT_AUDIT_STRICT === "1") process.exitCode = 1;
