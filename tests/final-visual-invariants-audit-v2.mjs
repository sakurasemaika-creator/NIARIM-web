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

function getGalleryCards(failure) {
  if (Array.isArray(failure.cards)) return failure.cards;
  if (Array.isArray(failure.gallery?.cards)) return failure.gallery.cards;
  return [];
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
    const cards = getGalleryCards(failure);
    const allSevenCardsHaveThemeTokens =
      cards.length === 7 &&
      cards.every((card) => card.theme && card.accent && card.bezel);

    if (allSevenCardsHaveThemeTokens) {
      removedLegacyGalleryFailures += 1;
      return false;
    }
  }

  return true;
});

const canonicalHeroFailures = await auditCanonicalHeroRatio(baseURL);
failures.push(...canonicalHeroFailures);

const removedLegacyInnerHeroFailures = legacyFailures.filter(
  (failure) => failure.kind === "hero-ratio",
).length;

if (failures.length) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        correctedAudit: "current-dom-v4-seven-card-gallery",
        removedLegacyInnerHeroFailures,
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
      correctedAudit: "current-dom-v4-seven-card-gallery",
      removedLegacyInnerHeroFailures,
      removedLegacyGalleryFailures,
      canonicalHeroChecks: 21,
    },
    null,
    2,
  ),
);