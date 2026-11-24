import fs from "node:fs/promises";

const [behavior, features] = await Promise.all([
  fs.readFile("public/js/popup-mock-interactions.js", "utf8").catch(() => ""),
  fs.readFile("public/features/index.html", "utf8"),
]);

const failures = [];
const expect = (value, message) => {
  if (!value) failures.push(message);
};

expect(
  behavior.includes('document.addEventListener("click"') &&
    behavior.includes(".fd-panel-close-bar") &&
    behavior.includes(".fd-canvas-screen") &&
    behavior.includes(".fd-app-overlay-panel") &&
    behavior.includes("panel.contains(target)") &&
    behavior.includes('panel.classList.add("is-dismissed")'),
  "Screen mocks must dismiss the floating tool panel from the close affordance or an outside canvas tap without dismissing from an inside-panel tap",
);
// The CSS that hid dismissed mock panels (popup-close-affordance.css) went
// with the stylesheet consolidation on 2026-11-24: the panel mocks are
// replaced by real app captures before they are shown, so it matched nothing.
// The home page was rebuilt without main.js (2026-11-09); only Features
// still loads the mock runtime.
for (const [name, html] of [["features", features]]) {
  expect(
    /<script src="\/js\/main\.js(?:\?v=[\w-]+)?"><\/script>/.test(html) &&
      html.includes('<script src="/js/popup-mock-interactions.js"></script>') &&
      html.indexOf("/js/popup-mock-interactions.js") >
        html.indexOf("/js/main.js"),
    `${name} must load delegated popup interactions after main.js`,
  );
}

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }, null, 2));
