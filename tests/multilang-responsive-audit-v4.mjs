import fs from "node:fs/promises";
import path from "node:path";
import { auditCanonicalHeroRatio } from "./hero-audit-compat.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const outDir =
  process.env.AUDIT_OUT_DIR || "artifacts/multilang-responsive-audit-v3";

await import("./multilang-responsive-audit-v3.mjs");

const reportPath = path.join(outDir, "report.json");
const report = JSON.parse(await fs.readFile(reportPath, "utf8"));
let removedLegacyHero = 0;
report.findings = report.findings.filter((finding) => {
  if (finding.kind === "hero-ratio") {
    removedLegacyHero += 1;
    return false;
  }
  if (finding.kind !== "app-preview-last-card-clipped") return true;
  const end = finding.detail || {};
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
report.findings.push(...(await auditCanonicalHeroRatio(baseURL)));

await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
const byKind = report.findings.reduce(
  (acc, finding) => ((acc[finding.kind] = (acc[finding.kind] || 0) + 1), acc),
  {},
);
console.log(
  JSON.stringify(
    {
      correctedAudit: "v5-current-dom",
      ok: report.findings.length === 0,
      combinations: report.combinations,
      removedLegacyInnerHeroFindings: removedLegacyHero,
      findings: report.findings.length,
      byKind,
    },
    null,
    2,
  ),
);
process.exitCode = report.findings.length ? 1 : 0;
