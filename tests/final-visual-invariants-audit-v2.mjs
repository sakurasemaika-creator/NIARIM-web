import { spawnSync } from "node:child_process";

const child = spawnSync(
  process.execPath,
  ["tests/final-visual-invariants-audit.mjs"],
  {
    env: process.env,
    encoding: "utf8",
  },
);

process.stdout.write(child.stdout || "");
process.stderr.write(child.stderr || "");

if (child.error) {
  throw child.error;
}

process.exit(child.status ?? 1);
