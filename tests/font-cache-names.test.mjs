import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// Fonts under /assets/ are cached for 30 days under their file name
// (public/_headers). When a subset was rebuilt in place (606a98b) while the
// CSS, which is never cached, widened its unicode-range, browsers holding the
// old file took the new range on trust, loaded the stale font and drew the
// new characters (「独自」) in a fallback face. So a published font's bytes
// never change: a rebuilt font gets a new file name (Name.v2.woff2, .v3…),
// a new entry in tests/font-files.json, and the CSS points at it.
const root = path.resolve(import.meta.dirname, "..");
const fontDir = path.join(root, "public", "assets", "fonts");
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "tests", "font-files.json"), "utf8"),
).files;

const sha256 = (file) =>
  crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

test("every published font has the bytes recorded for its name", () => {
  const files = fs.readdirSync(fontDir).filter((f) => f.endsWith(".woff2"));
  for (const file of files) {
    assert.ok(
      manifest[file],
      `${file} is not in tests/font-files.json: add its sha256 there`,
    );
    assert.equal(
      sha256(path.join(fontDir, file)),
      manifest[file],
      `${file} changed in place. Browsers keep the old file for 30 days: ` +
        "save the rebuilt font under a new name (for example .v2 → .v3), " +
        "add that name to tests/font-files.json and point the CSS at it.",
    );
  }
});

test("every font the site references exists and is in the manifest", () => {
  const sources = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "assets") walk(full);
      } else if (/\.(css|html|js)$/.test(entry.name)) sources.push(full);
    }
  };
  walk(path.join(root, "public"));
  const referenced = new Set();
  for (const file of sources) {
    const text = fs.readFileSync(file, "utf8");
    for (const match of text.matchAll(/\/assets\/fonts\/([\w.-]+\.woff2)/g))
      referenced.add(match[1]);
  }
  assert.ok(referenced.size > 0, "no font references found");
  for (const name of referenced) {
    assert.ok(
      fs.existsSync(path.join(fontDir, name)),
      `${name} is referenced but missing`,
    );
    assert.ok(manifest[name], `${name} is referenced but not in the manifest`);
  }
});
