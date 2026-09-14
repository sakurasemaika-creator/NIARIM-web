import { spawnSync } from "node:child_process";

const scripts = [
  "tests/hero-preview-scale-contract-audit.mjs",
  "tests/timeline-toolbar-frame-mode-contract.mjs",
  "tests/final-visual-invariants-audit.mjs",
  "tests/mock-detail-audit.mjs",
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
