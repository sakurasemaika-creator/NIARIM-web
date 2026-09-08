import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const widths = [320, 390, 560, 760, 1024, 1440];
const routes = [
  ["/about/", ".about-hero"],
  ["/features/", ".features-header"],
  ["/help/", ".help-header"],
  ["/faq/", ".faq-header"],
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
      const heads = [...document.querySelectorAll(".section-head")].map((head) => {
        const r = head.getBoundingClientRect();
        const parent = head.parentElement?.getBoundingClientRect();
        return {
          centerDelta: parent
            ? Math.abs(r.left + r.width / 2 - (parent.left + parent.width / 2))
            : 999,
          textAlign: getComputedStyle(head).textAlign,
        };
      });
      return {
        hero: heroRect
          ? {
              centerDelta: Math.abs(heroRect.left + heroRect.width / 2 - innerWidth / 2),
              textAlign: getComputedStyle(hero).textAlign,
            }
          : null,
        heads,
      };
    }, selector);
    if (!state.hero) {
      findings.push({ width, route, kind: "missing-page-heading" });
    } else if (state.hero.centerDelta > 2 || state.hero.textAlign !== "center") {
      findings.push({ width, route, kind: "page-heading-not-centered", state });
    }
    state.heads.forEach((head, index) => {
      if (head.centerDelta > 2 || head.textAlign !== "center") {
        findings.push({ width, route, kind: "section-heading-not-centered", index, head });
      }
    });
  }

  await page.goto(baseURL + "/about/", { waitUntil: "networkidle" });
  await page.waitForSelector(".unique-spotlight");
  const about = await page.evaluate(() => ({
    cards: document.querySelectorAll(".unique-spotlight-card").length,
    overflow:
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  if (about.cards !== 6 || about.overflow > 2) {
    findings.push({ width, route: "/about/", kind: "signature-showcase", about });
  }

  await page.goto(baseURL + "/features/", { waitUntil: "networkidle" });
  await page.waitForSelector(".fd-autolineart-screen");
  await page.waitForSelector("#advanced .is-auto-lineart-narrative");
  await page.waitForSelector("#widget .fd-widget-settings-screen");
  const feature = await page.evaluate(() => {
    const mock = document.querySelector(".fd-autolineart-screen");
    const preview = mock.querySelector(".fd-autolineart-preview");
    const rect = mock.getBoundingClientRect();
    const previewRect = preview.getBoundingClientRect();
    const style = getComputedStyle(mock);
    const header = document.querySelector(".features-header");
    const narrative = document.querySelector("#advanced .feature-narrative");
    const blocks = [...(narrative?.children || [])].filter((el) =>
      el.classList.contains("feature-narrative-block"),
    );
    const autoBlock = narrative?.querySelector(".is-auto-lineart-narrative");
    const special = document.querySelector("#advanced .signature-feature-layout");
    const widget = document.querySelector("#widget .fd-widget-settings-screen");
    const widgetRect = widget.getBoundingClientRect();
    return {
      mock: Boolean(mock),
      nodes: mock.querySelectorAll(".fd-autolineart-node").length,
      controls: mock.querySelectorAll(".fd-autolineart-row").length,
      phoneRatio: rect.width / rect.height,
      previewRatio: previewRect.width / previewRect.height,
      borderColor: style.borderTopColor,
      bezel: style.getPropertyValue("--fd-bezel").trim(),
      accent: style.getPropertyValue("--fd-accent").trim(),
      oldLandscapeVisible: Boolean(
        document.querySelector(".autolineart-app-mock")?.getClientRects().length,
      ),
      specialVisible: Boolean(special?.getClientRects().length),
      headerBackground: getComputedStyle(header).backgroundImage,
      autoBlockClass: autoBlock?.className || "",
      autoTitle: autoBlock?.querySelector("h3")?.textContent?.trim() || "",
      autoBody: autoBlock?.querySelector("p")?.textContent?.trim() || "",
      firstHeading: blocks[0]?.querySelector("h3")?.textContent?.trim() || "",
      secondHeading: blocks[1]?.querySelector("h3")?.textContent?.trim() || "",
      thirdHeading: blocks[2]?.querySelector("h3")?.textContent?.trim() || "",
      promoEyebrows: document.querySelectorAll("#advanced .signature-feature-copy .eyebrow").length,
      promoPoints: document.querySelectorAll("#advanced .signature-feature-point").length,
      widget: {
        ratio: widgetRect.width / widgetRect.height,
        sections: widget.querySelectorAll(".fd-widget-section").length,
        artworkTiles: widget.querySelectorAll(".fd-widget-artwork-tile").length,
        radioRows: widget.querySelectorAll(".fd-widget-radio-row").length,
        selectedRadios: widget.querySelectorAll(".fd-widget-radio.is-selected").length,
        appbarTitle:
          widget.querySelector(".fd-appbar strong")?.textContent?.trim() || "",
        oldFakeStatus: widget.querySelectorAll(".fd-widget-status-card").length,
        oldFakeQuickActions: widget.querySelectorAll(".fd-widget-action-row").length,
      },
      overflow:
        document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  const phoneDelta = Math.abs(feature.phoneRatio - 320 / 569);
  const previewDelta = Math.abs(feature.previewRatio - 16 / 9);
  const widgetPhoneDelta = Math.abs(feature.widget.ratio - 320 / 569);
  if (
    !feature.mock ||
    feature.nodes < 5 ||
    feature.controls !== 4 ||
    feature.overflow > 2 ||
    phoneDelta > 0.03 ||
    previewDelta > 0.03 ||
    feature.oldLandscapeVisible ||
    feature.specialVisible ||
    feature.headerBackground !== "none" ||
    !feature.autoBlockClass.includes("feature-narrative-block") ||
    feature.autoTitle !== "自動線画" ||
    !feature.autoBody.includes("ラフの線の中心") ||
    feature.firstHeading !== "いつもの作業を、もっとスムーズに。" ||
    feature.secondHeading !== "自動線画" ||
    feature.thirdHeading !== "早替えツール" ||
    feature.promoEyebrows !== 0 ||
    feature.promoPoints !== 0 ||
    widgetPhoneDelta > 0.03 ||
    feature.widget.sections !== 3 ||
    feature.widget.artworkTiles !== 1 ||
    feature.widget.radioRows !== 4 ||
    feature.widget.selectedRadios !== 2 ||
    feature.widget.appbarTitle !== "ウィジェット設定" ||
    feature.widget.oldFakeStatus !== 0 ||
    feature.widget.oldFakeQuickActions !== 0
  ) {
    findings.push({
      width,
      route: "/features/",
      kind: "feature-detail-consistency",
      feature,
      phoneDelta,
      previewDelta,
      widgetPhoneDelta,
    });
  }

  await context.close();
}

await browser.close();
console.log(JSON.stringify({ findings: findings.length, details: findings }, null, 2));
if (findings.length) process.exit(1);
