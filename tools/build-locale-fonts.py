#!/usr/bin/env python3
"""Extend the shipped locale subsets without dropping their existing glyphs.

A published font is cached for 30 days under its file name (public/_headers),
so a subset whose characters change is written under the next version name
(Name.woff2 -> Name.v2.woff2 -> Name.v3.woff2), the @font-face points at it,
its sha256 goes into tests/font-files.json and the old file is removed. A
subset whose characters stay the same is left as it is.
"""

import argparse
import hashlib
import json
import re
import textwrap
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

from font_strays import drop_stray_contours, stray_glyphs


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
    sheet = root / "public/css/site.css"
    # The standalone pages (404, account deletion, font licenses) do not load
    # site.css; they carry the same generated @font-face block.
    standalone = [root / "public/css/pages" / name for name in ("404.css", "account-deletion.css", "font-licenses.css")]
    css = sheet.read_text(encoding="utf-8")
    supplements = json.loads((root / "tools/locale-font-characters.json").read_text(encoding="utf-8"))

    app_fonts = arguments.app / "assets/fonts"
    brand_faces = {
        "Kuramubon": app_fonts / "Kuramubon.otf",
        "HakkouMincho": app_fonts / "HakkouMincho.ttf",
        "HakkouMinchoCJK": app_fonts / "HakkouMincho.ttf",
        "KuramubonCJK": app_fonts / "Kuramubon.otf",
    }
    manifest_file = root / "tests/font-files.json"
    manifest = json.loads(manifest_file.read_text(encoding="utf-8"))
    for family, characters in supplements.items():
        source = brand_faces.get(family, arguments.originals / f"{family}.ttf")
        published = re.search(
            r'@font-face\s*\{[^}]*?font-family:\s*"' + re.escape(family)
            + r'";[^}]*?/assets/fonts/([\w.-]+\.woff2)',
            css,
        )
        filename = published[1] if published else f"{family}-subset.woff2"
        current = font_dir / filename
        actual = {ord(character) for character in characters}
        if current.is_file():
            with TTFont(current) as old:
                previous = set(old.getBestCmap())
                strays = stray_glyphs(old)
            actual.update(previous)
            # A subset that still carries stray contours (font_strays.py) is
            # rebuilt without them even when its characters stay the same.
            if actual == previous and not strays:
                print(f"{family}: unchanged ({filename})")
                continue
            version = re.match(r"(.*?)(?:\.v(\d+))?\.woff2$", filename)
            filename = f"{version[1]}.v{int(version[2] or 1) + 1}.woff2"
        target = font_dir / filename
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
            dropped = drop_stray_contours(font)
            if dropped:
                print(f"{family}: removed stray contours from {', '.join(dropped)}")
            if "fvar" in font:
                instantiateVariableFont(font, {"wght": 400}, inplace=True)
            font.flavor = "woff2"
            font.save(target)

        with TTFont(target) as generated:
            if generated.getBestCmap().keys() != actual:
                raise ValueError(f"{family}: subset did not preserve the expected code points")
        manifest["files"][filename] = hashlib.sha256(target.read_bytes()).hexdigest()
        if current != target and current.is_file():
            current.unlink()
            manifest["files"].pop(current.name, None)
        pattern = re.compile(r"@font-face\s*\{[^}]*?/assets/fonts/" + re.escape(current.name) + r"[^}]*?\}")
        match = pattern.search(css)
        if match:
            face = match[0].replace("/assets/fonts/" + current.name, "/assets/fonts/" + filename)
            face = re.sub(r"unicode-range:\s*[^;]+;", "unicode-range:\n" + ranges(actual) + ";", face)
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
        # the same characters (site.css explains why).
        fallback = re.compile(
            r'@font-face\s*\{[^}]*?font-family:\s*"' + re.escape(family + "Fallback") + r'";[^}]*?\}'
        )
        stand_in = fallback.search(css)
        if stand_in:
            updated = re.sub(r"unicode-range:\s*[^;]+;", "unicode-range:\n" + ranges(actual) + ";", stand_in[0])
            css = css[:stand_in.start()] + updated + css[stand_in.end():]
        print(f"{family}: {len(actual)} characters, {target.stat().st_size:,} bytes")
    sheet.write_text(css, encoding="utf-8")
    begin, end = "/* === BEGIN generated font-face", "/* === END generated font-face === */"
    block = css[css.index(begin) : css.index(end) + len(end)]
    for page in standalone:
        text = page.read_text(encoding="utf-8")
        if begin in text:
            text = text[: text.index(begin)] + block + text[text.index(end) + len(end) :]
            page.write_text(text, encoding="utf-8")
    manifest_file.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
