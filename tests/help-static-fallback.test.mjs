import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// The Help page's static Japanese (shown before the script runs, and to
// crawlers) is the same text as the Japanese Help topics synced from the app.
// Two entries were left behind: the title still said 「エンドカード」 after the
// app renamed it 「エンドマーク」, and the community entry still said reporting
// and blocking were in preparation.
const root = path.resolve(import.meta.dirname, "..");

function plain(text) {
  return text
    .replace(/<[^>]+>/g, "")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replace(/\s+/g, " ")
    .trim();
}

test("static Help text matches the synced Japanese topics", () => {
  const ja = JSON.parse(
    fs.readFileSync(
      path.join(root, "public", "js", "help-topics", "ja.json"),
      "utf8",
    ),
  );
  const html = fs.readFileSync(
    path.join(root, "public", "help", "index.html"),
    "utf8",
  );
  const stale = [];
  for (const match of html.matchAll(
    /<(\w+)[^>]*data-i18n="(help\.[^"]+)"[^>]*>([\s\S]*?)<\/\1>/g,
  )) {
    const [, , key, inner] = match;
    if (typeof ja[key] !== "string") continue;
    if (plain(inner) !== plain(ja[key])) stale.push(key);
  }
  assert.deepEqual(stale, []);
});
