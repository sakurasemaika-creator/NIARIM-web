/**
 * Writes an SVG without its comments and the whitespace that only lays the
 * file out: the logo and favicon the site serves are cleaned this way from
 * the app's sources (assets/logo/*.svg in the app repository), which keep
 * the comments that explain the shapes. Only whitespace and comments go: the
 * drawing is the same (whitespace inside a tag only separates attributes and
 * numbers, and these files have no text elements).
 *
 * Usage: node tools/clean-svg.mjs <source.svg> <output.svg>
 */
import fs from "node:fs";

export function cleanSvg(source) {
  return (
    source
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/\s+/g, " ")
      .replace(/>\s*</g, "><")
      .replace(/="\s+/g, '="')
      .replace(/\s+"/g, '"')
      .replace(/\s*(\/?>)/g, "$1")
      .trim() + "\n"
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [input, output] = process.argv.slice(2);
  const source = fs.readFileSync(input, "utf8");
  if (/<(text|tspan|textPath|style|title|desc)\b/.test(source))
    throw new Error(`${input} has text or style: clean it by hand`);
  fs.writeFileSync(output, cleanSvg(source));
}
