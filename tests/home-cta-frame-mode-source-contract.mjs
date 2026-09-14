import fs from "node:fs/promises";

const [main, baseCss, finalCss, dict, home, faq, finishCss] = await Promise.all(
  [
    fs.readFile("public/js/main.js", "utf8"),
    fs.readFile("public/css/screen-mock-accuracy-base.css", "utf8"),
    fs.readFile("public/css/ui-regression-fixes.css", "utf8"),
    fs.readFile("public/js/i18n-dict.js", "utf8"),
    fs.readFile("public/index.html", "utf8"),
    fs.readFile("public/faq/index.html", "utf8"),
    fs.readFile("public/css/visual-finish.css", "utf8"),
  ],
);

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
expect(
  /\.fd-frame-mode\s*\{[\s\S]*?width:\s*42px\s*!important[\s\S]*?height:\s*42px\s*!important[\s\S]*?flex:\s*0\s+0\s+42px\s*!important[\s\S]*?border-radius:\s*50%\s*!important/.test(
    baseCss,
  ),
  "Canonical frame-mode CSS must define a 42px circular control",
);
expect(
  !/\.fd-frame-mode\s*\{[\s\S]*?grid-template-columns:\s*1fr\s+1fr/.test(
    baseCss,
  ) && !baseCss.includes(".fd-frame-mode > span + span"),
  "Canonical frame-mode CSS must not retain the segmented-pill split layout",
);
expect(
  /html body \.fd-frame-mode\s*\{[\s\S]*?width:\s*42px\s*!important[\s\S]*?height:\s*42px\s*!important[\s\S]*?min-width:\s*42px\s*!important[\s\S]*?flex:\s*0\s+0\s+42px\s*!important/.test(
    finalCss,
  ),
  "Final regression layer must enforce 42px frame-mode geometry for every fallback context",
);
expect(
  !finalCss.includes(".fd-frame-mode::before") &&
    !finalCss.includes('mask-image: url("data:image/svg+xml'),
  "Final regression layer must not synthesize movie_filter with a pseudo-element mask",
);
expect(
  dict.includes("cta.title") &&
    dict.includes(title) &&
    dict.includes("cta.body") &&
    dict.includes(body),
  "Japanese shared CTA dictionary must contain the requested title and body",
);
for (const [name, html] of [
  ["home", home],
  ["faq", faq],
]) {
  expect(
    html.includes('data-i18n="cta.title"') &&
      html.includes(title) &&
      html.includes('data-i18n="cta.body"') &&
      html.includes(body),
    `${name} fallback CTA must match the requested Japanese copy`,
  );
}
expect(
  !home.includes("feature-narrative") &&
    !home.includes("narrative.home.cta.heading") &&
    !home.includes("narrative.home.cta.body"),
  "Home must not retain the duplicate feature-narrative CTA block",
);
expect(
  !home.includes("fd-frame-strip-mode") &&
    (home.match(/class="fd-frame-mode"/g) || []).length >= 2 &&
    home.includes("sprite.svg#ic-movie_filter"),
  "Static home canvas fallbacks must use circular fd-frame-mode controls with the movie_filter sprite",
);
expect(
  !finishCss.includes(".site-footer::before") &&
    !/repeating-linear-gradient\(\s*90deg[\s\S]*?var\(--color-accent\)/.test(
      finishCss,
    ),
  "Footer stripe pseudo-element must stay removed",
);

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }, null, 2));
