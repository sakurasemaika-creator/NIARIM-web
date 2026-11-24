// The site's stylesheets were merged on 2026-11-24 into /css/site.css plus one
// file per page. Each block of a merged file starts with a marker comment
// naming the stylesheet it came from ("---- from the former polish.css ----"),
// in the cascade order the separate files used to have. Contracts that pinned
// a rule to one of those layers read that layer's blocks with this helper.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..", "public", "css");

export function readCss(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

// Every stylesheet the site ships, as one string.
export function allCss() {
  return [
    readCss("site.css"),
    ...fs
      .readdirSync(path.join(root, "pages"))
      .filter((f) => f.endsWith(".css"))
      .map((f) => readCss("pages/" + f)),
  ].join("\n");
}

// [{ from: "polish.css", text }] in file order.
export function cssBlocks(text) {
  const marker = /\/\* ---- from the former (.+?) ---- \*\//g;
  const blocks = [];
  let match;
  let last = null;
  while ((match = marker.exec(text))) {
    if (last) last.text = text.slice(last.start, match.index);
    last = { from: match[1], start: match.index + match[0].length };
    blocks.push(last);
  }
  if (last) last.text = text.slice(last.start);
  return blocks.map(({ from, text }) => ({ from, text }));
}

// All blocks of one former stylesheet, joined.
export function layer(text, from) {
  return cssBlocks(text)
    .filter((block) => block.from === from)
    .map((block) => block.text)
    .join("\n");
}
