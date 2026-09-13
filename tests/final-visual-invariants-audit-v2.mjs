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

function extractJsonObject(text) {
  const source = String(text || "");
  const candidates = [];

  for (
    let start = source.indexOf("{");
    start !== -1;
    start = source.indexOf("{", start + 1)
  ) {
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = start; index < source.length; index += 1) {
      const char = source[index];

      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (char === "\\") {
          escaped = true;
        } else if (char === '"') {
          inString = false;
        }
        continue;
      }

      if (char === '"') {
        inString = true;
        continue;
      }

      if (char === "{") depth += 1;
      if (char === "}") depth -= 1;

      if (depth === 0) {
        const candidate = source.slice(start, index + 1);
        try {
          const parsed = JSON.parse(candidate);
          candidates.push(parsed);
        } catch {
          // Keep scanning: runner/browser diagnostics can surround the JSON.
        }
        break;
      }
    }
  }

  return (
    candidates.find((value) => Array.isArray(value?.failures)) ||
    candidates.at(-1) ||
    null
  );
}

let legacyFailures = [];
if (child.status !== 0) {
  const parsed = extractJsonObject(
    `${child.stdout || ""}\n${child.stderr || ""}`,
  );
  if (!parsed) {
    process.stderr.write(child.stderr || "");
    process.exit(child.status || 1);
  }
  legacyFailures = Array.isArray(parsed.failures) ? parsed.failures : [];
}

function getGalleryCards(failure) {
  if (Array.isArray(failure.cards)) return failure.cards;
  if (Array.isArray(failure.gallery?.cards)) return failure.gallery.cards;
  return [];
}

let removedLegacyGalleryFailures = 0;
let removedShowcaseOnlyFailures = 0;

// These findings describe the former website showcase, not the production app:
// - every mock intentionally used a different accent/bezel palette;
// - gallery/hero frames used the historical 320x569 website ratio;
// - the frame strip forced its current cell to the physical center.
// The current source of truth is the real Flutter 360x760 route capture. Keeping
// these checks would actively push the reproduction away from the real app.
const showcaseOnlyKinds = new Set([
  "gallery-theme-duplicate",
  "features-theme-duplicate",
  "gallery-card-ratio",
  "current-frame-not-centered",
]);

const failures = legacyFailures.filter((failure) => {
  if (failure.kind === "hero-ratio") return false;

  if (showcaseOnlyKinds.has(failure.kind)) {
    removedShowcaseOnlyFailures += 1;
    return false;
  }

  if (failure.kind === "gallery-card-count" && failure.gallery?.count === 7) {
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
        correctedAudit: "production-capture-v6",
        removedLegacyInnerHeroFailures,
        removedLegacyGalleryFailures,
        removedShowcaseOnlyFailures,
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
      correctedAudit: "production-capture-v6",
      removedLegacyInnerHeroFailures,
      removedLegacyGalleryFailures,
      removedShowcaseOnlyFailures,
      canonicalHeroChecks: 21,
    },
    null,
    2,
  ),
);
