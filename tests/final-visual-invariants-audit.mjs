import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const languages = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"];
const viewports = [
  { name: "sp", width: 390, height: 844 },
  { name: "pc", width: 1440, height: 1000 },
];
const routes = ["/", "/features/"];
const failures = [];

const browser = await chromium.launch({ headless: true, ...launchOptions });

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
      await page.waitForTimeout(200);

      const state = await page.evaluate(() => {
        const resolve = (value) => {
          const probe = document.createElement("i");
          probe.style.color = value;
          probe.style.display = "none";
          document.body.appendChild(probe);
          const result = getComputedStyle(probe).color;
          probe.remove();
          return result;
        };
        const root = getComputedStyle(document.documentElement);
        const accent = resolve(root.getPropertyValue("--color-accent").trim());
        const accentStrong = resolve(
          root.getPropertyValue("--color-accent-strong").trim(),
        );
        const accentStrongDark = resolve(
          root.getPropertyValue("--color-accent-strong-dark").trim(),
        );
        const rect = (el) => {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return {
            width: r.width,
            height: r.height,
            left: r.left,
            right: r.right,
            top: r.top,
            bottom: r.bottom,
            ratio: r.height ? r.width / r.height : null,
          };
        };
        const buttons = [
          ...document.querySelectorAll(".btn-primary, .btn-accent"),
        ].map((el) => ({
          el,
          text: (el.textContent || "").trim(),
          background: getComputedStyle(el).backgroundColor,
          border: getComputedStyle(el).borderColor,
        }));
        const frames = [
          ...document.querySelectorAll(".fd-frame-thumb, .fd-frame"),
        ].map((el) => {
          const host = el.closest(".fd-app-screen, .fd-route-screen");
          const fit = host
            ? parseFloat(getComputedStyle(host).getPropertyValue("--fd-fit")) || 1
            : 1;
          const r = el.getBoundingClientRect();
          return {
            className: el.className,
            width: r.width / fit,
            height: r.height / fit,
          };
        });
        const hero = rect(document.querySelector(".hero-visual"));
        const scroller = document.querySelector(".screenshot-scroller");
        const cards = scroller
          ? [...scroller.querySelectorAll(".screenshot-card")]
          : [];
        return {
          accent,
          accentStrong,
          accentStrongDark,
          buttons: buttons.map(({ el, ...rest }) => rest),
          frames,
          hero,
          scrollWidth: Math.max(
            document.documentElement.scrollWidth,
            document.body?.scrollWidth || 0,
          ),
          clientWidth: document.documentElement.clientWidth,
          gallery: scroller
            ? {
                count: cards.length,
                first: rect(cards[0]),
                last: rect(cards[cards.length - 1]),
              }
            : null,
        };
      });

      const id = `${viewport.name}/${language}${route}`;
      if (state.scrollWidth > state.clientWidth + 2) {
        failures.push({ id, kind: "horizontal-overflow", state });
      }
      if (
        state.accentStrong !== state.accent ||
        state.accentStrongDark !== state.accent
      ) {
        failures.push({
          id,
          kind: "legacy-accent-alias-not-theme-accent",
          accent: state.accent,
          accentStrong: state.accentStrong,
          accentStrongDark: state.accentStrongDark,
        });
      }
      for (const button of state.buttons) {
        if (button.background !== state.accent || button.border !== state.accent) {
          failures.push({ id, kind: "button-not-theme-accent", button, accent: state.accent });
        }
      }
      for (const frame of state.frames) {
        if (Math.abs(frame.width - 50) > 1.5 || Math.abs(frame.height - 50) > 1.5) {
          failures.push({ id, kind: "frame-not-50x50", frame });
        }
      }
      if (route === "/" && state.hero) {
        const target = 320 / 569;
        if (Math.abs(state.hero.ratio - target) > 0.018) {
          failures.push({ id, kind: "hero-ratio", hero: state.hero, target });
        }
      }
      if (route === "/" && state.gallery) {
        if (state.gallery.count !== 6) {
          failures.push({ id, kind: "gallery-card-count", gallery: state.gallery });
        }
        for (const card of [state.gallery.first, state.gallery.last]) {
          if (!card) continue;
          const target = 320 / 569;
          if (Math.abs(card.ratio - target) > 0.025) {
            failures.push({ id, kind: "gallery-card-ratio", card, target });
          }
        }
        await page.locator(".screenshot-scroller").evaluate((el) => {
          el.scrollLeft = el.scrollWidth;
        });
        await page.waitForTimeout(120);
        const end = await page.evaluate(() => {
          const scroller = document.querySelector(".screenshot-scroller");
          const last = scroller?.querySelector(".screenshot-card:last-of-type");
          if (!scroller || !last) return null;
          const sr = scroller.getBoundingClientRect();
          const lr = last.getBoundingClientRect();
          return {
            scrollerLeft: sr.left,
            scrollerRight: sr.right,
            lastLeft: lr.left,
            lastRight: lr.right,
          };
        });
        if (
          end &&
          (end.lastLeft < end.scrollerLeft - 2 || end.lastRight > end.scrollerRight + 2)
        ) {
          failures.push({ id, kind: "gallery-last-card-clipped", end });
        }
      }

      // Hover must stay on the same theme accent; no darker red variant is allowed.
      const hoverTargets = page.locator(".btn-primary, .btn-accent");
      const count = await hoverTargets.count();
      for (let i = 0; i < count; i++) {
        const target = hoverTargets.nth(i);
        if (!(await target.isVisible())) continue;
        await target.hover();
        const bg = await target.evaluate((el) => getComputedStyle(el).backgroundColor);
        if (bg !== state.accent) {
          failures.push({ id, kind: "button-hover-not-theme-accent", index: i, bg, accent: state.accent });
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
        "theme-accent-only normal/hover",
        "legacy accent aliases",
        "50x50 frames",
        "hero 320:569 ratio",
        "six-card app preview",
        "app preview end visibility",
        "horizontal overflow",
      ],
    },
    null,
    2,
  ),
);
