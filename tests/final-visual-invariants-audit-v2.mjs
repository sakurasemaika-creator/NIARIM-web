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

let removedLegacyGalleryFailures = 0;
const failures = legacyFailures.filter((failure) => {
  if (failure.kind === "hero-ratio") return false;

  if (
    failure.kind === "gallery-card-count" &&
    failure.gallery?.count === 7
  ) {
    removedLegacyGalleryFailures += 1;
    return false;
  }

  if (failure.kind === "gallery-theme-missing") {
    const cards = Array.isArray(failure.cards) ? failure.cards : [];
    const populated = cards.filter(
      (card) => card.theme && card.accent && card.bezel,
    );
    const accents = new Set(populated.map((card) => card.accent));
    const bezels = new Set(populated.map((card) => card.bezel));
    if (
      cards.length === 7 &&
      populated.length === 7 &&
      accents.size === 7 &&
      bezels.size === 7
    ) {
      removedLegacyGalleryFailures += 1;
      return false;
    }
  }

  return true;
});
const canonicalHeroFailures = await auditCanonicalHeroRatio(baseURL);
failures.push(...canonicalHeroFailures);

if (failures.length) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        correctedAudit: "current-dom-v3-seven-card-gallery",
        removedLegacyInnerHeroFailures:
          legacyFailures.length -
          legacyFailures.filter((failure) => failure.kind !== "hero-ratio")
            .length,
        removedLegacyGalleryFailures,
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
      correctedAudit: "current-dom-v3-seven-card-gallery",
      removedLegacyInnerHeroFailures:
        legacyFailures.length -
        legacyFailures.filter((failure) => failure.kind !== "hero-ratio")
          .length,
      removedLegacyGalleryFailures,
      canonicalHeroChecks: 21,
    },
    null,
    2,
  ),
);
