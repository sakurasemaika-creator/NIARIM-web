import fs from "node:fs/promises";

const [behavior, home, features, css] = await Promise.all([
  fs.readFile("public/js/popup-mock-interactions.js", "utf8").catch(() => ""),
  fs.readFile("public/index.html", "utf8"),
  fs.readFile("public/features/index.html", "utf8"),
  fs.readFile("public/css/popup-close-affordance.css", "utf8"),
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
expect(
  css.includes(".fd-app-overlay-panel.is-dismissed") &&
    css.includes("display: none !important"),
  "Dismissed mock panels must be hidden by the final popup parity layer",
);
for (const [name, html] of [
  ["home", home],
  ["features", features],
]) {
  expect(
    html.includes('<script src="/js/main.js"></script>') &&
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
