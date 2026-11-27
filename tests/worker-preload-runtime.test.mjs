import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// The Worker preloads each page's runtime script in the <head>. The preload
// has to be the same URL as the page's <script> (with its ?v=…): a preload of
// /js/common-ui.js for a script that asks for /js/common-ui.js?v=20261109 was
// a second download of the same file on the top page (and /js/main.js on
// /features/ and /about/).
const root = path.resolve(import.meta.dirname, "..");

test("the Worker preloads the runtime script the page really asks for", async () => {
  execFileSync(process.execPath, ["tools/generate-seo-i18n.mjs"], {
    cwd: root,
    stdio: "ignore",
  });
  const { PAGE_RUNTIME } = await import(
    path.join(root, "src", "generated", "seo-i18n.js")
  );
  for (const [page, src] of Object.entries(PAGE_RUNTIME)) {
    const html = fs.readFileSync(
      path.join(
        root,
        "public",
        page === "home" ? "index.html" : page,
        page === "home" ? "" : "index.html",
      ),
      "utf8",
    );
    assert.ok(src, `${page} has a runtime script`);
    assert.ok(html.includes(`src="${src}"`), `${page}: ${src} is in the page`);
  }
  const worker = fs.readFileSync(path.join(root, "src", "index.js"), "utf8");
  assert.doesNotMatch(
    worker,
    /rel="preload" href="\/js\/(?:main|common-ui)\.js"/,
    "no preload of a runtime URL the page does not request",
  );
});
