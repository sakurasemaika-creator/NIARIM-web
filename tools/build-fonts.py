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

import re, glob, subprocess, sys, os, json, hashlib
from fontTools.ttLib import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public/assets/fonts")
CSS = os.path.join(ROOT, "public/css/common.css")
SERIF_CHARS = os.path.join(ROOT, "tools/serif-chars.txt")
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
    (
        "HakkouMincho",
        f"{SRCDIR}/hakkou/HakkouMincho_v1.004/HakkouMincho.ttf",
        "HakkouMincho-subset.woff2",
        "本文用（白光明朝／lavsic氏・Noto Serif JP派生）",
        "primary",
    ),
    (
        "Kuramubon",
        f"{SRCDIR}/kuramubon/KuramubonFont/Kuramubon.otf",
        "Kuramubon-subset.woff2",
        "見出し用（くらむぼん／フロップデザイン・Dela Gothic派生）",
        "heading",
    ),
    # 見出し(--font-serif)専用の補完。くらむぼんは超極太ゴシックなので、
    # 未収録のハングル・簡体字を明朝(Noto Serif KR/SC)で補うと、
    # 「550엔」のように同じ単語の中で極太ゴシックの数字と細い明朝が
    # 並んで明らかに浮く（実際にそうなっていた）。太さと骨格の印象が
    # 近い Noto Sans KR/SC の Black(900) で補い、見出しらしさを保つ。
    (
        "NotoSansHeadKR",
        f"{SRCDIR}/noto/NotoSansKR900.woff2",
        "NotoSansHeadKR-subset.woff2",
        "見出しのハングル補完（Noto Sans KR Black）",
        "heading-fallback",
    ),
    (
        "NotoSansHeadSC",
        f"{SRCDIR}/noto/NotoSansSC900.woff2",
        "NotoSansHeadSC-subset.woff2",
        "見出しの簡体字補完（Noto Sans SC Black）",
        "heading-fallback",
    ),
    (
        "NotoSerifMenuKR",
        f"{SRCDIR}/noto/NotoSerifKR.woff2",
        "NotoSerifMenuKR-subset.woff2",
        "言語切替メニューの「한국어」用（全ページで表示）",
        "menu",
    ),
    (
        "NotoSerifMenuSC",
        f"{SRCDIR}/noto/NotoSerifSC.woff2",
        "NotoSerifMenuSC-subset.woff2",
        "言語切替メニューの「简体中文」用（全ページで表示）",
        "menu",
    ),
    (
        "NotoSerifKR",
        f"{SRCDIR}/noto/NotoSerifKR.woff2",
        "NotoSerifKR-subset.woff2",
        "韓国語の補完（Noto Serif KR）",
        "fallback",
    ),
    (
        "NotoSerifSC",
        f"{SRCDIR}/noto/NotoSerifSC.woff2",
        "NotoSerifSC-subset.woff2",
        "簡体字中国語の補完（Noto Serif SC）",
        "fallback",
    ),
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
        for m in re.finditer(
            r'content:\s*"([^"]*)"', open(path, encoding="utf-8").read()
        ):
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


def content_fingerprint():
    """サブセット対象になるテキストの指紋。見出し実測結果の鮮度判定に使う。

    common.css の生成ブロック（@font-face）はこのスクリプト自身の出力なので
    指紋から除外する。含めてしまうと、ビルドするたびに自分が書き換えた
    common.css で指紋がずれ、次回必ず「実測結果が古い」と誤判定して
    安全側（全文字収録）へ倒れてしまう（＝毎回600KB以上太る）。
    指紋が見るべきなのは「どの文字が必要か」を決める入力だけ。
    """
    h = hashlib.sha256()
    for pattern in (
        "public/js/i18n-dict*.js",
        "public/**/*.html",
        "public/css/**/*.css",
    ):
        for path in sorted(glob.glob(os.path.join(ROOT, pattern), recursive=True)):
            data = open(path, "rb").read()
            if os.path.abspath(path) == os.path.abspath(CSS):
                text = data.decode("utf-8")
                i, j = text.find(BEGIN), text.find(END)
                if i != -1 and j != -1:
                    text = text[:i] + text[j + len(END) :]
                data = text.encode("utf-8")
            h.update(data)
    return h.hexdigest()[:16]


def load_serif_chars(want):
    """見出し用フォントが担当する文字を返す。

    tools/serif-chars.txt は `--measure` で実測して生成する
    （--font-serif が実際に当たったテキストノードの文字）。
    サイトの文言を変えると内容がずれるため、生成時の指紋を先頭に記録し、
    食い違ったら「安全側（全文字を収録）」へ倒して警告する。
    容量は増えるが字が抜けることはない、という失敗の仕方にしておく。
    """
    if not os.path.exists(SERIF_CHARS):
        print(
            "  ! tools/serif-chars.txt が無いため、見出し用も全文字を収録します"
            "（容量が増えます）。`python3 tools/build-fonts.py --measure` で実測できます。"
        )
        return set(want)
    lines = open(SERIF_CHARS, encoding="utf-8").read().split("\n")
    stamped = ""
    if lines and lines[0].startswith("# fingerprint:"):
        stamped = lines[0].split(":", 1)[1].strip()
    chars = set("\n".join(lines[1:]))
    if stamped != content_fingerprint():
        print(
            "  ! サイトの文言が変わっており tools/serif-chars.txt が古いため、"
            "見出し用も全文字を収録します（容量が増えます）。"
        )
        print("    `python3 tools/build-fonts.py --measure` で再実測してください。")
        return set(want)
    return {c for c in chars if c.isprintable() and not c.isspace()}


def measure_serif_chars():
    """ブラウザで実測して tools/serif-chars.txt を更新する（--measure）。"""
    print("見出しフォントで描画される文字を実測中（wrangler devが必要）...")
    out = subprocess.run(
        ["node", os.path.join(ROOT, "tools/measure-serif-chars.js")],
        capture_output=True,
        text=True,
        cwd=ROOT,
    )
    if out.returncode != 0:
        print(out.stderr[-2000:])
        sys.exit("実測に失敗しました（wrangler devは起動していますか？）")
    data = json.loads(out.stdout)
    chars = set(data["chars"])
    # 実測時に画面へ出ていなかった文言（送信後のメッセージ等）も拾えるよう、
    # 見出し要素に付いていたi18nキーの値を全7言語ぶん足しておく。
    for path in glob.glob(os.path.join(ROOT, "public/js/i18n-dict*.js")):
        src = open(path, encoding="utf-8").read()
        for k in data["keys"]:
            for m in re.finditer(r'"%s"\s*:\s*"((?:[^"\\]|\\.)*)"' % re.escape(k), src):
                chars |= set(m.group(1))
    chars |= {chr(c) for c in range(0x20, 0x7F)}  # 半角英数記号は安いので全部入れる
    chars = {c for c in chars if c.isprintable() and not c.isspace()}
    with open(SERIF_CHARS, "w", encoding="utf-8") as f:
        f.write(f"# fingerprint: {content_fingerprint()}\n")
        f.write("".join(sorted(chars)))
    print(f"  実測完了: {len(chars)}字 -> tools/serif-chars.txt")


def coverage(path):
    """フォントが収録している「Unicodeコードポイント」の集合を返す。

    注意: cmapの全サブテーブルを合算してはいけない。
    OpenTypeにはMacintosh用のレガシーサブテーブル(platformID=1, format=2)が
    含まれることがあり、そこに入っているのはUnicodeではなく旧来の
    マルチバイト文字コードである。これをUnicodeとして数えると、
    「入っていない字が入っている」と誤判定する
    （実例: くらむぼんの U+89C1 见 はレガシー表にしか無いのに収録扱いになり、
     本来Noto Serif SCで補うべき字がどのフォントからも欠落していた）。
    isUnicode() が真のサブテーブルだけを見る。
    """
    f = TTFont(path, fontNumber=0)
    cps = set()
    for t in f["cmap"].tables:
        if t.isUnicode():
            cps |= set(t.cmap.keys())
    return cps


def unicode_ranges(path):
    cps = sorted(coverage(path))
    out, s, p = [], cps[0], cps[0]
    for c in cps[1:]:
        if c == p + 1:
            p = c
            continue
        out.append((s, p))
        s = p = c
    out.append((s, p))
    return ", ".join(f"U+{a:04X}" if a == b else f"U+{a:04X}-{b:04X}" for a, b in out)


def build():
    want = site_chars()
    print(f"サイトで使う文字: {len(want)}")
    menu = menu_chars()
    serif_want = load_serif_chars(want)
    heading_cov = set()  # 見出し用フォント本体が持つ文字
    heading_filled = set()  # 見出し用の補完フォントが埋めた文字
    # primary同士は「本文用」「見出し用」で別々のfont-familyスタックに入るため、
    # 片方が持っていればもう片方も安心、という関係ではない。
    # 例: くらむぼん(見出し)は簡体字を持つが白光明朝(本文)は持たないので、
    #     「どちらかが持っている」を基準にすると簡体字の本文が字抜けする。
    # したがってfallbackが埋めるべきなのは「全primaryが揃って持っている文字」
    # 以外＝どれか1つでも欠けている文字、とする（＝カバーの積集合を基準にする）。
    primary_covs = []
    covered_by_primary = None  # 全primaryが共通して持つ文字（積集合）
    covered_by_menu = set()  # メニュー用極小フォントが持っている文字
    remaining = set(want)  # fallbackがまだ埋めていない文字
    blocks, report = [], []
    for family, src, outname, role, kind in FONTS:
        if not os.path.exists(src):
            print(f"  !! 原本が見つかりません: {src}")
            sys.exit(1)
        cov = coverage(src)
        if kind == "primary":
            # 本文用は全文字ぶん必要
            take = {c for c in want if ord(c) in cov}
            primary_covs.append(take)
        elif kind == "heading":
            # 見出し用は --font-serif が実際に当たる文字だけでよい
            take = {c for c in serif_want if ord(c) in cov}
            heading_cov = take
            primary_covs.append({c for c in want if ord(c) in cov})
        elif kind == "heading-fallback":
            # 見出しで使う文字のうち、見出し用フォントに無いものを引き受ける。
            # 本文側のカバー判定(covered_by_primary)には影響させない。
            take = {
                c for c in serif_want - heading_cov - heading_filled if ord(c) in cov
            }
            heading_filled |= take
        else:
            # 最初のfallback/menuに来た時点で、primaryの積集合を確定させる
            if covered_by_primary is None:
                covered_by_primary = (
                    set.intersection(*primary_covs) if primary_covs else set()
                )
            if kind == "menu":
                # 言語メニューの文字のうち、primaryが揃って持ってはいないものだけ。
                # 全ページに出るため常時読み込みになる。
                take = {
                    c
                    for c in (menu & want) - covered_by_primary - covered_by_menu
                    if ord(c) in cov
                }
                covered_by_menu |= take
            else:
                take = {
                    c
                    for c in remaining - covered_by_primary - covered_by_menu
                    if ord(c) in cov
                }
                remaining -= take
        if not take:
            print(f"  {family}: 担当文字なし（スキップ）")
            continue
        dst = os.path.join(OUT, outname)
        before = os.path.getsize(dst) if os.path.exists(dst) else 0
        subprocess.run(
            [
                "pyftsubset",
                src,
                "--output-file=" + dst,
                "--flavor=woff2",
                "--unicodes=" + ",".join(f"U+{ord(c):04X}" for c in sorted(take)),
                # '*'（全feature保持）は使わない。既定の必要最小セットに対して、
                # サイトで実際に使っている縦書き(writing-mode: vertical-rl)と
                # 等幅数字(font-variant-numeric: tabular-nums)ぶんだけ足す。
                # '*'のままだと未使用featureで白光明朝+87KB／くらむぼん+100KB膨らむ。
                # --desubroutinize はこのフォント群では容量に影響しなかったため外す。
                "--layout-features+=vert,vrt2,tnum",
                "--no-hinting",
                "--name-IDs=*",
                "--notdef-outline",
            ],
            check=True,
        )
        size = os.path.getsize(dst)
        report.append(
            f"  {family}: {len(take)}字  {before / 1024:.0f}KB -> {size / 1024:.0f}KB"
        )
        rule = [
            f"/* {role} */",
            "@font-face {",
            f'  font-family: "{family}";',
            "  font-display: swap;",
            f'  src: url("/assets/fonts/{outname}") format("woff2");',
        ]
        if kind in ("fallback", "menu", "heading-fallback"):
            rule.append(f"  unicode-range: {unicode_ranges(dst)};")
        rule.append("}")
        blocks.append("\n".join(rule))
    print("\n".join(report))
    if covered_by_primary is None:
        covered_by_primary = set.intersection(*primary_covs) if primary_covs else set()
    remaining -= covered_by_primary | covered_by_menu
    if remaining:
        print(
            f"  どのフォントにも無い文字 {len(remaining)}字 -> OSのフォントに任せる: "
            f"{''.join(sorted(remaining))}"
        )

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
        css = re.sub(
            re.escape(BEGIN) + r".*?" + re.escape(END), lambda _: new, css, flags=re.S
        )
    else:
        # 既存の手書き@font-faceブロック（先頭のコメント＋2つのルール）を置き換える
        css = re.sub(
            r"/\* NIARIMアプリ本体と同じフォント.*?\n\}\n\n@font-face \{.*?\n\}\n",
            lambda _: new + "\n",
            css,
            count=1,
            flags=re.S,
        )
    open(CSS, "w", encoding="utf-8").write(css)
    print(f"  common.css の @font-face を更新")


if __name__ == "__main__":
    if "--measure" in sys.argv:
        measure_serif_chars()
    build()
