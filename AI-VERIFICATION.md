# AI向け：実操作＋スクリーンショットによる自律動作確認の手順

このファイルは、AIモデル（Claude / GPT / Gemini など、ブラウザ自動操作が
できる実行環境を持つもの）が **このリポジトリの見た目を自分で確認しながら
直す** ための手順書です。そのままプロンプトとして貼って使えるように、
指示の形で書いています。

想定している困りごとは1つです。**このサイトの不具合の多くは「値としては
正常なのに、見え方が違う」形で現れます。** 実際に起きた例:

- `✓`(U+2713) は同梱フォントに入っているのに、明朝の字形なので9pxまで
  小さくすると数学の根号（√）に見える
- 錠の絵文字 `🔒` だけ閲覧環境のカラー絵文字で描かれ、単色アイコンが
  並ぶ中でそこだけ色付きで浮く
- ツールバーにパネル背景色が塗られ、実機には無い帯が画面を横切る

どれもCSSの値としては正しく、DOM検査だけでは異常になりません。逆に、
画像だけを見て判断すると縮小や圧縮で細部を取り違えます。
**数値と画像の両方を突き合わせて確定させる**のが、この手順の要点です。

---

## 0. 前提を整える（ここを飛ばすと後の症状が全部ここに化ける）

**まずこれを実行してください。** 足りないものと、その直し方だけが出ます。

```bash
npm ci
npm run verify:env
```

`NG` が出たら、表示された `→` のコマンドをそのまま実行して、もう一度
`npm run verify:env`。すべて `OK` になるまで先へ進まないこと。
確認している項目は次の6つです。

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
済み。CIも静的サーバーを使っています）。ネットワーク制限で `npx wrangler` が取得できない環境では、
迷わず静的サーバーを使ってください。

### ブラウザの置き場所

`tests/browser-launch.mjs` の `launchOptions()` を必ず使ってください。
`PLAYWRIGHT_CHROMIUM` → `/opt/pw-browsers/chromium` → Playwright の既定、
の順に探します。どこにも無ければ `npx playwright install chromium`。

> **撮る前に毎回サーバーの生存を確認すること。** 長い作業の途中で
> `wrangler dev` が落ちていることに気付かず「修正が効かない」と誤診した
> ことが実際にあります。`tools/shot.mjs` は起動時と `goto` 失敗時に
> この点を明示して止まります。

---

## 1. 撮る（`tools/shot.mjs`）

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

### なぜこの撮り方なのか（他の実装に移植するとき用）

1. **言語はページのスクリプトが動く前に入れる。**
   `addInitScript` で `localStorage.setItem("niarim_lang", lang)` を仕込む。
   `goto` の後に入れて `reload` する方式でも動きますが、初回描画が既定
   言語のまま撮れる事故が起きます。
2. **`networkidle` だけでは足りない。**
   `main.js` はデザインレイヤーのCSSを読み終えてから画面再現図を差し替え、
   `document.fonts.ready` の後に `fitMockScreens()` が縮小率を確定させます。
   `await page.evaluate(() => document.fonts.ready)` ＋ 1.5秒程度の追加待ち。
3. **ページ全体ではなく要素で撮る。**
   `page.$(selector)` → `elementHandle.screenshot()`。見たい図だけが等倍で
   大きく写ります。
4. **撮る前に `scrollIntoViewIfNeeded()`。**
   このサイトは `content-visibility` と `.reveal` の出現アニメーションを
   使っているため、画面外の要素は描画されておらず、そのまま撮ると
   空白や途中状態になります。
5. **`deviceScaleFactor` を上げる。** 等倍では小さな字形の判断ができません。

---

## 2. 測る（判断の主軸はこちら）

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
44.95pxと読まれます。CSS上の寸法で判定したいときは、祖先の
`--fd-fit` の値で割ってから比べてください（`tests/mock-detail-audit.mjs`
に実装例）。

### 文字がどのフォントで描かれたかを知る

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

1文字ずつ調べたいときは、テキストノードを1文字ずつ `<span>` に包んでから
問い合わせます。実装は `tests/font-fallback-audit.mjs` にあります。
この方式には固有の罠が2つあり、どちらも同スクリプトで対処済みです。

- **画面外の文字は代替フォントを返す。** 横に流れるマーキーの右側などは
  まだ実フォントで組まれていません。同じ文字を同じ書体指定のまま画面内の
  検証用要素へ複製して問い直します。
- **複製した直後に問い合わせると前の内容のフォントが返る。**
  差し替え後に `requestAnimationFrame` を2回待ってから問い直します。

---

## 3. 直す前に「実機の正解」を確認する

このサイトの画面再現図は、NIARIMアプリ本体（Flutter, `sakurasemaika-creator/NIARIM`）
の実装を再現したものです。**見た目の良し悪しで決めず、アプリのソースを
根拠にしてください。** 憶測で機能や意匠を足さないのが、このリポジトリの
一貫した方針です。

ソースの場所は環境によって違うので、パスを直書きせず
`NIARIM_APP_DIR` か自動検出を使ってください（`tools/app-source.mjs`）。
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
  `public/assets/icons/ui/sprite.svg` に足す。**絵文字や文字記号で
  代用しない**（字形が閲覧環境で変わるため）。追加したら
  `public/assets/icons/ui/LICENSE.md` に出典を追記する

**アプリのソースが手元に無い場合**（`verify:env` が WARN を出す）:

```bash
gh repo clone sakurasemaika-creator/NIARIM /tmp/niarim   # private なので認証が要る
NIARIM_APP_DIR=/tmp/niarim npm run verify:env
```

`gh` もネットワークも使えない環境では、**推測で進めないこと。**
撮影と測定（1・2節）はソース無しでも完結するので、そこまでを済ませ、
根拠が要る変更については参照したいファイルの中身を利用者に依頼して
ください。Claude Code の場合は GitHub MCP ツール
（`mcp__github__get_file_contents` 等）で
`owner: sakurasemaika-creator, repo: NIARIM` を直接読めます。

---

## 4. 直したら回帰を確認する

```bash
npm run format:check                              # 必須。CIの門番
BASE_URL=http://localhost:8788 npm run audit      # 12ページの静的検査
AUDIT_BASE_URL=http://localhost:8788 npm run audit:visual-final
AUDIT_BASE_URL=http://localhost:8788 npm run audit:mock-detail
```

一括なら `npm run audit:all`。ただし数十分かかるものがあります。

**多言語・両画面幅で見ること。** 日本語のPC表示だけで通しても、
フランス語やドイツ語相当の長い文言、390px幅で崩れます。最低でも
`ja / en / fr`（長い）と `ko`（行の高さが変わる）、PCとSPの両方。

**監査スクリプト自身を疑うこと。** これまでに実際にあった誤検出:

- `--fd-fit` の縮小を戻さずに寸法を判定 → 全言語・全画面幅で誤検出
- `color(srgb 0.9 0.9 1 / 0.6)` の 0〜1 の値を 0〜255 として読み、
  コントラスト比を過小に算出
- 空白文字を「代替フォントに落ちている」と報告（見た目に差は出ない）

報告が出たら、まず「その報告は本当か」を実キャプチャで確かめてください。
監査を直すべき場面で本体を直すと、正しかったものを壊します。

---

## 5. 手元で動かせない環境なら（GitHub Actions）

**新しくワークフローを書き起こす必要はありません。**
`.github/workflows/visual-audit.yml` が既にあり、`dev_branch` への push と
`workflow_dispatch` で動きます。中身は次のとおりです。

- `npx playwright install --with-deps chromium` でブラウザを用意
- `python3 -m http.server 8787 --directory public` で配信（wrangler は使わない）
- 監査スクリプト群を実行し、**撮ったPNGを artifact としてアップロード**

つまり、手元でブラウザを起動できない・GitHubへ到達できない環境でも、
**このワークフローを `workflow_dispatch` で回してアーティファクトを
ダウンロードすれば、生成PNGの目視までは到達できます。**

```bash
gh workflow run "Visual interaction audit" --ref dev_branch
gh run watch                      # 終わるまで待つ
gh run download --name final-visual-matrix -D artifacts/ci
```

撮る対象を増やしたいときは、既存のワークフローに1ステップ足すだけです。

```yaml
- name: Capture specific mocks
  if: always()
  run: |
    node tools/shot.mjs "#drawing .feature-diagram" --langs ja,en,fr --dir artifacts/final-matrix/shots
    node tools/shot.mjs "#drawing .feature-diagram" --vp sp --langs ja,en,fr --dir artifacts/final-matrix/shots
```

`--dir` を artifact のアップロード対象配下にするのを忘れないこと。

> **注意: CIの結果を「AI-VERIFICATION.md どおりの確認」として流用しないこと。**
> CIが回すのは既存の自動監査であって、この手順書が求めている
> 「特定の図を撮って**画像そのものを目視する**」ことではありません。
> CIは撮影までを代行する手段であり、目視と判断は人／モデルの側に残ります。

---

## 6. まとめ（この順で回す）

1. `npm ci && npm run verify:env` がすべて OK になるまで直す
2. アプリ本体のソースで「実機の正解」を確認する
3. 直す
4. `tools/shot.mjs` で撮り、**画像を開いて見る**（多言語・PC/SP）
5. `page.evaluate` で数値を測り、画像の印象と一致するか突き合わせる
6. `format:check` と監査を通す
7. `git fetch origin dev_branch && git rebase origin/dev_branch` してから
   `git push -u origin dev_branch`（他セッションが同時に触っている）

作業ブランチ・コミット規約・過去の経緯は `HANDOFF.md` を参照してください。
