import fs from "node:fs/promises";

const failures = [];
const read = (path) => fs.readFile(path, "utf8");
const [home, community, contactCss, visualFinish, uiFixes, baseDict, communityDict, featureDict] = await Promise.all([
  read("public/index.html"),
  read("public/community/index.html"),
  read("public/css/pages/contact.css"),
  read("public/css/visual-finish.css"),
  read("public/css/ui-regression-fixes.css"),
  read("public/js/i18n-dict.js"),
  read("public/js/i18n-dict-community.js"),
  read("public/js/i18n-dict-features-diagram.js"),
]);

if (!home.includes('data-i18n-html="cta.body"')) failures.push("home CTA body must use HTML i18n");
if (!baseDict.includes('描きたいと思ったら今すぐにでも始められる。<br>全フレーム手描きでも')) failures.push("home CTA requested line break missing");
if (!community.includes("NIARIMでアニメを制作して、作品広場に投稿してみませんか？")) failures.push("community fallback CTA copy stale");
if (!communityDict.includes('"NIARIMでアニメを制作して、作品広場に投稿してみませんか？"')) failures.push("community JA CTA copy stale");
if (!/\.form-checkbox\s*\{[\s\S]*?display:\s*flex;[\s\S]*?flex-wrap:\s*nowrap;/.test(contactCss)) failures.push("consent label must be a no-wrap flex row");
if (!/\.form-checkbox\s*>\s*span\s*\{[\s\S]*?min-width:\s*0;/.test(contactCss)) failures.push("consent copy must be allowed to shrink beside checkbox");
if (/\.site-footer::before\s*\{/.test(visualFinish) || /\.site-footer::before\s*\{/.test(uiFixes)) failures.push("footer decorative separator must stay removed");
if (!featureDict.includes('"fd.projectName": "星降る夜"')) failures.push("JA mock project title must be natural");
if (/"fd\.projectName":\s*"(?:fd\.|プロジェクト名|Project name|项目名称|專案名稱|프로젝트 이름|Nom du projet|Nombre del proyecto)/.test(featureDict)) failures.push("generic/internal mock project title remains");
if (home.includes('class="fd-frame-strip-mode"')) failures.push("legacy frame-list pill remains in home mock");
if (!home.includes('class="fd-frame-mode"')) failures.push("circular frame/timeline icon control missing");

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, checks: 10 }, null, 2));
