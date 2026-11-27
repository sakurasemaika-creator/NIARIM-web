/**
 * Writes the scripts the Worker serves (public/js/generated/compact/…) from
 * the source files in public/js: the same program, without comments and the
 * whitespace that only lays the file out.
 *
 * esbuild (installed with wrangler) parses each script and prints it again
 * with minifyWhitespace only: no name is shortened and no statement is
 * rewritten, so the program is the same (tests/js-build.test.mjs checks that
 * esbuild reads the source and the served file as the same program). Non-ASCII
 * text stays as written (charset "utf8"), so Japanese strings are not turned
 * into \u escapes. A script that loads another script of public/js by a
 * literal path ("/js/user-request-fixes.js") loads its served copy too.
 *
 * The source files stay as they are (and are what a static preview serves).
 * Run by the Wrangler custom build together with tools/generate-seo-i18n.mjs.
 */
import fs from "node:fs";
import path from "node:path";
import { transformSync } from "esbuild";

const root = path.resolve(import.meta.dirname, "..");
const jsDir = path.join(root, "public", "js");
const outDir = path.join(jsDir, "generated", "compact");
export const COMPACT_JS_PREFIX = "/js/generated/compact/";

/** The source scripts that are served compacted (public/js/*.js). */
export function sourceScripts() {
  return fs
    .readdirSync(jsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".js"))
    .map((entry) => entry.name)
    .sort();
}

/** The same script without comments and layout whitespace. */
export function compactJs(source, names = new Set(sourceScripts())) {
  const { code } = transformSync(source, {
    loader: "js",
    minifyWhitespace: true,
    charset: "utf8",
    legalComments: "inline",
  });
  // Another script of public/js named by a literal path: its served copy.
  return code.replace(
    /(["'`])\/js\/([\w-]+\.js)(?=[?#"'`])/g,
    (match, quote, name) =>
      names.has(name) ? `${quote}${COMPACT_JS_PREFIX}${name}` : match,
  );
}

function writeIfChanged(file, content) {
  if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === content) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, "utf8");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const names = new Set(sourceScripts());
  let before = 0;
  let after = 0;
  for (const name of names) {
    const source = fs.readFileSync(path.join(jsDir, name), "utf8");
    const compact = compactJs(source, names);
    writeIfChanged(path.join(outDir, name), compact);
    before += Buffer.byteLength(source);
    after += Buffer.byteLength(compact);
  }
  console.log(
    `Generated public/js/generated/compact (${before} -> ${after} bytes before compression).`,
  );
}
