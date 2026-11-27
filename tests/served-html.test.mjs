import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// The page templates carry comments for whoever edits them (many in
// Japanese, which compresses poorly; /features/ had 17). The Worker leaves
// them out of the pages it serves; the browser draws none of them.
const root = path.resolve(import.meta.dirname, "..");
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), "utf8");

test("the Worker sends pages without HTML comments", () => {
  const worker = read("src", "index.js");
  assert.match(
    worker,
    /on\("html", \{\s*comments\(comment\) \{\s*comment\.remove\(\);/,
  );
});
