import fs from "node:fs";
import assert from "node:assert/strict";
const routes = [
  "/",
  "/about/",
  "/features/",
  "/help/",
  "/premium/",
  "/community/",
  "/news/",
  "/faq/",
  "/contact/",
  "/privacy/",
  "/terms/",
  "/tokushoho/",
  "/font-licenses/",
  "/opals/",
];
const html = (route) =>
  fs.readFileSync(
    "public" + (route === "/" ? "/index.html" : route + "index.html"),
    "utf8",
  );
// The unified studio styles (formerly studio-unification-2026.css) are part
// of site.css; /font-licenses/ links its own standalone file with them.
for (const path of routes) {
  const content = html(path);
  const sheet =
    path === "/font-licenses/"
      ? "/css/pages/font-licenses.css"
      : "/css/site.css";
  assert.ok(
    content.includes(`href="${sheet}"`),
    "Missing unified style: " + path,
  );
}
const home = html("/");
// The Work Plaza capture is taken in every page language (plaza-v6-<lang>.webp);
// the Worker and i18n.js pick the page's file through img.plaza.
assert.match(home, /assets\/images\/app-captures\/plaza-v6-ja\.webp/);
assert.match(home, /data-i18n-attr="src:img\.plaza\|/);
assert.match(home, /loading="lazy"\s+decoding="async"/);
assert.doesNotMatch(
  home,
  /nr-plaza-illustration|nr-illustration-sun|nr-plaza-window/,
);
const css = fs
  .readFileSync("public/css/site.css", "utf8")
  .split("---- from the former studio-unification-2026.css ----")
  .slice(1)
  .map((block) => block.split("---- from the former ")[0])
  .join("\n");
assert.match(css, /Kuramubon/);
assert.match(css, /HakkouMincho/);
assert.match(css, /prefers-reduced-motion/);
const dict = fs.readFileSync("public/js/i18n-dict-refresh-2026.js", "utf8");
assert.match(dict, /"plaza\.title":\s*"作品から、<br>次の物語へ。"/);
for (const lang of ["ja", "en", "es", "fr", "ko", "zh-Hans", "zh-Hant"]) {
  const image = `public/assets/images/app-captures/plaza-v6-${lang}.webp`;
  const buf = fs.readFileSync(image);
  assert.equal(buf.subarray(0, 4).toString("ascii"), "RIFF", image);
  assert.equal(buf.subarray(8, 12).toString("ascii"), "WEBP", image);
  assert.ok(buf.byteLength > 1000 && buf.byteLength < 100000, image);
}
console.log(
  "Studio cross-page font, copy, motion and native capture source contracts OK",
);
