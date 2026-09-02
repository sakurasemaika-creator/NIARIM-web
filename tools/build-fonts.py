#!/usr/bin/env python3
"""
サイトで実際に使う文字だけを原本フォントから抜き出してwoff2を作り、
common.css の @font-face ブロック（マーカーで囲んだ範囲）を書き換える。

■ なぜこうしているか
  以前は、サブセットに無い文字を Google Fonts のCDN(fonts.googleapis.com)から
  Noto Serif を読み込んで補っていた。しかし7言語展開＝EU圏の利用を想定する以上、
  閲覧者のIPが第三者へ送信される構成は避けたい（GDPR）。
  そこで不足文字も含めて全部を自前配信に切り替え、外部CDNへの依存をなくした。

■ フォールバック先の選び方（重要）
  白光明朝(HakkouMincho)は Noto Serif JP(Source Han Serif)の派生フォント、
  くらむぼん(Kuramubon)は Dela Gothic の派生フォントである（各フォントの
  name テーブル／Read Me で確認済み）。したがって、収録外の文字を
  同じ Source Han Serif 系の Noto Serif KR / SC で補うと、骨格・字幅が
  揃っているため継ぎ目が目立たない。
    - 韓国語(ハングル) -> Noto Serif KR
    - 簡体字中国語     -> Noto Serif SC
  いずれも原本フォント側に収録が無く（白光明朝は日本語ビルドのため
  ハングル非対応・簡体字ほぼ非対応）、これを入れないと閲覧者のOSフォント
  任せになり、明朝で統一したい意図が崩れる。

■ unicode-range について
  KR/SC は「実際にその文字がページに出たときだけ」ダウンロードさせたいので、
  収録文字ちょうどの unicode-range を出力する。日本語ページを見るだけの
  利用者には KR/SC は1バイトも転送されない。簡体字は日本語の漢字と
  コードポイント範囲が重なるため、広い範囲(U+4E00-9FFF)ではなく
  収録文字ぴったりの範囲にする必要がある。

■ 使い方
  1. 原本フォントを SRC のパスに置く（リポジトリには含めない。配布元から取得）
  2. python3 tools/build-fonts.py
"""
import re, glob, subprocess, sys, os
from fontTools.ttLib import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public/assets/fonts")
CSS = os.path.join(ROOT, "public/css/common.css")
BEGIN = "/* === BEGIN generated font-face (tools/build-fonts.py) === */"
END = "/* === END generated font-face === */"

# 原本フォントの置き場所。環境変数 NIARIM_FONT_SRC で差し替え可能。
SRCDIR = os.environ.get("NIARIM_FONT_SRC", "/tmp/fontsrc")
# kind:
#   "primary"  … 本文用・見出し用。どちらも独立した役割なので、
#                 サイトの全文字のうち自分が収録している分をすべて持たせる
#                 （片方が持っているからもう片方は要らない、という関係ではない）。
#   "fallback" … primaryのどれもが収録していない文字だけを埋める。
#                 こちらは unicode-range を付け、必要なページでしか転送させない。
FONTS = [
    ("HakkouMincho", f"{SRCDIR}/hakkou/HakkouMincho_v1.004/HakkouMincho.ttf",
     "HakkouMincho-subset.woff2", "本文用（白光明朝／lavsic氏・Noto Serif JP派生）", "primary"),
    ("Kuramubon", f"{SRCDIR}/kuramubon/KuramubonFont/Kuramubon.otf",
     "Kuramubon-subset.woff2", "見出し用（くらむぼん／フロップデザイン・Dela Gothic派生）", "primary"),
    ("NotoSerifMenuKR", f"{SRCDIR}/noto/NotoSerifKR.woff2",
     "NotoSerifMenuKR-subset.woff2", "言語切替メニューの「한국어」用（全ページで表示）", "menu"),
    ("NotoSerifMenuSC", f"{SRCDIR}/noto/NotoSerifSC.woff2",
     "NotoSerifMenuSC-subset.woff2", "言語切替メニューの「简体中文」用（全ページで表示）", "menu"),
    ("NotoSerifKR", f"{SRCDIR}/noto/NotoSerifKR.woff2",
     "NotoSerifKR-subset.woff2", "韓国語の補完（Noto Serif KR）", "fallback"),
    ("NotoSerifSC", f"{SRCDIR}/noto/NotoSerifSC.woff2",
     "NotoSerifSC-subset.woff2", "簡体字中国語の補完（Noto Serif SC）", "fallback"),
]

def site_chars():
    """サイトが表示しうる全文字（7言語の辞書＋HTML直書き＋CSSのcontent）。"""
    chars = set()
    for path in glob.glob(os.path.join(ROOT, "public/js/i18n-dict*.js")):
        chars |= set(open(path, encoding="utf-8").read())
    for path in glob.glob(os.path.join(ROOT, "public/**/*.html"), recursive=True):
        s = open(path, encoding="utf-8").read()
        s = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", s, flags=re.S)
        chars |= set(re.sub(r"<[^>]+>", " ", s))
    for path in glob.glob(os.path.join(ROOT, "public/css/**/*.css"), recursive=True):
        for m in re.finditer(r'content:\s*"([^"]*)"', open(path, encoding="utf-8").read()):
            chars |= set(m.group(1))
    return {c for c in chars if c.isprintable() and not c.isspace()}

def menu_chars():
    """言語切替メニューに常時表示される各言語名（「한국어」「简体中文」等）。

    これらは全ページのヘッダーに出るため、大きいKR/SCサブセットに含めると
    「日本語しか読まない利用者にも134KB余計に転送される」ことになる。
    メニュー用の数文字だけを極小フォントに分け、大きい方のunicode-rangeからは
    除外することで、KR/SCは本当にその言語の本文が出るページでだけ転送させる。
    """
    src = open(os.path.join(ROOT, "public/js/i18n.js"), encoding="utf-8").read()
    m = re.search(r"var LANGS = \[(.*?)\];", src, re.S)
    labels = re.findall(r'label:\s*"([^"]+)"', m.group(1)) if m else []
    return {c for lab in labels for c in lab}


def coverage(path):
    f = TTFont(path, fontNumber=0)
    cps = set()
    for t in f["cmap"].tables:
        cps |= set(t.cmap.keys())
    return cps

def unicode_ranges(path):
    cps = sorted(coverage(path))
    out, s, p = [], cps[0], cps[0]
    for c in cps[1:]:
        if c == p + 1:
            p = c; continue
        out.append((s, p)); s = p = c
    out.append((s, p))
    return ", ".join(f"U+{a:04X}" if a == b else f"U+{a:04X}-{b:04X}" for a, b in out)

def build():
    want = site_chars()
    print(f"サイトで使う文字: {len(want)}")
    menu = menu_chars()
    covered_by_primary = set()     # primaryのいずれかが持っている文字
    covered_by_menu = set()        # メニュー用極小フォントが持っている文字
    remaining = set(want)          # fallbackがまだ埋めていない文字
    blocks, report = [], []
    for family, src, outname, role, kind in FONTS:
        if not os.path.exists(src):
            print(f"  !! 原本が見つかりません: {src}"); sys.exit(1)
        cov = coverage(src)
        if kind == "primary":
            # 本文用・見出し用はそれぞれ全文字ぶん必要（役割が違うため）
            take = {c for c in want if ord(c) in cov}
            covered_by_primary |= take
        elif kind == "menu":
            # 言語メニューの文字のうち、primaryに無いものだけ。全ページで読み込む。
            take = {c for c in (menu & want) - covered_by_primary - covered_by_menu
                    if ord(c) in cov}
            covered_by_menu |= take
        else:
            # primary・メニュー用のどれも持っていない文字だけを埋める
            take = {c for c in remaining - covered_by_primary - covered_by_menu
                    if ord(c) in cov}
            remaining -= take
        if not take:
            print(f"  {family}: 担当文字なし（スキップ）"); continue
        dst = os.path.join(OUT, outname)
        before = os.path.getsize(dst) if os.path.exists(dst) else 0
        subprocess.run([
            "pyftsubset", src, "--output-file=" + dst, "--flavor=woff2",
            "--unicodes=" + ",".join(f"U+{ord(c):04X}" for c in sorted(take)),
            "--layout-features=*", "--no-hinting", "--desubroutinize",
            "--name-IDs=*", "--notdef-outline",
        ], check=True)
        size = os.path.getsize(dst)
        report.append(f"  {family}: {len(take)}字  {before/1024:.0f}KB -> {size/1024:.0f}KB")
        rule = [f"/* {role} */", "@font-face {",
                f'  font-family: "{family}";', "  font-display: swap;",
                f'  src: url("/assets/fonts/{outname}") format("woff2");']
        if kind in ("fallback", "menu"):
            rule.append(f"  unicode-range: {unicode_ranges(dst)};")
        rule.append("}")
        blocks.append("\n".join(rule))
    print("\n".join(report))
    remaining -= covered_by_primary | covered_by_menu
    if remaining:
        print(f"  どのフォントにも無い文字 {len(remaining)}字 -> OSのフォントに任せる: "
              f"{''.join(sorted(remaining))}")

    header = (
        f"{BEGIN}\n"
        "/* このブロックは tools/build-fonts.py が生成する。手で編集しないこと。\n"
        "   フォントは全て自前配信で、外部CDNへのリクエストは発生しない\n"
        "   （閲覧者のIPを第三者に送信しないため。詳細はビルドスクリプトの説明を参照）。\n"
        "   ライセンスは /assets/fonts/LICENSE.md にまとめている。 */\n"
    )
    css = open(CSS, encoding="utf-8").read()
    new = header + "\n\n".join(blocks) + f"\n{END}"
    if BEGIN in css:
        css = re.sub(re.escape(BEGIN) + r".*?" + re.escape(END), lambda _: new, css, flags=re.S)
    else:
        # 既存の手書き@font-faceブロック（先頭のコメント＋2つのルール）を置き換える
        css = re.sub(r"/\* NIARIMアプリ本体と同じフォント.*?\n\}\n\n@font-face \{.*?\n\}\n",
                     lambda _: new + "\n", css, count=1, flags=re.S)
    open(CSS, "w", encoding="utf-8").write(css)
    print(f"  common.css の @font-face を更新")

if __name__ == "__main__":
    build()
