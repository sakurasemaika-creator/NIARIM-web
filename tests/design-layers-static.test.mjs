import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// main.js adds six stylesheet layers (and their @import chains) when it runs.
// On a slow phone that is several seconds after the first paint, and the page
// re-laid out under the reader (/premium/ CLS 0.20 ja, 0.27 en). Every page
// that loads main.js links the same layers in its <head>, in the same order
// and with the same marker attribute, so main.js finds them and adds nothing.
const root = path.resolve(import.meta.dirname, "..");

function layersInMainJs() {
  const source = fs.readFileSync(
    path.join(root, "public", "js", "main.js"),
    "utf8",
  );
  const list = source.slice(
    source.indexOf("var styles = ["),
    source.indexOf("];", source.indexOf("var styles = [")),
  );
  return [
    ...list.matchAll(/"([^"]+\.css[^"]*)",\s*"(data-niarim-[\w-]+)"/g),
  ].map(([, href, marker]) => ({ href, marker }));
}

test("pages that load main.js link its stylesheet layers in the head", () => {
  const layers = layersInMainJs();
  assert.equal(layers.length, 6);
  const pages = [];
  for (const dir of fs.readdirSync(path.join(root, "public"))) {
    const file = path.join(root, "public", dir, "index.html");
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, "utf8");
    if (!/<script[^>]+src="\/js\/main\.js/.test(html)) continue;
    pages.push(dir);
    const head = html.slice(0, html.indexOf("</head>"));
    let last = -1;
    for (const { href, marker } of layers) {
      const at = head.search(
        new RegExp(
          `<link\\s+rel="stylesheet"\\s+href="${href.replace(/[.?]/g, "\\$&")}"\\s+${marker}="true"`,
        ),
      );
      assert.ok(at >= 0, `/${dir}/ does not link ${href} with ${marker}`);
      assert.ok(at > last, `/${dir}/ links ${href} out of order`);
      last = at;
    }
  }
  assert.ok(pages.length >= 10, `only ${pages.length} pages load main.js`);
});
