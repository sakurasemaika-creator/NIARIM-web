import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { runtimeScript } from "../src/page-scripts.js";

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

// Every page but /features/ runs the lightweight common-ui.js, whatever ?v=
// it adds to /js/main.js. /about/ asked for main.js?v=…, which the Worker did
// not swap, so it ran the whole of main.js while the build collected its
// translations for common-ui.js.
test("every page but /features/ runs common-ui.js", async () => {
  const { PAGE_RUNTIME } = await import(
    path.join(root, "src", "generated", "seo-i18n.js")
  );
  for (const [page, src] of Object.entries(PAGE_RUNTIME)) {
    const runs = runtimeScript(page, src).replace(/[?#].*$/, "");
    assert.equal(
      runs,
      page === "features" ? "/js/main.js" : "/js/common-ui.js",
      page,
    );
  }
  assert.equal(
    runtimeScript("about", "/js/main.js?v=20260929-about-flatten"),
    "/js/common-ui.js",
  );
  assert.equal(
    runtimeScript("features", "/js/main.js?v=20260918-1"),
    "/js/main.js?v=20260918-1",
  );
  const worker = fs.readFileSync(path.join(root, "src", "index.js"), "utf8");
  assert.match(worker, /runtimeScript\(metadata\.page, src\)/);
  assert.match(worker, /runtimeScript\(page, PAGE_RUNTIME\[page\]\)/);
});
