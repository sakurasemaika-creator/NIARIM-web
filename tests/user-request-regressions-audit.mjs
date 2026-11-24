import fs from "node:fs/promises";

const failures = [];
const read = (path) => fs.readFile(path, "utf8");
const [
  home,
  visualFinish,
  uiFixes,
  fixCss,
  fixJs,
  bootstrap,
  lineBreak,
  heroShowcase,
  about,
] = await Promise.all([
  read("public/index.html"),
  read("public/css/visual-finish.css"),
  read("public/css/ui-regression-fixes.css"),
  read("public/css/user-request-fixes.css"),
  read("public/js/user-request-fixes.js"),
  read("public/js/lang-flag.js"),
  read("public/css/line-break.css"),
  // Deleted with the old hero (2026-11 redesign); the checks below only
  // apply to a home that still loads it.
  read("public/js/home-hero-showcase.js").catch(() => ""),
  read("public/about/index.html"),
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
  /\.site-footer::before\s*\{/.test(uiFixes) ||
  /\.site-footer::before\s*\{/.test(fixCss)
)
  failures.push(
    "footer decorative separator must stay removed from every final layer",
  );
if (!fixJs.includes('project: "星降る夜"'))
  failures.push("JA mock project title must be natural");
if (!fixJs.includes('onionNext: "次フレーム"'))
  failures.push("JA onion-next label must never fall back to fd.onionNext");
if (!fixJs.includes("upgradeLegacyFrameModeControls"))
  failures.push("legacy frame-list pill upgrader missing");
if (!fixJs.includes('className = "fd-frame-mode"'))
  failures.push("circular frame/timeline icon control missing");
if (
  !/\.fd-frame-strip-mode[^{]*\{[\s\S]*?display:\s*none\s*!important/.test(
    fixCss,
  )
)
  failures.push("legacy frame pill flash guard missing");
// Any explicit deployment cache key (the value changes with each fix).
if (
  !/\/css\/user-request-fixes\.css\?v=\w/.test(bootstrap) ||
  !/\/js\/user-request-fixes\.js\?v=\w/.test(bootstrap)
)
  failures.push("requested fix assets must use a fresh deployment cache key");
if (!/\/css\/ui-regression-fixes\.css\?v=\w/.test(lineBreak))
  failures.push(
    "final UI regression stylesheet must use a fresh deployment cache key",
  );

// The home rebuilt on 2026-11-09 (ea80ca47) no longer loads the hero
// showcase or the reconstructed frame list; their checks apply only to a
// home that still does.
const legacyHome = home.includes("home-hero-showcase.js");
if (
  legacyHome &&
  (!heroShowcase.includes('buildRealCapture("canvas-v4"') ||
    !heroShowcase.includes('buildRealCapture("timeline-v4"') ||
    !heroShowcase.includes('buildRealCapture("workspace-v3"'))
)
  failures.push(
    "hero must keep exactly the three intended real app capture sources",
  );
if (/buildCommunityMini|clonePreviewCard|workCard\(/.test(heroShowcase))
  failures.push(
    "unused coded app/community preview builders must stay removed",
  );
if (
  (about.match(/data-about-unique-section/g) || []).length !== 1 ||
  (about.match(/data-about-unique>/g) || []).length !== 1
)
  failures.push(
    "About Only in NIARIM must be one consolidated section with one heading",
  );
for (const key of [
  "core1",
  "core2",
  "core3",
  "core4",
  "core5",
  "core6",
  "item3",
  "item8",
  "item9",
  "item7",
]) {
  const count = (
    about.match(
      new RegExp('data-i18n="about\\.unique\\.' + key + '\\.title"', "g"),
    ) || []
  ).length;
  if (count !== 1)
    failures.push("About unique feature must appear exactly once: " + key);
}
if (
  !fixJs.includes('shot1: "canvas-v3"') ||
  !fixJs.includes('shot2: "timeline-v3"') ||
  !fixJs.includes('shot3: "layers-v3"') ||
  !fixJs.includes('shot5: "save-tree-v2"') ||
  !fixJs.includes('shot6: "workspace-v2"') ||
  !fixJs.includes('card.dataset.mockTheme === "shot4"')
)
  failures.push(
    "app preview gallery must keep the five-screen real-capture mapping and remove legacy shot4",
  );

if (legacyHome && !home.includes('class="fd-frame-mode"'))
  failures.push(
    "canonical circular frame/timeline icon control missing from home",
  );

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, checks: 29 }, null, 2));
