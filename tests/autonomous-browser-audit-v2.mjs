import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import {
  isIntentionalHiddenHeroFinding,
  verifyHiddenHeroFindings,
} from "./hero-audit-compat.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const outDir =
  process.env.AUDIT_OUT_DIR || "artifacts/autonomous-browser-audit";
const child = spawnSync(
  process.execPath,
  ["tests/autonomous-browser-audit.mjs"],
  {
    env: process.env,
    encoding: "utf8",
  },
);
process.stdout.write(child.stdout || "");
process.stderr.write(child.stderr || "");

const reportPath = path.join(outDir, "report.json");
const report = JSON.parse(await fs.readFile(reportPath, "utf8"));
const candidates = report.findings.filter(isIntentionalHiddenHeroFinding);
const verified = await verifyHiddenHeroFindings(candidates, baseURL);
if (verified) {
  report.findings = report.findings.filter(
    (finding) => !isIntentionalHiddenHeroFinding(finding),
  );
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
}

const severeKinds = new Set([
  "page-error",
  "console-error",
  "horizontal-overflow",
  "broken-image",
  "missing-svg-symbol",
  "nav-open",
  "nav-close",
  "nav-clipped",
  "language-menu",
  "language-restore",
  "faq-open",
  "help-search",
  "scroll-top",
  "empty-viewport",
  "screen-mock",
  "design-invariant",
  "community-tab",
  "anchor-nav",
]);
const byKind = report.findings.reduce(
  (acc, item) => ((acc[item.kind] = (acc[item.kind] || 0) + 1), acc),
  {},
);
console.log(
  JSON.stringify(
    {
      correctedAudit: "current-dom-v2",
      hiddenHeroFindingsRemoved: verified ? candidates.length : 0,
      totalFindings: report.findings.length,
      byKind,
    },
    null,
    2,
  ),
);
process.exitCode = report.findings.some((item) => severeKinds.has(item.kind))
  ? 1
  : 0;
