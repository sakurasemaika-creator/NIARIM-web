import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const cases = [
  { locale: "ja-JP", expected: "ja" },
  { locale: "en-US", expected: "en" },
  { locale: "zh-CN", expected: "zh-Hans" },
  { locale: "zh-TW", expected: "zh-Hant" },
  { locale: "ko-KR", expected: "ko" },
  { locale: "fr-FR", expected: "fr" },
  { locale: "es-ES", expected: "es" },
  { locale: "de-DE", expected: "en" },
];

const findings = [];
const browser = await chromium.launch(launchOptions());

for (const test of cases) {
  const context = await browser.newContext({ locale: test.locale });
  const page = await context.newPage();
  await page.goto(baseURL + "/", { waitUntil: "networkidle" });
  const actual = await page.evaluate(() => document.documentElement.lang);
  if (actual !== test.expected) {
    findings.push({
      kind: "locale-detection",
      locale: test.locale,
      expected: test.expected,
      actual,
    });
  }
  await context.close();
}

// navigator.languages の2番目以降も候補として使うことを確認する。
{
  const context = await browser.newContext({ locale: "de-DE" });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "languages", {
      configurable: true,
      get: () => ["de-DE", "fr-FR", "en-US"],
    });
  });
  const page = await context.newPage();
  await page.goto(baseURL + "/", { waitUntil: "networkidle" });
  const actual = await page.evaluate(() => document.documentElement.lang);
  if (actual !== "fr") {
    findings.push({
      kind: "language-priority-list",
      languages: ["de-DE", "fr-FR", "en-US"],
      expected: "fr",
      actual,
    });
  }
  await context.close();
}

// 既存の言語切替で明示的に選んだ値はブラウザ自動判定より優先される。
{
  const context = await browser.newContext({ locale: "de-DE" });
  const page = await context.newPage();
  await page.goto(baseURL + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.setItem("niarim_lang", "ja"));
  await page.reload({ waitUntil: "networkidle" });
  const actual = await page.evaluate(() => document.documentElement.lang);
  if (actual !== "ja") {
    findings.push({ kind: "manual-language-priority", expected: "ja", actual });
  }
  await context.close();
}

await browser.close();

console.log(
  JSON.stringify(
    { findings: findings.length, cases: cases.length + 2, details: findings },
    null,
    2,
  ),
);
if (findings.length) process.exitCode = 1;
