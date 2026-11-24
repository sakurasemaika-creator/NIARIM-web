import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const failures = [];

async function read(rel) {
  return fs.readFile(path.join(root, rel), "utf8");
}

function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, "");
}

import { allCss, cssBlocks, layer, readCss } from "./css-sections.mjs";

// site.css keeps the former layers in their cascade order (marker comments).
const site = readCss("site.css");
const blocks = cssBlocks(site);
const themeGuard = layer(site, "theme-accent-only.css");
const visualFinish = layer(site, "visual-finish.css");
const uiRegression = layer(site, "ui-regression-fixes.css");
const guardAt = blocks.findIndex((b) => b.from === "theme-accent-only.css");
if (guardAt < 0) {
  failures.push("site.css lost the theme accent guard (theme-accent-only.css)");
} else {
  // Layers after the accent guard may adjust layout, but must not set accent
  // colours again (the guard is the last word on accents).
  for (const later of blocks.slice(guardAt + 1)) {
    if (/--color-accent[\w-]*\s*:|accent/i.test(stripComments(later.text))) {
      failures.push(
        `${later.from} after theme-accent-only.css sets accent colours`,
      );
    }
  }
}
// The page files load after site.css: they must not redefine the accent
// tokens the guard resolves.
const STANDALONE = ["404.css", "account-deletion.css", "font-licenses.css"];
for (const file of await fs.readdir("public/css/pages")) {
  if (STANDALONE.includes(file)) continue; // they do not load site.css
  const text = stripComments(readCss("pages/" + file));
  if (/--color-accent[\w-]*\s*:/.test(text)) {
    failures.push(`pages/${file} redefines an accent token after site.css`);
  }
}

const polish = layer(site, "polish.css");
const polishClean = stripComments(polish);
const focusRule = polishClean.match(
  /:where\(a, button, input, textarea, select\):focus-visible\s*\{([^}]*)\}/,
);
if (
  !focusRule ||
  !/outline:\s*3px solid var\(--color-accent-text\)/.test(focusRule[1])
) {
  failures.push(
    "keyboard focus indicator must use the active theme accent token",
  );
}
if (focusRule && /#[0-9a-f]{3,8}|rgba?\(/i.test(focusRule[1])) {
  failures.push("keyboard focus indicator must not hard-code a color");
}

const mainJs = await read("public/js/main.js");
if (
  !/prefers-reduced-motion:\s*reduce/.test(mainJs) ||
  !/behavior:\s*window\.matchMedia/.test(mainJs)
) {
  failures.push("main page scroll-to-top must respect prefers-reduced-motion");
}

const guardClean = stripComments(themeGuard);
for (const token of ["--color-accent-strong", "--color-accent-strong-dark"]) {
  const required = `${token}: var(--color-accent)`;
  if (!guardClean.includes(required)) {
    failures.push(
      `${token} must resolve directly to --color-accent in final guard`,
    );
  }
}

for (const selector of [
  ".btn.btn-primary",
  ".btn.btn-accent",
  ".scroll-top-btn",
  ".community-tabs button.is-active",
]) {
  if (!themeGuard.includes(selector)) {
    failures.push(`final theme guard does not cover ${selector}`);
  }
}

// The Features and Help section tabs mark the current section with the red
// pencil token (paper/ink redesign), not the accent fill.
for (const file of ["features.css", "help.css"]) {
  if (
    !/\.feature-nav a\.is-active\s*\{[^}]*var\(--pencil\)/.test(
      readCss("pages/" + file),
    )
  ) {
    failures.push(`pages/${file}: the current section tab must use --pencil`);
  }
}

if (!/background:\s*var\(--color-accent\)\s*!important/.test(guardClean)) {
  failures.push(
    "final theme guard must force the active theme accent background",
  );
}
if (!/border-color:\s*var\(--color-accent\)\s*!important/.test(guardClean)) {
  failures.push("final theme guard must force the active theme accent border");
}

/* Do not blacklist colors by hue/brightness. A dark red may be a legitimate
   preset accent. Runtime audits compare interactive surfaces to the computed
   --color-accent value, which is the actual source of truth. */

/* The 50x50 frame-thumbnail, gallery-card and sheet-slider invariants styled
   the hand-drawn screen mocks and the old screenshot gallery. Neither reaches
   any page any more (real app captures replaced them), so their rules matched
   nothing and were dropped when the stylesheets were merged (2026-11-24). */
if (/\.fd-frame-thumb\.fd-frame-thumb|\.fd-sheet-slider/.test(allCss())) {
  failures.push("mock frame/slider rules came back without a mock to style");
}

for (const [name, source] of [
  ["visual-finish.css", visualFinish],
  ["ui-regression-fixes.css", uiRegression],
]) {
  if (/\.site-footer::before\s*\{/.test(stripComments(source))) {
    failures.push(
      `${name} must not define the removed decorative footer separator`,
    );
  }
}

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      checks: [
        "no layer after the theme guard sets accent colours",
        "legacy strong aliases resolve to active theme accent",
        "interactive selectors are guarded by the active theme token",
        "keyboard focus indicator follows the contrast-safe theme text token",
        "main page scroll-to-top respects reduced-motion preference",
        "no rules for the removed frame/slider mocks",
        "removed footer separator has no source definition or downstream hide override",
      ],
    },
    null,
    2,
  ),
);
