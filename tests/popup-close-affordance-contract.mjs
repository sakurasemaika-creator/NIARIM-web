import fs from "node:fs/promises";

const main = await fs.readFile("public/js/main.js", "utf8");

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

expect(
  main.includes("function panelCloseBar()") &&
    main.includes('class="fd-panel-close-bar"') &&
    main.includes('class="fd-panel-close"'),
  "Screen mocks must keep the shared close affordance markup",
);

// The close-bar CSS (popup-close-affordance.css) went with the stylesheet
// consolidation on 2026-11-24: the hand-drawn panel mocks are replaced by real
// app captures before they are shown, so no page draws .fd-panel-close-bar
// and the rules matched nothing. The real popups are in the captures.

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
