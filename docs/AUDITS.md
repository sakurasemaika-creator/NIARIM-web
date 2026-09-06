# 監査スクリプトの一覧と読み方

`tests/` に23本、`tools/audit-site.js` に1本あります。**どれも
「配信サーバーを立てて実際にブラウザで開き、DOMを測る」形式**です。
落ちたときに何を見ているのか分からないと直しようがないので、
ここに用途をまとめます。

前提と立て方は `AI-VERIFICATION.md` 0節を見てください。

---

## 1. まず走らせるもの

```bash
npm run format:check                              # CIの門番。必須
BASE_URL=http://localhost:8788 npm run audit      # 12ページの静的検査
```

`npm run audit`（`tools/audit-site.js`）は全12ページを
1280 / 1024 / 768 / 375 / 320px で開き、次を機械的に確認します。
1件でもあれば終了コード1です。

- JSエラー・失敗したリクエスト・**同一オリジン以外への通信**
  （フォントを自前配信に切り替えた効果が消えていないかの見張り）
- アクセシブル名の無いリンク／ボタン、ラベルの無い入力欄
- 表示されているのに行き先の無いリンク
- 畳んだFAQの中身がタブ順に残っていないか（実際に `focus()` して判定）
- 見出しレベルの飛び、h1の個数、lang / title / description / canonical
- 各幅での横スクロールの発生

---

## 2. npm scripts になっているもの

| コマンド                   | 中身                                 | 何を守るか                                                 |
| -------------------------- | ------------------------------------ | ---------------------------------------------------------- |
| `audit:browser`            | `autonomous-browser-audit.mjs`       | 節ごとの操作（タブ・アコーディオン・ホバー）が実際に動くか |
| `audit:multilang`          | `multilang-responsive-audit-v2.mjs`  | 7言語 × 複数幅での溢れ・見切れ                             |
| `audit:i18n`               | `i18n-completeness-audit.mjs`        | 辞書キーの欠け                                             |
| `audit:visual-final`       | `final-visual-invariants-audit.mjs`  | 図の不変条件（後述）                                       |
| `audit:visual-screenshots` | `final-visual-screenshot-audit.mjs`  | Home/Features の撮影と検査                                 |
| `audit:mock-detail`        | `mock-detail-audit.mjs`              | 図の細部（コマ50px・中央・スライダー高さ・ベゼル）         |
| `audit:style-source`       | `source-style-consistency-audit.mjs` | CSSソースの書き方の一貫性                                  |
| `audit:all`                | 上を順に全部                         | —                                                          |

`audit:all` は数十分かかります。普段は関係するものだけ回してください。

### `final-visual-invariants-audit` が見ている10項目

落ちたときにどれかが壊れています。

```
theme-accent-only normal/hover      legacy accent aliases
50x50 frames                        current frame centered
hero 320:569 ratio                  all six app-preview ratios
six distinct app-preview themes     nine distinct features themes
app preview end visibility          horizontal overflow
```

---

## 3. npm scripts になっていないもの

直接 `node tests/….mjs` で走らせます。

| スクリプト                                                                                                                | 用途                                                           |
| ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `font-fallback-audit.mjs`                                                                                                 | 同梱フォントに字形が無い文字を1文字ずつ検出（`docs/FONTS.md`） |
| `i18n-browser-detection-audit.mjs`                                                                                        | ブラウザ言語からの初期言語判定                                 |
| `ai-trust-visual-audit.mjs`                                                                                               | AIに関する記述の節を実キャプチャで確認                         |
| `deep-section-audit.mjs`                                                                                                  | 節ごとの深い視覚検査                                           |
| `design-polish-audit.mjs`                                                                                                 | 余白・角丸・背景の質、機能ナビの追従とスクロール               |
| `complete-scroll-audit-v2.mjs`                                                                                            | 全画面スクロールと `.reveal` の出現漏れ                        |
| `screen-mock-capture.mjs`                                                                                                 | 各画面再現図を個別PNGに撮る                                    |
| `validate-rendered-audit.mjs`                                                                                             | `autonomous-browser-audit` の代替（CIでフォールバック）        |
| `multilang-responsive-audit-v3/v4.mjs`                                                                                    | 上記の新版。CIは v4 を使用                                     |
| `final-visual-screenshot-audit-v2/v3.mjs`                                                                                 | 上記の新版。CIは v3 を使用                                     |
| `complete-scroll-audit.mjs` / `multilang-responsive-audit.mjs` / `visual-audit.mjs` / `final-visual-screenshot-audit.mjs` | 旧版。新版があるものは新版を優先                               |

> **v2 / v3 / v4 が並んでいるのは経緯によるものです。** 消していないのは
> CIが特定の版を名指ししているためで、どれを使うべきかは
> `.github/workflows/visual-audit.yml` を見るのが確実です。

---

## 4. 監査自身を疑うこと

**実際にあった誤検出です。監査を直すべき場面で本体を直すと、
正しかったものを壊します。**

| 誤検出                                         | 原因                                                                                                    |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `current-frame-not-50x50` が全言語・全幅で出る | `--fd-fit` の縮小を戻さずに `getBoundingClientRect()` の値で判定していた。50pxのコマが44.95pxと読まれる |
| コントラスト比が実際より低く出る               | `color(srgb 0.9 0.9 1 / 0.6)` の 0〜1 の値を 0〜255 として読んでいた                                    |
| 全ページで「代替フォントに落ちている」         | 空白文字を報告していた（見た目に差は出ない）                                                            |
| マーキーの文字が代替フォント扱い               | 画面外の文字はまだ実フォントで組まれていない                                                            |
| 上を直しても消えない                           | 検証用要素に差し替えた**直後**に問い合わせ、前の内容のフォントが返っていた                              |
| コントラスト違反が大量に出る                   | 背景色を `el.parentElement` から辿り始めていた（自分自身を見ていない）                                  |

**報告が出たら、まず「その報告は本当か」を実キャプチャで確かめる。**
`AI-VERIFICATION.md` の手順で該当箇所を撮り、目で見て一致しなければ
監査側のバグです。直したら、なぜ誤検出だったのかをコメントに残して
ください。

---

## 5. CI

`.github/workflows/visual-audit.yml` が `dev_branch` への push と
`workflow_dispatch` で動きます。

- ブラウザは `npx playwright install --with-deps chromium`
- 配信は `python3 -m http.server 8787 --directory public`（**wrangler は
  使わない**）
- 撮ったPNGを artifact としてアップロード（保持14日）

手元でブラウザを起動できない環境では、これを回して成果物を落とせば
生成PNGの目視までは到達できます。

```bash
gh workflow run "Visual interaction audit" --ref dev_branch
gh run watch
gh run download --name final-visual-matrix -D artifacts/ci
```

> CIが回すのは既存の自動監査です。**「特定の図を撮って画像そのものを
> 目視する」ことの代わりにはなりません。** CIは撮影までを代行する手段で、
> 判断は人／モデルの側に残ります。
