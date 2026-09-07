import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const languages = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"];
const viewports = [
  { name: "sp360", width: 360, height: 800 },
  { name: "sp390", width: 390, height: 844 },
  { name: "pc", width: 1440, height: 1000 },
];
const routes = ["/", "/features/"];
const failures = [];

const browser = await chromium.launch(launchOptions());

for (const viewport of viewports) {
  for (const language of languages) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();

    for (const route of routes) {
      await page.goto(baseURL + route, { waitUntil: "networkidle" });
      await page.evaluate((lang) => {
        if (window.NIARIM_I18N?.applyLang) {
          window.NIARIM_I18N.applyLang(lang, { persist: false });
        } else {
          document.documentElement.lang = lang;
        }
      }, language);
      await page.waitForTimeout(220);

      const timelines = await page.evaluate(() => {
        const resolve = (value) => {
          const probe = document.createElement("i");
          probe.style.color = value;
          probe.style.display = "none";
          document.body.appendChild(probe);
          const result = getComputedStyle(probe).color;
          probe.remove();
          return result;
        };

        return [...document.querySelectorAll(".fd-timeline-screen")].map(
          (screen, index) => {
            const sr = screen.getBoundingClientRect();
            const currents = [
              ...screen.querySelectorAll(".fd-tl-frame.is-current"),
            ];
            const current = currents[0] || null;
            const cr = current?.getBoundingClientRect();
            const currentStyle = current ? getComputedStyle(current) : null;
            const cursor = screen.querySelector(
              ".fd-timeline-frames > .fd-frame-cursor",
            );
            const cursorStyle = cursor ? getComputedStyle(cursor) : null;
            const screenStyle = getComputedStyle(screen);
            const accentRaw = screenStyle
              .getPropertyValue("--fd-accent")
              .trim();
            const accent = accentRaw ? resolve(accentRaw) : "";

            return {
              index,
              currentCount: currents.length,
              screenCenter: sr.left + sr.width / 2,
              currentCenter: cr ? cr.left + cr.width / 2 : null,
              centerDelta: cr
                ? cr.left + cr.width / 2 - (sr.left + sr.width / 2)
                : null,
              currentBorderColor: currentStyle?.borderTopColor || "",
              currentBorderWidth: currentStyle?.borderTopWidth || "",
              accent,
              cursorPresent: Boolean(cursor),
              cursorDisplay: cursorStyle?.display || "",
              cursorVisibility: cursorStyle?.visibility || "",
            };
          },
        );
      });

      const id = `${viewport.name}/${language}${route}`;
      if (!timelines.length) {
        failures.push({ id, kind: "timeline-mock-missing" });
        continue;
      }

      for (const timeline of timelines) {
        if (timeline.currentCount !== 1) {
          failures.push({ id, kind: "timeline-current-count", timeline });
          continue;
        }
        if (
          timeline.currentCenter === null ||
          Math.abs(timeline.centerDelta) > 2
        ) {
          failures.push({
            id,
            kind: "timeline-current-not-screen-centered",
            timeline,
          });
        }
        if (
          !timeline.accent ||
          timeline.currentBorderColor !== timeline.accent ||
          parseFloat(timeline.currentBorderWidth) < 1.5
        ) {
          failures.push({
            id,
            kind: "timeline-current-theme-border-missing",
            timeline,
          });
        }
        if (
          timeline.cursorPresent &&
          timeline.cursorDisplay !== "none" &&
          timeline.cursorVisibility !== "hidden"
        ) {
          failures.push({
            id,
            kind: "timeline-fixed-cursor-visible",
            timeline,
          });
        }
      }
    }

    await context.close();
  }
}

await browser.close();

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      combinations: routes.length * languages.length * viewports.length,
      checks: [
        "exactly one current timeline frame",
        "current timeline frame centered on app screen",
        "current timeline frame keeps theme accent border",
        "legacy fixed red cursor stays hidden",
      ],
    },
    null,
    2,
  ),
);
