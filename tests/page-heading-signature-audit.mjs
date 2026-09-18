import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const widths = [320, 390, 560, 760, 1024, 1440];
const routes = [
  ["/about/", ".about-hero"],
  ["/features/", ".features-header"],
  ["/help/", ".help-header"],
  ["/faq/", ".about-hero"],
  ["/news/", ".news-header"],
  ["/privacy/", ".legal-header"],
  ["/terms/", ".legal-header"],
];
const findings = [];
const browser = await chromium.launch(launchOptions());

for (const width of widths) {
  const context = await browser.newContext({
    viewport: { width, height: width <= 560 ? 844 : 1000 },
    locale: "ja-JP",
  });
  const page = await context.newPage();

  for (const [route, selector] of routes) {
    await page.goto(baseURL + route, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const state = await page.evaluate((heroSelector) => {
      const hero = document.querySelector(heroSelector);
      const heroRect = hero?.getBoundingClientRect();
      const heads = [...document.querySelectorAll(".section-head")].map(
        (head) => {
          const r = head.getBoundingClientRect();
          const parent = head.parentElement?.getBoundingClientRect();
          return {
            centerDelta: parent
              ? Math.abs(
                  r.left + r.width / 2 - (parent.left + parent.width / 2),
                )
              : 999,
            textAlign: getComputedStyle(head).textAlign,
          };
        },
      );
      return {
        hero: heroRect
          ? {
              centerDelta: Math.abs(
                heroRect.left +
                  heroRect.width / 2 -
                  document.documentElement.clientWidth / 2,
              ),
              textAlign: getComputedStyle(hero).textAlign,
            }
          : null,
        heads,
      };
    }, selector);
    if (!state.hero) {
      findings.push({ width, route, kind: "missing-page-heading" });
    } else if (
      state.hero.centerDelta > 2 ||
      state.hero.textAlign !== "center"
    ) {
      findings.push({ width, route, kind: "page-heading-not-centered", state });
    }
    state.heads.forEach((head, index) => {
      if (head.centerDelta > 2 || head.textAlign !== "center") {
        findings.push({
          width,
          route,
          kind: "section-heading-not-centered",
          index,
          head,
        });
      }
    });
  }

  await page.goto(baseURL + "/about/", { waitUntil: "networkidle" });
  await page.waitForSelector(".unique-spotlight");
  const about = await page.evaluate(() => ({
    cards: document.querySelectorAll(".unique-spotlight-card").length,
    overflow:
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  }));
  if (about.cards !== 6 || about.overflow > 2) {
    findings.push({
      width,
      route: "/about/",
      kind: "signature-showcase",
      about,
    });
  }

  await page.goto(baseURL + "/features/", { waitUntil: "networkidle" });
  await page.waitForSelector("#advanced .real-app-capture img", { state: "attached" });
  await page.locator("#advanced .real-app-capture img").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const img = document.querySelector("#advanced .real-app-capture img");
    return img?.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
  });
  await page.waitForSelector("#advanced .is-auto-lineart-narrative");
  await page.waitForSelector("#widget .fd-widget-settings-screen");
  const feature = await page.evaluate(() => {
    const capture = document.querySelector("#advanced .real-app-capture img");
    const captureRect = capture.getBoundingClientRect();
    const header = document.querySelector(".features-header");
    const narrative = document.querySelector("#advanced .feature-narrative");
    const blocks = [...(narrative?.children || [])].filter((el) =>
      el.classList.contains("feature-narrative-block"),
    );
    const autoBlock = narrative?.querySelector(".is-auto-lineart-narrative");
    const widget = document.querySelector("#widget .fd-widget-settings-screen");
    const widgetRect = widget.getBoundingClientRect();
    return {
      capture: {
        src: capture?.currentSrc || capture?.src || "",
        width: captureRect.width,
        height: captureRect.height,
        naturalWidth: capture?.naturalWidth || 0,
        naturalHeight: capture?.naturalHeight || 0,
      },
      headerBackground: getComputedStyle(header).backgroundImage,
      autoBlockClass: autoBlock?.className || "",
      autoTitle: autoBlock?.querySelector("h3")?.textContent?.trim() || "",
      autoBody: autoBlock?.querySelector("p")?.textContent?.trim() || "",
      firstHeading: blocks[0]?.querySelector("h3")?.textContent?.trim() || "",
      secondHeading: blocks[1]?.querySelector("h3")?.textContent?.trim() || "",
      thirdHeading: blocks[2]?.querySelector("h3")?.textContent?.trim() || "",
      widgetRatio: widgetRect.width / widgetRect.height,
      widgetSections: widget.querySelectorAll(".fd-widget-section").length,
      overflow:
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    };
  });
  const captureRatio =
    feature.capture.height > 0 ? feature.capture.width / feature.capture.height : 0;
  if (
    !feature.capture.src.includes("/assets/images/app-captures/onion-skin.") ||
    feature.capture.naturalWidth <= 0 ||
    feature.capture.naturalHeight <= 0 ||
    feature.capture.width < 250 ||
    feature.capture.height < 300 ||
    captureRatio > 1 ||
    feature.overflow > 2 ||
    feature.headerBackground !== "none" ||
    !feature.autoBlockClass.includes("feature-narrative-block") ||
    feature.autoTitle !== "自動線画" ||
    !feature.autoBody.includes("ラフの線の中心") ||
    feature.firstHeading !== "いつもの作業を、もっとスムーズに。" ||
    feature.secondHeading !== "自動線画" ||
    feature.thirdHeading !== "早替えツール" ||
    feature.widgetSections !== 3
  ) {
    findings.push({
      width,
      route: "/features/",
      kind: "feature-detail-consistency",
      feature,
      captureRatio,
    });
  }

  await context.close();
}

await browser.close();
console.log(
  JSON.stringify({ findings: findings.length, details: findings }, null, 2),
);
if (findings.length) process.exit(1);
