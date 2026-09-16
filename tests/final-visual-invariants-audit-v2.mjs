import { spawnSync } from "node:child_process";

/* The final invariant suite owns the current normalized geometry contract.
   mock-detail-audit.mjs is a legacy pre-normalization audit (six-card gallery,
   rendered-pixel 50x50 checks and old slider dimensions), so running it here
   contradicts the current seven-card/logical-pixel contract already verified
   by final-visual-invariants-audit.mjs. Keep independent source/UI contracts,
   but do not re-run the superseded duplicate. */
const scripts = [
  "tests/hero-preview-scale-contract-audit.mjs",
  "tests/timeline-toolbar-frame-mode-contract.mjs",
  "tests/final-visual-invariants-audit.mjs",
  "tests/user-request-regressions-audit.mjs",
];

for (const script of scripts) {
  const child = spawnSync(process.execPath, [script], {
    env: process.env,
    encoding: "utf8",
  });

  process.stdout.write(child.stdout || "");
  process.stderr.write(child.stderr || "");

  if (child.error) throw child.error;
  if (child.status !== 0) process.exit(child.status ?? 1);
}
