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


## SIL Open Font License 1.1（全文）

```
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.
```
