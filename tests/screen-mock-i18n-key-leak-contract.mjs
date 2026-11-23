import fs from "node:fs/promises";

const [i18n, features] = await Promise.all([
  fs.readFile("public/js/i18n.js", "utf8"),
  fs.readFile("public/features/index.html", "utf8"),
]);

const failures = [];

// Both handlers leave the HTML's own text in place when a key is missing.
const handlers = i18n.split('querySelectorAll("[data-i18n');
if (
  !handlers.some(
    (part) => part.startsWith(']")') && /if \(translated !== key\)/.test(part),
  )
) {
  failures.push(
    "data-i18n must preserve visible fallback copy when a dictionary key is missing",
  );
}
if (
  !handlers.some(
    (part) =>
      part.startsWith('-html]")') && /if \(translated !== key\)/.test(part),
  )
) {
  failures.push(
    "data-i18n-html must preserve visible fallback copy when a dictionary key is missing",
  );
}

// The pages that draw screen mocks load the generator, its dictionary and
// the runtime with a version query, so a returning visitor never mixes an
// old generator with a new dictionary. (The home page no longer draws mocks.)
for (const [name, html] of [["features", features]]) {
  for (const [script, what] of [
    ["i18n-dict-features-diagram.js", "screen-mock dictionary"],
    ["i18n.js", "i18n runtime"],
    ["main.js", "screen-mock generator"],
  ]) {
    if (
      !new RegExp(`/js/${script.replace(".", "\\.")}\\?v=[\\w-]+`).test(html)
    ) {
      failures.push(`${name} must cache-bust the ${what}`);
    }
  }
}

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, checks: 8 }, null, 2));
