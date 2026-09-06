# 引き継ぎガイド（AI開発者向け）

このリポジトリを初めて触るAIモデル・担当者が、**これ1枚で開発を
引き継げる**ようにまとめた文書です。そのままプロンプトとして貼っても
使えるよう、指示の形で書いています。

実装の詳細は `README.md`、これまでの経緯・残タスクは `HANDOFF.md`、
デザインの規範は `DESIGN.md` にあります。ここは**作業の進め方と、
同じ失敗を繰り返さないための知見**に絞っています。

## 目次

| 節                                               | 内容                           | いつ読むか               |
| ------------------------------------------------ | ------------------------------ | ------------------------ |
| [1](#1-60秒で分かるこのリポジトリ)               | 60秒で分かるこのリポジトリ     | 最初                     |
| [2](#2-環境を整える)                             | 環境を整える（`verify:env`）   | 最初                     |
| [3](#3-絶対に守ること)                           | 絶対に守ること                 | 最初                     |
| [4](#4-変更の型と進め方)                         | 変更の型と進め方               | 最初                     |
| [5](#5-見た目を確かめる撮る測る)                 | 見た目を確かめる（撮る・測る） | 見た目を触る前           |
| [6](#6-実機の正解を確認する)                     | 実機の正解を確認する           | 図・文言を触る前         |
| [7](#7-cssの読み込み順と詳細度)                  | **CSSの読み込み順と詳細度**    | CSSを1行足す前           |
| [8](#8-画面再現図screen-mock)                    | 画面再現図の仕組みと足し方     | 図を触るとき             |
| [9](#9-7言語の文言)                              | 7言語の文言                    | 文字を足すとき           |
| [10](#10-フォントのサブセット化)                 | フォントのサブセット化         | 新しい記号を使うとき     |
| [11](#11-監査スクリプト)                         | 監査スクリプトと、その誤検出   | 監査が落ちたとき         |
| [12](#12-手元で動かせない環境ならgithub-actions) | 手元で動かせない環境なら（CI） | ブラウザが動かせないとき |
| [13](#13-終わり方)                               | 終わり方・詰まったとき         | 毎回                     |

---

## 1. 60秒で分かるこのリポジトリ

手描きアニメーション制作アプリ **NIARIM** の公式サイトです。

- **Cloudflare Workers Static Assets**。フロントは素の HTML / CSS / JavaScript。
  ビルドステップは無く、`public/` の中身がそのまま配信される
- Worker（`src/index.js`）が処理するのは**お問い合わせフォームの送信だけ**
- **7言語**（ja / en / zh-Hans / zh-Hant / ko / fr / es）。URLは全言語共通で、
  `public/js/i18n.js` が `data-i18n` 属性のテキストを差し替える
- 実際にデプロイされるブランチは **`dev_branch`**（`main` ではない）
- **複数のセッションが同時に同じブランチを触っている。** push 前に必ず
  `git fetch origin dev_branch && git rebase origin/dev_branch`

このサイトの一番の特徴は、**アプリの画面を画像ではなく DOM と CSS で
再現した「画面再現図」**を大量に載せていることです。スクリーンショットを
貼っていないので、翻訳すると図の中の文字も差し替わり、節ごとに配色も
変わります。その代わり、**アプリ本体の実装と食い違うと嘘の説明になる**
ため、図に手を入れるときは必ずアプリのソースを根拠にします。

そしてこのサイトの不具合の多くは、**値としては正常なのに見え方が違う**
形で現れます。実際に起きた例:

- `✓`(U+2713) は同梱フォントに入っているのに、明朝の字形なので9pxまで
  小さくすると数学の根号（√）に見える
- 錠の絵文字 `🔒` だけ閲覧環境のカラー絵文字で描かれ、単色アイコンが
  並ぶ中でそこだけ色付きで浮く
- ツールバーにパネル背景色が塗られ、実機には無い帯が画面を横切る

どれもCSSの値としては正しく、DOM検査だけでは異常になりません。逆に、
画像だけを見て判断すると縮小や圧縮で細部を取り違えます。
**数値と画像の両方を突き合わせて確定させる**のが、この文書の要点です。

---

## 2. 環境を整える

ここを飛ばすと、後の症状が全部ここに化けます。**まずこれを実行してください。**
足りないものと、その直し方だけが出ます。

```bash
npm ci
npm run verify:env
```

`NG` が出たら、表示された `→` のコマンドをそのまま実行して、もう一度
`npm run verify:env`。すべて `OK` になるまで先へ進まないこと。

| 項目               | 足りないと起きること                                                         |
| ------------------ | ---------------------------------------------------------------------------- |
| Node.js 20+        | 構文エラーで落ちる                                                           |
| `playwright`       | `Cannot find package 'playwright'`                                           |
| Chromium 本体      | `Executable doesn't exist`（パッケージが入っていてもブラウザは別途DLが要る） |
| 配信サーバー       | `ERR_CONNECTION_REFUSED`。**「修正が効かない」と誤診しやすい最頻の原因**     |
| アプリ本体のソース | 「実機の正解」を確認できない（撮影自体はできるので警告扱い）                 |
| 作業ブランチ       | `dev_branch` 以外だと成果が反映されない                                      |

### 配信サーバーは2通りある

```bash
npx wrangler dev --port 8788                      # 本番と同じ（推奨）
python3 -m http.server 8787 --directory public    # wrangler が使えない環境
```

**`file://` で直接開かないこと。** `@font-face` の `unicode-range` と
`/assets/` のパス解決が本番と違う条件になり、確認の意味がなくなります。

`tools/shot.mjs` と `npm run verify:env` は 8788 → 8787 の順に自動で
探すので、どちらで立てても構いません。別のポート・ホストなら
`AUDIT_BASE_URL=http://…` で指定できます。

2つの違いは**CSPだけ**です。`public/_headers` の
`Content-Security-Policy` は Worker 経由（wrangler）でしか付きません。
インラインスクリプトを増やしたときのCSP違反を見たい場合は wrangler が
必要ですが、**レイアウト・配色・フォントの確認は静的サーバーで同じ結果に
なります**（同じ図を両方で撮って、PNGがバイト単位で一致することを確認
済み。CIも静的サーバーを使っています）。ネットワーク制限で
`npx wrangler` が取得できない環境では、迷わず静的サーバーを使ってください。

### ブラウザの置き場所

`tests/browser-launch.mjs` の `launchOptions()` を必ず使ってください。
`PLAYWRIGHT_CHROMIUM` → `/opt/pw-browsers/chromium` → Playwright の既定、
の順に探します。どこにも無ければ `npx playwright install chromium`。

> **撮る前に毎回サーバーの生存を確認すること。** 長い作業の途中で
> `wrangler dev` が落ちていることに気付かず「修正が効かない」と誤診した
> ことが実際にあります。`tools/shot.mjs` は起動時と `goto` 失敗時に
> この点を明示して止まります。

---

## 3. 絶対に守ること

破ると作り直しになります。詳細と背景は `HANDOFF.md` 2節にあります。

1. **アプリに無い機能・意匠を書かない。** 内容はすべて
   `sakurasemaika-creator/NIARIM`（Flutter）の実装が根拠。憶測で足さない
2. **絵文字を使わない。** アイコンは `public/assets/icons/ui/sprite.svg`。
   アプリが使っている `Icons.*` と同じ意匠を足し、`LICENSE.md` に出典を書く。
   文字記号（`★` `✓` `⋮` など）も字形が閲覧環境で変わるので避ける
3. **文言は自分で訳さない。** `lib/l10n/app_*.arb` から7言語ぶん取る
4. **価格・キャンペーンの文言を勝手に変えない。** 変更が要るときは
   お知らせ記事を足す形で相談する
5. **プリセットの「個数」を書かない**（増減するため）
6. **UI部品の専門用語をそのまま利用者向けの文章に出さない**
7. **対応デバイスの記述**（板タブ／液タブ／DeX／Sペン）は現状維持
8. **ホバー演出は実際に押せる要素だけ**に付ける
9. **`npm run format:check` を必ず通す。** CIの門番であり、他セッションと
   同時に触るため差分を最小に保つ意味もある

---

## 4. 変更の型と進め方

### A. 文言だけ変える

[9節](#9-7言語の文言) → 7言語ぶん足す → `npm run audit` → push。
新しい文字・記号を使った場合だけ [10節](#10-フォントのサブセット化) も見ること。

### B. 見た目（CSS）を変える

[7節](#7-cssの読み込み順と詳細度)で**どのファイルに書くべきか**を決めてから
書く。ここを外すと「`!important` を足したのに効かない」に必ずなります。
その後 [5節](#5-見た目を確かめる撮る測る)の手順で撮って目視。

### C. 画面再現図を変える

[8節](#8-画面再現図screen-mock)。**先にアプリのソースで正解を確認**してから
`public/js/main.js` と HTML のフォールバックの**両方**を直します。

### D. アプリ側の新機能をサイトに反映する

`HANDOFF.md` 6.1節に突き合わせの手順と、これまで確認済みの範囲があります。

---

## 5. 見た目を確かめる（撮る・測る）

### 5.1 撮る（`tools/shot.mjs`）

毎回スクリプトを書き捨てると、後述の「待ち方」「言語の入れ方」を
取りこぼします。共通スクリプトを用意してあるので、これを使ってください。

```bash
# 基本
node tools/shot.mjs "#drawing .feature-diagram"

# 言語・画面幅を変える（sp=390x844, pc=1280x1000）
node tools/shot.mjs "#drawing .feature-diagram" --lang fr --vp sp

# 7言語を続けて撮る
node tools/shot.mjs "#workspace [data-mock-screen='theme']" --langs ja,en,zh-Hans,zh-Hant,ko,fr,es

# 細部を見る（9pxの文字・1.5pxの罫線の判断には dsf 3〜4 が要る）
node tools/shot.mjs ".fd-appbar" --dsf 4

# 寸法・はみ出し量・背景色も一緒に出す
node tools/shot.mjs "#drawing .feature-diagram" --measure
```

出力は `artifacts/shots/`（`.gitignore` 済み）。**撮ったPNGは必ず自分で
開いて見てください。** 撮っただけで見ずに「確認しました」と書くのは、
確認していないのと同じです。

**なぜこの撮り方なのか**（他の実装に移植するとき用）:

1. **言語はページのスクリプトが動く前に入れる。**
   `addInitScript` で `localStorage.setItem("niarim_lang", lang)` を仕込む。
   `goto` の後に入れて `reload` する方式でも動きますが、初回描画が既定
   言語のまま撮れる事故が起きます
2. **`networkidle` だけでは足りない。**
   `main.js` はデザインレイヤーのCSSを読み終えてから画面再現図を差し替え、
   `document.fonts.ready` の後に `fitMockScreens()` が縮小率を確定させます。
   `await page.evaluate(() => document.fonts.ready)` ＋ 1.5秒程度の追加待ち
3. **ページ全体ではなく要素で撮る。**
   `page.$(selector)` → `elementHandle.screenshot()`
4. **撮る前に `scrollIntoViewIfNeeded()`。**
   このサイトは `content-visibility` と `.reveal` の出現アニメーションを
   使っているため、画面外の要素は描画されておらず、空白や途中状態になります
5. **`deviceScaleFactor` を上げる。** 等倍では小さな字形の判断ができません

### 5.2 測る（判断の主軸はこちら）

数値で確かめられることは、必ず数値で確かめます。画像は「数値では
表現できない判断」のためだけに使います。

```js
// 背景が実際に何色で塗られているか（帯・透過の確認）
await page.evaluate(() =>
  [...document.querySelectorAll(".fd-toolbar")].map(
    (el) => getComputedStyle(el).backgroundColor,
  ),
);

// はみ出し（枠から溢れていないか）
await el.evaluate((n) => n.scrollHeight - n.clientHeight);
await el.evaluate(
  (n) =>
    n.lastElementChild.getBoundingClientRect().bottom -
    n.getBoundingClientRect().bottom,
);
```

**落とし穴: 画面再現図は `--fd-fit` で縮小されています。**
`getBoundingClientRect()` が返すのは縮小後の値なので、50pxのはずのコマが
44.95pxと読まれます。CSS上の寸法で判定したいときは、祖先の `--fd-fit` の
値で割ってから比べてください（`tests/mock-detail-audit.mjs` に実装例）。

### 5.3 文字がどのフォントで描かれたかを知る

「フォント未対応の文字だけ書体が変わる」類の調査は、Chrome DevTools
Protocol の `CSS.getPlatformFontsForNode` を使います。CSSの
`font-family` ではなく、**実際に使われたフォント**が返ります。

```js
const cdp = await context.newCDPSession(page);
await cdp.send("DOM.enable");
await cdp.send("CSS.enable");
const { root } = await cdp.send("DOM.getDocument", { depth: -1 });
const { nodeIds } = await cdp.send("DOM.querySelectorAll", {
  nodeId: root.nodeId,
  selector: "span[data-ch]",
});
const r = await cdp.send("CSS.getPlatformFontsForNode", { nodeId: nodeIds[0] });
// r.fonts[0].familyName が同梱フォント以外なら代替フォントに落ちている
```

1文字ずつ調べる実装は `tests/font-fallback-audit.mjs` にあります。
この方式には固有の罠が3つあり、どれも同スクリプトで対処済みです。

- **画面外の文字は代替フォントを返す。** 横に流れるマーキーの右側などは
  まだ実フォントで組まれていません。→ 同じ文字を同じ書体指定のまま画面内の
  検証用要素へ複製して問い直す
- **複製した直後に問い合わせると前の内容のフォントが返る。**
  → `requestAnimationFrame` を2回待ってから問い直す
- **空白は報告しない。** どのフォントで描かれても見た目に差が出ず、
  かつ文字数の3割近くを占めるため、除外しないと監査が終わらない

---

## 6. 実機の正解を確認する

画面再現図はアプリ本体（Flutter, `sakurasemaika-creator/NIARIM`）の実装を
再現したものです。**見た目の良し悪しで決めず、アプリのソースを根拠に
してください。** 憶測で機能や意匠を足さないのが一貫した方針です。

ソースの場所は環境によって違うので、パスを直書きせず `NIARIM_APP_DIR` か
自動検出を使ってください（`tools/app-source.mjs`）。
`npm run verify:env` が実際の場所を表示します。

```bash
# 7言語ぶんの文言を引く（自分で訳さない）
node -e "import('./tools/app-source.mjs').then(m=>console.log(m.arbStrings('themeSettingsTitle')))"
# => { ja: 'テーマ・外観', en: 'Theme & Appearance', ... }

# 色・寸法の根拠を読む
APP=$(node -e "import('./tools/app-source.mjs').then(m=>console.log(m.findAppDir()))")
grep -rn "kCanvasOutsideColor" "$APP/lib/"
sed -n '1,140p' "$APP/lib/screens/canvas/widgets/brush_size_slider.dart"
```

- 色・寸法 → 対応する Widget の `Container` / `decoration` を読む
- 文言 → `lib/l10n/app_*.arb` から7言語ぶん取る（`arbStrings()` が楽）
- アイコン → アプリが使っている `Icons.*` を特定し、同じ意匠を
  `public/assets/icons/ui/sprite.svg` に足す。追加したら
  `public/assets/icons/ui/LICENSE.md` に出典を追記する

**アプリのソースが手元に無い場合**（`verify:env` が WARN を出す）:

```bash
gh repo clone sakurasemaika-creator/NIARIM /tmp/niarim   # private なので認証が要る
NIARIM_APP_DIR=/tmp/niarim npm run verify:env
```

`gh` もネットワークも使えない環境では、**推測で進めないこと。**
撮影と測定（5節）はソース無しでも完結するので、そこまでを済ませ、
根拠が要る変更については参照したいファイルの中身を利用者に依頼して
ください。Claude Code の場合は GitHub MCP ツール
（`mcp__github__get_file_contents` 等）で
`owner: sakurasemaika-creator, repo: NIARIM` を直接読めます。

---

## 7. CSSの読み込み順と詳細度

**このリポジトリで一番事故が多い場所です。CSSを1行足す前に読んでください。**

症状はいつも同じ形で現れます。「`!important` を付けたのに効かない」
「直したはずなのに見た目が変わらない」。原因はほぼ必ず、
**書いた場所が悪い（読み込み順で負けている）** か
**詳細度が足りない** のどちらかです。

### 7.1 実際の読み込み順（実測）

`<head>` の4枚だけが静的で、残りは `public/js/main.js` の
`loadDesignLayers()` が実行時に `<link>` を足しています。さらに `@import`
があるので、最終的な順序は次のとおりです（ブラウザの
`document.styleSheets` を辿って実測した結果）。

```
 1  reset.css
 2  variables.css                    ← デザイントークンの定義
 3  common.css                       ← @font-face（build-fonts.py が生成）
 4  pages/<そのページ>.css
 5  polish.css
 6  responsive-consistency.css
 7  screen-mock-accuracy.css
 7a   ├ screen-mock-accuracy-base.css     ← 再現図の土台
 7b   ├ visual-finish.css
 7c   └ screen-mock-fidelity.css
 7c1      ├ mobile-first-view.css
 7c2      ├ screen-mock-theme-showcase.css
 7c3      ├ manual-visual-audit-fixes.css
 7c4      ├ manual-visual-audit-final.css
 7c5      └ manual-visual-audit-continuation.css
 8  screen-mock-palette.css          ← 節ごとの配色（#drawing など）
 9  screen-mock-layout-fix.css
10  line-break.css
10a   ├ manual-visual-audit-continuation.css   ← ★2回目
10b   ├ screen-mock-contrast-palettes.css      ← 配色の最終上書き
10c   ├ features-source-normalization.css
10d   ├ visual-audit-tail.css
10e   ├ mobile-first-view.css                  ← ★2回目
10f   └ theme-accent-only.css
```

**後にあるほど強い**（同じ詳細度なら後勝ち）。

**罠1: `@import` は「そのファイルの先頭」に巻き上がる。**
`@import` はファイルのどこに書いても、**そのファイルの全ルールより前**に
適用されます。つまり `line-break.css` の中に自分でルールを書いても、
同じファイルが `@import` している `visual-audit-tail.css` より**後**に
なります。

**罠2: 同じファイルが2回読まれている。**
`manual-visual-audit-continuation.css` と `mobile-first-view.css` は
2か所から `@import` されています。**後の位置（10a / 10e）が有効**です。

**罠3: `loadDesignLayers()` は非同期。**
`<head>` の4枚が当たった状態で一度描画され、そのあと 5〜10 が届きます。
撮影・測定でここを踏むと途中状態が写ります。

### 7.2 どこに書けばいいか

| 直したいもの                                 | 書く場所                                                                                |
| -------------------------------------------- | --------------------------------------------------------------------------------------- |
| デザイントークン（色・余白・フォントの定義） | `variables.css`                                                                         |
| ページ固有のレイアウト                       | `pages/<page>.css`                                                                      |
| 全ページ共通の部品                           | `common.css`                                                                            |
| 画面再現図の**構造・寸法**                   | `screen-mock-layout-fix.css`（末尾に節番号を振って追記）                                |
| 画面再現図の**配色**                         | `screen-mock-palette.css`（節ごと）／ `screen-mock-contrast-palettes.css`（最終上書き） |
| レスポンシブの調整                           | `responsive-consistency.css`                                                            |

**新しいCSSファイルを増やさないこと。** 増やすと読み込み順の管理が
さらに難しくなります。`screen-mock-layout-fix.css` は末尾に
`/* ---- NN. 見出し ---- */` を付けて追記していく運用です（現在25節まで）。
**何を直したのか・なぜそうしたのかをコメントに書く**のがこのリポジトリの
慣習です。後から読む人が同じ罠を踏まないための記録です。

### 7.3 詳細度の実際

このリポジトリは `!important` が大量にあります。**`!important` 同士では
詳細度で決まる**ので、「`!important` を足す」だけでは勝てません。

| セレクタ                                                                    | 詳細度    |
| --------------------------------------------------------------------------- | --------- |
| `.fd-canvas-screen`                                                         | 0,1,0     |
| `.hero-visual.fd-app-screen`                                                | 0,2,0     |
| `html body .fd-canvas-screen.fd-canvas-screen`                              | 0,3,2     |
| `html body :is(.feature-section, .screenshot-card) .feature-diagram :is(…)` | 0,3,2     |
| `html body :is(#drawing, #editing, …) > .feature-diagram`                   | **1,1,2** |
| `html body :is(#drawing, …) > .feature-diagram.fd-canvas-screen`            | **1,2,2** |

**IDが1つ入ると、クラスを何個重ねても勝てません。**
`screen-mock-contrast-palettes.css` は節ID（`#drawing` など）で配色を
当てているので、そこを上書きするには**こちらもIDを含める**か、
**そのルール自体を直す**しかありません。

実際に起きた事故: キャンバス画面の下地を外周色にしたかったが、
`html body .fd-canvas-screen.fd-canvas-screen`（0,3,2）を書いても節の中では
効かなかった。`#drawing > .feature-diagram`（1,1,2）が勝っていたため。
**IDを含む版を併記して解決**した:

```css
html body .fd-canvas-screen.fd-canvas-screen,
html
  body
  :is(#drawing, #editing, #advanced)
  > .feature-diagram.fd-canvas-screen {
  background: var(--fd-outside) !important;
}
```

**勝てないときは推測せず、どのルールが勝っているかをブラウザに聞く:**

```js
const m = await cdp.send("CSS.getMatchedStylesForNode", { nodeId });
// matchedCSSRules は「弱い順」。最後に出てくるものが勝っている。
for (const r of m.matchedCSSRules) {
  const p = r.rule.style.cssProperties.find(
    (c) => c.name === "background-color",
  );
  if (p) console.log(r.rule.selectorList.text, "->", p.value);
}
```

### 7.4 矛盾するルールを見つけたら

複数のセッションが同時に触っているため、**同じ要素に対して逆のことを
指定しているルールが両方生きている**ことがあります。実際にありました。

- `screen-mock-layout-fix.css`: コマ一覧を `justify-content: center` で中央寄せ
- `visual-audit-tail.css`: 同じ要素に `padding-left: calc(50% - 125px)`

中央寄せの flex 行が親より広い場合、はみ出しは左右へ均等に出るため
padding が打ち消され、選択中のコマがちょうど1マスぶんずれていました。

**このときは、勝っているほうに合わせて負けているルールを消す**のが正解です。
「上書きするルールをもう1枚足す」と、矛盾が3重になって次の人が詰みます。
消すときは**なぜ消したのかをコメントに残す**こと。

### 7.5 その他の既知の罠

`HANDOFF.md` 3節に実例つきでまとまっています。特に次の2つは再発しやすい
ので、そちらも読んでください。

- `word-break: keep-all` と `overflow-wrap: break-word` の組み合わせ
- `IntersectionObserver` の `threshold` が要素の高さに左右される件

---

## 8. 画面再現図（screen mock）

### 8.1 どこに何があるか

| もの             | 場所                                                            |
| ---------------- | --------------------------------------------------------------- |
| 図を組み立てるJS | `public/js/main.js`（`canvasScreen()` ほか8種）                 |
| HTMLの初期状態   | 各 `public/*/index.html` の `<div class="feature-diagram">`     |
| 構造・寸法のCSS  | `screen-mock-accuracy-base.css` / `screen-mock-layout-fix.css`  |
| 配色のCSS        | `screen-mock-palette.css` / `screen-mock-contrast-palettes.css` |
| 図の中の文言     | `public/js/i18n-dict-features-diagram.js`                       |
| アイコン         | `public/assets/icons/ui/sprite.svg`                             |

| 関数                                     | 再現しているアプリ画面       | 使われている場所           |
| ---------------------------------------- | ---------------------------- | -------------------------- |
| `canvasScreen(null)`                     | キャンバス（描画）           | `#drawing`                 |
| `canvasScreen("layer")`                  | キャンバス＋レイヤーパネル   | `#editing`、画面紹介カード |
| `canvasScreen("onion")`                  | キャンバス＋オニオンスキン   | `#advanced`、カード        |
| `timelineScreen()`                       | タイムライン                 | `#animation`、カード       |
| `audioScreen()`                          | 音声クリップ詳細             | `#audio`、カード           |
| `saveSlotsScreen()` / `saveTreeScreen()` | セーブスロット／セーブツリー | `#save`、カード            |
| `workspaceScreen()`                      | ワークスペース設定           | `#workspace`、カード       |
| `themeScreen()`                          | テーマ・外観                 | `#workspace` の2つ目       |
| `exportScreen()`                         | 書き出し                     | `#export`、カード          |

### 8.2 HTMLとJSの二重管理（重要）

図は **HTMLに初期状態が書いてあり、JSがそれを丸ごと差し替える**という
作りです。**両方直さないと、JSが無効な環境やJS実行前の一瞬で古い図が
出ます。**

```js
// 節の直下にある最初の .feature-diagram を差し替える
replaceFeatureDiagram("#drawing", canvasScreen(null));

// 2つ目以降は :scope > .feature-diagram では取れないので、
// 図そのものを指すセレクタで差し替える
replaceDiagramNode('#workspace [data-mock-screen="theme"]', themeScreen());
```

- [ ] `public/js/main.js` の組み立て関数を直した
- [ ] 対応する `index.html` のフォールバックも同じ内容に直した
- [ ] 新しい文言は `i18n-dict-features-diagram.js` に7言語ぶん足した
- [ ] `data-i18n="fd.xxx"` を付けた（付け忘れると日本語のまま残る）

### 8.3 配色（`--fd-*` トークン）

図の色は直接書かず、必ずトークンを使います。節ごとに違う色相が割り当てて
あり、同じ図でも `#drawing` と `#audio` では色が変わります。

| トークン                              | 意味                                 | アプリ側の対応                                       |
| ------------------------------------- | ------------------------------------ | ---------------------------------------------------- |
| `--fd-accent`                         | アクセント色                         | `accentColor`                                        |
| `--fd-accent-fill` / `--fd-on-accent` | アクセントで塗る面と、その上の文字色 | Material の primary / onPrimary                      |
| `--fd-ink` / `--fd-text`              | 文字色                               | `textColor`                                          |
| `--fd-muted`                          | 副次的な文字色                       | `onSurfaceVariant`                                   |
| `--fd-panel` / `--fd-panel-2`         | パネルの面                           | `panelBgColor`                                       |
| `--fd-surface`                        | メニューの面                         | `menuBgColor`                                        |
| `--fd-bg`                             | 画面の地色                           | Scaffold の背景                                      |
| `--fd-outside`                        | **キャンバスの外周**                 | `kCanvasOutsideColor`（= `surfaceContainerHighest`） |
| `--fd-bezel`                          | 端末の外枠                           | （図だけのもの）                                     |

**「パネル」と「外周」を取り違えないこと。** 実際に起きた事故です。
上部バー・ツールバー・コマ一覧に `--fd-panel` を塗ったところ、
**実機には無い帯が画面を横切りました。** アプリではこれらは自前の背景を
持たず（`ToolbarWidget` の根は `Colors.transparent`）、用紙の外側は画面全体に
`kCanvasOutsideColor` が一枚敷かれているので地続きに見えます。

- **キャンバス画面**の上部バー・ツールバー・コマ一覧・折りたたみハンドル
  → **透過**。画面の下地が `--fd-outside`
- **本当にパネルなもの**（レイヤーパネル、オニオンスキン、音声クリップ
  シート、セーブスロット、設定カード）→ `--fd-panel`
- **タイムラインのツールバー**だけは実機にも帯がある
  （`_buildToolbar` の `decoration` が `surfaceContainerHighest`）
  → `--fd-outside` を明示的に敷く

### 8.4 縮小（`--fd-fit`）

図は 320×569（アプリの論理解像度）で作り、枠に収まらないときだけ
`fitMockScreens()` が `transform: scale()` で縮めます。縮小率は
`--fd-fit` に入ります。測るときは[5.2](#52-測る判断の主軸はこちら)の
注意を参照。

### 8.5 新しい画面を足す手順

1. **アプリのソースで正解を確認する**（[6節](#6-実機の正解を確認する)）
2. `main.js` に組み立て関数を書く。既存の `appBar()` / `iconButton()` /
   `icon()` などの部品を使い回す
3. HTML に同じ内容のフォールバックを置く。2つ目以降の図なら
   `data-mock-screen="…"` を付けて `replaceDiagramNode()` で差し替える
4. `i18n-dict-features-diagram.js` に7言語ぶんのキーを足す
5. CSS を `screen-mock-layout-fix.css` の末尾に節番号を振って追記
6. **撮って目視する。** PC/SP × 少なくとも ja / en / fr / ko

```bash
node tools/shot.mjs '#workspace [data-mock-screen="theme"]' --langs ja,en,fr,ko --measure
node tools/shot.mjs '#workspace [data-mock-screen="theme"]' --vp sp --langs ja,en,fr,ko
```

### 8.6 アイコンと記号

- **絵文字を使わない。** 閲覧環境のカラー絵文字で描かれ、単色アイコンが
  並ぶ中でそこだけ浮きます
- **文字記号も避ける。** `★` `☆` `✓` `⋮` `▾` `⌄` `⌗` `↺` `❗` は、
  同梱フォントに無いか、あっても明朝の字形が意図と違います
- **アプリが使っている `Icons.*` を特定して sprite.svg に足す**のが原則
- スプライトに無く、アイコンでもない図形（チェック、シェブロン、
  全画面マーク、閉じる印）は **CSSの罫線で描く**。
  `screen-mock-layout-fix.css` の23・24節に実例があります

---

## 9. 7言語の文言

対応言語は **ja / en / zh-Hans / zh-Hant / ko / fr / es**。URLは全言語共通で、
`public/js/i18n.js` が実行時にテキストを差し替えます。選んだ言語は
`localStorage` の `niarim_lang` に保存されます。

| 属性                   | 効果                                                |
| ---------------------- | --------------------------------------------------- |
| `data-i18n="key"`      | その要素の `textContent` を差し替える               |
| `data-i18n-html="key"` | `innerHTML` を差し替える（リンクを含む文など）      |
| `data-i18n-attr="…"`   | 属性（`placeholder` `aria-label` など）を差し替える |

`data-i18n` は `textContent` を上書きするので、**中に別の要素があると
消えます。** リンクや `<strong>` を含む文は `data-i18n-html` を使うか、
文を分割してそれぞれに `data-i18n` を付けてください。

`en` / `fr` / `es` のときは `<html>` に `data-latin-only` が付き、
CJKフォントを読み込まなくなります（[10節](#10-フォントのサブセット化)）。

### 9.1 辞書ファイルの形（2種類ある）

辞書は `public/js/i18n-dict*.js` に18ファイルあります。**書き方が2種類
混在している**ので、直す前にそのファイルがどちらかを確認してください。

```js
// 形A
var DATA = {
  ja: { "fd.themeTitle": "テーマ・外観" },
  en: { "fd.themeTitle": "Theme & Appearance" },
};

// 形B（こちらが正しい形）
DICT["zh-Hans"] = Object.assign(DICT["zh-Hans"] || {}, {
  "featuresPage.drawing.title": "Drawing｜绘画",
});
```

**`Object.assign` でマージするのが正しい形です。** 以前
`DICT["zh-Hans"] = {…}` と代入していたため、後から読まれたファイルが前の
ファイルのキーを丸ごと消す事故がありました。

一括編集するときは、両方の形に対応する正規表現を使ってください。
言語コードのキーが `zh` ではなく **`zh-Hans`** であることにも注意。

```python
pat = re.compile(
    r'^\s*(?:DICT\[\s*"([a-zA-Z-]+)"\s*\]'           # 形B
    r'|"?([a-zA-Z]{2}(?:-[A-Za-z]+)?)"?\s*:\s*\{)',  # 形A
    re.M)
```

### 9.2 足す手順

1. **アプリに同じ文言があるなら、自分で訳さずそこから取る**
   （[6節](#6-実機の正解を確認する)の `arbStrings()`）
2. 適切な辞書ファイルの**7言語すべて**にキーを足す。1つでも欠けると
   その言語だけ日本語（またはキー名）が出ます
3. HTML / JS 側に `data-i18n="キー"` を付ける
4. 確認する

```bash
AUDIT_BASE_URL=http://localhost:8788 npm run audit:i18n   # 欠けているキーを検出
node tools/shot.mjs "<セレクタ>" --langs ja,en,zh-Hans,zh-Hant,ko,fr,es
```

### 9.3 言語ごとの崩れやすさ

| 言語              | 崩れ方                                                                |
| ----------------- | --------------------------------------------------------------------- |
| fr / es           | **文字数が最も多い。** ボタンや図の中で溢れる。幅の検証は fr を基準に |
| ko                | 行の高さが変わる。縦方向に溢れる                                      |
| zh-Hans / zh-Hant | 簡体字と繁体字で別フォントが要る                                      |
| ja                | 開発時の基準。ここだけ見て通しても意味がない                          |

**最低でも `ja / en / fr / ko` を PC と SP の両方で見ること。**

### 9.4 ラテン語圏で全角記号を使わない

`en` / `fr` / `es` はCJKフォントを読み込まないため、全角の記号はその1文字
だけ閲覧環境のフォントで描かれ、明らかに浮きます。実際に直した例:

| 直す前                 | 直した後 | 箇所                                       |
| ---------------------- | -------- | ------------------------------------------ |
| `・`（箇条書きの頭）   | `• `     | 利用規約・プライバシーポリシー（各18箇所） |
| `｜`（見出しの区切り） | `\|`     | `Drawing｜Dessin` などの見出し15箇所       |

**日本語・中国語・韓国語の文面はそのままで構いません。**

### 9.5 既知の「意図的な欠け」

`npm run audit:i18n` が `contact.form.agree.pre` の ja / ko について
`empty-translation` を報告しますが、**これは意図的です。** 語順の都合で
リンクの前に置く語が無い言語があるためで、レンダリング結果は7言語とも
正しいことを確認済みです。他の欠けと混同しないでください。

---

## 10. フォントのサブセット化

**新しい文字・記号をサイトに出したら、この節を読んでください。**
サブセットに入っていない文字は、その1文字だけ閲覧環境のフォントで描かれ、
周りと書体が変わって浮きます。

### 10.1 何をしているか

同梱フォントは日本語を含むため1ファイル 300〜630KB あります。全部を配信
すると、日本語を1文字も含まない英語ページでも約950KB落ちてきます。そこで
`tools/build-fonts.py` が、**サイトで実際に使う文字だけ**を残したサブセットを
作り、`public/css/common.css` の `@font-face`（`unicode-range` つき）を
自動生成しています。

| ファミリ                            | 役割                           | 由来                   |
| ----------------------------------- | ------------------------------ | ---------------------- |
| `HakkouMincho` / `HakkouMinchoCJK`  | 本文（`--font-sans`）          | 白光明朝               |
| `Kuramubon` / `KuramubonCJK`        | 見出し（`--font-serif`）       | くらむぼん             |
| `NotoSansHeadKR` / `NotoSansHeadSC` | 見出しのハングル・簡体字の補完 | Noto Sans Black        |
| `NotoSerifKR` / `NotoSerifSC`       | 本文のハングル・簡体字の補完   | Noto Serif             |
| `NotoSerifMenu*`                    | 言語切替メニューの数文字だけ   | 全ページに出るため分離 |

**ラテン側とCJK側に分割**してあり（境界は U+2E80）、`en` / `fr` / `es` は
`<html data-latin-only>` によりラテン側だけを読みます。これで英語ページは
961KB → 約120KB になりました。

### 10.2 作り直しの手順

```bash
# 配信サーバーを立てたうえで（実測にブラウザを使うため）
python3 tools/build-fonts.py --measure
npx prettier --write public/css/common.css     # 生成物を整形する
```

`--measure` は実際にブラウザで全ページ・全言語を描画して**見出しフォントで
描かれる文字**を数え、`tools/serif-chars.txt` を更新します。付けずに実行
すると、`serif-chars.txt` が古い場合に「見出し用も全文字を収録します」と
警告して 1.26MB のファイルを作ってしまいます。**基本は必ず付ける。**
処理には10〜20分かかります。

### 10.3 収録される文字の集め方（間違えた実例）

`site_chars()` が集める対象:

- `public/js/*.js` のすべて（**辞書だけでなく `main.js` も**）
- `public/**/*.html`（`html.unescape()` で実体参照を展開してから）
- `public/css/**/*.css` の `content: "…"`
- 半角スペースと NBSP（明示的に追加）

| 漏れていた文字   | 原因                                             |
| ---------------- | ------------------------------------------------ |
| `©`             | `&copy;` の実体参照を展開していなかった          |
| `★` `☆` `✓`      | `main.js` が直接書き出す記号を走査していなかった |
| **半角スペース** | 「見えないから要らない」と除外していた           |

半角スペースは特に見落としやすいのですが、**字送り（アドバンス幅）は空白を
持つフォントのものが使われる**ため、外すと欧文の単語間だけ別フォントの幅に
なります。実測すると全ページの空白が Liberation Serif で描かれていました。

### 10.4 出せない文字は「文字として出さない」

どの同梱フォントにも字形が無い記号は、サブセットを作り直しても解決しません。

| 記号            | 対応                                                         |
| --------------- | ------------------------------------------------------------ |
| `⋮`             | スプライトの `ic-more_vert` に置換                           |
| `🔒` `★` `☆`    | アプリと同じ `Icons.lock` / `Icons.star` をスプライトに追加  |
| `▾` `⌄` `⌗` `✓` | **CSSの罫線で描く**（`screen-mock-layout-fix.css` 23・24節） |
| `↺`             | 文章中ならアプリ側の呼び名（「早替えツール」など）で書く     |
| `❗`            | 例示の括弧書きなら削る                                       |

`✓` は白光明朝に**入っています**が、明朝の字形は左払いが長く、9px前後まで
小さくすると数学の根号（√）に見えます。**「フォントにある」＝「使ってよい」
ではありません。**

### 10.5 落ちている文字を見つける

```bash
AUDIT_BASE_URL=http://localhost:8788 node tests/font-fallback-audit.mjs ja,en
AUDIT_ROUTES="/features/" node tests/font-fallback-audit.mjs ja      # ページを絞る
```

仕組みと固有の罠は[5.3](#53-文字がどのフォントで描かれたかを知る)を参照。
全ページ・全言語だと数十分かかるので `AUDIT_ROUTES` で絞ってください。

### 10.6 原本の置き場所

`tools/build-fonts.py` の `SRCDIR`（既定 `/tmp/fontsrc`、環境変数
`NIARIM_FONT_SRC` で変更可）に原本が要ります。アプリ本体リポジトリの
`assets/fonts/` にも同じものがあります。ライセンスは
`public/assets/fonts/LICENSE.md`、アイコンは
`public/assets/icons/ui/LICENSE.md` に記載。**足したら必ず出典を追記。**

---

## 11. 監査スクリプト

`tests/` に23本、`tools/audit-site.js` に1本あります。**どれも
「配信サーバーを立てて実際にブラウザで開き、DOMを測る」形式**です。

### 11.1 まず走らせるもの

```bash
npm run format:check                              # CIの門番。必須
BASE_URL=http://localhost:8788 npm run audit      # 12ページの静的検査
```

`npm run audit` は全12ページを 1280 / 1024 / 768 / 375 / 320px で開き、
JSエラー・同一オリジン以外への通信・アクセシブル名の無いリンク／ボタン・
行き先の無いリンク・畳んだFAQのタブ順・見出しレベル・各幅での横スクロールを
機械的に確認します。1件でもあれば終了コード1です。

### 11.2 npm scripts になっているもの

| コマンド                   | 何を守るか                                                   |
| -------------------------- | ------------------------------------------------------------ |
| `audit:browser`            | 節ごとの操作（タブ・アコーディオン・ホバー）が実際に動くか   |
| `audit:multilang`          | 7言語 × 複数幅での溢れ・見切れ                               |
| `audit:i18n`               | 辞書キーの欠け                                               |
| `audit:visual-final`       | 図の不変条件（コマ50px・中央・比率・テーマの重複など10項目） |
| `audit:visual-screenshots` | Home/Features の撮影と検査                                   |
| `audit:mock-detail`        | 図の細部（コマ・スライダー高さ・ベゼル）                     |
| `audit:style-source`       | CSSソースの書き方の一貫性                                    |
| `audit:all`                | 上を順に全部（数十分かかる）                                 |

### 11.3 npm scripts になっていないもの

直接 `node tests/….mjs` で走らせます。主なもの:

- `font-fallback-audit.mjs` … 字形が無い文字を1文字ずつ検出
- `i18n-browser-detection-audit.mjs` … ブラウザ言語からの初期言語判定
- `deep-section-audit.mjs` … 節ごとの深い視覚検査
- `design-polish-audit.mjs` … 余白・角丸・背景の質、機能ナビの追従
- `complete-scroll-audit-v2.mjs` … 全画面スクロールと `.reveal` の出現漏れ
- `screen-mock-capture.mjs` … 各画面再現図を個別PNGに撮る

> **v2 / v3 / v4 が並んでいるのは経緯によるものです。** 消していないのは
> CIが特定の版を名指ししているためで、どれを使うべきかは
> `.github/workflows/visual-audit.yml` を見るのが確実です。

### 11.4 監査自身を疑うこと

**実際にあった誤検出です。監査を直すべき場面で本体を直すと、正しかった
ものを壊します。**

| 誤検出                                         | 原因                                                                       |
| ---------------------------------------------- | -------------------------------------------------------------------------- |
| `current-frame-not-50x50` が全言語・全幅で出る | `--fd-fit` の縮小を戻さずに判定。50pxのコマが44.95pxと読まれる             |
| コントラスト比が実際より低く出る               | `color(srgb 0.9 0.9 1 / 0.6)` の 0〜1 の値を 0〜255 として読んでいた       |
| 全ページで「代替フォントに落ちている」         | 空白文字を報告していた（見た目に差は出ない）                               |
| マーキーの文字が代替フォント扱い               | 画面外の文字はまだ実フォントで組まれていない                               |
| 上を直しても消えない                           | 検証用要素に差し替えた**直後**に問い合わせ、前の内容のフォントが返っていた |
| コントラスト違反が大量に出る                   | 背景色を `el.parentElement` から辿り始めていた（自分自身を見ていない）     |

**報告が出たら、まず「その報告は本当か」を実キャプチャで確かめる。**
直したら、なぜ誤検出だったのかをコメントに残してください。

---

## 12. 手元で動かせない環境なら（GitHub Actions）

**新しくワークフローを書き起こす必要はありません。**
`.github/workflows/visual-audit.yml` が既にあり、`dev_branch` への push と
`workflow_dispatch` で動きます。

- `npx playwright install --with-deps chromium` でブラウザを用意
- `python3 -m http.server 8787 --directory public` で配信（wrangler は使わない）
- 監査スクリプト群と `tools/shot.mjs` を実行し、
  **撮ったPNGを artifact としてアップロード**

つまり、手元でブラウザを起動できない・GitHubへ到達できない環境でも、
**このワークフローを回してアーティファクトをダウンロードすれば、
生成PNGの目視までは到達できます。**

```bash
gh workflow run "Visual interaction audit" --ref dev_branch
gh run watch
gh run download --name final-visual-matrix -D artifacts/ci
```

撮る対象を増やしたいときは、既存のワークフローに1ステップ足すだけです
（`--dir` を artifact のアップロード対象配下にすること）。

> **注意: CIの結果を「このガイドどおりの確認」として流用しないこと。**
> CIが回すのは既存の自動監査であって、このガイドが求めている
> 「特定の図を撮って**画像そのものを目視する**」ことではありません。
> CIは撮影までを代行する手段であり、目視と判断は人／モデルの側に残ります。

---

## 13. 終わり方

```bash
npm run format:check
BASE_URL=http://localhost:8788 npm run audit
git fetch origin dev_branch && git rebase origin/dev_branch
git push -u origin dev_branch
```

コミットメッセージは**日本語で、何をしたかではなく「なぜそうしたか」**を
書く慣習です（既存のログが参考になります）。同じ罠を後から踏まないための
記録として書いてください。

### この順で回す

1. `npm ci && npm run verify:env` がすべて OK になるまで直す
2. アプリ本体のソースで「実機の正解」を確認する
3. 直す（CSSなら[7節](#7-cssの読み込み順と詳細度)で書く場所を決めてから）
4. `tools/shot.mjs` で撮り、**画像を開いて見る**（多言語・PC/SP）
5. `page.evaluate` で数値を測り、画像の印象と一致するか突き合わせる
6. `format:check` と監査を通す
7. rebase してから push

### 詰まったときに真っ先に疑うこと

| 症状                              | まず疑う                                                         |
| --------------------------------- | ---------------------------------------------------------------- |
| 修正が反映されない                | 配信サーバーが落ちている（`npm run verify:env`）                 |
| `!important` を足したのに効かない | [7節](#7-cssの読み込み順と詳細度)。読み込み順か詳細度            |
| 撮ったPNGが空白・途中             | `scrollIntoViewIfNeeded` していない。`tools/shot.mjs` を使う     |
| 監査が大量に落ちる                | 監査側のバグを疑う（[11.4](#114-監査自身を疑うこと)）            |
| 図の寸法が合わない                | `--fd-fit` の縮小。実寸はこの値で割る                            |
| 文字だけ書体が違う                | サブセット漏れか字形の問題（[10節](#10-フォントのサブセット化)） |
| push が衝突する                   | 他セッションが同じブランチにいる。rebase する                    |
