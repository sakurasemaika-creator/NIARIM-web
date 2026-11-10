import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const pages = ["public/index.html", ...[
  "about", "community", "contact", "faq", "features", "help",
  "news", "premium", "privacy", "terms"
].map((name) => `public/${name}/index.html`)];
const css = read("public/css/font-and-capture-2026.css");
assert.match(css, /--font-serif/);
assert.match(css, /--font-sans/);
assert.match(css, /html\[lang\] body/);
assert.match(css, /1440 \/ 900/);
assert.match(css, /320 \/ 569/);
for (const name of pages) {
  const html = read(name);
  const font = html.indexOf("/css/font-and-capture-2026.css");
  const lastLegacy = html.lastIndexOf('rel="stylesheet"', html.indexOf("</head>"));
  assert(font > 0 && font < html.indexOf("</head>"), name + " lacks font CSS");
  assert(html.includes('href="/font-licenses/"'), name + " lacks font credit");
  assert(!html.includes("--capture-accent:##"), name + " has invalid hex color");
}
const licenses = read("public/font-licenses/index.html");
for (const token of [
  "くらむぼん", "白光明朝", "SIL OPEN FONT LICENSE",
  "PERMISSION &amp; CONDITIONS", "Copyright 2020"
]) assert(licenses.includes(token), "license page missing " + token);
assert(read("public/assets/fonts/LICENSE.md").includes("SIL OPEN FONT LICENSE Version 1.1"));

const palette = read("public/js/refresh-2026.js");
assert(palette.includes('"--capture-frame",color'));
assert(palette.includes('[data-capture-theme]'));
const catalog = palette.match(/var colors=([\s\S]*?\];)/);
assert(catalog, "Missing palette matrix");
const shades = JSON.parse(catalog[1].replace(/;$/, ""));
assert.equal(shades.length, 9);
for (const row of shades) {
  assert.equal(row.length, 4);
  for (const color of row)assert.match(color, /^#[0-9a-f]{6}$/i);
}
const names = [
  "canvas", "layers", "onion-skin", "timeline", "audio-editor",
  "save-tree", "export", "workspace", "widget"
];
for (const name of names)for (const variant of ["", "-v2", "-v3", "-v4"]) {
  for (const mode of ["", "pc-"])for (const extension of ["webp", "avif"]) {
    const p = `public/assets/images/app-captures/${mode}${name}${variant}.${extension}`;
    assert(fs.statSync(path.join(root, p)).size > 0, p);
  }
}
console.log("PASS 11 licensed pages, brand typography, palette + 144 app captures");
