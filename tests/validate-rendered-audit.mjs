import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const reportPath =
  process.env.AUDIT_REPORT || "artifacts/autonomous-browser-audit/report.json";
const report = JSON.parse(await fs.readFile(reportPath, "utf8"));

const knownDeferredRule = "Final download CTA must use brand accent";
const remaining = report.findings.filter(
  (item) =>
    !(
      item.kind === "design-invariant" &&
      item.detail?.rule === knownDeferredRule
    ),
);

if (remaining.length) {
  console.error(
    JSON.stringify(
      {
        validated: false,
        reason: "non-deferred findings remain",
        findings: remaining,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

const viewports = [
  { name: "sp", width: 390, height: 844 },
  { name: "tablet", width: 834, height: 1112 },
  { name: "pc", width: 1440, height: 1000 },
];

const renderedFindings = [];
const browser = await chromium.launch({ headless: true });

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    locale: "ja-JP",
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  await page.goto(baseURL + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";
  });

  const cta = page.locator(".final-cta .btn-primary").first();
  if (!(await cta.count())) {
    renderedFindings.push({
      viewport: vp.name,
      rule: knownDeferredRule,
      reason: "missing",
    });
    await context.close();
    continue;
  }

  await cta.scrollIntoViewIfNeeded();
  await page.waitForTimeout(350);

  const state = await cta.evaluate((el) => {
    const root = getComputedStyle(document.documentElement);
    const probe = document.createElement("i");
    const accentStrong = root.getPropertyValue("--color-accent-strong").trim();
    probe.style.color =
      accentStrong || root.getPropertyValue("--color-accent").trim();
    probe.style.display = "none";
    document.body.appendChild(probe);
    const expected = getComputedStyle(probe).color;
    probe.remove();
    return {
      actual: getComputedStyle(el).backgroundColor,
      expected,
      rect: el.getBoundingClientRect().toJSON(),
    };
  });

  if (state.actual !== state.expected) {
    renderedFindings.push({
      viewport: vp.name,
      rule: knownDeferredRule,
      ...state,
    });
  }

  await context.close();
}

await browser.close();

if (renderedFindings.length) {
  console.error(
    JSON.stringify({ validated: false, renderedFindings }, null, 2),
  );
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      validated: true,
      deferredInitialFindingsIgnored: report.findings.length,
      renderedFinalCta: "contrast-safe CTA accent on sp/tablet/pc",
    },
    null,
    2,
  ),
);
