/**
 * Checks Japanese copy on every public route against the actual shipped WOFF2
 * unicode-range sets and the font-family computed by Chromium. No screenshots
 * or backend calls are required. Set FONT_AUDIT_STRICT=1 to fail on findings.
 */
import fs from "node:fs";
import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const CSS = fs.readFileSync("public/css/common-base.css", "utf8");
const glyphs = { Kuramubon: new Set(), HakkouMincho: new Set(), Menu: new Set() };
for (const face of CSS.matchAll(/@font-face\s*\{([\s\S]*?)\}/g)) {
  const src = face[1];
  const name = src.match(/font-family:\s*"([^"]+)"/)?.[1] || "";
  const target = name.startsWith("Kuramubon") ? "Kuramubon" :
    name.startsWith("HakkouMincho") ? "HakkouMincho" :
    name.startsWith("NotoSerifMenu") ? "Menu" : null;
  if (!target) continue;
  const ranges = src.match(/unicode-range:\s*([\s\S]*?);/)?.[1] || "";
  for (const range of ranges.matchAll(/U\+([0-9a-f]{4,6})(?:-([0-9a-f]{4,6}))?/gi)) {
    const lo = parseInt(range[1], 16);
    const hi = parseInt(range[2] || range[1], 16);
    for (let point = lo; point <= hi; point++) glyphs[target].add(point);
  }
}
for (const [name, chars] of Object.entries(glyphs)) {
  if (chars.size < (name === "Menu" ? 20 : 500)) throw Error(name + " CSS glyph range is incomplete");
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
  for (const width of [390, 1280]) {
   for (const route of routes) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const response = await page.goto(base + route + "?lang=ja", { waitUntil: "networkidle" });
    if (!response || response.status() !== 200) throw Error("Unavailable page: " + route);
    await page.evaluate(async () => {
      document.querySelectorAll("details").forEach(d => { d.open = true; });
      await document.fonts.ready;
    });
    const result = await page.evaluate(({ h, b, m, route }) => {
      const families = { Kuramubon: new Set(h), HakkouMincho: new Set(b), Menu: new Set([...m, ...b]) };
      const discovered = [];
      const unknownDetails = [];
      const totals = { Kuramubon: 0, HakkouMincho: 0, Menu: 0, unknown: 0 };
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
          firstFont.startsWith("HakkouMincho") ? "HakkouMincho" :
          firstFont.startsWith("NotoSerifMenu") ? "Menu" : null;
        if (!family) {
          totals.unknown++;
          if (unknownDetails.length < 35) unknownDetails.push({ text: node.textContent.trim().slice(0,70), font: style.fontFamily.slice(0,120), tag: el.tagName, className: typeof el.className === "string" ? el.className.slice(0,70) : "" });
          continue;
        }
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
      // All footer navigation links share the licensed body font.
      for (const a of document.querySelectorAll(".site-footer .footer-col a")) {
        const first = getComputedStyle(a).fontFamily.split(",")[0].trim().replace(/^["\x27]|["\x27]$/g, "");
        if (!first.startsWith("HakkouMincho")) discovered.push({ family: first, chars: "", where: "footer:" + a.textContent.trim(), text: "Footer font mismatch" });
      }
      const navCoin = document.querySelector("header a[data-i18n=\"nav.coins\"]");
      if (navCoin) {
        const first = getComputedStyle(navCoin).fontFamily.split(",")[0].trim().replace(/^["\x27]|["\x27]$/g, "");
        if (!first.startsWith("Kuramubon")) discovered.push({ family: first, chars: "", where: "navigation:coins", text: navCoin.textContent.trim() });
      }
      if (route === "/community/") {
        const labels = [...document.querySelectorAll("[data-community-tab]")].map(x => x.textContent.trim());
        const expected = ["新着", "1day", "1week", "1month", "1year", "ALL TIME"];
        if (JSON.stringify(labels) !== JSON.stringify(expected)) discovered.push({ family: "labels", chars: "", where: "community:period-tabs", text: JSON.stringify(labels) });
      }
      if (route === "/premium/" && document.querySelector("main")?.textContent.includes("コイン・特典")) {
        discovered.push({ family: "copy", chars: "", where: "premium:obsolete-coin-navigation", text: "Legacy coin benefit label remains" });
      }
      return { discovered, totals, unknownDetails };
    }, { h: [...glyphs.Kuramubon], b: [...glyphs.HakkouMincho], m: [...glyphs.Menu], route });
    const unique = new Map();
    for (const f of result.discovered) {
      const key = f.family + ":" + f.where + ":" + f.chars;
      if (!unique.has(key)) unique.set(key, { route, width, ...f });
    }
    findings.push(...unique.values());
    routeReports.push({ route, width, ...result.totals, missingGroups: unique.size });
    console.log("FONT_ROUTE", JSON.stringify(routeReports.at(-1)));
    if (result.unknownDetails.length) console.log("FONT_UNKNOWN", JSON.stringify({route,width,details:result.unknownDetails}));
    await page.close();
   }
  }
} finally {
  await browser.close();
}
console.log("FONT_FINDINGS", JSON.stringify(findings.slice(0, 150)));
console.log("FONT_SUMMARY", JSON.stringify({ missingGroups: findings.length, routes: routes.length, widths: 2, menuGlyphs: glyphs.Menu.size, headGlyphs: glyphs.Kuramubon.size, bodyGlyphs: glyphs.HakkouMincho.size }));
if (findings.length && process.env.FONT_AUDIT_STRICT === "1") process.exitCode = 1;
