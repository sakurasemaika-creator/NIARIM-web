/**
 * 同梱フォントに字形が無い文字を洗い出す監査。
 *
 * 「この文字だけ書体が変わって浮いて見える」は、CSSやスクリーンショットを
 * 眺めても原因が分からない。ブラウザがどのフォントで各文字を描いたかは
 * Chrome DevTools Protocol の CSS.getPlatformFontsForNode でしか取れないため、
 * 全ページの文字を1文字ずつ span に包み、1文字ずつ実際の描画フォントを問う。
 *
 * サイトの同梱フォント（白光明朝・くらむぼん・Noto各種）以外が返ってきたら、
 * その文字はサブセットから漏れているか、そもそも原本に字形が無い。
 * 前者は tools/build-fonts.py の収集対象を直し、後者は文字をやめて
 * アイコンやCSSの図形に置き換える。
 *
 * 使い方: AUDIT_BASE_URL=http://localhost:8788 node tests/font-fallback-audit.mjs [ja,en,...]
 */
import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const BASE = process.env.AUDIT_BASE_URL || "http://localhost:8788";
const ROUTES = [
  "/",
  "/features/",
  "/about/",
  "/help/",
  "/premium/",
  "/community/",
  "/faq/",
  "/contact/",
  "/privacy/",
  "/terms/",
  "/news/",
  "/download/",
];
const LANGS = (process.argv[2] || "ja,en,zh-Hans,zh-Hant,ko,fr,es").split(",");

// 同梱しているフォント。これ以外で描かれた文字が「落ちた」文字。
const BUNDLED = /^(Kuramubon|HakkouMincho|Noto Serif|Noto Sans)/;
// 絵文字はどの本文フォントも持たず、環境のカラー絵文字で描かれるのが正しい。
const EXPECTED_FALLBACK = /^(Noto Color Emoji)/;

const browser = await chromium.launch(launchOptions());
const findings = new Map();

for (const lang of LANGS) {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");
  await page.addInitScript((l) => localStorage.setItem("niarim_lang", l), lang);

  for (const route of ROUTES) {
    const res = await page
      .goto(BASE + route, { waitUntil: "networkidle" })
      .catch(() => null);
    if (!res || res.status() >= 400) continue;
    await page.waitForTimeout(900);

    // 1文字ずつ span に包む。CSS.getPlatformFontsForNode は要素単位でしか
    // 答えないので、こうしないと「その要素のどの文字が落ちたか」が分からない。
    await page.evaluate(() => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
      );
      const nodes = [];
      let n;
      while ((n = walker.nextNode())) nodes.push(n);
      for (const t of nodes) {
        if (!t.textContent.trim()) continue;
        if (t.parentElement.closest("script,style,noscript")) continue;
        const frag = document.createDocumentFragment();
        for (const ch of t.textContent) {
          const s = document.createElement("span");
          s.setAttribute("data-ch", ch);
          s.textContent = ch;
          frag.appendChild(s);
        }
        t.replaceWith(frag);
      }
    });
    await page.waitForTimeout(300);

    const { root } = await cdp.send("DOM.getDocument", { depth: -1 });
    const { nodeIds } = await cdp.send("DOM.querySelectorAll", {
      nodeId: root.nodeId,
      selector: "span[data-ch]",
    });

    for (const nodeId of nodeIds) {
      let fonts;
      try {
        fonts = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
      } catch {
        continue;
      }
      if (!fonts.fonts.length) continue;
      const family = fonts.fonts[0].familyName;
      if (BUNDLED.test(family) || EXPECTED_FALLBACK.test(family)) continue;

      const { node } = await cdp.send("DOM.describeNode", { nodeId });
      const ch = node.attributes[node.attributes.indexOf("data-ch") + 1];
      // 空白だけの span は、どのフォントで描かれても見た目に差が出ない。
      if (!ch || !ch.trim()) continue;

      const { object } = await cdp.send("DOM.resolveNode", { nodeId });

      // 画面外の文字（横に流れるマーキーの右側など）は、まだ実フォントで
      // 組まれていないため代替フォントを返すことがある。誤検出になるので、
      // 一度画面内へ入れてから同じ文字をもう一度問い直し、それでも
      // 代替フォントのままのものだけを報告する。
      await cdp.send("Runtime.callFunctionOn", {
        objectId: object.objectId,
        functionDeclaration:
          "function(){this.scrollIntoView({block:'center',inline:'center'});}",
      });
      await page.waitForTimeout(30);
      let recheck;
      try {
        recheck = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
      } catch {
        continue;
      }
      if (!recheck.fonts.length) continue;
      const confirmed = recheck.fonts[0].familyName;
      if (BUNDLED.test(confirmed) || EXPECTED_FALLBACK.test(confirmed))
        continue;
      const ctxRes = await cdp.send("Runtime.callFunctionOn", {
        objectId: object.objectId,
        returnByValue: true,
        functionDeclaration:
          "function(){const p=this.parentElement;" +
          "return (p?p.tagName+'.'+String(p.className).slice(0,30):'')" +
          "+' || '+getComputedStyle(this).fontFamily.slice(0,80);}",
      });

      const key = confirmed + "\t" + ctxRes.result.value;
      if (!findings.has(key)) {
        findings.set(key, {
          family,
          where: ctxRes.result.value,
          chars: new Set(),
          pages: [],
        });
      }
      const entry = findings.get(key);
      entry.chars.add(ch);
      const page_id = lang + route;
      if (entry.pages.length < 3 && !entry.pages.includes(page_id))
        entry.pages.push(page_id);
    }
  }
  await ctx.close();
}
await browser.close();

for (const f of findings.values()) {
  console.log(
    "FALLBACK",
    f.family,
    "|",
    [...f.chars].join(""),
    "|",
    f.where,
    "|",
    f.pages.join(" "),
  );
}
console.log(
  JSON.stringify(
    {
      ok: findings.size === 0,
      languages: LANGS.length,
      routes: ROUTES.length,
      fallbackGroups: findings.size,
    },
    null,
    2,
  ),
);
process.exit(findings.size === 0 ? 0 : 1);
