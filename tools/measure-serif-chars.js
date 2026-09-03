/**
 * 見出し用フォント（くらむぼん）で実際に描画される文字を実測する。
 *
 * なぜ必要か:
 *   くらむぼんは装飾性の高い極太フォントで、1文字あたりのアウトラインが重く、
 *   サイトの全文字(1542字)を入れると1.26MBに達していた。しかし
 *   --font-serif が当たるのは見出し・価格表示・カード・画面再現図のラベル等に
 *   限られ、本文の大半は白光明朝で描画される。実際に必要な文字だけに絞れば
 *   半分以下になる。
 *
 *   どの文字が見出しフォントで描画されるかはCSSの適用結果に依存するため、
 *   静的な解析では正確に求められない（--font-serif は !important 込みで
 *   多数のセレクタから適用され、DOMの一部はJSが生成する）。そこで実際に
 *   ブラウザでレンダリングし、computedStyleのfontFamilyが Kuramubon で
 *   始まるテキストノードだけを集める。
 *
 * 前提: `npx wrangler dev --port 8788` が起動していること。
 * 出力: stdout に文字列（build-fonts.py --measure が受け取る）
 */
const { chromium } = require("playwright");

const PAGES = [
  "/",
  "/about/",
  "/features/",
  "/help/",
  "/premium/",
  "/community/",
  "/news/",
  "/faq/",
  "/contact/",
  "/privacy/",
  "/terms/",
  "/404.html",
];
const LANGS = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"];
const ORIGIN = process.env.NIARIM_ORIGIN || "http://localhost:8788";

(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM || "/opt/pw-browsers/chromium",
  });
  const chars = new Set();
  const keys = new Set();

  for (const path of PAGES) {
    for (const lang of LANGS) {
      const page = await browser.newPage({
        viewport: { width: 1280, height: 900 },
      });
      await page.goto(ORIGIN + path, { waitUntil: "domcontentloaded" });
      await page.evaluate((l) => {
        try {
          localStorage.setItem("niarim_lang", l);
        } catch (e) {}
      }, lang);
      await page.reload({ waitUntil: "networkidle" });
      await page.waitForTimeout(400);
      // 閉じているアコーディオンの中身も対象にするため一度すべて開く
      await page.evaluate(() => {
        document.querySelectorAll(".faq-question").forEach((q) => q.click());
      });
      await page.waitForTimeout(300);

      const res = await page.evaluate(() => {
        const out = { txt: "", keys: [] };
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
        );
        let node;
        while ((node = walker.nextNode())) {
          const el = node.parentElement;
          if (!el) continue;
          // --font-serif は "Kuramubon" から始まる。先頭ファミリーで判定する。
          if (!/^\s*["']?Kuramubon/.test(getComputedStyle(el).fontFamily || ""))
            continue;
          out.txt += node.textContent;
          // 動的に差し替わる文言も拾えるよう、対応するi18nキーを控えておく
          let a = el;
          for (let i = 0; i < 3 && a; i++) {
            for (const attr of ["data-i18n", "data-i18n-html"]) {
              const k = a.getAttribute && a.getAttribute(attr);
              if (k) out.keys.push(k);
            }
            a = a.parentElement;
          }
        }
        return out;
      });
      for (const c of res.txt) chars.add(c);
      res.keys.forEach((k) => keys.add(k));
      await page.close();
    }
  }
  await browser.close();
  // 1行目: 文字、2行目以降: i18nキー（build-fonts.py側で全言語へ展開する）
  process.stdout.write(
    JSON.stringify({ chars: [...chars].join(""), keys: [...keys] }),
  );
})();
