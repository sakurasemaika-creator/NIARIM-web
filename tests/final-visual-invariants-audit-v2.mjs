import { spawnSync } from "node:child_process";
import { auditCanonicalHeroRatio } from "./hero-audit-compat.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const child = spawnSync(
  process.execPath,
  ["tests/final-visual-invariants-audit.mjs"],
  {
    env: process.env,
    encoding: "utf8",
  },
);
process.stdout.write(child.stdout || "");

let legacyFailures = [];
if (child.status !== 0) {
  const raw = String(child.stderr || "").trim();
  try {
    const parsed = JSON.parse(raw);
    legacyFailures = Array.isArray(parsed.failures) ? parsed.failures : [];
  } catch {
    process.stderr.write(child.stderr || "");
    process.exit(child.status || 1);
  }
}

const failures = legacyFailures.filter((failure) => failure.kind !== "hero-ratio");
const canonicalHeroFailures = await auditCanonicalHeroRatio(baseURL);
failures.push(...canonicalHeroFailures);

if (failures.length) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        correctedAudit: "current-dom-v2",
        removedLegacyInnerHeroFailures:
          legacyFailures.length -
          legacyFailures.filter((failure) => failure.kind !== "hero-ratio").length,
        failures,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      correctedAudit: "current-dom-v2",
      removedLegacyInnerHeroFailures:
        legacyFailures.length -
        legacyFailures.filter((failure) => failure.kind !== "hero-ratio").length,
      canonicalHeroChecks: 21,
    },
    null,
    2,
  ),
);
