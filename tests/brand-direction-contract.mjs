/* NIARIM branded art-direction contract: static checks only.
   Browser screenshots and app capture fidelity are independently verified in CI. */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";
const root = new URL("../public/", import.meta.url);
const fsRoot = (path) => new URL(path, root);
const pages = ["index.html", "404.html", ...readdirSync(fsRoot("."),
  { withFileTypes: true }).filter(x => x.isDirectory()).map(x => x.name + "/index.html")];
const pageFiles = pages.filter(path => {
  try { readFileSync(fsRoot(path)); return true; } catch { return false; }
});
for (const path of pageFiles) {
  const html = readFileSync(fsRoot(path), "utf8");
  assert.match(html, /\/css\/brand-direction-2026\.css/, path + ": missing art-direction CSS");
  assert.match(html, /\/js\/brand-direction\.js/, path + ": missing progress script");
  assert.equal((html.match(/\/css\/brand-direction-2026\.css/g) || []).length, 1, path);
  assert.equal((html.match(/\/js\/brand-direction\.js/g) || []).length, 1, path);
}
const css = readFileSync(fsRoot("css/brand-direction-2026.css"), "utf8");
const script = readFileSync(fsRoot("js/brand-direction.js"), "utf8");
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /focus-visible/);
assert.doesNotMatch(css, /\.fd-[\w-]+\s*\{/);
assert.match(script, /requestAnimationFrame/);
assert.doesNotMatch(script, /fetch\s*\(/);
console.log(`brand art direction linked on ${pageFiles.length} public pages; contract OK`);
