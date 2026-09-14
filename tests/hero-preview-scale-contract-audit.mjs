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
  /\.hero-showcase\s*>\s*\.hero-preview-card[\s\S]*?border:\s*0\s*!important/,
  "Hero bezel must not consume app viewport layout geometry",
);

requireMatch(
  heroCSS,
  /\.hero-showcase\s*>\s*\.hero-preview-card[\s\S]*?inset\s+0\s+0\s+0\s+5px\s+var\(--hero-bezel,\s*var\(--fd-bezel\)\)/,
  "Hero bezel must be drawn as a 5px inset frame without shrinking the viewport",
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
        "Hero bezel does not shrink the app viewport",
        "Canvas/Timeline Hero clones scale as a single 320x569 composition",
        "Community Hero preview uses the same logical screen geometry",
      ],
    },
    null,
    2,
  ),
);
