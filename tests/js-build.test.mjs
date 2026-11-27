import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { compactJs, sourceScripts } from "../tools/build-js.mjs";
import { servedScript } from "../src/page-scripts.js";

// The Worker serves /js/generated/compact/<name>.js (tools/build-js.mjs): the
// source scripts without comments and layout whitespace. They must be the same
// programs as the sources.
const root = path.resolve(import.meta.dirname, "..");
const jsDir = path.join(root, "public", "js");
const outDir = path.join(jsDir, "generated", "compact");

test("each served script is the same program as its source", () => {
  execFileSync(process.execPath, ["tools/build-js.mjs"], {
    cwd: root,
    stdio: "ignore",
  });
  const names = sourceScripts();
  assert.ok(names.length >= 40, `only ${names.length} scripts`);
  for (const name of names) {
    const source = fs.readFileSync(path.join(jsDir, name), "utf8");
    const served = fs.readFileSync(path.join(outDir, name), "utf8");
    // Only literal paths to other scripts of public/js point at their served
    // copies; with those put back, esbuild prints the served file and the
    // source as the same program (printing it again changes nothing).
    const unrouted = served.replaceAll("/js/generated/compact/", "/js/");
    assert.equal(compactJs(unrouted, new Set()), unrouted, `${name} differs`);
    assert.equal(
      compactJs(source, new Set()),
      unrouted,
      `${name}: not the source's program`,
    );
    assert.ok(served.length < source.length, `${name}: nothing was removed`);
    for (const [, target] of served.matchAll(
      /\/js\/generated\/compact\/([\w-]+\.js)/g,
    )) {
      assert.ok(names.includes(target), `${name} points at missing ${target}`);
    }
    // Japanese text is kept as written, not turned into \u escapes.
    for (const [escape] of served.matchAll(/\\u[3-9a-f][0-9a-f]{3}/gi))
      assert.ok(source.includes(escape), `${name}: ${escape} was added`);
  }
});

test("a script that loads another script loads its served copy", () => {
  const served = fs.readFileSync(path.join(outDir, "lang-flag.js"), "utf8");
  assert.ok(
    served.includes('"/js/generated/compact/user-request-fixes.js?v='),
    "lang-flag.js loads the served user-request-fixes.js",
  );
  const links = fs.readFileSync(path.join(outDir, "config-links.js"), "utf8");
  for (const name of [
    "features-fidelity.js",
    "advanced-narrative-normalizer.js",
  ])
    assert.ok(links.includes(`"/js/generated/compact/${name}"`), name);
});

test("the Worker serves the compact scripts", () => {
  assert.equal(servedScript("/js/i18n.js"), "/js/generated/compact/i18n.js");
  assert.equal(
    servedScript("/js/common-ui.js?v=20261109"),
    "/js/generated/compact/common-ui.js?v=20261109",
  );
  // Generated files and other folders are left alone.
  assert.equal(
    servedScript("/js/generated/i18n-home.ja.js"),
    "/js/generated/i18n-home.ja.js",
  );
  const worker = fs.readFileSync(path.join(root, "src", "index.js"), "utf8");
  assert.match(worker, /servedScript\(runtimeScript\(metadata\.page, src\)\)/);
  assert.match(
    worker,
    /servedScript\(runtimeScript\(page, PAGE_RUNTIME\[page\]\)\)/,
  );
  const wrangler = fs.readFileSync(path.join(root, "wrangler.jsonc"), "utf8");
  assert.match(wrangler, /node tools\/build-js\.mjs/);
});
