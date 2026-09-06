/**
 * 見た目の確認を始める前に、必要なものが揃っているかを1つずつ確かめる。
 *
 * なぜ必要か:
 *   AI-VERIFICATION.md の手順は、途中でどれか1つでも欠けると
 *   「修正が効かない」「撮れない」という別の症状に化けて現れる。
 *   実際に別のモデルがこの手順を実行したとき、次の3点で止まった。
 *     - Chromium が Playwright の既定の場所に無い環境だった
 *     - 配信サーバーが立っていなかった
 *     - アプリ本体のソースがローカルに無く、README の絶対パスが使えなかった
 *   どれも「何が足りないか」と「どう直すか」さえ分かれば数秒で解決する。
 *   欠けているものと、その直し方を並べて出すのがこのスクリプトの役目。
 *
 * 使い方:
 *   node tools/verify-env.mjs          # 確認するだけ
 *   npm run verify:env
 *
 * 終了コード: 撮影に必須のものが欠けていれば 1、揃っていれば 0。
 *   アプリ本体のソースは「無くても撮影はできる」ため警告に留める。
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { findChromium, CHROMIUM_CANDIDATES } from "../tests/browser-launch.mjs";
import { findAppDir, APP_DIR_CANDIDATES } from "./app-source.mjs";
import { detectServer, SERVER_CANDIDATES } from "./dev-server.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const results = [];

function ok(name, detail) {
  results.push({ level: "ok", name, detail });
}
function warn(name, detail, fix) {
  results.push({ level: "warn", name, detail, fix });
}
function fail(name, detail, fix) {
  results.push({ level: "fail", name, detail, fix });
}

/* 1. Node ---------------------------------------------------------------- */
const nodeMajor = Number(process.versions.node.split(".")[0]);
if (nodeMajor >= 20) {
  ok("Node.js", `v${process.versions.node}`);
} else {
  fail(
    "Node.js",
    `v${process.versions.node}（20以上が必要）`,
    "Node.js 20以降を入れる（CIは22を使っている）",
  );
}

/* 2. 依存パッケージ ------------------------------------------------------- */
if (fs.existsSync(path.join(ROOT, "node_modules/playwright/package.json"))) {
  const v = JSON.parse(
    fs.readFileSync(
      path.join(ROOT, "node_modules/playwright/package.json"),
      "utf8",
    ),
  ).version;
  ok("playwright", `v${v}（node_modules に有り）`);
} else {
  fail(
    "playwright",
    "node_modules に無い",
    "npm ci      # package.json の devDependencies に入っている",
  );
}

/* 3. Chromium 本体 -------------------------------------------------------- */
/* Playwright のパッケージが入っていても、ブラウザ本体は別途ダウンロードが
   必要。ここを踏み外すと「Executable doesn't exist」で全スクリプトが落ちる。 */
const chromium = findChromium();
if (chromium) {
  ok("Chromium", chromium);
} else {
  fail(
    "Chromium",
    `見つからない（探した場所: ${CHROMIUM_CANDIDATES.filter(Boolean).join(", ") || "なし"} と Playwright の既定）`,
    "npx playwright install chromium\n" +
      "        # 別の場所にあるなら PLAYWRIGHT_CHROMIUM=/path/to/chromium",
  );
}

/* 4. 配信サーバー --------------------------------------------------------- */
const server = await detectServer();
if (server) {
  ok("配信サーバー", `${server.base}（${server.kind}）`);
} else {
  fail(
    "配信サーバー",
    `どこにも応答が無い（探した先: ${SERVER_CANDIDATES.join(", ")}）`,
    "npx wrangler dev --port 8788        # 本番と同じ配信（推奨）\n" +
      "        # wrangler が使えない環境（ネットワーク制限など）では:\n" +
      "        python3 -m http.server 8787 --directory public\n" +
      "        # ただし _headers のCSPは適用されない。詳細は AI-VERIFICATION.md",
  );
}

/* 5. アプリ本体のソース（あれば根拠として使う） --------------------------- */
const appDir = findAppDir();
if (appDir) {
  ok("アプリ本体のソース", appDir);
} else {
  warn(
    "アプリ本体のソース",
    `ローカルに無い（探した場所: ${APP_DIR_CANDIDATES.filter(Boolean).join(", ")}）`,
    "撮影と測定はこのままでもできる。ただし「実機の正解」を確認できないので、\n" +
      "        画面再現図の色・寸法・文言を変える作業は根拠なしに進めないこと。\n" +
      "        用意する方法:\n" +
      "          NIARIM_APP_DIR=/path/to/niarim   # 既にどこかにある場合\n" +
      "          gh repo clone sakurasemaika-creator/NIARIM /tmp/niarim\n" +
      "          # 上記が使えない場合は、参照したいファイルを利用者に依頼する",
  );
}

/* 6. 出力先 --------------------------------------------------------------- */
try {
  fs.mkdirSync(path.join(ROOT, "artifacts/shots"), { recursive: true });
  ok("出力先", "artifacts/shots/（.gitignore 済み）");
} catch (e) {
  fail("出力先", String(e.message), "artifacts/ に書き込める権限を確認する");
}

/* 7. git の作業ブランチ --------------------------------------------------- */
try {
  const branch = execSync("git rev-parse --abbrev-ref HEAD", {
    cwd: ROOT,
    encoding: "utf8",
  }).trim();
  if (branch === "dev_branch") ok("作業ブランチ", branch);
  else
    warn(
      "作業ブランチ",
      `${branch}（デプロイされるのは dev_branch）`,
      "git switch dev_branch",
    );
} catch {
  warn("作業ブランチ", "git リポジトリとして読めない", "");
}

/* 出力 -------------------------------------------------------------------- */
const mark = { ok: "  OK ", warn: "WARN ", fail: "NG   " };
console.log("");
for (const r of results) {
  console.log(`${mark[r.level]} ${r.name}: ${r.detail}`);
  if (r.fix) console.log(`        → ${r.fix}`);
}

const failed = results.filter((r) => r.level === "fail");
const warned = results.filter((r) => r.level === "warn");
console.log("");
if (failed.length) {
  console.log(
    `撮影に必要なものが ${failed.length} 件足りない。上の「→」を実行してから、` +
      `もう一度 node tools/verify-env.mjs を走らせること。`,
  );
  process.exit(1);
}
console.log(
  warned.length
    ? `撮影はできる。ただし警告 ${warned.length} 件（上記）を読んでから進めること。`
    : "すべて揃っている。node tools/shot.mjs で撮影できる。",
);
