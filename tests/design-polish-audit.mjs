import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const widths = [
  320, 360, 375, 390, 430, 480, 520, 559, 560, 600, 640, 641, 700, 759, 760,
  834, 900, 1024, 1180, 1280, 1366, 1440, 1600, 1920,
];

const findings = [];
const browser = await chromium.launch(launchOptions());

for (const width of widths) {
  const height =
    width <= 430 ? 844 : width <= 759 ? 900 : width <= 1024 ? 1112 : 1000;
  const context = await browser.newContext({
    viewport: { width, height },
    locale: "ja-JP",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(baseURL + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";
  });

  const state = await page.evaluate(() => {
    const rows = [...document.querySelectorAll(".feature-row")].map(
      (el, index) => {
        const cs = getComputedStyle(el);
        return {
          index,
          paddingLeft: parseFloat(cs.paddingLeft),
          paddingRight: parseFloat(cs.paddingRight),
          radius: parseFloat(cs.borderTopLeftRadius),
          background: cs.backgroundColor,
        };
      },
    );

    const cards = [
      ...document.querySelectorAll(".screenshot-scroller .screenshot-card"),
    ].map((el, index) => {
      const cs = getComputedStyle(el);
      const child = el.firstElementChild;
      const childCs = child ? getComputedStyle(child) : null;
      const rect = el.getBoundingClientRect();
      return {
        index,
        radius: parseFloat(cs.borderTopLeftRadius),
        overflow: cs.overflow,
        ratio: rect.width / rect.height,
        childRadius: childCs ? parseFloat(childCs.borderTopLeftRadius) : null,
      };
    });

    const body = getComputedStyle(document.body);
    const footer = document.querySelector(".site-footer");
    const footerCs = footer ? getComputedStyle(footer) : null;
    const finalCta = document.querySelector(".final-cta");
    const finalCtaCs = finalCta ? getComputedStyle(finalCta) : null;
    return {
      rows,
      cards,
      bodyBackgroundImage: body.backgroundImage,
      footerBackgroundImage: footerCs?.backgroundImage || null,
      finalCta: finalCta
        ? {
            paddingLeft: parseFloat(finalCtaCs.paddingLeft),
            paddingRight: parseFloat(finalCtaCs.paddingRight),
            radius: parseFloat(finalCtaCs.borderTopLeftRadius),
            width: finalCta.getBoundingClientRect().width,
          }
        : null,
      pageOverflow:
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    };
  });

  const minInlinePadding = width <= 640 ? 16 : 24;
  state.rows.forEach((row) => {
    if (
      row.paddingLeft < minInlinePadding ||
      row.paddingRight < minInlinePadding
    ) {
      findings.push({ width, kind: "feature-padding", row });
    }
    if (row.radius < 16)
      findings.push({ width, kind: "feature-radius", row });
  });

  state.cards.forEach((card) => {
    if (card.radius < 14)
      findings.push({ width, kind: "screenshot-radius", card });
    if (!["hidden", "clip"].includes(card.overflow))
      findings.push({ width, kind: "screenshot-clipping", card });
    if (Math.abs(card.ratio - 9 / 16) > 0.035)
      findings.push({ width, kind: "screenshot-ratio", card });
    if (card.index >= 2 && card.childRadius !== null && card.childRadius < 10) {
      findings.push({ width, kind: "screenshot-inner-radius", card });
    }
  });

  if (!state.bodyBackgroundImage || state.bodyBackgroundImage === "none") {
    findings.push({
      width,
      kind: "background-depth",
      actual: state.bodyBackgroundImage,
    });
  }
  if (state.footerBackgroundImage && state.footerBackgroundImage !== "none") {
    findings.push({
      width,
      kind: "footer-gradient-regression",
      actual: state.footerBackgroundImage,
    });
  }
  if (state.finalCta) {
    const minCtaPadding = width <= 640 ? 20 : 28;
    if (
      state.finalCta.paddingLeft < minCtaPadding ||
      state.finalCta.paddingRight < minCtaPadding
    ) {
      findings.push({ width, kind: "final-cta-padding", cta: state.finalCta });
    }
    if (state.finalCta.radius < 16) {
      findings.push({ width, kind: "final-cta-radius", cta: state.finalCta });
    }
  }
  if (state.pageOverflow > 2)
    findings.push({
      width,
      kind: "horizontal-overflow",
      amount: state.pageOverflow,
    });

  // The feature index is a persistent orientation aid. A later polish layer must not
  // accidentally downgrade it from sticky to relative/static just to position decoration.
  await page.goto(baseURL + "/features/", { waitUntil: "networkidle" });
  const featureNav = await page.evaluate(() => {
    const nav = document.querySelector(".feature-nav");
    if (!nav) return null;
    const cs = getComputedStyle(nav);
    const after = getComputedStyle(nav, "::after");
    return {
      position: cs.position,
      top: cs.top,
      overflowX: cs.overflowX,
      fadeContent: after.content,
      fadePointerEvents: after.pointerEvents,
    };
  });

  if (!featureNav) {
    findings.push({ width, kind: "feature-nav-missing" });
  } else {
    if (featureNav.position !== "sticky") {
      findings.push({
        width,
        kind: "feature-nav-not-sticky",
        actual: featureNav.position,
      });
    }
    if (width <= 640) {
      if (!["auto", "scroll"].includes(featureNav.overflowX)) {
        findings.push({
          width,
          kind: "feature-nav-not-scrollable",
          actual: featureNav.overflowX,
        });
      }
      if (
        featureNav.fadeContent === "none" ||
        featureNav.fadeContent === "normal"
      ) {
        findings.push({ width, kind: "feature-nav-scroll-cue-missing" });
      }
      if (featureNav.fadePointerEvents !== "none") {
        findings.push({
          width,
          kind: "feature-nav-scroll-cue-blocks-input",
          actual: featureNav.fadePointerEvents,
        });
      }
    }
  }

  await context.close();
}

await browser.close();

console.log(
  JSON.stringify(
    {
      auditedWidths: widths,
      designPolishFindings: findings.length,
      findings,
    },
    null,
    2,
  ),
);
if (findings.length) process.exit(1);
