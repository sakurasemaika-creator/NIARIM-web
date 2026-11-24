"""Stray contours far outside a glyph's own box.

Three glyphs of the HakkouMincho source font (之 U+4E4B, 林 U+6797 and
活 U+6D3B) carry an extra small four-pointed star 3.7 to 4.7 em to the right
of the character. In the middle of a line it lands on a later character;
where the line ends early (a phrase break, a <br>) it is drawn alone in the
empty space as a small "×" (Opals' 「いつもの活動を」 at 390px). The subsets
are built without such contours: a contour that lies entirely more than half
an em beyond the advance (or before the origin) is not part of the character.
Marks with no advance (combining accents) are left alone.
"""

from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.ttGlyphPen import TTGlyphPen


def _contours(glyph_set, name):
    pen = RecordingPen()
    glyph_set[name].draw(pen)
    contours, current = [], []
    for operator, operands in pen.value:
        current.append((operator, operands))
        if operator in ("closePath", "endPath"):
            contours.append(current)
            current = []
    if current:
        contours.append(current)
    return contours


def _outside(contour, advance, margin):
    xs = [point[0] for _, operands in contour for point in operands]
    return bool(xs) and (min(xs) > advance + margin or max(xs) < -margin)


def stray_glyphs(font, margin_em=0.5):
    """Names of the glyphs that carry a contour far outside their box."""
    if "glyf" not in font:
        return []
    glyph_set = font.getGlyphSet()
    margin = font["head"].unitsPerEm * margin_em
    names = []
    for name in font.getGlyphOrder():
        advance = font["hmtx"][name][0]
        if advance <= 0 or font["glyf"][name].isComposite():
            continue
        if any(_outside(c, advance, margin) for c in _contours(glyph_set, name)):
            names.append(name)
    return names


def drop_stray_contours(font, margin_em=0.5):
    """Removes those contours in place and returns the glyph names it changed."""
    names = stray_glyphs(font, margin_em)
    if not names:
        return []
    glyph_set = font.getGlyphSet()
    margin = font["head"].unitsPerEm * margin_em
    rebuilt = {}
    for name in names:
        advance = font["hmtx"][name][0]
        pen = TTGlyphPen(glyph_set)
        for contour in _contours(glyph_set, name):
            if _outside(contour, advance, margin):
                continue
            for operator, operands in contour:
                getattr(pen, operator)(*operands)
        rebuilt[name] = pen.glyph()
    glyf = font["glyf"]
    for name, glyph in rebuilt.items():
        glyph.recalcBounds(glyf)
        glyf[name] = glyph
        font["hmtx"][name] = (font["hmtx"][name][0], getattr(glyph, "xMin", 0))
    return names
