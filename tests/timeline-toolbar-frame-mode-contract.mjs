import fs from "node:fs/promises";

const main = await fs.readFile("public/js/main.js", "utf8");
// The timeline mock's CSS (ui-regression-fixes.css) went with the stylesheet
// consolidation on 2026-11-24: the mock is replaced by a real app capture
// before it is shown, so its rules matched nothing. Only the mock markup in
// main.js is still checked; the site shows the real timeline capture.

const failures = [];
const expectMatch = (text, pattern, message) => {
  if (!pattern.test(text)) failures.push(message);
};

expectMatch(
  main,
  /fd-back-canvas[\s\S]*?fd-timeline-title[\s\S]*?ic-home_outlined[\s\S]*?ic-undo[\s\S]*?ic-redo[\s\S]*?ic-more_vert[\s\S]*?ic-help_outline/,
  "Timeline mock must keep the back-to-canvas control first and preserve the remaining control order",
);
expectMatch(
  main,
  /class=\"fd-frame-mode\"[\s\S]*?aria-label=\"タイムライン\"[\s\S]*?icon\(\"ic-movie_filter\"\)/,
  "Frame strip mode control must use the existing movie_filter sprite with an accessibility label",
);

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
