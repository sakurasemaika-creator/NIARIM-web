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
const featuresNormalization = await read(
  "public/css/features-source-normalization.css",
);

const imports = [
  ...lineBreak.matchAll(/@import\s+url\(["']([^"']+)["']\)/g),
].map((m) => m[1]);
const normalizationIndex = imports.indexOf(
  "/css/features-source-normalization.css",
);
const tailIndex = imports.indexOf("/css/visual-audit-tail.css");
const guardIndex = imports.indexOf("/css/theme-accent-only.css");

if (normalizationIndex < 0) {
  failures.push(
    "features-source-normalization.css is not imported by line-break.css",
  );
}
if (
  tailIndex < 0 ||
  (normalizationIndex >= 0 && normalizationIndex > tailIndex)
) {
  failures.push(
    "Features normalization must load before final visual audit tail",
  );
}
if (guardIndex < 0) {
  failures.push("theme-accent-only.css is not imported by line-break.css");
} else if (guardIndex !== imports.length - 1) {
  failures.push(
    "theme-accent-only.css must be the final imported design layer",
  );
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
  ".feature-nav a.is-active",
]) {
  if (!themeGuard.includes(selector)) {
    failures.push(`final theme guard does not cover ${selector}`);
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

for (const required of [
  "width: 50px",
  "height: 50px",
  "min-width: 50px",
  "min-height: 50px",
  "aspect-ratio: 1 / 1",
]) {
  if (
    !featuresNormalization.includes(required) &&
    !visualTail.includes(required)
  ) {
    failures.push(`missing frame invariant: ${required}`);
  }
}

if (!visualTail.includes(".fd-frame-thumb.fd-frame-thumb.is-selected")) {
  failures.push("selected frame must be treated as the current 50x50 frame");
}
if (!visualTail.includes("calc(50% - 125px)")) {
  failures.push("generated third selected frame must be centered in its strip");
}
if (!visualTail.includes(".screenshot-card:last-of-type")) {
  failures.push(
    "visual-audit-tail.css must preserve explicit trailing gallery space",
  );
}
if (
  !featuresNormalization.includes(".fd-sheet-slider") ||
  !featuresNormalization.includes("height: 4px")
) {
  failures.push(
    "Features slider normalization must enforce the shared 4px track",
  );
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
        "Features normalization loads before final visual audit tail",
        "theme guard is final import",
        "legacy strong aliases resolve to active theme accent",
        "interactive selectors are guarded by the active theme token",
        "50x50 frame invariants exist",
        "generated selected frame is centered",
        "gallery trailing space invariant exists",
        "slider geometry normalization exists",
      ],
    },
    null,
    2,
  ),
);
