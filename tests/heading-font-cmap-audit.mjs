/**
 * Every character set in Kuramubon (headings, buttons, navigation) must be a
 * character the real Kuramubon font has, and must be drawn with it.
 *
 * 1. Against the full font: the text of every element whose font-family
 *    starts with Kuramubon, hidden ones included (closed accordions, the
 *    menu), is checked against tests/fonts/Kuramubon-cmap.json, the cmap of
 *    the source font (tools/font-cmap.mjs). A character the font lacks has to
 *    be reworded, not left to a fallback face.
 * 2. As drawn: for the visible ones, Chromium reports which fonts it used
 *    (CSS.getPlatformFontsForNode). Any glyph drawn with a font that is not a
 *    web font of the site means the subset or its unicode-range misses it.
 *
 * Pages are loaded twice so that the fonts with font-display: optional are
 * in the cache, as on a visitor's second page.
 *
 *   node tests/heading-font-cmap-audit.mjs
 *   HEADING_FONT_LANGS=ja,en HEADING_FONT_ROUTES=/,/about/ node tests/...
 */
import fs from "node:fs";
import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const routes = (
  process.env.HEADING_FONT_ROUTES ||
  "/,/about/,/features/,/premium/,/opals/,/community/,/help/,/faq/,/news/,/contact/,/privacy/,/terms/,/tokushoho/,/account-deletion/,/font-licenses/,/404.html"
).split(",");
const languages = (
  process.env.HEADING_FONT_LANGS || "ja,en,fr,es,ko,zh-Hans,zh-Hant"
).split(",");
const widths = (process.env.HEADING_FONT_WIDTHS || "1440,390")
  .split(",")
  .map(Number);

const cmap = new Set();
for (const [lo, hi] of JSON.parse(
  fs.readFileSync("tests/fonts/Kuramubon-cmap.json", "utf8"),
).ranges)
  for (let c = lo; c <= hi; c++) cmap.add(c);

const findings = [];
const browser = await chromium.launch(launchOptions());
for (const width of widths) {
  for (const language of languages) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      locale: language,
      reducedMotion: "reduce",
    });
    await context.addCookies([
      { name: "niarim_lang", value: language, url: baseURL },
    ]);
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    for (const route of routes) {
      const url = `${baseURL}${route}${route.includes("?") ? "&" : "?"}lang=${language}`;
      for (let pass = 0; pass < 2; pass++) {
        await page.goto(url, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
      }
      await page.waitForTimeout(250);
      const elements = await page.evaluate(() => {
        const out = [];
        let index = 0;
        for (const el of document.body.querySelectorAll("*")) {
          if (el.closest("svg, script, style, noscript, template")) continue;
          const own = [...el.childNodes]
            .filter((n) => n.nodeType === Node.TEXT_NODE)
            .map((n) => n.textContent)
            .join("")
            .replace(/\s+/g, " ")
            .trim();
          if (!own) continue;
          const cs = getComputedStyle(el);
          if (!/^"?Kuramubon/.test(cs.fontFamily)) continue;
          const text =
            cs.textTransform === "uppercase"
              ? own.toUpperCase()
              : cs.textTransform === "lowercase"
                ? own.toLowerCase()
                : own;
          const r = el.getBoundingClientRect();
          const visible =
            r.width > 0 &&
            r.height > 0 &&
            cs.visibility !== "hidden" &&
            el.checkVisibility?.({ opacityProperty: false }) !== false;
          const id = `kfa-${index++}`;
          if (visible) el.setAttribute("data-kfa", id);
          const name =
            el.tagName.toLowerCase() +
            (el.id ? `#${el.id}` : "") +
            (el.classList.length ? `.${[...el.classList].join(".")}` : "");
          out.push({ id, name, text, visible });
        }
        return out;
      });
      for (const el of elements) {
        const missing = [
          ...new Set(
            [...el.text].filter(
              // Zero-width break hints (U+200B, U+2060…) draw nothing.
              (ch) =>
                ch.trim() &&
                !/\p{Default_Ignorable_Code_Point}/u.test(ch) &&
                !cmap.has(ch.codePointAt(0)),
            ),
          ),
        ];
        if (missing.length)
          findings.push({
            kind: "not-in-kuramubon",
            route,
            language,
            width,
            element: el.name,
            missing: missing.join(""),
            text: el.text.slice(0, 80),
          });
      }
      await cdp.send("DOM.enable");
      await cdp.send("CSS.enable");
      const { root } = await cdp.send("DOM.getDocument", { depth: 0 });
      const { nodeIds } = await cdp.send("DOM.querySelectorAll", {
        nodeId: root.nodeId,
        selector: "[data-kfa]",
      });
      for (const nodeId of nodeIds) {
        const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", {
          nodeId,
        });
        const fallback = fonts.filter(
          (f) => !f.isCustomFont && f.glyphCount > 0,
        );
        if (!fallback.length) continue;
        const { attributes } = await cdp.send("DOM.getAttributes", {
          nodeId,
        });
        const id = attributes[attributes.indexOf("data-kfa") + 1];
        const el = elements.find((e) => e.id === id);
        findings.push({
          kind: "drawn-with-fallback",
          route,
          language,
          width,
          element: el?.name,
          fonts: fallback.map((f) => `${f.familyName}×${f.glyphCount}`),
          text: el?.text.slice(0, 80),
        });
      }
      await cdp.send("DOM.disable");
    }
    await context.close();
  }
}
await browser.close();

const unique = new Map();
for (const f of findings) {
  const key = `${f.kind}|${f.element}|${f.text}|${f.language}`;
  if (!unique.has(key)) unique.set(key, { ...f, routes: new Set() });
  unique.get(key).routes.add(f.route);
}
const details = [...unique.values()].map((f) => ({
  ...f,
  routes: [...f.routes],
}));
console.log(
  JSON.stringify(
    { routes, languages, widths, findings: details.length, details },
    null,
    2,
  ),
);
if (details.length) process.exit(1);
