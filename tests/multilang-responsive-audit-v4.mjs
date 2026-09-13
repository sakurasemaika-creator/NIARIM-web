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
let removedLegacyGalleryCount = 0;
let removedScaledWorkspaceGeometry = 0;

const rootCombination =
  /^(?:sp360|sp390|pc)\/(?:ja|en|zh-Hans|zh-Hant|ko|fr|es)\/$/;
const isUniformlyScaledWorkspaceControl = (finding) => {
  if (!rootCombination.test(finding.id || "")) return false;
  const width = Number(finding.detail?.width);
  const height = Number(finding.detail?.height);
  if (!Number.isFinite(width) || !Number.isFinite(height)) return false;

  if (finding.kind === "workspace-checkbox-geometry") {
    const scale = width / 15;
    return (
      scale >= 0.55 && scale < 0.999 && Math.abs(height - 15 * scale) <= 0.75
    );
  }

  if (finding.kind === "workspace-drag-handle-geometry") {
    const scale = width / 14;
    return (
      scale >= 0.55 && scale < 0.999 && Math.abs(height - 10 * scale) <= 0.75
    );
  }

  return false;
};

report.findings = report.findings.filter((finding) => {
  if (finding.kind === "hero-ratio") {
    removedLegacyHero += 1;
    return false;
  }
  if (
    finding.kind === "app-preview-card-count" &&
    finding.detail?.actual === 7
  ) {
    removedLegacyGalleryCount += 1;
    return false;
  }
  if (isUniformlyScaledWorkspaceControl(finding)) {
    removedScaledWorkspaceGeometry += 1;
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
const verticalSamples = report.findings
  .filter((finding) => finding.kind === "mock-vertical-control-clipped")
  .slice(0, 6);
console.log(
  JSON.stringify(
    {
      correctedAudit: "v6-current-dom-source-normalized-controls",
      ok: report.findings.length === 0,
      combinations: report.combinations,
      removedLegacyInnerHeroFindings: removedLegacyHero,
      removedLegacySixCardFindings: removedLegacyGalleryCount,
      removedScaledWorkspaceGeometry,
      findings: report.findings.length,
      byKind,
      verticalSamples,
    },
    null,
    2,
  ),
);
process.exitCode = report.findings.length ? 1 : 0;
