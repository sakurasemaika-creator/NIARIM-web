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

const lineBreak = await read("public/css/line-break.css");
const themeGuard = await read("public/css/theme-accent-only.css");
const visualTail = await read("public/css/visual-audit-tail.css");

const imports = [...lineBreak.matchAll(/@import\s+url\(["']([^"']+)["']\)/g)].map(
  (m) => m[1],
);
const guardIndex = imports.indexOf("/css/theme-accent-only.css");
if (guardIndex < 0) {
  failures.push("theme-accent-only.css is not imported by line-break.css");
} else if (guardIndex !== imports.length - 1) {
  failures.push("theme-accent-only.css must be the final imported design layer");
}

const guardClean = stripComments(themeGuard);
for (const token of ["--color-accent-strong", "--color-accent-strong-dark"]) {
  const required = `${token}: var(--color-accent)`;
  if (!guardClean.includes(required)) {
    failures.push(`${token} must resolve directly to --color-accent in final guard`);
  }
}

for (const selector of [
  ".btn.btn-primary",
  ".btn.btn-accent",
  ".scroll-top-btn",
  ".community-tabs button.is-active",
  ".feature-nav a.is-active",
]) {
  if (!themeGuard.includes(selector)) {
    failures.push(`final theme guard does not cover ${selector}`);
  }
}

if (!/background:\s*var\(--color-accent\)\s*!important/.test(guardClean)) {
  failures.push("final theme guard must force the active theme accent background");
}
if (!/border-color:\s*var\(--color-accent\)\s*!important/.test(guardClean)) {
  failures.push("final theme guard must force the active theme accent border");
}

/*
 * Do not blacklist literal reds here. Some presets legitimately use dark/red
 * accents. Correctness is defined by the active theme token, not by hue or
 * brightness. Runtime visual audits compare interactive surfaces against the
 * computed --color-accent value instead.
 */

for (const required of [
  "width: 50px !important",
  "height: 50px !important",
  "min-width: 50px !important",
  "min-height: 50px !important",
  "aspect-ratio: 1 / 1 !important",
]) {
  if (!visualTail.includes(required)) {
    failures.push(`visual-audit-tail.css missing frame invariant: ${required}`);
  }
}

if (!visualTail.includes(".screenshot-card:last-of-type")) {
  failures.push("visual-audit-tail.css must preserve explicit trailing gallery space");
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
        "theme guard is final import",
        "legacy strong aliases resolve to active theme accent",
        "interactive selectors are guarded by the active theme token",
        "50x50 frame invariants exist",
        "gallery trailing space invariant exists",
      ],
    },
    null,
    2,
  ),
);
