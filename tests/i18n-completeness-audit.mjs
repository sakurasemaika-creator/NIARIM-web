import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const outFile =
  process.env.I18N_AUDIT_OUT || "artifacts/i18n-completeness-report.json";

const routes = [
  "/",
  "/about/",
  "/features/",
  "/premium/",
  "/community/",
  "/help/",
  "/faq/",
  "/news/",
  "/contact/",
  "/privacy/",
  "/terms/",
  "/404.html",
];
const languages = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
});
const page = await context.newPage();
const findings = [];

function add(route, language, kind, detail) {
  findings.push({ route, language, kind, detail });
}

for (const route of routes) {
  await page.goto(baseURL + route, { waitUntil: "networkidle" });

  for (const language of languages) {
    const state = await page.evaluate((lang) => {
      const dict = window.NIARIM_I18N_DICT || {};
      const table = dict[lang] || {};
      const has = (key) => Object.prototype.hasOwnProperty.call(table, key);
      const requested = new Set();

      document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (key) requested.add(key);
      });
      document.querySelectorAll("[data-i18n-html]").forEach((el) => {
        const key = el.getAttribute("data-i18n-html");
        if (key) requested.add(key);
      });
      document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
        const spec = el.getAttribute("data-i18n-attr") || "";
        spec.split("|").forEach((pair) => {
          const index = pair.indexOf(":");
          if (index > -1) {
            const key = pair.slice(index + 1).trim();
            if (key) requested.add(key);
          }
        });
      });
      const titleKey = document.body?.getAttribute("data-i18n-title");
      const descKey = document.body?.getAttribute("data-i18n-description");
      if (titleKey) requested.add(titleKey);
      if (descKey) requested.add(descKey);

      const missing = [...requested].filter((key) => !has(key)).sort();
      const empty = [...requested]
        .filter((key) => has(key) && String(table[key]).trim() === "")
        .sort();

      if (window.NIARIM_I18N?.applyLang) {
        window.NIARIM_I18N.applyLang(lang, { persist: false });
      }

      return {
        actualLang: document.documentElement.lang,
        requestedCount: requested.size,
        missing,
        empty,
      };
    }, language);

    if (state.actualLang !== language) {
      add(route, language, "language-not-applied", {
        expected: language,
        actual: state.actualLang,
      });
    }
    for (const key of state.missing) add(route, language, "missing-key", key);
    for (const key of state.empty)
      add(route, language, "empty-translation", key);
  }
}

await browser.close();
await fs.mkdir("artifacts", { recursive: true });
const report = {
  generatedAt: new Date().toISOString(),
  checkedRoutes: routes.length,
  checkedLanguages: languages.length,
  checkedCombinations: routes.length * languages.length,
  findings,
  byKind: findings.reduce((acc, item) => {
    acc[item.kind] = (acc[item.kind] || 0) + 1;
    return acc;
  }, {}),
};
await fs.writeFile(outFile, JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    {
      checkedCombinations: report.checkedCombinations,
      findings: findings.length,
      byKind: report.byKind,
    },
    null,
    2,
  ),
);
if (findings.length) process.exitCode = 1;
