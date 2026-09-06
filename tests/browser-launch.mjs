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
 * 3 の場合でもブラウザ本体が未ダウンロードのことがある。そのときの
 * Playwright のエラーは原因が分かりにくいので、requireChromium() で
 * 「npx playwright install chromium を実行する」と直接伝えられるようにした。
 * 別の環境でこの手順書どおりに実行したモデルが、ここで止まったため。
 *
 * tools/measure-serif-chars.js も同じ考え方で書かれている。
 */
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export const CHROMIUM_CANDIDATES = [
  process.env.PLAYWRIGHT_CHROMIUM,
  "/opt/pw-browsers/chromium",
];

/** 明示指定された場所にブラウザがあればそのパス、無ければ null。 */
export function findChromium() {
  const found = CHROMIUM_CANDIDATES.find((p) => p && fs.existsSync(p));
  if (found) return found;
  // Playwright の既定の置き場所に入っているかを、実行せずに確かめる。
  try {
    const { chromium } = require("playwright");
    const p = chromium.executablePath();
    return p && fs.existsSync(p) ? p : null;
  } catch {
    return null;
  }
}

export function chromiumHelp() {
  return (
    "Chromium が見つかりません。\n" +
    "  探した場所: " +
    (CHROMIUM_CANDIDATES.filter(Boolean).join(", ") || "（指定なし）") +
    " と Playwright の既定の置き場所\n" +
    "  次のどちらかで用意してください:\n" +
    "    npx playwright install chromium\n" +
    "    PLAYWRIGHT_CHROMIUM=/path/to/chromium node ...   # 既にどこかにある場合"
  );
}

export function launchOptions(extra = {}) {
  const found = CHROMIUM_CANDIDATES.find((p) => p && fs.existsSync(p));
  return {
    headless: true,
    ...(found ? { executablePath: found } : {}),
    ...extra,
  };
}
