# フォントライセンスについて

このディレクトリのフォントはすべて **SIL Open Font License 1.1** で配布されている
フォントを、サイト表示に必要な文字だけに絞り込んだサブセット版です。
（サブセット化は tools/build-fonts.py で行っています。原本はリポジトリに含めていません。）

外部CDN（Google Fonts等）からの読み込みは行わず、すべて自前配信しています。
閲覧者のIPアドレスが第三者に送信されないようにするためです。

## 収録フォント

### HakkouMincho-subset.woff2 — 本文用
**白光明朝**（lavsic 氏 作）
- Noto Serif JP（Source Han Serif / (c) 2017-2024 Adobe）の派生フォントです。
  ※ "Noto" は Google Inc. の商標です。
- NIARIMアプリ本体でも本文フォントとして使用しています。

### Kuramubon-subset.woff2 — 見出し用
**くらむぼん**（フロップデザイン 制作）
- Dela Gothic（Copyright 2020 The Dela Gothic Project Authors）の派生フォントです。
  漢字はDela Gothicを膨らませてギザギザ処理したもの、ひらがな・カタカナ・
  アルファベットはフロップデザインのオリジナルです。
- 配布元: https://www.flopdesign.com/freefont/kuramubon.html
- NIARIMアプリ本体でも見出しフォントとして使用しています。

### NotoSerifKR-subset.woff2 — 韓国語の補完
**Noto Serif KR**（Google / Source Han Serif ベース）
- 白光明朝・くらむぼんは日本語ビルドのためハングルを収録していません。
  これを入れないと韓国語ページが閲覧者のOSフォント任せになり、
  明朝で統一したデザインが崩れます。
- 白光明朝と同じ Source Han Serif 系のため、骨格・字幅が揃い、
  混在しても継ぎ目が目立ちません。
- CSSで `unicode-range` を指定しているため、ハングルが出ないページでは
  ダウンロードされません。

### NotoSansHeadKR-subset.woff2 / NotoSansHeadSC-subset.woff2 — 見出しの補完
**Noto Sans KR / Noto Sans SC**（Google、いずれもWeight 900 Black）
- 見出し用のくらむぼんは超極太ゴシックのため、未収録のハングル・簡体字を
  明朝(Noto Serif KR/SC)で補うと、「550엔」のように同じ単語の中で
  極太の数字と細い明朝が並び、明らかに浮いてしまう（実際にそうなっていた）。
- 太さと骨格の印象が近い Black(900) のゴシックで補うことで、
  見出しらしい太さと「ゴシック見出し／明朝本文」のメリハリを保つ。
- 見出しに出る文字だけのサブセット（計47KB）で、`unicode-range` 指定により
  その言語のページ以外では転送されない。

### NotoSerifSC-subset.woff2 — 簡体字中国語の補完
**Noto Serif SC**（Google / Source Han Serif ベース）
- 簡体字固有の字形（专・业・东 等）は白光明朝・くらむぼんに収録が無いため補完します。
- こちらも `unicode-range` 指定により、簡体字が出ないページでは転送されません。
  （日本語の漢字と範囲が重なるため、広い範囲ではなく収録文字ちょうどの
  範囲を指定しています。）

## サブセットの再生成

サイトの文言を変更したら、収録文字が変わるため再生成が必要です。

```sh
# 原本フォントを配置（配布元から取得。リポジトリには含めない）
#   $NIARIM_FONT_SRC/hakkou/HakkouMincho_v1.004/HakkouMincho.ttf
#   $NIARIM_FONT_SRC/kuramubon/KuramubonFont/Kuramubon.otf
#   $NIARIM_FONT_SRC/noto/NotoSerifKR.woff2
#   $NIARIM_FONT_SRC/noto/NotoSerifSC.woff2
#   $NIARIM_FONT_SRC/noto/NotoSansKR900.woff2
#   $NIARIM_FONT_SRC/noto/NotoSansSC900.woff2
pip install fonttools brotli

# 見出しで実際に使われる文字を実測してから生成する
# （--measure は wrangler dev の起動が必要。省略すると前回の実測結果を使い、
#   文言が変わっていた場合は安全側=全文字収録へ倒れる）
npx wrangler dev --port 8788 &
python3 tools/build-fonts.py --measure
```

common.css の `@font-face` ブロック（BEGIN/ENDマーカーの間）も自動更新されます。
