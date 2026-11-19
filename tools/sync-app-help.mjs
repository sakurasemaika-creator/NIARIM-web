import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const [app, mode] = process.argv.slice(2);
if (!app || (mode !== "--check" && mode !== "--write")) {
  throw Error("Usage: node tools/sync-app-help.mjs /path/to/NIARIM --check|--write");
}

const locales = {
  ja: "ja", en: "en", "zh-Hans": "zh", "zh-Hant": "zh_Hant",
  ko: "ko", fr: "fr", es: "es",
};
const read = path => readFileSync(path, "utf8");
const page = read(resolve(root, "public/help/index.html"));
const mapping = JSON.parse(read(resolve(root, "tools/app-help-topic-map.json")));
const screen = read(resolve(app, "lib/screens/help/help_screen.dart"));
const entries = screen.match(/List<_HelpEntry> _buildEntries[\s\S]*?=> \[([\s\S]*?)\n  \];/)?.[1];
if (!entries) throw Error("Cannot find the app Help entry list");

function helpEntry(block) {
  const topic = block.match(/\btopicKey:\s*'([^']+)'/)?.[1];
  const title = block.match(/\btitle:\s*l10n\.(\w+)/)?.[1];
  const description = block.match(/\bdescription:\s*l10n\.(\w+)/)?.[1];
  if (!topic || !title || !description) throw Error(`Unsupported Help entry: ${block.trim()}`);
  return [topic, { title, description }];
}
const appTopics = new Map(
  [...entries.matchAll(/_HelpEntry\(([\s\S]*?)\n    \),/g)].map(match => helpEntry(match[1])),
);
const pageTopics = new Set(
  [...page.matchAll(/data-i18n="(help\.(?:entry\d+|premiumExpiry))\.title"/g)].map(match => match[1]),
);
const mappedTopics = new Set(Object.values(mapping));
const missingAppTopics = [...appTopics.keys()].filter(topic => !mappedTopics.has(topic));
const missingPageTopics = [...pageTopics].filter(key => !mapping[key]);
const removedTopics = Object.entries(mapping).filter(([key, topic]) =>
  !pageTopics.has(key) || !appTopics.has(topic)
);
if (missingAppTopics.length || missingPageTopics.length || removedTopics.length ||
    mappedTopics.size !== Object.keys(mapping).length) {
  throw Error(JSON.stringify({ missingAppTopics, missingPageTopics, removedTopics }));
}

const categories = [...new Set(
  [...page.matchAll(/data-i18n="help\.category\.(\w+)"/g)].map(match => match[1]),
)];
const bundlePath = resolve(root, "public/js/app-help-sync-2026.js");
const bundle = read(bundlePath);
const table = bundle.match(/var tables=(\{[\s\S]*\});var store=/);
if (!table) throw Error("Cannot find the website Help translation tables");
const current = JSON.parse(table[1]);
const mismatches = [];
const next = {};

for (const [locale, arbLocale] of Object.entries(locales)) {
  const arb = JSON.parse(read(resolve(app, `lib/l10n/app_${arbLocale}.arb`)));
  const expected = {};
  function add(key, arbKey) {
    const text = arb[arbKey];
    if (typeof text !== "string" || text.includes("\\n")) {
      throw Error(`${locale}: missing or escaped Help text at ${arbKey}`);
    }
    expected[key] = text;
  }
  for (const category of categories) {
    add(`help.category.${category}`, `helpCategory${category[0].toUpperCase()}${category.slice(1)}`);
  }
  for (const [key, topic] of Object.entries(mapping)) {
    const { title, description } = appTopics.get(topic);
    add(`${key}.title`, title);
    add(`${key}.desc`, description);
  }
  const keys = new Set([...Object.keys(current[locale] || {}), ...Object.keys(expected)]);
  for (const key of keys) {
    if (current[locale]?.[key] !== expected[key]) mismatches.push(`${locale} ${key}`);
  }
  next[locale] = Object.fromEntries(
    [...keys].filter(key => Object.hasOwn(expected, key)).map(key => [key, expected[key]]),
  );
}

if (mode === "--write") {
  if (mismatches.length) {
    const start = table.index + "var tables=".length;
    const updated = bundle.slice(0, start) + JSON.stringify(next) +
      bundle.slice(start + table[1].length);
    writeFileSync(bundlePath, updated.replace(
      /^\/\*[\s\S]*?\*\//,
      "/* Generated from NIARIM Help and ARB files by tools/sync-app-help.mjs. */",
    ));
  }
} else if (mismatches.length) {
  console.error(mismatches.join("\n"));
  throw Error(`Synchronize ${mismatches.length} website Help strings with --write.`);
}
console.log(`App and Web Help: ${pageTopics.size} entries in ${Object.keys(locales).length} locales.`);
