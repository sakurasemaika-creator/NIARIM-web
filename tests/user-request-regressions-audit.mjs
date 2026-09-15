import fs from "node:fs/promises";

const failures = [];
const read = (path) => fs.readFile(path, "utf8");
const [home, visualFinish, uiFixes, fixCss, fixJs, bootstrap] =
  await Promise.all([
    read("public/index.html"),
    read("public/css/visual-finish.css"),
    read("public/css/ui-regression-fixes.css"),
    read("public/css/user-request-fixes.css"),
    read("public/js/user-request-fixes.js"),
    read("public/js/lang-flag.js"),
  ]);

if (
  !fixJs.includes(
    "描きたいと思ったら今すぐにでも始められる。<br>全フレーム手描きでも",
  )
)
  failures.push("home CTA requested line break missing");
if (!fixJs.includes("NIARIMでアニメを制作して、作品広場に投稿してみませんか？"))
  failures.push("community JA CTA copy stale");
if (
  !/\.contact-form \.form-checkbox\s*\{[\s\S]*?flex-flow:\s*row nowrap/.test(
    fixCss,
  )
)
  failures.push("consent label must be a no-wrap flex row");
if (
  !/\.contact-form \.form-checkbox > span\s*\{[\s\S]*?min-width:\s*0/.test(
    fixCss,
  )
)
  failures.push("consent copy must shrink beside checkbox");
if (
  /\.site-footer::before\s*\{/.test(visualFinish) ||
  /\.site-footer::before\s*\{/.test(uiFixes)
)
  failures.push("footer decorative separator must stay removed");
if (!fixJs.includes('project: "星降る夜"'))
  failures.push("JA mock project title must be natural");
if (!fixJs.includes("upgradeLegacyFrameModeControls"))
  failures.push("legacy frame-list pill upgrader missing");
if (!fixJs.includes('className = "fd-frame-mode"'))
  failures.push("circular frame/timeline icon control missing");
if (
  !fixCss.includes(".fd-frame-strip-mode") ||
  !fixCss.includes("display: none !important")
)
  failures.push("legacy frame pill flash guard missing");
if (
  !bootstrap.includes("/css/user-request-fixes.css") ||
  !bootstrap.includes("/js/user-request-fixes.js")
)
  failures.push("requested fixes are not bootstrapped");
if (!home.includes('class="fd-frame-mode"'))
  failures.push(
    "canonical circular frame/timeline icon control missing from home",
  );

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, checks: 11 }, null, 2));
