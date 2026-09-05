import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";
import fs from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const outDir =
  process.env.AUDIT_SCREENSHOT_DIR || "artifacts/final-visual-screenshots";
const languages = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"];
const viewports = [
  { name: "sp360", width: 360, height: 800 },
  { name: "sp390", width: 390, height: 844 },
  { name: "tablet", width: 834, height: 1112 },
  { name: "pc", width: 1440, height: 1000 },
];
const routes = [
  { path: "/", name: "home" },
  { path: "/features/", name: "features" },
];
const featureIds = [
  "drawing",
  "animation",
  "editing",
  "advanced",
  "audio",
  "save",
  "workspace",
  "widget",
  "export",
];

await fs.mkdir(outDir, { recursive: true });
const browser = await chromium.launch(launchOptions());
const manifest = [];
const failures = [];

const pushScreenshot = async (locator, filePath) => {
  if (!(await locator.count())) return;
  await locator.first().screenshot({ path: filePath });
  manifest.push(filePath);
};

for (const viewport of viewports) {
  for (const language of languages) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();

    for (const route of routes) {
      await page.goto(baseURL + route.path, { waitUntil: "networkidle" });
      await page.evaluate((lang) => {
        if (window.NIARIM_I18N?.applyLang) {
          window.NIARIM_I18N.applyLang(lang, { persist: false });
        } else {
          document.documentElement.lang = lang;
        }
        document.documentElement.style.scrollBehavior = "auto";
        document.body.style.scrollBehavior = "auto";
      }, language);
      await page.waitForTimeout(220);

      const baseName = `${viewport.name}__${language}__${route.name}`;
      const fullPath = path.join(outDir, `${baseName}__full.png`);
      await page.screenshot({ path: fullPath, fullPage: true });
      manifest.push(fullPath);

      const state = await page.evaluate(() => {
        const de = document.documentElement;
        const clipped = [
          ...document.querySelectorAll(
            ".hero-visual, .feature-section > .feature-diagram, .feature-section > .fd-app-screen, .feature-section > .fd-route-screen",
          ),
        ]
          .map((el) => {
            const r = el.getBoundingClientRect();
            return {
              className: el.className,
              left: r.left,
              right: r.right,
              top: r.top,
              bottom: r.bottom,
              width: r.width,
              height: r.height,
            };
          })
          .filter((r) => r.left < -2 || r.right > innerWidth + 2);
        return {
          lang: de.lang,
          clientWidth: de.clientWidth,
          scrollWidth: Math.max(
            de.scrollWidth,
            document.body?.scrollWidth || 0,
          ),
          clipped,
        };
      });

      if (state.lang !== language)
        failures.push({
          viewport: viewport.name,
          language,
          route: route.path,
          kind: "language-not-applied",
          state,
        });
      if (state.scrollWidth > state.clientWidth + 2)
        failures.push({
          viewport: viewport.name,
          language,
          route: route.path,
          kind: "horizontal-overflow",
          state,
        });
      if (state.clipped.length)
        failures.push({
          viewport: viewport.name,
          language,
          route: route.path,
          kind: "mock-or-hero-clipped",
          clipped: state.clipped,
        });

      if (route.path === "/") {
        await pushScreenshot(
          page.locator(".hero"),
          path.join(outDir, `${baseName}__hero.png`),
        );

        const scroller = page.locator(".screenshot-scroller").first();
        if (await scroller.count()) {
          await scroller.evaluate((el) => {
            el.scrollLeft = 0;
          });
          await page.waitForTimeout(120);
          await pushScreenshot(
            scroller,
            path.join(outDir, `${baseName}__gallery-start.png`),
          );

          const cards = page.locator(".screenshot-scroller > .screenshot-card");
          const cardCount = await cards.count();
          if (cardCount !== 6)
            failures.push({
              viewport: viewport.name,
              language,
              route: route.path,
              kind: "gallery-card-count",
              actual: cardCount,
            });
          for (let i = 0; i < cardCount; i += 1) {
            const card = cards.nth(i);
            await card.scrollIntoViewIfNeeded();
            await page.waitForTimeout(80);
            await pushScreenshot(
              card,
              path.join(outDir, `${baseName}__gallery-card-${i + 1}.png`),
            );
          }

          await scroller.evaluate((el) => {
            el.scrollLeft = el.scrollWidth;
          });
          await page.waitForTimeout(180);
          await pushScreenshot(
            scroller,
            path.join(outDir, `${baseName}__gallery-end.png`),
          );

          const endState = await scroller.evaluate((el) => {
            const last = el.querySelector(".screenshot-card:last-of-type");
            if (!last) return null;
            const sr = el.getBoundingClientRect();
            const lr = last.getBoundingClientRect();
            return {
              scrollerLeft: sr.left,
              scrollerRight: sr.right,
              lastLeft: lr.left,
              lastRight: lr.right,
            };
          });
          if (
            endState &&
            (endState.lastLeft < endState.scrollerLeft - 2 ||
              endState.lastRight > endState.scrollerRight + 2)
          ) {
            failures.push({
              viewport: viewport.name,
              language,
              route: route.path,
              kind: "gallery-last-card-clipped",
              endState,
            });
          }
        }
      }

      if (route.path === "/features/") {
        for (const id of featureIds) {
          const section = page.locator(`#${id}`).first();
          if (!(await section.count())) {
            failures.push({
              viewport: viewport.name,
              language,
              route: route.path,
              kind: "feature-section-missing",
              id,
            });
            continue;
          }
          await section.scrollIntoViewIfNeeded();
          await page.waitForTimeout(100);
          await pushScreenshot(
            section,
            path.join(outDir, `${baseName}__feature-${id}.png`),
          );

          const featureState = await section.evaluate((root) => {
            const surface = root.querySelector(
              ".feature-diagram, .fd-app-screen, .fd-route-screen",
            );
            if (!surface) return { missingSurface: true };
            const sr = surface.getBoundingClientRect();
            const descendants = [...surface.querySelectorAll("*")]
              .filter((el) => {
                const cs = getComputedStyle(el);
                if (cs.display === "none" || cs.visibility === "hidden")
                  return false;
                const r = el.getBoundingClientRect();
                return (
                  r.width > 1 &&
                  r.height > 1 &&
                  (r.left < sr.left - 2 ||
                    r.right > sr.right + 2 ||
                    r.top < sr.top - 2 ||
                    r.bottom > sr.bottom + 2)
                );
              })
              .slice(0, 20)
              .map((el) => {
                const r = el.getBoundingClientRect();
                return {
                  className: el.className,
                  text: (el.textContent || "").trim().slice(0, 80),
                  left: r.left,
                  right: r.right,
                  top: r.top,
                  bottom: r.bottom,
                };
              });
            return { missingSurface: false, descendants };
          });
          if (featureState.missingSurface) {
            failures.push({
              viewport: viewport.name,
              language,
              route: route.path,
              kind: "feature-surface-missing",
              id,
            });
          } else if (featureState.descendants.length) {
            failures.push({
              viewport: viewport.name,
              language,
              route: route.path,
              kind: "feature-internal-overflow",
              id,
              descendants: featureState.descendants,
            });
          }
        }
      }
    }

    await context.close();
  }
}

await browser.close();
await fs.writeFile(
  path.join(outDir, "manifest.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      baseURL,
      screenshots: manifest,
      failures,
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    { screenshots: manifest.length, failures: failures.length, outDir },
    null,
    2,
  ),
);
if (failures.length) process.exitCode = 1;
