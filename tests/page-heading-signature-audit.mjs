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
const existingMockAccents = new Set([
  "rgb(255, 123, 57)",
  "rgb(118, 81, 232)",
  "rgb(255, 211, 74)",
  "rgb(47, 142, 234)",
  "rgb(39, 212, 137)",
  "rgb(40, 215, 255)",
  "rgb(49, 87, 217)",
  "rgb(181, 108, 255)",
  "rgb(239, 90, 200)",
  "rgb(255, 159, 47)",
  "rgb(223, 52, 77)",
]);
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
              centerDelta: Math.abs(
                heroRect.left + heroRect.width / 2 - innerWidth / 2,
              ),
              textAlign: getComputedStyle(hero).textAlign,
            }
          : null,
        heads,
      };
    }, selector);

    if (!state.hero) {
      findings.push({ width, route, kind: "missing-page-heading" });
      continue;
    }
    if (state.hero.centerDelta > 2 || state.hero.textAlign !== "center") {
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
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  if (about.cards !== 6 || about.overflow > 2) {
    findings.push({ width, route: "/about/", kind: "signature-showcase", about });
  }

  await page.goto(baseURL + "/features/", { waitUntil: "networkidle" });
  await page.waitForSelector(".autolineart-app-mock");
  const feature = await page.evaluate(() => {
    const mock = document.querySelector(".autolineart-app-mock");
    const rect = mock.getBoundingClientRect();
    const style = getComputedStyle(mock);
    const probe = document.createElement("span");
    probe.style.color = style.getPropertyValue("--al-bezel");
    document.body.appendChild(probe);
    const bezelToken = getComputedStyle(probe).color;
    probe.style.color = style.getPropertyValue("--al-accent");
    const accentToken = getComputedStyle(probe).color;
    probe.remove();
    return {
      mock: Boolean(mock),
      nodes: document.querySelectorAll(".autolineart-node").length,
      controls: document.querySelectorAll(".autolineart-control-row").length,
      ratio: rect.width / rect.height,
      borderColor: style.borderTopColor,
      bezelToken,
      accentToken,
      theme: mock.getAttribute("data-mock-theme"),
      title: document.querySelector(".signature-feature-copy h3")?.textContent || "",
      lead: document.querySelector(".signature-feature-copy > p")?.textContent || "",
      overflow:
        document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  const ratioDelta = Math.abs(feature.ratio - 16 / 9);
  const releaseNoteLanguage = /最新|new auto|new lineart|now lives|added|加わりました/i.test(
    `${feature.title} ${feature.lead}`,
  );
  if (
    !feature.mock ||
    feature.nodes < 5 ||
    feature.controls !== 4 ||
    feature.overflow > 2 ||
    ratioDelta > 0.03 ||
    feature.borderColor !== feature.bezelToken ||
    feature.theme !== "ink" ||
    existingMockAccents.has(feature.accentToken) ||
    releaseNoteLanguage
  ) {
    findings.push({
      width,
      route: "/features/",
      kind: "auto-lineart-showcase",
      feature,
      ratioDelta,
      releaseNoteLanguage,
    });
  }

  await context.close();
}

await browser.close();
console.log(
  JSON.stringify({ findings: findings.length, details: findings }, null, 2),
);
if (findings.length) process.exit(1);
