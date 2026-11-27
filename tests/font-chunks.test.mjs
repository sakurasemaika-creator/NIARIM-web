import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// HakkouMinchoCJK and KuramubonCJK are served in parts (tools/font_chunks.py,
// which checks glyphs, metrics and kerning when it writes them): a page
// downloads only the parts holding the characters it draws. These checks keep
// the parts and the measurements they were cut from in step.
const root = path.resolve(import.meta.dirname, "..");
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), "utf8");
const families = ["HakkouMinchoCJK", "KuramubonCJK"];

function faces(sheet, family) {
  return [
    ...sheet.matchAll(
      new RegExp(
        `@font-face\\s*\\{[^}]*font-family:\\s*"${family}";[^}]*\\}`,
        "g",
      ),
    ),
  ].map(([face]) => ({
    file: face.match(/url\("\/assets\/fonts\/([^"]+)"\)/)[1],
    chars: new Set(
      face
        .match(/unicode-range:\s*([^;]+);/)[1]
        .split(",")
        .flatMap((part) => {
          const [a, b = a] = part.trim().replace(/^U\+/i, "").split("-");
          const out = [];
          for (let cp = parseInt(a, 16); cp <= parseInt(b, 16); cp++)
            out.push(String.fromCodePoint(cp));
          return out;
        }),
    ),
  }));
}

test("each Japanese font is served in parts, the same in every stylesheet", () => {
  const site = read("public", "css", "site.css");
  for (const family of families) {
    const parts = faces(site, family);
    assert.ok(parts.length >= 3, `${family}: ${parts.length} files`);
    for (const { file } of parts)
      assert.match(file, /-(kern|latin|intl|home|pages|legal|rest)\.woff2$/);
    for (const page of ["404.css", "account-deletion.css", "font-licenses.css"])
      assert.deepEqual(
        faces(read("public", "css", "pages", page), family).map((f) => f.file),
        parts.map((f) => f.file),
        `${page} names the same files`,
      );
  }
});

test("the measurements cover every page", () => {
  const measured = JSON.parse(read("tools", "page-font-chars.json"));
  const pages = ["/", "/404.html"];
  for (const dir of fs.readdirSync(path.join(root, "public"))) {
    if (
      dir !== "admin" &&
      fs.existsSync(path.join(root, "public", dir, "index.html"))
    )
      pages.push(`/${dir}/`);
  }
  // The top page draws both fonts in Japanese; every page is measured in
  // every language for the text font.
  for (const page of pages)
    assert.ok(
      measured.HakkouMinchoCJK[`${page} ja`],
      `${page} ja is not measured`,
    );
  assert.ok(measured.KuramubonCJK["/ ja"]);
});

test("the top page in Japanese needs only some of the parts", () => {
  const site = read("public", "css", "site.css");
  const measured = JSON.parse(read("tools", "page-font-chars.json"));
  for (const family of families) {
    const parts = faces(site, family);
    const drawn = [...measured[family]["/ ja"]];
    const used = parts.filter((p) => drawn.some((ch) => p.chars.has(ch)));
    assert.ok(used.length < parts.length, `${family}: every part is fetched`);
    for (const ch of drawn)
      assert.ok(
        parts.some((p) => p.chars.has(ch)),
        `${family}: ${ch} is in no part`,
      );
  }
});

test("English, French and Spanish pages need at most the kerning and latin parts", () => {
  const site = read("public", "css", "site.css");
  const measured = JSON.parse(read("tools", "page-font-chars.json"));
  for (const family of families) {
    const parts = faces(site, family);
    for (const [key, text] of Object.entries(measured[family])) {
      if (!/ (en|fr|es)$/.test(key)) continue;
      for (const ch of text) {
        const part = parts.find((p) => p.chars.has(ch));
        assert.match(part.file, /-(kern|latin)\.woff2$/, `${key}: ${ch}`);
      }
    }
  }
});
