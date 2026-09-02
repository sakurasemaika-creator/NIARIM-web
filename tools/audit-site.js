/**
 * NIARIM公式サイト 回帰チェック
 *
 * 使い方:
 *   npx wrangler dev --port 8787       # 別ターミナルで起動しておく
 *   node tools/audit-site.js           # 既定で http://localhost:8787 を見る
 *   BASE_URL=http://localhost:9999 node tools/audit-site.js
 *
 * 終了コード: 問題ゼロなら0、1件でもあれば1（CIでそのまま使える）。
 *
 * 判定でハマりやすい点（過去に誤検出を出したもの）:
 *  - 「見えない」を display:none だけで判定しない。閉じたFAQは
 *    max-height:0 + visibility:hidden で畳んでいるので、visibility と
 *    実際に focus() が通るかまで見ないとタブ順の可否が判定できない。
 *  - リンクのアクセシブル名を「最初のimgのalt」で判定しない。ロゴは
 *    アイコン(alt="")とタイトル(alt="NIARIM")の2枚組なので、
 *    子孫のaltを全部集めて判定する。
 *  - 非表示判定は要素自身だけでなく祖先までさかのぼる。Xリンクは
 *    config-links.js が親の<li>ごと隠している。
 */
const { chromium } = require("playwright");

const BASE = process.env.BASE_URL || "http://localhost:8787";
const PAGES = ["/", "/about/", "/features/", "/help/", "/premium/", "/community/",
               "/news/", "/faq/", "/contact/", "/privacy/", "/terms/", "/404.html"];
const WIDTHS = [320, 375, 768, 1024, 1280];

(async () => {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  let issues = 0;
  const note = (path, kind, detail) => {
    issues++;
    console.log(`  [${kind}] ${path} -> ${detail}`);
  };

  for (const path of PAGES) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    const failed = [];
    const external = [];
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));
    page.on("requestfailed", (r) => failed.push(r.url() + " :: " + (r.failure() || {}).errorText));
    page.on("request", (r) => { if (!r.url().startsWith(BASE) && !r.url().startsWith("data:")) external.push(r.url()); });

    const resp = await page.goto(BASE + path, { waitUntil: "networkidle" });
    if (!resp || resp.status() >= 400) note(path, "HTTP", String(resp && resp.status()));
    await page.waitForTimeout(400);

    const res = await page.evaluate(() => {
      // 祖先までさかのぼって「レンダリングされていない」かを見る
      const isHidden = (el) => {
        for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
          const cs = getComputedStyle(e);
          if (cs.display === "none" || cs.visibility === "hidden" || cs.contentVisibility === "hidden") return true;
          if (e.hasAttribute("hidden") || e.getAttribute("aria-hidden") === "true") return true;
        }
        return false;
      };
      // リンク/ボタンのアクセシブル名を、子孫のalt・aria-labelまで含めて求める
      const accName = (el) => {
        const parts = [
          el.getAttribute("aria-label") || "",
          el.textContent || "",
          ...[...el.querySelectorAll("img[alt]")].map((i) => i.alt),
          ...[...el.querySelectorAll("svg title")].map((t) => t.textContent),
          el.getAttribute("title") || "",
        ];
        const ref = el.getAttribute("aria-labelledby");
        if (ref) ref.split(/\s+/).forEach((id) => {
          const t = document.getElementById(id);
          if (t) parts.push(t.textContent || "");
        });
        return parts.join(" ").trim();
      };

      const out = {};
      out.noName = [...document.querySelectorAll("a[href], button")]
        .filter((el) => !isHidden(el) && !accName(el))
        .map((el) => el.tagName + " " + (el.getAttribute("href") || el.className));
      // 表示されているのに行き先が無いリンク（未設定リンクは隠す運用）
      out.dead = [...document.querySelectorAll('a[href="#"], a[href=""]')]
        .filter((a) => !isHidden(a))
        .map((a) => accName(a).slice(0, 30) || a.id || "?");
      // ラベルの無いフォーム部品
      out.unlabeled = [...document.querySelectorAll("input,select,textarea")]
        .filter((el) => el.type !== "hidden" && !el.getAttribute("aria-label") &&
          !el.getAttribute("aria-labelledby") &&
          !(el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) && !el.closest("label"))
        .map((el) => el.name || el.id || el.tagName);
      // 畳まれたアコーディオンの中身がタブ順に残っていないか（実際にfocusを試す）
      out.focusableInCollapsed = [...document.querySelectorAll(".faq-item:not(.is-open) .faq-answer a[href], .faq-item:not(.is-open) .faq-answer button")]
        .filter((el) => { el.focus(); return document.activeElement === el; }).length;
      out.faqMissingAriaControls = [...document.querySelectorAll(".faq-question")]
        .filter((b) => !b.getAttribute("aria-controls")).length;
      // 見出しレベルの飛び（h1の次にh3など）
      const levels = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")]
        .filter((h) => !isHidden(h)).map((h) => +h.tagName[1]);
      out.headingJumps = levels.filter((l, i) => i > 0 && l > levels[i - 1] + 1).length;
      out.h1 = document.querySelectorAll("h1").length;
      out.lang = document.documentElement.lang;
      // noindexのページ（404など）は検索対象外なので canonical / description を求めない
      const robots = document.querySelector('meta[name="robots"]');
      out.noindex = !!(robots && /noindex/i.test(robots.content));
      out.canonical = out.noindex || !!document.querySelector("link[rel=canonical]");
      out.title = (document.title || "").trim().length;
      out.desc = out.noindex || !!document.querySelector('meta[name="description"]');
      return out;
    });

    if (errors.length) note(path, "JSエラー", errors.join(" | "));
    if (failed.length) note(path, "リクエスト失敗", failed.join(" | "));
    if (external.length) note(path, "外部リクエスト", [...new Set(external)].join(" | "));
    if (res.noName.length) note(path, "アクセシブル名なし", res.noName.join(", "));
    if (res.dead.length) note(path, "行き先の無い表示リンク", res.dead.join(", "));
    if (res.unlabeled.length) note(path, "ラベルなし入力", res.unlabeled.join(", "));
    if (res.focusableInCollapsed) note(path, "畳んだFAQ内がタブ可能", res.focusableInCollapsed);
    if (res.faqMissingAriaControls) note(path, "aria-controls欠落", res.faqMissingAriaControls);
    if (res.headingJumps) note(path, "見出しレベルの飛び", res.headingJumps);
    if (res.h1 !== 1) note(path, "h1の数", res.h1);
    if (!res.lang) note(path, "lang属性なし", "-");
    if (!res.canonical) note(path, "canonicalなし", "-");
    if (!res.title) note(path, "titleなし", "-");
    if (!res.desc) note(path, "descriptionなし", "-");

    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 800 });
      await page.waitForTimeout(200);
      const o = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
      }));
      if (o.scrollW > o.clientW + 1) note(path, "横スクロール発生", `${w}px: ${o.scrollW} > ${o.clientW}`);
    }
    await page.close();
  }

  await browser.close();
  console.log(issues === 0 ? `\n問題なし（${PAGES.length}ページ）` : `\n問題 ${issues} 件`);
  process.exit(issues === 0 ? 0 : 1);
})();
