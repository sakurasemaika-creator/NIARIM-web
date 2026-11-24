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

function faceRange(sheet, family) {
  const face = sheet.match(
    new RegExp(`@font-face\\s*\\{[^}]*font-family:\\s*"${family}";[^}]*\\}`),
  );
  assert.ok(face, `no @font-face for ${family}`);
  const range = face[0].match(/unicode-range:\s*([^;]+);/);
  assert.ok(range, `${family} has no unicode-range`);
  return range[1].replace(/\s+/g, " ").trim();
}

for (const [subset, standIn, sizeAdjust] of [
  ["HakkouMinchoCJK", "HakkouMinchoCJKFallback", "65%"],
  ["KuramubonCJK", "KuramubonCJKFallback", null],
]) {
  test(`${standIn} covers exactly the characters of ${subset}`, () => {
    const sheet = css("site.css");
    assert.equal(faceRange(sheet, standIn), faceRange(sheet, subset));
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
