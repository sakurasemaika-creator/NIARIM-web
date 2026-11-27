/**
 * Measures, page by page and language by language, which characters the
 * browser draws with each Japanese font (KuramubonCJK for headings,
 * HakkouMinchoCJK for text), and writes tools/page-font-chars.json.
 * tools/font_chunks.py splits each of those fonts into files by these pages,
 * so a page downloads only the parts it uses.
 *
 * A character counts for a family when it is the first family in the
 * element's font-family list whose @font-face unicode-range holds it (as the
 * browser picks the face). Hidden text (closed menus, FAQ answers),
 * placeholders and ::before / ::after strings count too. Text that appears
 * only later (search results, messages) is still drawn correctly: it may
 * fetch one more part of the font then.
 *
 * Requires a server (npx wrangler dev --port 8788).
 * Usage: node tools/measure-page-font-chars.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { launchOptions } from "../tests/browser-launch.mjs";
import { requireServer } from "./dev-server.mjs";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "tools", "page-font-chars.json");
export const MEASURED_FAMILIES = ["HakkouMinchoCJK", "KuramubonCJK"];
const PAGES = [
  "/",
  "/about/",
  "/community/",
  "/contact/",
  "/faq/",
  "/features/",
  "/font-licenses/",
  "/help/",
  "/news/",
  "/opals/",
  "/premium/",
  "/privacy/",
  "/terms/",
  "/tokushoho/",
  "/account-deletion/",
  "/404.html",
];
const LANGS = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"];

function collect(families) {
  const faces = {};
  const parseRanges = (text) =>
    (text || "U+0-10FFFF").split(",").map((part) => {
      const [a, b] = part.trim().replace(/^U\+/i, "").split("-");
      return [parseInt(a, 16), parseInt(b || a, 16)];
    });
  const walkRules = (rules) => {
    for (const rule of rules) {
      if (rule instanceof CSSFontFaceRule) {
        const family = rule.style
          .getPropertyValue("font-family")
          .replace(/["']/g, "")
          .trim();
        (faces[family] = faces[family] || []).push(
          parseRanges(rule.style.getPropertyValue("unicode-range")),
        );
      } else if (rule.cssRules) walkRules(rule.cssRules);
    }
  };
  for (const sheet of document.styleSheets) {
    try {
      walkRules(sheet.cssRules);
    } catch (_) {}
  }
  const used = {};
  const add = (text, style) => {
    const list = style.fontFamily
      .split(",")
      .map((name) => name.trim().replace(/^["']|["']$/g, ""));
    for (const ch of text) {
      const cp = ch.codePointAt(0);
      if (cp <= 0x20) continue;
      for (const family of list) {
        const ranges = faces[family];
        if (!ranges) break; // a device font: none of the site's files
        if (ranges.some((r) => r.some(([a, b]) => cp >= a && cp <= b))) {
          if (families.includes(family))
            (used[family] = used[family] || new Set()).add(ch);
          break;
        }
      }
    }
  };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const el = node.parentElement;
    if (!el || el.closest("script, style, noscript, template")) continue;
    add(node.data, getComputedStyle(el));
  }
  for (const el of document.querySelectorAll("*")) {
    for (const pseudo of ["::before", "::after"]) {
      const style = getComputedStyle(el, pseudo);
      const match = /^"(.*)"$/.exec(style.content);
      if (match) add(match[1], style);
    }
    if (el.placeholder) add(el.placeholder, getComputedStyle(el));
  }
  return Object.fromEntries(
    Object.entries(used).map(([family, set]) => [
      family,
      [...set].sort().join(""),
    ]),
  );
}

const { base } = await requireServer();
const browser = await chromium.launch(launchOptions());
const result = Object.fromEntries(MEASURED_FAMILIES.map((f) => [f, {}]));
for (const page of PAGES) {
  for (const lang of LANGS) {
    const tab = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });
    await tab.goto(`${base}${page}?lang=${lang}`, { waitUntil: "load" });
    await tab.waitForTimeout(2000);
    const used = await tab.evaluate(collect, MEASURED_FAMILIES);
    for (const [family, chars] of Object.entries(used))
      result[family][`${page} ${lang}`] = chars;
    await tab.close();
  }
}
await browser.close();
fs.writeFileSync(out, JSON.stringify(result, null, 2) + "\n");
console.log(`Wrote ${path.relative(root, out)}`);
