import fs from "node:fs/promises";

const [main, baseCss] = await Promise.all([
  fs.readFile("public/js/main.js", "utf8"),
  fs.readFile("public/css/screen-mock-accuracy-base.css", "utf8"),
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
  baseCss,
  /\.fd-timeline-title\s*\{[\s\S]*?margin-left:\s*auto\s*!important/,
  "Timeline title must start the right-aligned group",
);
expectMatch(
  baseCss,
  /\.fd-timeline-topbar\s*>\s*\.fd-spacer\s*\{[\s\S]*?flex:\s*0\s+0\s+0\s*!important/,
  "Timeline spacer must not split the title away from the right-side controls",
);
expectMatch(
  baseCss,
  /\.fd-frame-mode\s*\{[\s\S]*?width:\s*42px\s*!important[\s\S]*?height:\s*42px\s*!important[\s\S]*?border-radius:\s*50%\s*!important/,
  "Frame strip mode control must be a 42px circular icon button",
);
expectMatch(
  baseCss,
  /\.fd-frame-mode::before\s*\{[\s\S]*?mask-image:[\s\S]*?M18%204l2%204/,
  "Frame strip mode control must use the existing movie_filter clapperboard icon geometry",
);
expectMatch(
  baseCss,
  /\.fd-frame-mode\s*>\s*span\s*\{[\s\S]*?display:\s*none\s*!important/,
  "Frame strip mode control must hide the legacy two text segments",
);

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
