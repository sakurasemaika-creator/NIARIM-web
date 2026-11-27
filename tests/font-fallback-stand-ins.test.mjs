import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// Until the Japanese subsets of HakkouMincho and Kuramubon arrive, their
// characters are drawn with a device font sized to the same advance
// (HakkouMincho kana and kanji are 0.65em wide, Kuramubon's 1em). Without the
// stand-ins, paragraphs wrapped at 1.5 times the width and headings fell back
// to the 0.65em body face, and both re-wrapped when the fonts arrived (CLS
// 0.31 on /opals/ on a slow phone). Each stand-in must cover exactly its
// subset's characters, or characters the subset lacks would change font for
// good, and every stack that names a subset must name its stand-in next.
const root = path.resolve(import.meta.dirname, "..");
const css = (file) =>
  fs.readFileSync(path.join(root, "public", "css", file), "utf8");

// The characters of a family: a subset is served in several files (one
// @font-face each, tools/font_chunks.py), so the ranges of all its faces.
function faceRange(sheet, family) {
  const faces = [
    ...sheet.matchAll(
      new RegExp(
        `@font-face\\s*\\{[^}]*font-family:\\s*"${family}";[^}]*\\}`,
        "g",
      ),
    ),
  ];
  assert.ok(faces.length, `no @font-face for ${family}`);
  const codePoints = new Set();
  for (const [face] of faces) {
    const range = face.match(/unicode-range:\s*([^;]+);/);
    assert.ok(range, `${family} has no unicode-range`);
    for (const part of range[1].split(",")) {
      const [a, b = a] = part.trim().replace(/^U\+/i, "").split("-");
      for (let cp = parseInt(a, 16); cp <= parseInt(b, 16); cp++) {
        assert.ok(!codePoints.has(cp), `${family}: U+${cp.toString(16)} twice`);
        codePoints.add(cp);
      }
    }
  }
  return [...codePoints].sort((x, y) => x - y);
}

for (const [subset, standIn, sizeAdjust] of [
  ["HakkouMinchoCJK", "HakkouMinchoCJKFallback", "65%"],
  ["KuramubonCJK", "KuramubonCJKFallback", null],
]) {
  test(`${standIn} covers exactly the characters of ${subset}`, () => {
    const sheet = css("site.css");
    assert.deepEqual(faceRange(sheet, standIn), faceRange(sheet, subset));
    const face = sheet.match(
      new RegExp(`@font-face\\s*\\{[^}]*font-family:\\s*"${standIn}";[^}]*\\}`),
    )[0];
    assert.match(face, /src:\s*local\(/);
    assert.doesNotMatch(face, /url\(/);
    if (sizeAdjust)
      assert.match(face, new RegExp(`size-adjust:\\s*${sizeAdjust}`));
    else assert.doesNotMatch(face, /size-adjust/);
  });

  test(`every stack naming ${subset} names ${standIn} right after it`, () => {
    const offenders = [];
    const files = [
      "site.css",
      ...fs
        .readdirSync(path.join(root, "public", "css", "pages"))
        .map((f) => "pages/" + f),
    ];
    for (const file of files) {
      if (!file.endsWith(".css")) continue;
      const sheet = css(file).replace(/\/\*[\s\S]*?\*\//g, "");
      for (const match of sheet.matchAll(
        new RegExp(`"${subset}"\\s*([,;)!])\\s*("[^"]*")?`, "g"),
      )) {
        // The @font-face declaration itself, not a stack.
        if (/font-family:\s*$/.test(sheet.slice(0, match.index))) continue;
        // Korean and Chinese stacks put the locale's own font first. It covers
        // the punctuation and kanji at 1em, so a 0.65em stand-in there would
        // itself re-wrap the text when the locale font arrives.
        const stack = sheet.slice(
          sheet.lastIndexOf(":", match.index),
          match.index,
        );
        if (stack.includes("var(--font-cjk-locale)")) continue;
        if (match[2] !== `"${standIn}"`) offenders.push(`${file}: ${match[0]}`);
      }
    }
    assert.deepEqual(offenders, []);
  });
}
