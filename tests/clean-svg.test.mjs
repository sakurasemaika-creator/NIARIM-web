import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { cleanSvg } from "../tools/clean-svg.mjs";

// The logos and the favicon are served without comments and layout
// whitespace (tools/clean-svg.mjs; the drawing is the same). Every page links
// the cleaned files.
const root = path.resolve(import.meta.dirname, "..");
const files = [
  "assets/images/logo/app_logo.v2.svg",
  "assets/images/logo/app_logo_footer.v2.svg",
  "assets/images/logo/title_logo.v2.svg",
  "assets/icons/favicon.v2.svg",
];

test("the served logos and favicon are cleaned", () => {
  for (const file of files) {
    const svg = fs.readFileSync(path.join(root, "public", file), "utf8");
    assert.equal(cleanSvg(svg), svg, `${file} is not cleaned`);
    assert.doesNotMatch(svg, /<!--/);
    assert.match(svg, /^<\?xml[^>]*\?><svg /);
  }
});

test("no page links a logo or favicon by its old name", () => {
  const pages = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!["assets", "generated"].includes(entry.name)) walk(full);
      } else if (entry.name.endsWith(".html")) pages.push(full);
    }
  };
  walk(path.join(root, "public"));
  assert.ok(pages.length >= 15);
  for (const page of pages) {
    const html = fs.readFileSync(page, "utf8");
    assert.doesNotMatch(
      html,
      /(?:app_logo|app_logo_footer|title_logo|favicon)\.svg/,
      path.relative(root, page),
    );
  }
  for (const file of files)
    assert.ok(fs.existsSync(path.join(root, "public", file)), file);
});
