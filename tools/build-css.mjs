/**
 * Writes the stylesheets the Worker serves (public/css/generated/…) from the
 * source files in public/css: the same rules, without the comments and the
 * indentation.
 *
 * Most of site.css is comments (in Japanese, which compresses poorly): every
 * page waited for about 47 KB (Brotli) of render-blocking CSS, of which about
 * 20 KB was comments. Nothing else is changed: no rule, value or selector is
 * rewritten, and whitespace between two tokens stays as one space or newline,
 * so the browser reads the same style sheet (tests/css-build.test.mjs checks
 * that only comments and whitespace differ).
 *
 * The source files stay as they are (and are what a static preview serves).
 * Run by the Wrangler custom build together with tools/generate-seo-i18n.mjs.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const cssDir = path.join(root, "public", "css");
const outDir = path.join(cssDir, "generated");

const isWordChar = (ch) => /[\w\-\\%.#@()]/.test(ch || "");

/** Removes comments and the whitespace that only lays the file out. */
export function compactCss(source) {
  let out = "";
  let i = 0;
  const n = source.length;
  // Whitespace (or a removed comment) between two tokens is kept as one
  // separator: one newline when the run had one, otherwise one space.
  let pending = "";
  const flush = (next) => {
    if (pending && out && next !== undefined) {
      out += pending.includes("\n") ? "\n" : " ";
    }
    pending = "";
  };
  while (i < n) {
    const ch = source[i];
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < n && source[j] !== ch) {
        if (source[j] === "\\") j += 1;
        else if (source[j] === "\n") break;
        j += 1;
      }
      flush(ch);
      out += source.slice(i, j + 1);
      i = j + 1;
    } else if (ch === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      i = end < 0 ? n : end + 2;
      // A comment separates tokens (1px/**/solid is two tokens).
      const before = out[out.length - 1];
      const after = source[i];
      if (!pending && isWordChar(before) && isWordChar(after)) pending = " ";
    } else if (/\s/.test(ch)) {
      let j = i;
      while (j < n && /\s/.test(source[j])) j += 1;
      pending += source.slice(i, j);
      i = j;
    } else {
      flush(ch);
      out += ch;
      i += 1;
    }
  }
  return out + "\n";
}

function cssFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (full !== outDir) files.push(...cssFiles(full));
    } else if (entry.name.endsWith(".css")) files.push(full);
  }
  return files;
}

function writeIfChanged(file, content) {
  if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === content) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, "utf8");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let before = 0;
  let after = 0;
  for (const file of cssFiles(cssDir)) {
    const source = fs.readFileSync(file, "utf8");
    const compact = compactCss(source);
    writeIfChanged(path.join(outDir, path.relative(cssDir, file)), compact);
    before += Buffer.byteLength(source);
    after += Buffer.byteLength(compact);
  }
  console.log(
    `Generated public/css/generated (${before} -> ${after} bytes before compression).`,
  );
}
