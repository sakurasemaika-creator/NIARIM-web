import fs from "node:fs/promises";

const [i18n, home, features] = await Promise.all([
  fs.readFile("public/js/i18n.js", "utf8"),
  fs.readFile("public/index.html", "utf8"),
  fs.readFile("public/features/index.html", "utf8"),
]);

const failures = [];

if (!i18n.includes("if (translated !== key) el.textContent = translated;")) {
  failures.push(
    "data-i18n must preserve visible fallback copy when a dictionary key is missing",
  );
}
if (!i18n.includes("if (translated !== key) el.innerHTML = translated;")) {
  failures.push(
    "data-i18n-html must preserve visible fallback copy when a dictionary key is missing",
  );
}

for (const [name, html] of [
  ["home", home],
  ["features", features],
]) {
  if (!html.includes("/js/i18n-dict-features-diagram.js?v=20260917-2")) {
    failures.push(`${name} must cache-bust the screen-mock dictionary`);
  }
  if (!html.includes("/js/i18n.js?v=20260917-2")) {
    failures.push(`${name} must cache-bust the i18n runtime`);
  }
  if (!html.includes("/js/main.js?v=20260917-2")) {
    failures.push(`${name} must cache-bust the screen-mock generator`);
  }
}

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, checks: 8 }, null, 2));
