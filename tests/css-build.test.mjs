import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// The Worker serves public/css/generated/… (tools/build-css.mjs): the source
// stylesheets without comments and indentation. Only those may differ; every
// token (selector, property, value, string) stays the same and in order.
const root = path.resolve(import.meta.dirname, "..");
const cssDir = path.join(root, "public", "css");
const outDir = path.join(cssDir, "generated");

function sources(dir = cssDir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return full === outDir ? [] : sources(full);
    return entry.name.endsWith(".css") ? [full] : [];
  });
}

// Strings, runs of name characters, and single other characters. A comment
// counts as whitespace (it separates tokens), whitespace itself is dropped.
function tokens(css) {
  const out = [];
  const pattern =
    /"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?|\/\*[\s\S]*?(?:\*\/|$)|\s+|[\w\-\\%.#@]+|[^]/g;
  for (const [token] of css.matchAll(pattern)) {
    if (/^\s/.test(token) || token.startsWith("/*")) continue;
    out.push(token);
  }
  return out;
}

test("the served stylesheets have the same tokens as the sources", () => {
  execFileSync(process.execPath, ["tools/build-css.mjs"], {
    cwd: root,
    stdio: "ignore",
  });
  const files = sources();
  assert.ok(files.length >= 15, `only ${files.length} stylesheets`);
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    const served = fs.readFileSync(
      path.join(outDir, path.relative(cssDir, file)),
      "utf8",
    );
    const name = path.relative(cssDir, file);
    assert.deepEqual(tokens(served), tokens(source), `${name}: tokens differ`);
    assert.ok(
      !tokens(served).length ||
        !/\/\*/.test(served.replace(/"[^"]*"|'[^']*'/g, "")),
      `${name}: a comment is left`,
    );
    assert.ok(served.length < source.length, `${name}: nothing was removed`);
  }
});

test("the Worker links the served stylesheets", () => {
  const worker = fs.readFileSync(path.join(root, "src", "index.js"), "utf8");
  assert.match(worker, /link\[href\^="\/css\/"\]\[href\$="\.css"\]/);
  assert.match(worker, /"\/css\/generated\/" \+ href\.slice\(5\)/);
  const wrangler = fs.readFileSync(path.join(root, "wrangler.jsonc"), "utf8");
  assert.match(wrangler, /node tools\/build-css\.mjs/);
});
