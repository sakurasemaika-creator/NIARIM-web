/**
 * Playwright の起動オプションを1か所にまとめる。
 *
 * tests/ 以下の監査スクリプトはどれも chromium.launch({ headless: true })
 * だけで起動していたため、Playwright が同梱ブラウザを置く既定の場所に
 * ブラウザが無い環境（このリポジトリの開発環境がそうで、ブラウザは
 * /opt/pw-browsers/chromium にある）では、どのスクリプトも
 * 「Executable doesn't exist」で落ちて `npm run audit:all` が通らなかった。
 *
 * 探す順番:
 *   1. 環境変数 PLAYWRIGHT_CHROMIUM（明示指定を最優先）
 *   2. /opt/pw-browsers/chromium（この開発環境の置き場所）
 *   3. 指定なし＝Playwright の既定（同梱ブラウザを入れてある環境向け）
 *
 * tools/measure-serif-chars.js も同じ考え方で書かれている。
 */
import fs from "node:fs";

const CANDIDATES = [
  process.env.PLAYWRIGHT_CHROMIUM,
  "/opt/pw-browsers/chromium",
];

export function launchOptions(extra = {}) {
  const found = CANDIDATES.find((p) => p && fs.existsSync(p));
  return {
    headless: true,
    ...(found ? { executablePath: found } : {}),
    ...extra,
  };
}
