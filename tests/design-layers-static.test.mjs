import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// main.js used to add six stylesheet layers (and their @import chains) when it
// ran. On a slow phone that is several seconds after the first paint, and the
// page re-laid out under the reader (/premium/ CLS 0.20 ja, 0.27 en). Since the
// stylesheets were merged (2026-11-24) every page links all of its CSS in the
// <head> (site.css and its own file), and no script or Worker adds any later.
const root = path.resolve(import.meta.dirname, "..");
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), "utf8");

test("no script adds a stylesheet after the first paint", () => {
  for (const file of fs.readdirSync(path.join(root, "public", "js"))) {
    if (!file.endsWith(".js")) continue;
    const source = read("public", "js", file);
    assert.doesNotMatch(
      source,
      /\.rel\s*=\s*["']stylesheet["']|href\s*=\s*["'][^"']*\/css\/[^"']*\.css/,
      `${file} adds a stylesheet at run time`,
    );
  }
});

test("the Worker does not append stylesheets to the head", () => {
  assert.doesNotMatch(read("src", "index.js"), /rel="stylesheet"/);
});

test("every page links its stylesheets in the head", () => {
  const pages = ["index.html", "404.html"];
  for (const dir of fs.readdirSync(path.join(root, "public"))) {
    if (fs.existsSync(path.join(root, "public", dir, "index.html")))
      pages.push(path.join(dir, "index.html"));
  }
  assert.ok(pages.length >= 15, `only ${pages.length} pages`);
  for (const page of pages) {
    const html = read("public", page);
    const head = html.slice(0, html.indexOf("</head>"));
    const body = html.slice(html.indexOf("</head>"));
    const sheets = [...head.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)];
    assert.ok(sheets.length >= 1, `${page} links no stylesheet`);
    for (const [, href] of sheets)
      assert.ok(
        fs.existsSync(path.join(root, "public", href)),
        `${page}: ${href}`,
      );
    assert.doesNotMatch(body, /rel="stylesheet"/, `${page} links CSS in body`);
  }
});
