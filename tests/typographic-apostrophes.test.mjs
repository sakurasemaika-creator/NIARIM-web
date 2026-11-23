import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// The site's English and French copy uses the typographic apostrophe (’),
// as the app's French does and the help topics already did. Straight and
// curly apostrophes used to be mixed on the same page ("l'animation" next to
// "l’application"). Checked on the source: any apostrophe between two letters
// in a dictionary or help topic must be ’.
const root = path.resolve(import.meta.dirname, "..");
const js = path.join(root, "public", "js");
const sources = [
  ...fs
    .readdirSync(js)
    .filter((name) => /^i18n-dict.*\.js$/.test(name))
    .map((name) => path.join(js, name)),
  path.join(js, "help-topics", "en.json"),
  path.join(js, "help-topics", "fr.json"),
  path.join(js, "community.js"),
];
const straight = /[A-Za-zÀ-ÿ]\\?'[A-Za-zÀ-ÿ]/;
const comment = /^\s*(\/\/|\/\*|\*)/;

test("English and French copy uses ’, not '", () => {
  const found = [];
  for (const file of sources) {
    fs.readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, index) => {
        if (!comment.test(line) && straight.test(line)) {
          found.push(
            `${path.relative(root, file)}:${index + 1}: ${line.trim().slice(0, 80)}`,
          );
        }
      });
  }
  assert.deepEqual(found, []);
});
