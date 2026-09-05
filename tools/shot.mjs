/**
 * 画面の一部を実際にブラウザで描画して撮る、確認用の共通スクリプト。
 *
 * 目的:
 *   このサイトの見た目の不具合は「値としては正常なのに、見え方が違う」形で
 *   現れることが多い（フォントの字形が環境で変わる、帯が横切って見える、
 *   9pxの文字が読めない等）。数値の監査（tests/*.mjs）だけでは拾えないので、
 *   実際に配信して描画したものを画像で確認する手順を1本にまとめている。
 *
 *   毎回その場でスクリプトを書き捨てると、待ち時間や言語の入れ方といった
 *   間違えやすい部分を取りこぼすため、ここに固定した。
 *
 * 前提: `npx wrangler dev --port 8788` が起動していること。
 *   file:// で直接開くのではなく必ず配信する。_headers のCSP、
 *   @font-face の unicode-range、/assets/ のパス解決が本番と同じ条件に
 *   ならないと、確認の意味がないため。
 *
 * 使い方:
 *   node tools/shot.mjs "<CSSセレクタ>" [オプション]
 *
 *   node tools/shot.mjs "#drawing .feature-diagram"
 *   node tools/shot.mjs "#drawing .feature-diagram" --lang en --vp sp
 *   node tools/shot.mjs ".hero-visual" --page / --out hero
 *   node tools/shot.mjs "#workspace" --langs ja,en,ko --measure
 *   node tools/shot.mjs "body" --full --out whole-page
 *
 * オプション:
 *   --page <path>    既定 /features/
 *   --lang <code>    既定 ja（ja / en / zh-Hans / zh-Hant / ko / fr / es）
 *   --langs a,b,c    複数言語を続けて撮る（--lang より優先）
 *   --vp pc|sp|WxH   既定 pc（pc=1280x1000, sp=390x844）
 *   --dsf <n>        既定 2。細部を見るときは 3〜4
 *   --full           要素ではなくページ全体を撮る
 *   --measure        寸法・はみ出し量・背景色を直下の子要素まで出力する
 *   --wait <ms>      描画待ちの追加時間（既定 1500）
 *   --out <name>     出力ファイル名の基本部分（既定はセレクタから生成）
 *   --dir <path>     出力先（既定 artifacts/shots、.gitignore 済み）
 *   --base <url>     既定 http://localhost:8788
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { launchOptions } from "../tests/browser-launch.mjs";

const VIEWPORTS = { pc: [1280, 1000], sp: [390, 844] };

function parseArgs(argv) {
  const opt = {
    page: "/features/",
    langs: ["ja"],
    vp: "pc",
    dsf: 2,
    full: false,
    measure: false,
    wait: 1500,
    out: null,
    dir: "artifacts/shots",
    base: process.env.AUDIT_BASE_URL || "http://localhost:8788",
  };
  const rest = [];
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--full") opt.full = true;
    else if (a === "--measure") opt.measure = true;
    else if (a === "--langs") opt.langs = argv[++i].split(",");
    else if (a === "--lang") opt.langs = [argv[++i]];
    else if (a === "--page") opt.page = argv[++i];
    else if (a === "--vp") opt.vp = argv[++i];
    else if (a === "--dsf") opt.dsf = Number(argv[++i]);
    else if (a === "--wait") opt.wait = Number(argv[++i]);
    else if (a === "--out") opt.out = argv[++i];
    else if (a === "--dir") opt.dir = argv[++i];
    else if (a === "--base") opt.base = argv[++i];
    else rest.push(a);
  }
  opt.selector = rest[0];
  return opt;
}

function viewportOf(vp) {
  if (VIEWPORTS[vp]) return VIEWPORTS[vp];
  const m = /^(\d+)x(\d+)$/.exec(vp);
  if (m) return [Number(m[1]), Number(m[2])];
  throw new Error(`--vp は pc / sp / 1280x900 の形式で指定する: ${vp}`);
}

function slug(s) {
  return (
    s
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "shot"
  );
}

const opt = parseArgs(process.argv.slice(2));
if (!opt.selector) {
  console.error('使い方: node tools/shot.mjs "<CSSセレクタ>" [オプション]');
  process.exit(2);
}

const [width, height] = viewportOf(opt.vp);
fs.mkdirSync(opt.dir, { recursive: true });

const browser = await chromium.launch(launchOptions());
let missing = 0;

for (const lang of opt.langs) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: opt.dsf,
  });
  const page = await context.newPage();

  // 言語はページのスクリプトが動く前に入れる。goto の後に入れて reload
  // する方式だと、初回描画が既定言語のまま撮れてしまう。
  await page.addInitScript((l) => {
    try {
      localStorage.setItem("niarim_lang", l);
    } catch {
      /* プライベートウィンドウ相当の環境では何もしない */
    }
  }, lang);

  await page.goto(opt.base + opt.page, { waitUntil: "networkidle" });

  // networkidle だけでは足りない。main.js はデザインレイヤーのCSSを
  // 読み終えてから画面再現図を差し替え、document.fonts.ready のあとに
  // fitMockScreens() が縮小率を確定させるため、その後まで待つ。
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(opt.wait);

  const name = `${opt.out || slug(opt.selector)}-${opt.vp}-${lang}.png`;
  const file = path.join(opt.dir, name);

  if (opt.full) {
    await page.screenshot({ path: file, fullPage: true });
    console.log(`${lang} ${opt.vp} -> ${file}`);
  } else {
    const el = await page.$(opt.selector);
    if (!el) {
      console.log(`${lang} ${opt.vp} -> 見つからない: ${opt.selector}`);
      missing += 1;
      await context.close();
      continue;
    }
    // このサイトは content-visibility と .reveal の出現アニメーションを
    // 使っているので、画面外の要素は描画されていない。一度視界へ入れる。
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await el.screenshot({ path: file });

    if (opt.measure) {
      const info = await el.evaluate((node) => {
        const box = node.getBoundingClientRect();
        const cs = getComputedStyle(node);
        const children = [...node.children].map((c) => {
          const s = getComputedStyle(c);
          const r = c.getBoundingClientRect();
          return {
            cls: String(c.className).split(" ")[0] || c.tagName.toLowerCase(),
            bg: s.backgroundColor,
            color: s.color,
            size: `${Math.round(r.width)}x${Math.round(r.height)}`,
          };
        });
        return {
          size: `${Math.round(box.width)}x${Math.round(box.height)}`,
          // 図は枠に収めるため --fd-fit で縮小されることがある。
          // 実寸を見たいときはこの値で割る。
          fit: cs.getPropertyValue("--fd-fit").trim() || "1",
          overflowY: node.scrollHeight - node.clientHeight,
          bg: cs.backgroundColor,
          color: cs.color,
          children,
        };
      });
      console.log(`${lang} ${opt.vp} -> ${file}`);
      console.log("  " + JSON.stringify(info, null, 2).replace(/\n/g, "\n  "));
    } else {
      console.log(`${lang} ${opt.vp} -> ${file}`);
    }
  }

  await context.close();
}

await browser.close();
process.exit(missing ? 1 : 0);
