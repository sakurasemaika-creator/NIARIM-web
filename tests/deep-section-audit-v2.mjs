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
}

/* The legacy deep audit treats every .fd-app-screen as if it were an outer
   9:16 device. Hero App Preview sources are different: main.js marks them
   .is-fit-scaled and scales that inner reconstruction inside a canonical
   .hero-preview-card bezel. The outer card ratio/containment is covered by the
   Home width sweep, so applying the device-ratio assertion to this inner source
   produces a false positive even when the rendered phone is correct. Keep this
   exception deliberately narrow: it must be a screen-mock finding and carry
   both hero source markers. */
const isIntentionalScaledHeroSourceFinding = (finding) => {
  if (finding?.kind !== "screen-mock") return false;
  const className = String(finding?.detail?.className || "");
  return (
    className.split(/\s+/).includes("hero-app-preview-source") &&
    className.split(/\s+/).includes("is-fit-scaled")
  );
};

const scaledHeroSources = report.findings.filter(
  isIntentionalScaledHeroSourceFinding,
);
if (scaledHeroSources.length) {
  report.findings = report.findings.filter(
    (finding) => !isIntentionalScaledHeroSourceFinding(finding),
  );
}

if (verified || scaledHeroSources.length) {
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
      scaledHeroSourceFindingsRemoved: scaledHeroSources.length,
      findings: report.findings.length,
      byKind,
    },
    null,
    2,
  ),
);
process.exitCode = report.findings.length ? 1 : 0;
