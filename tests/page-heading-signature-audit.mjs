import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
// Page openings are left-aligned editorial headers sharing the content's left
// edge (owner, 2026-11-24: no centred-everything layouts, one header pattern
// for every page). Section headings inside the pages are still centred.
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
      // The page opening shares the left edge of the page's content column
      // (its parent .container), like the home hero.
      const column = hero?.parentElement?.getBoundingClientRect();
      return {
        hero: heroRect
          ? {
              leftDelta: column ? Math.abs(heroRect.left - column.left) : 999,
              textAlign: getComputedStyle(hero).textAlign,
            }
          : null,
        heads,
      };
    }, selector);
    if (!state.hero) {
      findings.push({ width, route, kind: "missing-page-heading" });
    } else if (
      // The features index heading still opens its section centred.
      selector === ".features-header"
        ? state.hero.textAlign !== "center"
        : state.hero.leftDelta > 2 ||
          !["left", "start"].includes(state.hero.textAlign)
    ) {
      findings.push({ width, route, kind: "page-heading-not-aligned", state });
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
  // "What you can do in NIARIM" is one short section of the page itself that
  // points to the home page's featured tools and the Features page.
  await page.waitForSelector("[data-about-unique-section]");
  const about = await page.evaluate(() => ({
    sections: document.querySelectorAll("[data-about-unique-section]").length,
    links: [
      ...document.querySelectorAll("[data-about-unique-section] a[href]"),
    ].map((a) => a.getAttribute("href")),
    overflow:
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  }));
  if (
    about.sections !== 1 ||
    !about.links.includes("/#tp-unique-title") ||
    !about.links.includes("/features/") ||
    about.overflow > 2
  ) {
    findings.push({
      width,
      route: "/about/",
      kind: "signature-showcase",
      about,
    });
  }

  await page.goto(baseURL + "/features/", { waitUntil: "networkidle" });
  // Install real captures deterministically. The production installer is
  // deferred through lang-flag.js, which can race under a heavily loaded CI
  // runner even though the rendered page itself is healthy.
  await page.waitForSelector("#advanced");
  await page.waitForFunction(
    () => typeof window.__niarimInstallRealAppCaptures === "function",
    null,
    { timeout: 10000 },
  );
  await page.evaluate(() => window.__niarimInstallRealAppCaptures(document));
  await page.waitForSelector("#advanced .real-app-capture img", {
    state: "attached",
    timeout: 10000,
  });
  // The phone capture and its paired PC capture.
  await page
    .locator("#advanced .real-app-capture img")
    .first()
    .scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const img = document.querySelector("#advanced .real-app-capture img");
    return img?.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
  });
  await page.waitForSelector("#advanced .is-auto-lineart-narrative");
  // The widget section shows the real app capture of the widget settings
  // (the drawn widget tiles were replaced by it).
  await page.waitForSelector('#widget img[src*="/app-captures/widget."]', {
    state: "attached",
  });
  const feature = await page.evaluate(() => {
    const capture = document.querySelector("#advanced .real-app-capture img");
    const captureRect = capture.getBoundingClientRect();
    const header = document.querySelector(".features-header");
    const narrative = document.querySelector("#advanced .feature-narrative");
    const blocks = [...(narrative?.children || [])].filter((el) =>
      el.classList.contains("feature-narrative-block"),
    );
    const autoBlock = narrative?.querySelector(".is-auto-lineart-narrative");
    const widget = document.querySelector(
      '#widget img[src*="/app-captures/widget."]',
    );
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
      widgetCaptureLoaded: Boolean(widget),
      overflow:
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    };
  });
  const captureRatio =
    feature.capture.height > 0
      ? feature.capture.width / feature.capture.height
      : 0;
  if (
    !feature.capture.src.includes("/assets/images/app-captures/onion-skin.") ||
    feature.capture.naturalWidth <= 0 ||
    feature.capture.naturalHeight <= 0 ||
    // The phone capture sits beside its paired PC capture (the gallery shows
    // both), so it takes about a quarter of the width, at least 200px wide.
    feature.capture.width < Math.min(200, width * 0.25) ||
    feature.capture.height < Math.min(200, width * 0.25) * 1.5 ||
    captureRatio > 1 ||
    feature.overflow > 2 ||
    feature.headerBackground !== "none" ||
    !feature.autoBlockClass.includes("feature-narrative-block") ||
    feature.autoTitle !== "自動線画" ||
    !feature.autoBody.includes("ラフの線の中心") ||
    feature.firstHeading !== "よく使う操作のまとめ方" ||
    feature.secondHeading !== "自動線画" ||
    feature.thirdHeading !== "早替えツール" ||
    !feature.widgetCaptureLoaded
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
