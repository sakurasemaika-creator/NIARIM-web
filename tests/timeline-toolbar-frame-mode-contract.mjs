import fs from "node:fs/promises";

const [main, finalCss] = await Promise.all([
  fs.readFile("public/js/main.js", "utf8"),
  fs.readFile("public/css/ui-regression-fixes.css", "utf8"),
]);

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
  finalCss,
  /\.fd-timeline-title\s*\{[\s\S]*?margin-left:\s*auto\s*!important/,
  "Timeline title must start the right-aligned group",
);
expectMatch(
  finalCss,
  /\.fd-timeline-topbar\s*>\s*\.fd-spacer\s*\{[\s\S]*?flex:\s*0\s+0\s+0\s*!important/,
  "Timeline spacer must not split the title away from the right-side controls",
);
expectMatch(
  finalCss,
  /\.fd-frame-mode\s*\{[\s\S]*?width:\s*42px\s*!important[\s\S]*?height:\s*42px\s*!important[\s\S]*?border-radius:\s*50%\s*!important/,
  "Frame strip mode control must be a 42px circular icon button",
);
expectMatch(
  main,
  /class=\"fd-frame-mode\"[\s\S]*?aria-label=\"タイムライン\"[\s\S]*?icon\(\"ic-movie_filter\"\)/,
  "Frame strip mode control must use the existing movie_filter sprite with an accessibility label",
);
if (finalCss.includes(".fd-frame-mode::before")) {
  failures.push(
    "Frame strip mode control must not synthesize the icon with a pseudo-element mask",
  );
}

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
