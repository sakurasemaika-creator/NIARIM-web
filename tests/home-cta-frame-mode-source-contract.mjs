import fs from "node:fs/promises";

const [main, dict, home, faq] = await Promise.all([
  fs.readFile("public/js/main.js", "utf8"),
  fs.readFile("public/js/i18n-dict.js", "utf8"),
  fs.readFile("public/index.html", "utf8"),
  fs.readFile("public/faq/index.html", "utf8"),
]);
// Every stylesheet the site ships (site.css and the page files).
const sheets = [
  "public/css/site.css",
  ...(await fs.readdir("public/css/pages")).map((f) => "public/css/pages/" + f),
];
const allCss = (
  await Promise.all(sheets.map((f) => fs.readFile(f, "utf8")))
).join("\n");

// The owner's own words (f8ffb190, 2026-08-28). A rewrite on 2026-11-24 took
// a coordinator's inference ("no ad-style copy") for an owner rule; the owner
// asked for their own copy to stay, so it is back.
const title = "実際にアニメーションを つくってみよう！";
const body =
  "描きたいと思ったら今すぐにでも始められる。全フレーム手描きでもキーフレームアニメーションでもあなたのお好みで。納得するまでとことんこだわってあなただけのオリジナル作品をつくろう。完成したら作品広場でみんなにみてもらうことができます。逆に、他の人の作品をみることもできます。つくって、公開して、みつけよう。";
const failures = [];
const expect = (ok, message) => {
  if (!ok) failures.push(message);
};

expect(
  main.includes('class="fd-frame-mode"') &&
    main.includes('aria-label="タイムライン"') &&
    main.includes("aria-label:fd.timelineMode") &&
    main.includes('icon("ic-movie_filter")'),
  "Dynamic canvas frame-mode control must be an accessible button using the existing ic-movie_filter sprite icon",
);
expect(
  !main.includes('<span class="fd-frame-mode"><span class="is-selected"') &&
    !main.includes('data-i18n="fd.frameListMode">フレーム一覧</span><span'),
  "Dynamic frame-mode control must not keep the legacy two visible text segments",
);
// The 42px frame-mode CSS of the hand-drawn canvas mock is gone with the
// stylesheet consolidation (2026-11-24): the mock is replaced by a real app
// capture before it is ever shown, so no page draws .fd-frame-mode. The
// button markup check above still guards main.js.
expect(
  !allCss.includes(".fd-frame-mode::before") &&
    !allCss.includes(".fd-frame-mode > span + span"),
  "No stylesheet may bring back the segmented or pseudo-element frame-mode control",
);
expect(
  dict.includes("cta.title") &&
    dict.includes(title) &&
    dict.includes("cta.body") &&
    dict.includes(body),
  "Japanese shared CTA dictionary must contain the requested title and body",
);
// The home page was rebuilt for the prelaunch site on 2026-11-09 (ea80ca47)
// without this CTA block or the static canvas mock; the requested CTA copy
// lives on the FAQ page.
for (const [name, html] of [["faq", faq]]) {
  expect(
    html.includes('data-i18n="cta.title"') &&
      html.includes(title) &&
      html.includes('data-i18n="cta.body"') &&
      html.includes(body),
    `${name} fallback CTA must match the requested Japanese copy`,
  );
}
// The owner asked (2026-11-24) for the closing invitation, written by the
// owner (narrative.home.cta.*), to come back at the end of the home page.
// It closes the page once; the old feature-narrative blocks stay away.
const count = (text, needle) => text.split(needle).length - 1;
expect(
  !home.includes("feature-narrative") &&
    count(home, '"narrative.home.cta.heading"') === 1 &&
    count(home, '"narrative.home.cta.body"') === 1,
  "Home must close with the owner's CTA once, without the old feature-narrative blocks",
);
expect(
  !home.includes("fd-frame-strip-mode"),
  "Home must not bring back the legacy frame-strip mode pill",
);
// site.css still carries the old stripe rule (from reference-polish.css), so
// the rule that switches it off must stay in the shared sheet.
expect(
  /html body \.site-footer::before\s*\{\s*content:\s*none\s*!important;\s*display:\s*none\s*!important;/.test(
    allCss,
  ),
  "Footer stripe pseudo-element must stay removed",
);

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }, null, 2));
