import fs from "node:fs/promises";
import path from "node:path";

const outDir =
  process.env.AUDIT_SCREENSHOT_DIR || "artifacts/final-visual-screenshots-v2";

await import("./final-visual-screenshot-audit-v2.mjs");

const manifestPath = path.join(outDir, "manifest.json");
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));

manifest.failures = manifest.failures.filter((failure) => {
  if (failure.kind !== "gallery-last-card-clipped") return true;
  const end = failure.end || {};
  if (
    Number.isFinite(end.lastLeft) &&
    Number.isFinite(end.lastRight) &&
    Number.isFinite(end.scrollerLeft) &&
    Number.isFinite(end.scrollerRight) &&
    end.lastLeft >= end.scrollerLeft - 2 &&
    end.lastRight <= end.scrollerRight + 2
  ) {
    return false;
  }
  return true;
});

await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
const byKind = manifest.failures.reduce(
  (acc, failure) =>
    ((acc[failure.kind] = (acc[failure.kind] || 0) + 1), acc),
  {},
);
console.log(
  JSON.stringify(
    {
      correctedAudit: "v3",
      ok: manifest.failures.length === 0,
      screenshots: manifest.screenshots.length,
      failures: manifest.failures.length,
      byKind,
    },
    null,
    2,
  ),
);
process.exitCode = manifest.failures.length ? 1 : 0;
