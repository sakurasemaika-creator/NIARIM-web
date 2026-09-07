import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

// Wrangler uses --ip for the bind address; supervised previews pass --host.
// Its listener already fails when the port is occupied, so no --strictPort flag
// is needed. Keep ordinary `npm run dev` arguments unchanged.
const args = process.argv.slice(2).flatMap((arg) => {
  if (arg === "--strictPort") return [];
  if (arg === "--host") return ["--ip"];
  if (arg.startsWith("--host=")) return [arg.replace("--host=", "--ip=")];
  return [arg];
});
const wrangler = fileURLToPath(
  new URL("../node_modules/wrangler/bin/wrangler.js", import.meta.url),
);
const child = spawn(process.execPath, [wrangler, "dev", ...args], {
  stdio: "inherit",
});
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
