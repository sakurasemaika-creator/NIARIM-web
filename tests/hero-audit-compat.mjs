import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

export const auditLanguages = [
  "ja",
  "en",
  "zh-Hans",
  "zh-Hant",
  "ko",
  "fr",
  "es",
];

export const auditViewports = [
  { name: "sp360", width: 360, height: 800 },
  { name: "sp390", width: 390, height: 844 },
  { name: "pc", width: 1440, height: 1000 },
];

const ratioTarget = 320 / 569;

const rect = (value) => ({
  width: value.width,
  height: value.height,
  left: value.left,
  right: value.right,
  top: value.top,
  bottom: value.bottom,
  ratio: value.height ? value.width / value.height : null,
  centerX: value.left + value.width / 2,
});

export function isIntentionalHiddenHeroFinding(finding) {
  if (finding?.kind !== "screen-mock") return false;
  const detail = finding.detail || finding;
  const className = String(detail.className || detail.classes || "");
  return (
    className.includes("hero-app-preview-source") &&
    Number(detail.width) < 1 &&
    Number(detail.height) < 1
  );
}

export async function verifyHiddenHeroFindings(findings, baseURL) {
  if (!findings.length) return true;
  const viewportMap = new Map([
    ["sp", { width: 390, height: 844 }],
    ["tablet", { width: 834, height: 1112 }],
    ["pc", { width: 1440, height: 1000 }],
  ]);
  const groups = new Map();
  for (const finding of findings) {
    const key = `${finding.viewport}|${finding.route}`;
    groups.set(key, finding);
  }

  const browser = await chromium.launch(launchOptions());
  try {
    for (const finding of groups.values()) {
      const viewport = viewportMap.get(finding.viewport);
      if (!viewport) return false;
      const context = await browser.newContext({
        viewport,
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      await page.goto(baseURL + finding.route, { waitUntil: "networkidle" });
      await page.waitForTimeout(220);
      const state = await page.evaluate(() =>
        [...document.querySelectorAll(".hero-app-preview-source")]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width < 1 || r.height < 1;
          })
          .map((el) => {
            const card = el.closest(".hero-preview-card");
            const r = card?.getBoundingClientRect();
            const style = card ? getComputedStyle(card) : null;
            return {
              hasCard: Boolean(card),
              cardWidth: r?.width || 0,
              cardHeight: r?.height || 0,
              cardDisplay: style?.display || "",
              cardVisibility: style?.visibility || "",
            };
          }),
      );
      await context.close();
      if (
        !state.length ||
        state.some(
          (item) =>
            !item.hasCard ||
            (item.cardWidth > 0 &&
              item.cardHeight > 0 &&
              item.cardDisplay !== "none" &&
              item.cardVisibility !== "hidden"),
        )
      ) {
        return false;
      }
    }
  } finally {
    await browser.close();
  }
  return true;
}

export async function auditCanonicalHeroRatio(
  baseURL,
  languages = auditLanguages,
  viewports = auditViewports,
) {
  const failures = [];
  const browser = await chromium.launch(launchOptions());
  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      for (const language of languages) {
        await page.goto(baseURL + "/", { waitUntil: "networkidle" });
        await page.evaluate((lang) => {
          window.NIARIM_I18N?.applyLang?.(lang, { persist: false });
          document.documentElement.lang = lang;
        }, language);
        await page.waitForTimeout(180);
        const hero = await page.evaluate(() => {
          const visible = (selector) =>
            [...document.querySelectorAll(selector)].find((el) => {
              const r = el.getBoundingClientRect();
              const cs = getComputedStyle(el);
              return (
                r.width > 0 &&
                r.height > 0 &&
                cs.display !== "none" &&
                cs.visibility !== "hidden"
              );
            });
          const element =
            visible(".hero-preview-card") || visible(".hero-visual");
          if (!element) return null;
          return element.getBoundingClientRect().toJSON();
        });
        const id = `${viewport.name}/${language}/`;
        if (!hero) {
          failures.push({ id, kind: "hero-missing" });
          continue;
        }
        const geometry = rect(hero);
        if (Math.abs(geometry.ratio - ratioTarget) > 0.018) {
          failures.push({
            id,
            kind: "hero-ratio",
            hero: geometry,
            target: ratioTarget,
          });
        }
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }
  return failures;
}
