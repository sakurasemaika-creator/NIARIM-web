/**
 * Line breaks in headings: every heading-like element (h1–h6, summary, FAQ
 * questions, buttons, table heads, captions, navigation links) on every page,
 * in the 7 languages, at 320/390/768/1024/1440px. Each element's text is split
 * into its rendered lines (one Range per character) and a break is a finding
 * when it falls inside a word (Latin, Korean, a Japanese katakana word or a
 * Chinese/Japanese dictionary word from Intl.Segmenter), when a closing
 * bracket, small kana, prolonged sound mark or punctuation starts a line, when
 * an opening bracket ends one, or when a word kept on one line (i18n.js) still
 * runs past its box. Japanese breaks before hiragana are left to
 * word-break: auto-phrase. Exits 1 on findings.
 *
 *   node tests/heading-line-break-audit.mjs [paths] [langs] [widths]
 */
import fs from "node:fs";
import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";
const [pathsArg, langsArg, widthsArg, selArg] = process.argv.slice(2);
const out =
  process.env.LINE_BREAK_AUDIT_OUT || "artifacts/heading-line-breaks.json";
const PATHS = (
  pathsArg ||
  "/,/about/,/features/,/help/,/premium/,/opals/,/community/,/news/,/faq/,/contact/,/privacy/,/terms/,/tokushoho/,/account-deletion/,/font-licenses/,/404.html"
).split(",");
const LANGS = (langsArg || "ja,en,es,fr,ko,zh-Hans,zh-Hant").split(",");
const WIDTHS = (widthsArg || "320,390,768,1024,1440").split(",").map(Number);
const SEL =
  selArg ||
  'h1,h2,h3,h4,h5,h6,summary,[role="heading"],.btn,button,dt,th,figcaption,.main-nav a,.footer-grid a';
const BASE = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const b = await chromium.launch(launchOptions());
const results = [];
async function run(lang, w) {
  const ctx = await b.newContext({
    viewport: { width: w, height: 900 },
    locale: lang,
    hasTouch: w < 800,
    isMobile: w < 800,
  });
  await ctx.addCookies([{ name: "niarim_lang", value: lang, url: BASE }]);
  const p = await ctx.newPage();
  for (const path of PATHS) {
    try {
      await p.goto(
        BASE + path + (path.includes("?") ? "&" : "?") + "lang=" + lang,
        { waitUntil: "networkidle", timeout: 45000 },
      );
      await p.evaluate(() => document.fonts.ready);
      await p.addStyleTag({
        content: "*{content-visibility:visible !important}",
      });
      await p.evaluate(() => {
        for (const d of document.querySelectorAll("details")) d.open = true;
      });
      await p.waitForTimeout(150);
      const hits = await p.evaluate(
        ({ SEL, lang }) => {
          const startBad =
            /^[)）\]］}｝〕〉》」』】〙〗〟’”»、。，．,.:：;；!！?？・ー〜～ぁぃぅぇぉっゃゅょゎゕゖァィゥェォッャュョヮヵヶㇰ-ㇿ%％‰°′″℃]/u;
          const endBad = /[(（\[［{｛〔〈《「『【〘〖〝‘“«]$/u;
          const zw = /[​⁠­﻿‌‍]/;
          const seg = new Intl.Segmenter(lang, { granularity: "word" });
          const out = [];
          const seen = new Set();
          for (const el of document.querySelectorAll(SEL)) {
            if (seen.has(el)) continue;
            // skip nested matches (outer element covers them)
            let anc = el.parentElement,
              nested = false;
            while (anc) {
              if (seen.has(anc)) {
                nested = true;
                break;
              }
              anc = anc.parentElement;
            }
            if (nested) continue;
            seen.add(el);
            if (!el.getClientRects().length) continue;
            const cs = getComputedStyle(el);
            if (cs.visibility === "hidden" || cs.display === "none") continue;
            if (el.closest('[aria-hidden="true"], .sr-only, .visually-hidden'))
              continue;
            let full = "";
            const chars = [];
            const walk = (node) => {
              for (const n of node.childNodes) {
                if (n.nodeType === 3) {
                  const t = n.data;
                  const base = full.length;
                  full += t;
                  for (let i = 0; i < t.length; ) {
                    const cp = t.codePointAt(i);
                    const len = cp > 0xffff ? 2 : 1;
                    const ch = String.fromCodePoint(cp);
                    if (!/\s/.test(ch) && !zw.test(ch)) {
                      const r = document.createRange();
                      r.setStart(n, i);
                      r.setEnd(n, i + len);
                      const rects = [...r.getClientRects()].filter(
                        (q) => q.width > 0 || q.height > 0,
                      );
                      if (rects.length)
                        chars.push({
                          ch,
                          gi: base + i,
                          len,
                          top: rects[0].top,
                          bottom: rects[0].bottom,
                          left: rects[0].left,
                        });
                    }
                    i += len;
                  }
                } else if (n.nodeType === 1) {
                  const c = getComputedStyle(n);
                  if (c.display === "none" || c.visibility === "hidden")
                    continue;
                  if (n.tagName === "BR") {
                    full += "\n";
                    continue;
                  }
                  if (
                    n.tagName === "svg" ||
                    n.tagName === "SVG" ||
                    n.tagName === "IMG"
                  ) {
                    full += " ";
                    continue;
                  }
                  if (
                    c.display === "block" ||
                    c.display === "flex" ||
                    c.display === "grid" ||
                    c.display === "list-item"
                  ) {
                    full += "\n";
                    walk(n);
                    full += "\n";
                    continue;
                  }
                  walk(n);
                }
              }
            };
            walk(el);
            // words kept on one line that still run past their block
            for (const w of el.querySelectorAll(".nw")) {
              let blk = w.parentElement;
              while (
                blk &&
                blk !== el &&
                /^inline/.test(getComputedStyle(blk).display)
              )
                blk = blk.parentElement;
              const br = blk.getBoundingClientRect(),
                wr = w.getBoundingClientRect();
              const cs2 = getComputedStyle(blk);
              if (
                wr.right > br.right - parseFloat(cs2.paddingRight) + 1 ||
                wr.left < br.left + parseFloat(cs2.paddingLeft) - 1
              ) {
                const r = el.getBoundingClientRect();
                out.push({
                  tag: el.tagName.toLowerCase(),
                  key: el.dataset.i18n || "",
                  cls: "",
                  problems: ["overflow:" + w.textContent],
                  lines: [el.textContent.trim().slice(0, 80)],
                  elw: Math.round(r.width),
                  y: Math.round(r.top + scrollY),
                  fit: el.style.fontSize || "",
                });
                break;
              }
            }
            if (chars.length < 2) continue;
            const bounds = new Set();
            for (const s of seg.segment(full)) bounds.add(s.index);
            bounds.add(full.length);
            // lines
            const lines = [[chars[0]]];
            for (let k = 1; k < chars.length; k++) {
              const prev =
                lines[lines.length - 1][lines[lines.length - 1].length - 1];
              const c = chars[k];
              const h = Math.min(prev.bottom - prev.top, c.bottom - c.top);
              if (
                c.top > prev.top + h * 0.6 ||
                (c.left < prev.left - 2 && c.top > prev.top + h * 0.3)
              )
                lines.push([c]);
              else lines[lines.length - 1].push(c);
            }
            if (lines.length < 2) continue;
            const lineText = lines.map((l) => l.map((c) => c.ch).join(""));
            for (let k = 0; k + 1 < lines.length; k++) {
              const A = lines[k][lines[k].length - 1],
                B = lines[k + 1][0];
              const between = full.slice(A.gi + A.len, B.gi);
              const problems = [];
              const spaced = /[\s\n]/.test(between);
              if (!spaced) {
                if (startBad.test(B.ch)) problems.push("start:" + B.ch);
                if (endBad.test(A.ch)) problems.push("end:" + A.ch);
                const latinA =
                  /[\p{L}\p{N}]/u.test(A.ch) &&
                  !/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(
                    A.ch,
                  );
                const latinB =
                  /[\p{L}\p{N}]/u.test(B.ch) &&
                  !/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(
                    B.ch,
                  );
                if (between.includes("­")) problems.push("hyphenated");
                else if (latinA && latinB) problems.push("midword");
                else if (
                  /\p{Script=Hangul}/u.test(A.ch) &&
                  /\p{Script=Hangul}/u.test(B.ch)
                )
                  problems.push("midword-ko");
                else if (
                  /[\p{Script=Katakana}ー]/u.test(A.ch) &&
                  /[\p{Script=Katakana}ー]/u.test(B.ch)
                ) {
                  if (!bounds.has(B.gi)) problems.push("midword-kana");
                } else if (lang === "ja" && /\p{Script=Hiragana}/u.test(B.ch)) {
                  /* phrase breaks before hiragana are left to auto-phrase */
                } else if (!bounds.has(B.gi) && !startBad.test(B.ch)) {
                  // inside a dictionary word (ja/zh)
                  let w = "";
                  for (const s of seg.segment(full))
                    if (s.index <= B.gi && s.index + s.segment.length > B.gi)
                      w = s.segment;
                  problems.push("inword:" + w);
                }
              } else if (/[\s]/.test(between) && !between.includes("\n")) {
                if (startBad.test(B.ch) && !/^[ー〜]/.test(B.ch))
                  problems.push("start-after-space:" + B.ch);
              }
              if (problems.length) {
                const r = el.getBoundingClientRect();
                out.push({
                  ew: 0,
                  tag: el.tagName.toLowerCase(),
                  key:
                    el.dataset.i18n ||
                    el.closest("[data-i18n]")?.dataset.i18n ||
                    "",
                  cls: (el.className && el.className.baseVal === undefined
                    ? el.className
                    : ""
                  ).slice(0, 60),
                  problems,
                  lines: lineText,
                  elw: Math.round(r.width),
                  y: Math.round(r.top + scrollY),
                });
              }
            }
          }
          return out;
        },
        { SEL, lang },
      );
      const hs = await p.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      );
      if (hs > 1)
        results.push({ path, lang, w, problems: ["hscroll:" + hs], lines: [] });
      for (const h of hits) results.push({ path, lang, w, ...h });
    } catch (e) {
      results.push({ path, lang, w, error: String(e).slice(0, 200) });
    }
  }
  await ctx.close();
}
const jobs = [];
for (const lang of LANGS) for (const w of WIDTHS) jobs.push([lang, w]);
const CONC = +(process.env.CONC || 4);
let idx = 0;
await Promise.all(
  Array.from({ length: CONC }, async () => {
    while (idx < jobs.length) {
      const j = jobs[idx++];
      await run(...j);
      process.stderr.write(".");
    }
  }),
);
await b.close();
fs.mkdirSync(out.replace(/[^/]*$/, "") || ".", { recursive: true });
fs.writeFileSync(out, JSON.stringify(results, null, 1));
const byKind = {};
for (const r of results)
  for (const pr of r.problems || ["error"]) {
    const k = pr.split(":")[0];
    byKind[k] = (byKind[k] || 0) + 1;
  }
console.log("\nhits", results.length, byKind);
for (const r of results.slice(0, 40))
  console.log(
    r.path,
    r.lang,
    r.w,
    r.tag || "",
    (r.problems || [r.error]).join(" "),
    (r.lines || []).join(" | ").slice(0, 100),
  );
if (results.length) process.exitCode = 1;
