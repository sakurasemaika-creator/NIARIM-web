import fs from "node:fs/promises";

const [main, css] = await Promise.all([
  fs.readFile("public/js/main.js", "utf8"),
  fs.readFile("public/css/screen-mock-accuracy-base.css", "utf8"),
]);

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

expect(
  main.includes('function panelCloseBar()') &&
    main.includes('class="fd-panel-close-bar"') &&
    main.includes('class="fd-panel-close"'),
  "Screen mocks must keep the shared close affordance markup",
);

expect(
  /\.fd-panel-close-bar\s*\{[\s\S]*?justify-content:\s*flex-end\s*!important/.test(css),
  "Mock popup close bar must align the close affordance to the right",
);

expect(
  /\.fd-panel-close\s*\{[\s\S]*?width:\s*14px\s*!important[\s\S]*?height:\s*14px\s*!important/.test(css),
  "Mock popup close glyph must stay visually compact",
);

expect(
  /\.fd-panel-close-bar\s*\{[\s\S]*?padding:\s*0\s+8px\s*!important/.test(css),
  "Mock popup close affordance must keep a comfortable right-side hit area",
);

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
