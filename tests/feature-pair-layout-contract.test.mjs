import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const js = readFileSync("public/js/user-request-fixes.js", "utf8");
const css = [
  readFileSync("public/css/site.css", "utf8"),
  ...readdirSync("public/css/pages").map((f) =>
    readFileSync("public/css/pages/" + f, "utf8"),
  ),
].join("\n");

assert.match(js, /className = "feature-pair"/);
assert.match(js, /pair\.append\(copyColumn, stack\)/);
assert.match(js, /copyColumn\.append\(narrative\)/);
assert.match(js, /stack\.append\(diagram\)/);
// The Features page pairs each section's captures with its text in
// .nr-feature-duo (pc-paired-captures.js) before user-request-fixes.js looks
// for loose diagrams, so no .feature-pair is built today (checked in the
// browser at 390 and 1366px in seven languages, 2026-11-24). Its grid rules
// matched nothing and went with the stylesheet consolidation; what stays is
// that no layer forces the old grid back onto the sections.
assert.doesNotMatch(
  css,
  /\.features-header ~ \.feature-section\s*\{[\s\S]*?display:\s*grid\s*!important/,
);
assert.doesNotMatch(
  css,
  /\.features-header ~ \.feature-section > \.feature-narrative/,
);

console.log("feature pair layout contract: ok");
