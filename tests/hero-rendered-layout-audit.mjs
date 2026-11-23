import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const widths = [
  320, 390, 559, 560, 733, 759, 760, 1023, 1024, 1280, 1440, 1920,
];
const issues = [];
const browser = await chromium.launch(launchOptions());

for (const width of widths) {
  const context = await browser.newContext({
    viewport: { width, height: 1000 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(baseURL + "/", { waitUntil: "networkidle" });
  // The home rebuilt on 2026-11-09 (ea80ca47) names its parts .nr-hero,
  // .nr-hero-grid, .nr-hero-showcase and #nr-hero-title.
  const rebuilt = (await page.locator(".nr-hero").count()) > 0;
  const names = rebuilt
    ? {
        section: ".nr-hero",
        container: ":scope > .nr-hero-grid",
        copy: ".nr-hero-copy",
        visual: ".nr-hero-showcase",
        title: "#nr-hero-title",
      }
    : {
        section: ".hero",
        container: ":scope > .container",
        copy: ".hero-copy",
        visual: ".hero-visual, .hero-showcase",
        title: ".hero-title",
      };
  const hero = await page
    .locator(names.section)
    .first()
    .evaluate((el, names) => {
      const rect = (node) => {
        const r = node?.getBoundingClientRect();
        return r
          ? {
              left: r.left,
              right: r.right,
              top: r.top,
              bottom: r.bottom,
              width: r.width,
              height: r.height,
            }
          : null;
      };
      const cs = getComputedStyle(el);
      return {
        hero: rect(el),
        container: rect(el.querySelector(names.container)),
        copy: rect(el.querySelector(names.copy)),
        visual: rect(el.querySelector(names.visual)),
        title: rect(el.querySelector(names.title)),
        backgroundImage: cs.backgroundImage,
        backgroundColor: cs.backgroundColor,
      };
    }, names);
  for (const [name, box] of Object.entries({
    container: hero.container,
    visual: hero.visual,
    title: hero.title,
  })) {
    if (!box || box.width < 1 || box.height < 1)
      issues.push({ width, kind: "hero-missing-geometry", name, hero });
    else if (box.left < -1 || box.right > width + 1)
      issues.push({ width, kind: "hero-horizontal-overflow", name, box });
  }
  if (hero.visual && hero.visual.top < hero.hero.top - 1)
    issues.push({ width, kind: "hero-visual-above-section", hero });
  if (hero.visual && hero.visual.bottom > hero.hero.bottom + 2)
    issues.push({ width, kind: "hero-visual-below-section", hero });
  await context.close();
}
await browser.close();
console.log(
  JSON.stringify({ widths, issues: issues.length, details: issues }, null, 2),
);
if (issues.length) process.exit(1);
