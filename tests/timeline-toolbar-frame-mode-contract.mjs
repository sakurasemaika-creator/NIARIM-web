import fs from "node:fs/promises";

const [main, baseCss] = await Promise.all([
  fs.readFile("public/js/main.js", "utf8"),
  fs.readFile("public/css/screen-mock-accuracy-base.css", "utf8"),
]);

const failures = [];
const expectMatch = (text, pattern, message) => {
  if (!pattern.test(text)) failures.push(message);
};
const expectNoMatch = (text, pattern, message) => {
  if (pattern.test(text)) failures.push(message);
};

expectMatch(
  main,
  /fd-back-canvas[\s\S]*?fd-timeline-actions[\s\S]*?fd-timeline-title[\s\S]*?ic-home_outlined[\s\S]*?ic-undo[\s\S]*?ic-redo[\s\S]*?ic-more_vert[\s\S]*?ic-help_outline/,
  "Timeline mock must keep back-to-canvas separate and group title plus all other controls on the right",
);
expectMatch(
  baseCss,
  /\.fd-timeline-actions\s*\{[\s\S]*?margin-left:\s*auto\s*!important[\s\S]*?justify-content:\s*flex-end\s*!important/,
  "Timeline right-side control group must be right aligned",
);
expectMatch(
  main,
  /fd-frame-mode[^>]*[\s\S]*?ic-movie_filter/,
  "Frame strip mode control must use the existing movie/filter frame icon",
);
expectNoMatch(
  main,
  /fd-frame-mode[\s\S]{0,320}frameListMode[\s\S]{0,320}timelineMode/,
  "Frame strip mode control must no longer render the two text segments",
);
expectMatch(
  baseCss,
  /\.fd-frame-mode\s*\{[\s\S]*?width:\s*42px\s*!important[\s\S]*?height:\s*42px\s*!important[\s\S]*?border-radius:\s*50%\s*!important/,
  "Frame strip mode control must be a 42px circular icon button",
);

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }, null, 2));
