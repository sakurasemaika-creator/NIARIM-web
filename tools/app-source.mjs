/**
 * アプリ本体（NIARIM / Flutter）のソースの場所を見つける。
 *
 * なぜ必要か:
 *   このサイトの画面再現図は、アプリ本体の実装を根拠に作っている
 *   （色・寸法は Widget から、文言は lib/l10n/app_*.arb から取る）。
 *   ところが手順書に開発環境の絶対パス（/home/user/niarim）を直接
 *   書いていたため、別の環境で実行したモデルはそのパスが存在せず
 *   「実機の正解」を確認する手順に進めなかった。
 *
 *   環境変数 NIARIM_APP_DIR を最優先で見て、無ければ思い当たる場所を
 *   順に探す。それでも無ければ null を返し、呼び出し側が
 *   「用意する方法」を案内する。
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const ROOT = path.resolve(import.meta.dirname, "..");

export const APP_DIR_CANDIDATES = [
  process.env.NIARIM_APP_DIR,
  path.resolve(ROOT, "../niarim"),
  path.resolve(ROOT, "../NIARIM"),
  path.join(os.homedir(), "niarim"),
  path.join(os.homedir(), "NIARIM"),
  "/home/user/niarim",
  "/tmp/niarim",
].filter(Boolean);

/** それらしいディレクトリか（lib/l10n/app_ja.arb があるか）で判定する。 */
function looksLikeApp(dir) {
  try {
    return fs.existsSync(path.join(dir, "lib/l10n/app_ja.arb"));
  } catch {
    return false;
  }
}

/** アプリ本体のソースのルートを返す。見つからなければ null。 */
export function findAppDir() {
  return APP_DIR_CANDIDATES.find(looksLikeApp) || null;
}

/**
 * app_<lang>.arb から文言を引く。
 * 7言語ぶんまとめて取れるので、図の文言を自分で訳さずに済む。
 *
 *   import { arbStrings } from "./tools/app-source.mjs";
 *   arbStrings("themeSettingsTitle");
 *   // { ja: "テーマ・外観", en: "Theme & Appearance", ... }
 */
export const ARB_LANGS = {
  ja: "app_ja.arb",
  en: "app_en.arb",
  "zh-Hans": "app_zh.arb",
  "zh-Hant": "app_zh_Hant.arb",
  ko: "app_ko.arb",
  fr: "app_fr.arb",
  es: "app_es.arb",
};

export function arbStrings(key, appDir = findAppDir()) {
  if (!appDir) throw new Error(appSourceHelp());
  const out = {};
  for (const [lang, file] of Object.entries(ARB_LANGS)) {
    const p = path.join(appDir, "lib/l10n", file);
    if (!fs.existsSync(p)) {
      out[lang] = null;
      continue;
    }
    const dict = JSON.parse(fs.readFileSync(p, "utf8"));
    out[lang] = Object.prototype.hasOwnProperty.call(dict, key)
      ? dict[key]
      : null;
  }
  return out;
}

export function appSourceHelp() {
  return (
    "アプリ本体（NIARIM）のソースが見つかりません。\n" +
    "  探した場所: " +
    APP_DIR_CANDIDATES.join(", ") +
    "\n" +
    "  用意する方法（どれか1つ）:\n" +
    "    NIARIM_APP_DIR=/path/to/niarim node ...   # 既にどこかにある場合\n" +
    "    gh repo clone sakurasemaika-creator/NIARIM /tmp/niarim\n" +
    "    # クローンできない環境では、参照したいファイルの中身を利用者に依頼する\n" +
    "  ソースが無いまま、画面再現図の色・寸法・文言を推測で変えないこと。"
  );
}
