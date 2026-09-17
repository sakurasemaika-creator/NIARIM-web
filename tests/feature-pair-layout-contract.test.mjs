import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const js = readFileSync("public/js/user-request-fixes.js", "utf8");
const css = readFileSync("public/css/user-request-fixes.css", "utf8");

assert.match(js, /className = "feature-pair"/);
assert.match(js, /pair\.appendChild\(narrative\)/);
assert.match(js, /pair\.appendChild\(diagram\)/);
assert.match(css, /\.feature-pair\s*\{/);
assert.match(
  css,
  /grid-template-columns:\s*minmax\(0, 1fr\) minmax\(280px, 360px\)/,
);
assert.doesNotMatch(
  css,
  /\.features-header ~ \.feature-section\s*\{[\s\S]*?display:\s*grid\s*!important/,
);
assert.doesNotMatch(
  css,
  /\.features-header ~ \.feature-section > \.feature-narrative/,
);

console.log("feature pair layout contract: ok");
