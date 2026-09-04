import { chromium } from "playwright";
import fs from "node:fs/promises";

const base = "http://127.0.0.1:8787";
const out = "artifacts/autonomous-browser-audit/ai-trust";
await fs.mkdir(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();

async function setLang(lang) {
  await page.evaluate((value) => {
    window.localStorage.removeItem("niarim_lang");
    if (window.NIARIM_I18N)
      window.NIARIM_I18N.applyLang(value, { persist: false });
  }, lang);
  await page.waitForTimeout(150);
}

async function assertVisible(selector, message) {
  const el = page.locator(selector);
  if (!(await el.count()) || !(await el.first().isVisible()))
    throw new Error(message);
  return el.first();
}

try {
  await page.goto(`${base}/faq/`, { waitUntil: "networkidle" });
  await setLang("ja");
  const faq = await assertVisible(
    "[data-ai-training-faq]",
    "AI training FAQ was not rendered",
  );
  const q = faq.locator(".faq-question");
  await q.click();
  if ((await q.getAttribute("aria-expanded")) !== "true")
    throw new Error("AI training FAQ did not open");
  const jaAnswer = (
    await faq.locator("[data-ai-training-a]").innerText()
  ).trim();
  if (!jaAnswer.includes("生成AI"))
    throw new Error("Japanese AI training FAQ answer is missing expected copy");
  await faq.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `${out}/pc-faq-ai-training-ja-open.png`,
    fullPage: false,
  });

  await setLang("en");
  const enQuestion = (
    await faq.locator("[data-ai-training-q]").innerText()
  ).trim();
  const enAnswer = (
    await faq.locator("[data-ai-training-a]").innerText()
  ).trim();
  if (!enQuestion.includes("AI"))
    throw new Error("English AI training FAQ question did not localize");
  if (!enAnswer.includes("does not use"))
    throw new Error("English AI training FAQ answer did not localize");
  await page.screenshot({
    path: `${out}/pc-faq-ai-training-en-open.png`,
    fullPage: false,
  });

  await page.goto(`${base}/privacy/`, { waitUntil: "networkidle" });
  await setLang("ja");
  const clause = await assertVisible(
    "[data-ai-training-privacy]",
    "AI training privacy clause was not rendered",
  );
  const jaClause = (await clause.innerText()).trim();
  if (!jaClause.includes("機械学習モデル"))
    throw new Error("Japanese privacy AI clause is missing expected text");
  await clause.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `${out}/pc-privacy-ai-training-ja.png`,
    fullPage: false,
  });

  await setLang("en");
  const enClause = (await clause.innerText()).trim();
  const updated = (await page.locator(".updated-at").innerText()).trim();
  if (!enClause.includes("machine-learning models"))
    throw new Error("English privacy AI clause did not localize");
  if (/[ぁ-んァ-ン一-龯]/.test(enClause))
    throw new Error("Japanese text remains in English privacy AI clause");
  if (/[ぁ-んァ-ン一-龯]/.test(updated))
    throw new Error("Japanese text remains in English updated date");
  if (!updated.includes("September 4, 2026"))
    throw new Error(`Unexpected English updated date: ${updated}`);
  await page.screenshot({
    path: `${out}/pc-privacy-ai-training-en.png`,
    fullPage: false,
  });

  for (const lang of ["zh-Hans", "zh-Hant", "ko", "fr", "es"]) {
    await setLang(lang);
    const text = (await clause.innerText()).trim();
    if (!text || text === jaClause || text === enClause)
      throw new Error(
        `${lang}: privacy AI clause did not localize independently`,
      );
  }

  console.log("AI_TRUST_VISUAL_AUDIT_PASS");
} finally {
  await browser.close();
}
