/* NIARIM branded art-direction contract: static checks only.
   Browser screenshots and app capture fidelity are independently verified in CI. */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";
const root = new URL("../public/", import.meta.url);
const fsRoot = (path) => new URL(path, root);
const pages = [
  "index.html",
  "404.html",
  ...readdirSync(fsRoot("."), { withFileTypes: true })
    .filter((x) => x.isDirectory())
    .map((x) => x.name + "/index.html"),
];
const pageFiles = pages.filter((path) => {
  try {
    readFileSync(fsRoot(path));
    return true;
  } catch {
    return false;
  }
});
// Every stylesheet of a page is one of the consolidated files: the shared
// /css/site.css plus the page's own file (the three standalone pages link only
// their own file). The art direction (formerly brand-direction-2026.css) is
// part of site.css and of those standalone files.
const STANDALONE = {
  "404.html": "/css/pages/404.css",
  "account-deletion/index.html": "/css/pages/account-deletion.css",
  "font-licenses/index.html": "/css/pages/font-licenses.css",
};
for (const path of pageFiles) {
  const html = readFileSync(fsRoot(path), "utf8");
  const sheets = [
    ...html.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)"/g),
  ]
    .map((m) => m[1])
    .filter((href) => href.startsWith("/css/"));
  if (STANDALONE[path]) {
    assert.deepEqual(sheets, [STANDALONE[path]], path);
  } else {
    assert.equal(sheets.length, 2, path + ": " + sheets.join(" "));
    assert.equal(sheets[0], "/css/site.css", path + ": site.css comes first");
    assert.match(sheets[1], /^\/css\/pages\/[\w-]+\.css$/, path);
  }
  assert.match(
    html,
    /\/js\/brand-direction\.js/,
    path + ": missing progress script",
  );
  assert.equal(
    (html.match(/\/js\/brand-direction\.js/g) || []).length,
    1,
    path,
  );
}
const css = readFileSync(fsRoot("css/site.css"), "utf8");
const home = readFileSync(fsRoot("css/pages/home.css"), "utf8");
const script = readFileSync(fsRoot("js/brand-direction.js"), "utf8");
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /focus-visible/);
// The hero device previews are static product imagery, not interactive controls.
// Keep decorative hover transforms from implying a false affordance.
for (const sheet of [css, home]) {
  assert.doesNotMatch(
    sheet,
    /\.nr-hero-showcase:hover\s+\.nr-hero-(?:pc|sp)-view/,
    "static hero device previews must not move on hover",
  );
}
assert.match(script, /requestAnimationFrame/);
assert.doesNotMatch(script, /fetch\s*\(/);
console.log(
  `brand art direction linked on ${pageFiles.length} public pages; contract OK`,
);
