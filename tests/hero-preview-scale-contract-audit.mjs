import fs from "node:fs/promises";

const [heroJS, heroCSS] = await Promise.all([
  fs.readFile("public/js/home-hero-showcase.js", "utf8"),
  fs.readFile("public/css/home-hero-cascade-final.css", "utf8"),
]);

const failures = [];
const requireMatch = (text, pattern, message) => {
  if (!pattern.test(text)) failures.push(message);
};

requireMatch(
  heroJS,
  /--hero-preview-scale["']?\s*,\s*String\(width\s*\/\s*320\)/,
  "Hero preview scale must use the same 320px logical width as the canonical screen mocks",
);

requireMatch(
  heroCSS,
  /\.hero-showcase\s*>\s*\.hero-preview-card[\s\S]*?aspect-ratio:\s*320\s*\/\s*569\s*!important/,
  "Hero preview cards must use the canonical 320:569 screen ratio",
);

requireMatch(
  heroCSS,
  /\.hero-showcase\s*>\s*\.hero-preview-card[\s\S]*?border:\s*4px\s+solid\s+var\(--hero-bezel,\s*var\(--fd-bezel\)\)\s*!important/,
  "Hero preview must have a visible 4px device bezel",
);

requireMatch(
  heroCSS,
  /\.hero-showcase\s+\.hero-app-preview-source[\s\S]*?width:\s*320px\s*!important[\s\S]*?height:\s*569px\s*!important[\s\S]*?transform:\s*scale\(var\(--hero-preview-scale,\s*1\)\)\s*!important[\s\S]*?transform-origin:\s*0\s+0\s*!important/,
  "Canvas/Timeline Hero clones must remain 320x569 logical screens and be scaled as one composition",
);

requireMatch(
  heroCSS,
  /\.hero-preview-community\s*>\s*\.hero-community-mini[\s\S]*?width:\s*320px\s*!important[\s\S]*?height:\s*569px\s*!important[\s\S]*?transform:\s*scale\(var\(--hero-preview-scale,\s*1\)\)\s*!important/,
  "Community Hero preview must use the same 320x569 logical screen and shared scale",
);

requireMatch(
  heroCSS,
  /\.hero-preview-canvas\s+\.fd-topbar[\s\S]*?width:\s*320px\s*!important[\s\S]*?max-width:\s*none\s*!important/,
  "Canvas Hero topbar must span the full 320px logical app width",
);

requireMatch(
  heroCSS,
  /\.hero-preview-canvas\s+\.fd-brush-slider[\s\S]*?width:\s*320px\s*!important[\s\S]*?max-width:\s*none\s*!important/,
  "Canvas Hero brush slider must span the full 320px logical app width",
);

requireMatch(
  heroCSS,
  /\.hero-preview-timeline\s+\.fd-fullscreen-mark[\s\S]*?display:\s*none\s*!important/,
  "Timeline Hero preview must not show the misleading top-right pseudo control",
);

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      checks: [
        "Hero scale uses 320px canonical logical width",
        "Hero card ratio is 320:569",
        "Hero device bezel remains visible",
        "Canvas/Timeline Hero clones scale as a single 320x569 composition",
        "Community Hero preview uses the same logical screen geometry",
        "Canvas Hero topbar and brush slider span the full logical width",
        "Timeline Hero has no misleading top-right pseudo control",
      ],
    },
    null,
    2,
  ),
);
