import fs from "node:fs/promises";
import path from "node:path";
import pngjs from "pngjs";

const { PNG } = pngjs;
const outDir = "artifacts/autonomous-browser-audit/complete-scroll";

await import("./complete-scroll-audit.mjs");

const reportPath = path.join(outDir, "report.json");
const report = JSON.parse(await fs.readFile(reportPath, "utf8"));
const slug = (s) =>
  s.replace(/^\//, "").replace(/[^a-zA-Z0-9_-]+/g, "-") || "home";

async function screenshotHasRenderedContent(finding) {
  const file = path.join(
    outDir,
    `${finding.viewport}__${slug(finding.route)}__${String(finding.step).padStart(3, "0")}.png`,
  );
  try {
    const png = PNG.sync.read(await fs.readFile(file));
    const bins = new Set();
    const top = Math.min(90, Math.floor(png.height * 0.12));
    const left = Math.floor(png.width * 0.08);
    const right = Math.floor(png.width * 0.9);
    for (let y = top; y < png.height; y += 6) {
      for (let x = left; x < right; x += 6) {
        const i = (y * png.width + x) * 4;
        const r = png.data[i] >> 4;
        const g = png.data[i + 1] >> 4;
        const b = png.data[i + 2] >> 4;
        bins.add((r << 8) | (g << 4) | b);
        if (bins.size > 48) return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

const corrected = [];
for (const finding of report.findings) {
  if (
    finding.kind === "empty-main-viewport" &&
    (await screenshotHasRenderedContent(finding))
  ) {
    continue;
  }
  corrected.push(finding);
}
report.findings = corrected;
await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

const byKind = corrected.reduce(
  (acc, finding) =>
    ((acc[finding.kind] = (acc[finding.kind] || 0) + 1), acc),
  {},
);
console.log(
  JSON.stringify(
    {
      correctedAudit: "complete-scroll-v2",
      findings: corrected.length,
      byKind,
    },
    null,
    2,
  ),
);
process.exitCode = corrected.length ? 1 : 0;
