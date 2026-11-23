#!/usr/bin/env python3
"""Extend the shipped locale subsets without dropping their existing glyphs."""

import argparse
import json
import re
import textwrap
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont


def ranges(points):
    intervals = []
    for point in sorted(points):
        if intervals and intervals[-1][1] == point - 1:
            intervals[-1][1] = point
        else:
            intervals.append([point, point])
    runs = [f"U+{a:04X}" if a == b else f"U+{a:04X}-{b:04X}" for a, b in intervals]
    return textwrap.fill(", ".join(runs), width=78, initial_indent="    ", subsequent_indent="    ")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("originals", type=Path, help="directory with original Noto Serif KR, SC and TC .ttf files")
    parser.add_argument("app", type=Path, help="NIARIM checkout with the original application fonts")
    arguments = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    font_dir = root / "public/assets/fonts"
    sheet = root / "public/css/common-base.css"
    css = sheet.read_text(encoding="utf-8")
    supplements = json.loads((root / "tools/locale-font-characters.json").read_text(encoding="utf-8"))

    app_fonts = arguments.app / "assets/fonts"
    brand_faces = {
        "Kuramubon": ("Kuramubon-latin.woff2", app_fonts / "Kuramubon.otf"),
        "HakkouMincho": ("HakkouMincho-latin.woff2", app_fonts / "HakkouMincho.ttf"),
        "HakkouMinchoCJK": ("HakkouMincho-subset.woff2", app_fonts / "HakkouMincho.ttf"),
        "KuramubonCJK": ("Kuramubon-subset.woff2", app_fonts / "Kuramubon.otf"),
    }
    for family, characters in supplements.items():
        filename, source = brand_faces.get(family, (
            f"{family}-subset.woff2", arguments.originals / f"{family}.ttf",
        ))
        target = font_dir / filename
        actual = {ord(character) for character in characters}
        if target.is_file():
            with TTFont(target) as old:
                actual.update(old.getBestCmap())
        with TTFont(source, recalcTimestamp=False) as font:
            missing = actual - font.getBestCmap().keys()
            if missing:
                raise ValueError(f"{family}: source is missing requested code points {sorted(missing)}")
            options = subset.Options()
            options.layout_features += ["vert", "vrt2", "tnum"]
            options.hinting = False
            options.name_IDs = ["*"]
            options.notdef_outline = True
            sub = subset.Subsetter(options=options)
            sub.populate(unicodes=actual)
            sub.subset(font)
            if "fvar" in font:
                instantiateVariableFont(font, {"wght": 400}, inplace=True)
            font.flavor = "woff2"
            font.save(target)

        with TTFont(target) as generated:
            if generated.getBestCmap().keys() != actual:
                raise ValueError(f"{family}: subset did not preserve the expected code points")
        pattern = re.compile(r"@font-face\s*\{[^}]*?/assets/fonts/" + re.escape(filename) + r"[^}]*?\}")
        match = pattern.search(css)
        if match:
            face = re.sub(r"unicode-range:\s*[^;]+;", "unicode-range:\n" + ranges(actual) + ";", match[0])
            if family not in brand_faces:
                face = re.sub(r"^  font-weight: [^;]+;\n", "", face, flags=re.M)
            css = css[:match.start()] + face + css[match.end():]
        else:
            face = (
                "@font-face {\n"
                f'  font-family: "{family}";\n'
                "  font-display: swap;\n"
                f'  src: url("/assets/fonts/{filename}") format("woff2");\n'
                "  unicode-range:\n" + ranges(actual) + ";\n}\n"
            )
            marker = "/* === END generated font-face === */"
            css = css.replace(marker, face + marker, 1)
        # The device-font stand-in used until this subset arrives covers exactly
        # the same characters (common-base.css explains why).
        fallback = re.compile(
            r'@font-face\s*\{[^}]*?font-family:\s*"' + re.escape(family + "Fallback") + r'";[^}]*?\}'
        )
        stand_in = fallback.search(css)
        if stand_in:
            updated = re.sub(r"unicode-range:\s*[^;]+;", "unicode-range:\n" + ranges(actual) + ";", stand_in[0])
            css = css[:stand_in.start()] + updated + css[stand_in.end():]
        print(f"{family}: {len(actual)} characters, {target.stat().st_size:,} bytes")
    sheet.write_text(css, encoding="utf-8")


if __name__ == "__main__":
    main()
