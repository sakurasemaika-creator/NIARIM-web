#!/usr/bin/env python3
"""
Split the Japanese fonts (HakkouMinchoCJK, KuramubonCJK) into files by page.

Why: a page downloads a font file when one of its characters falls in that
file's unicode-range. One file per font meant every Japanese page fetched the
whole subset (HakkouMinchoCJK 314KB, KuramubonCJK 579KB) for the 150-500
characters it shows, and an English privacy policy fetched the 314KB file for
its "・" bullets.

Each font becomes several files of the same font-family, each with the
unicode-range of its characters (tools/page-font-chars.json, measured with
tools/measure-page-font-chars.mjs, says which page draws which character):
  kern   every character in a kerning pair of the font (kana and punctuation
         in HakkouMincho). They stay in one file, so the browser still
         shapes them in one run and the pairs keep their kerning.
  latin  characters drawn on English, French or Spanish pages
  intl   characters drawn on Chinese or Korean pages
  home   characters drawn on the top page
  pages  characters drawn on the other pages (features, help, about...)
  legal  characters drawn on the legal pages and the font licenses
  rest   characters no page draws when it opens (later messages, results)
Each character is in exactly one file, with the same outline, advance and
metrics as before; only the vertical-writing features (the site sets no
vertical text) are left out. A character a page did not show when measured
is still drawn the same: the page then fetches one more file.

Usage (rewrites the generated @font-face block in site.css and its copies;
run Prettier on those stylesheets afterwards, as after build-fonts.py):
    python3 tools/font_chunks.py
build-fonts.py calls chunk_faces() for the files it builds.
"""

import hashlib
import json
import os
import re
import sys

from fontTools import subset
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.ttLib import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_DIR = os.path.join(ROOT, "public/assets/fonts")
PAGE_CHARS = os.path.join(ROOT, "tools/page-font-chars.json")
MANIFEST = os.path.join(ROOT, "tests/font-files.json")
CSS_FILES = [
    os.path.join(ROOT, "public/css/site.css"),
    os.path.join(ROOT, "public/css/pages/404.css"),
    os.path.join(ROOT, "public/css/pages/account-deletion.css"),
    os.path.join(ROOT, "public/css/pages/font-licenses.css"),
]
CHUNKED_FAMILIES = ("HakkouMinchoCJK", "KuramubonCJK")
VERTICAL = {"vert", "vrt2", "vkrn", "vpal", "vhal", "vchw", "valt", "vkna"}
HOME = {"/"}
LEGAL = {"/privacy/", "/terms/", "/tokushoho/", "/font-licenses/"}
LATIN_LANGS = {"en", "fr", "es"}
INTL_LANGS = {"zh-Hans", "zh-Hant", "ko"}


def features(font):
    tags = set()
    for tag in ("GSUB", "GPOS"):
        if tag in font and font[tag].table.FeatureList:
            tags |= {r.FeatureTag for r in font[tag].table.FeatureList.FeatureRecord}
    return tags


def kern_pairs(font):
    """Every (first, second) character pair the font kerns, with its value."""
    cmap = font.getBestCmap()
    chars = {}
    for cp, glyph in cmap.items():
        chars.setdefault(glyph, []).append(chr(cp))
    pairs = {}
    if "GPOS" not in font:
        return pairs
    gpos = font["GPOS"].table
    for record in gpos.FeatureList.FeatureRecord:
        if record.FeatureTag != "kern":
            continue
        for index in record.Feature.LookupListIndex:
            lookup = gpos.LookupList.Lookup[index]
            for table in lookup.SubTable:
                if lookup.LookupType == 9:
                    table = table.ExtSubTable
                if not hasattr(table, "Format") or not hasattr(table, "Coverage"):
                    continue
                firsts = table.Coverage.glyphs
                if table.Format == 1:
                    for first, pair_set in zip(firsts, table.PairSet):
                        for record2 in pair_set.PairValueRecord:
                            value = record2.Value1
                            amount = getattr(value, "XAdvance", 0) if value else 0
                            if amount:
                                for a in chars.get(first, []):
                                    for b in chars.get(record2.SecondGlyph, []):
                                        pairs.setdefault((a, b), amount)
                else:
                    class1 = table.ClassDef1.classDefs
                    class2 = table.ClassDef2.classDefs
                    all_glyphs = font.getGlyphOrder()
                    for first in firsts:
                        row = table.Class1Record[class1.get(first, 0)]
                        for second in all_glyphs:
                            value = row.Class2Record[class2.get(second, 0)].Value1
                            amount = getattr(value, "XAdvance", 0) if value else 0
                            if amount:
                                for a in chars.get(first, []):
                                    for b in chars.get(second, []):
                                        pairs.setdefault((a, b), amount)
    return pairs


def is_han(ch):
    cp = ord(ch)
    return 0x3400 <= cp <= 0x9FFF or 0xF900 <= cp <= 0xFAFF or cp >= 0x20000


def plan(font, family, page_chars):
    """Characters of each file, in order (the first file a character fits)."""
    cmap = {chr(cp) for cp in font.getBestCmap()}
    measured = page_chars.get(family, {})

    def drawn(pages=None, langs=None):
        out = set()
        for key, text in measured.items():
            page, lang = key.split(" ")
            if pages is not None and page not in pages:
                continue
            if langs is not None and lang not in langs:
                continue
            out |= set(text)
        return out

    other_pages = {key.split(" ")[0] for key in measured} - HOME - LEGAL
    kern = {ch for pair in kern_pairs(font) for ch in pair}
    groups = [
        ("kern", kern),
        ("latin", drawn(langs=LATIN_LANGS)),
        ("intl", drawn(langs=INTL_LANGS)),
        ("home", drawn(pages=HOME, langs={"ja"})),
        ("pages", drawn(pages=other_pages, langs={"ja"})),
        ("legal", drawn(pages=LEGAL, langs={"ja"})),
        ("rest", cmap),
    ]
    taken = set()
    chunks = []
    for name, chars in groups:
        own = (chars & cmap) - taken
        if own:
            chunks.append((name, own))
            taken |= own
    return chunks


def subset_to(src, chars, dst):
    font = TTFont(src)
    options = subset.Options()
    options.layout_features = sorted(features(font) - VERTICAL)
    options.name_IDs = ["*"]
    options.name_languages = ["*"]
    options.name_legacy = True
    options.notdef_outline = True
    options.notdef_glyph = True
    options.hinting = False
    options.legacy_kern = True
    options.drop_tables = []
    options.recalc_bounds = False
    options.recalc_timestamp = False
    options.recalc_average_width = False
    options.recalc_max_context = False
    options.prune_unicode_ranges = False
    options.prune_codepages = False
    options.flavor = "woff2"
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=[ord(ch) for ch in chars])
    subsetter.subset(font)
    # A glyph kept only as a part of another (》 is drawn from 《) keeps its
    # cmap entry too; that character belongs to its own file.
    wanted = {ord(ch) for ch in chars}
    for table in font["cmap"].tables:
        table.cmap = {cp: g for cp, g in table.cmap.items() if cp in wanted}
    font.flavor = "woff2"
    font.save(dst)


def outlines(font, chars):
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    out = {}
    for ch in chars:
        name = cmap[ord(ch)]
        pen = DecomposingRecordingPen(glyphs)
        glyphs[name].draw(pen)
        out[ch] = (pen.value, font["hmtx"][name][0])
    return out


def verify(src, files):
    """Same glyphs, metrics and kerning as the source, split without overlap."""
    source = TTFont(src)
    cmap = {chr(cp) for cp in source.getBestCmap()}
    seen = set()
    owner = {}
    for path, chars in files:
        chunk = TTFont(path)
        got = {chr(cp) for cp in chunk.getBestCmap()}
        assert got == chars, f"{path}: characters differ"
        assert not (got & seen), f"{path}: characters in two files"
        seen |= got
        for ch in got:
            owner[ch] = path
        assert outlines(chunk, got) == outlines(source, got), f"{path}: glyphs differ"
        for tag, fields in {
            "head": ["unitsPerEm", "macStyle"],
            "hhea": ["ascent", "descent", "lineGap"],
            "OS/2": [
                "sTypoAscender",
                "sTypoDescender",
                "sTypoLineGap",
                "usWinAscent",
                "usWinDescent",
                "fsSelection",
                "usWeightClass",
            ],
        }.items():
            for field in fields:
                assert getattr(chunk[tag], field) == getattr(source[tag], field), (
                    f"{path}: {tag}.{field} differs"
                )
        kept = {pair: v for pair, v in kern_pairs(source).items() if set(pair) <= got}
        assert kern_pairs(chunk) == kept, f"{path}: kerning differs"
    assert seen == cmap, "some characters are in no file"
    for a, b in kern_pairs(source):
        assert owner[a] == owner[b], f"kerning pair {a}{b} split across files"


def unicode_ranges(chars):
    cps = sorted(ord(ch) for ch in chars)
    spans = []
    start = prev = cps[0]
    for cp in cps[1:]:
        if cp == prev + 1:
            prev = cp
            continue
        spans.append((start, prev))
        start = prev = cp
    spans.append((start, prev))
    return ", ".join(f"U+{a:04X}" if a == b else f"U+{a:04X}-{b:04X}" for a, b in spans)


def chunk_faces(src, family, stem, display="swap"):
    """Write the files of one font and return their @font-face rules.

    src is the subset with every character of the font; stem names the files
    (stem-kern.woff2, stem-home.woff2, …). src itself is not changed.
    """
    with open(PAGE_CHARS, encoding="utf-8") as f:
        page_chars = json.load(f)
    chunks = plan(TTFont(src), family, page_chars)
    files = []
    rules = []
    for name, chars in chunks:
        out_name = f"{stem}-{name}.woff2"
        path = os.path.join(FONT_DIR, out_name)
        subset_to(src, chars, path)
        files.append((path, chars))
        rules.append(
            "\n".join(
                [
                    "@font-face {",
                    f'  font-family: "{family}";',
                    f"  font-display: {display};",
                    f'  src: url("/assets/fonts/{out_name}") format("woff2");',
                    f"  unicode-range: {unicode_ranges(chars)};",
                    "}",
                ]
            )
        )
    verify(src, files)
    return files, rules


FACE = re.compile(r"@font-face \{[^}]*\}")
RANGE = re.compile(r"unicode-range:([^;]*);")


def split_stand_in(css, family):
    """Give the metric stand-in of a split font one face per part.

    <family>Fallback draws the font's characters with a device font sized to
    the same advance until the font arrives; it covers exactly the font's
    characters. With the same ranges as the parts, each range is written twice
    in the stylesheet, which compression stores once (one stand-in with the
    whole range cost 4.5KB compressed on every page).
    """
    parts = [
        RANGE.search(m.group(0)).group(1)
        for m in FACE.finditer(css)
        if f'font-family: "{family}";' in m.group(0)
    ]
    stand_ins = [
        m.group(0)
        for m in FACE.finditer(css)
        if f'font-family: "{family}Fallback";' in m.group(0)
    ]
    if len(parts) < 2 or len(stand_ins) != 1:
        return css
    face = stand_ins[0]
    copies = [RANGE.sub(lambda _: f"unicode-range:{part};", face) for part in parts]
    return css.replace(face, "\n".join(copies))


def main():
    with open(CSS_FILES[0], encoding="utf-8") as f:
        css = f.read()
    replaced = {}
    manifest_path = MANIFEST
    with open(manifest_path, encoding="utf-8") as f:
        manifest = json.load(f)
    for family in CHUNKED_FAMILIES:
        faces = [
            m for m in FACE.finditer(css) if f'font-family: "{family}";' in m.group(0)
        ]
        if len(faces) != 1:
            print(f"{family}: already split ({len(faces)} faces), skipped")
            continue
        face = faces[0].group(0)
        src_name = re.search(r'url\("/assets/fonts/([^"]+)"\)', face).group(1)
        version = re.search(r"\.v(\d+)\.woff2$", src_name)
        next_version = int(version.group(1)) + 1 if version else 2
        stem = re.sub(r"(\.v\d+)?\.woff2$", "", src_name) + f".v{next_version}"
        src = os.path.join(FONT_DIR, src_name)
        files, rules = chunk_faces(src, family, stem)
        replaced[face] = "\n".join(rules)
        for path, chars in files:
            with open(path, "rb") as f:
                manifest["files"][os.path.basename(path)] = hashlib.sha256(
                    f.read()
                ).hexdigest()
            print(
                f"  {os.path.basename(path)}: {len(chars)} chars, "
                f"{os.path.getsize(path)} bytes"
            )
        print(
            f"{family}: {src_name} ({os.path.getsize(src)} bytes) -> {len(files)} files"
        )
        os.remove(src)
    for path in CSS_FILES:
        with open(path, encoding="utf-8") as f:
            text = f.read()
        for old, new in replaced.items():
            if old in text:
                text = text.replace(old, new)
        for family in CHUNKED_FAMILIES:
            text = split_stand_in(text, family)
        with open(path, "w", encoding="utf-8") as f:
            f.write(text)
    if not replaced:
        return
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
        f.write("\n")


if __name__ == "__main__":
    sys.exit(main())
