import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import {
  isIntentionalHiddenHeroFinding,
  verifyHiddenHeroFindings,
} from "./hero-audit-compat.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const outDir =
  process.env.AUDIT_OUT_DIR ||
  "artifacts/autonomous-browser-audit/deep-sections";
const child = spawnSync(process.execPath, ["tests/deep-section-audit.mjs"], {
  env: process.env,
  encoding: "utf8",
});
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

const byKind = report.findings.reduce(
  (acc, item) => ((acc[item.kind] = (acc[item.kind] || 0) + 1), acc),
  {},
);
console.log(
  JSON.stringify(
    {
      correctedAudit: "current-dom-v2",
      hiddenHeroFindingsRemoved: verified ? candidates.length : 0,
      findings: report.findings.length,
      byKind,
    },
    null,
    2,
  ),
);
process.exitCode = report.findings.length ? 1 : 0;
