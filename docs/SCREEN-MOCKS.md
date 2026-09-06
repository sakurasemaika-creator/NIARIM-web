# 画面再現図（screen mock）の仕組みと直し方

このサイトはアプリの画面を**スクリーンショットではなく DOM と CSS で
再現**しています。翻訳すると図の中の文字も差し替わり、節ごとに配色も
変わるのはそのためです。

その代わり、**アプリの実装と食い違うと嘘の説明になります。**
図に手を入れるときは必ずアプリのソースを根拠にしてください。

---

## 1. どこに何があるか

| もの             | 場所                                                            |
| ---------------- | --------------------------------------------------------------- |
| 図を組み立てるJS | `public/js/main.js`（`canvasScreen()` ほか8種）                 |
| HTMLの初期状態   | 各 `public/*/index.html` の `<div class="feature-diagram">`     |
| 構造・寸法のCSS  | `screen-mock-accuracy-base.css` / `screen-mock-layout-fix.css`  |
| 配色のCSS        | `screen-mock-palette.css` / `screen-mock-contrast-palettes.css` |
| 図の中の文言     | `public/js/i18n-dict-features-diagram.js`                       |
| アイコン         | `public/assets/icons/ui/sprite.svg`                             |

### 8種類の画面

| 関数                                     | 再現しているアプリ画面       | 使われている場所            |
| ---------------------------------------- | ---------------------------- | --------------------------- |
| `canvasScreen(null)`                     | キャンバス（描画）           | `#drawing`                  |
| `canvasScreen("layer")`                  | キャンバス＋レイヤーパネル   | `#editing`、画面紹介カード  |
| `canvasScreen("onion")`                  | キャンバス＋オニオンスキン   | `#advanced`、画面紹介カード |
| `timelineScreen()`                       | タイムライン                 | `#animation`、カード        |
| `audioScreen()`                          | 音声クリップ詳細             | `#audio`、カード            |
| `saveSlotsScreen()` / `saveTreeScreen()` | セーブスロット／セーブツリー | `#save`、カード             |
| `workspaceScreen()`                      | ワークスペース設定           | `#workspace`、カード        |
| `themeScreen()`                          | テーマ・外観                 | `#workspace` の2つ目        |
| `exportScreen()`                         | 書き出し                     | `#export`、カード           |

---

## 2. HTMLとJSの二重管理（重要）

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

**チェックリスト**

- [ ] `public/js/main.js` の組み立て関数を直した
- [ ] 対応する `index.html` のフォールバックも同じ内容に直した
- [ ] 新しい文言は `i18n-dict-features-diagram.js` に7言語ぶん足した
- [ ] `data-i18n="fd.xxx"` を付けた（付け忘れると日本語のまま残る）

---

## 3. 配色（`--fd-*` トークン）

図の色は直接書かず、必ずトークンを使います。節ごとに違う色相が
割り当ててあり、同じ図でも `#drawing` と `#audio` では色が変わります。

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

### 「パネル」と「外周」を取り違えないこと

実際に起きた事故です。上部バー・ツールバー・コマ一覧に
`--fd-panel` を塗ったところ、**実機には無い帯が画面を横切りました。**

アプリではこれらは自前の背景を持たず（`ToolbarWidget` の根は
`Colors.transparent`）、用紙の外側は画面全体に `kCanvasOutsideColor` が
一枚敷かれているので地続きに見えます。

- **キャンバス画面**の上部バー・ツールバー・コマ一覧・折りたたみハンドル
  → **透過**。画面の下地が `--fd-outside`
- **本当にパネルなもの**（レイヤーパネル、オニオンスキン、音声クリップ
  シート、セーブスロット、設定カード）→ `--fd-panel`
- **タイムラインのツールバー**だけは実機にも帯がある
  （`_buildToolbar` の `decoration` が `surfaceContainerHighest`）
  → `--fd-outside` を明示的に敷く

---

## 4. 縮小（`--fd-fit`）

図は 320×569（アプリの論理解像度）で作り、枠に収まらないときだけ
`main.js` の `fitMockScreens()` が `transform: scale()` で縮めます。
縮小率は `--fd-fit` に入ります。

**`getBoundingClientRect()` が返すのは縮小後の値です。**
50pxのはずのコマが 44.95px と読まれます。CSS上の寸法で判定したいときは
`--fd-fit` で割ってください（`tests/mock-detail-audit.mjs` に実装例）。

---

## 5. 新しい画面を足す手順

1. **アプリのソースで正解を確認する**（`docs/../AI-VERIFICATION.md` 3節）
   - 構造 → 対応する Widget を読む
   - 文言 → `arbStrings("キー名")` で7言語ぶん取る
   - 色・寸法 → `Container` / `decoration` を読む
2. `main.js` に組み立て関数を書く。既存の `appBar()` / `iconButton()` /
   `icon()` などの部品を使い回す
3. HTML に同じ内容のフォールバックを置く。2つ目以降の図なら
   `data-mock-screen="…"` を付けて `replaceDiagramNode()` で差し替える
4. `i18n-dict-features-diagram.js` に7言語ぶんのキーを足す
5. CSS を `screen-mock-layout-fix.css` の末尾に節番号を振って追記
6. **撮って目視する**（`AI-VERIFICATION.md`）。PC/SP × 少なくとも
   ja / en / fr / ko。文言が長い言語で溢れやすい
7. 溢れていないか実測する

```bash
node tools/shot.mjs '#workspace [data-mock-screen="theme"]' \
  --langs ja,en,fr,ko --measure
node tools/shot.mjs '#workspace [data-mock-screen="theme"]' --vp sp --langs ja,en,fr,ko
```

---

## 6. アイコンと記号

- **絵文字を使わない。** 閲覧環境のカラー絵文字で描かれ、単色アイコンが
  並ぶ中でそこだけ浮きます
- **文字記号も避ける。** `★` `☆` `✓` `⋮` `▾` `⌄` `⌗` `↺` `❗` は、
  同梱フォントに無いか、あっても明朝の字形が意図と違います
  （`✓` は9pxまで小さくすると数学の根号に見える）
- **アプリが使っている `Icons.*` を特定して sprite.svg に足す**のが原則。
  足したら `public/assets/icons/ui/LICENSE.md` に出典を書く
- スプライトに無く、アイコンでもない図形（チェック、シェブロン、
  全画面マーク、閉じる印）は **CSSの罫線で描く**。
  `screen-mock-layout-fix.css` の23・24節に実例があります
