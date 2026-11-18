import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const js = readFileSync("public/js/user-request-fixes.js", "utf8");
const css = readFileSync("public/css/pages/features.css", "utf8");

assert.match(js, /className = "feature-pair"/);
assert.match(js, /pair\.append\(copyColumn, stack\)/);
assert.match(js, /copyColumn\.append\(narrative\)/);
assert.match(js, /stack\.append\(diagram\)/);
assert.match(
  css,
  /\.feature-section > \.feature-pair\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\) 320px/,
);
assert.match(
  css,
  /\.feature-section:has\(> \.feature-pair\) > \.spec-grid\s*\{[^}]*width:\s*100%/,
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
