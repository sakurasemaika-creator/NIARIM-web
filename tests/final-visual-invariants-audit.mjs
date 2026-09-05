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
            centerX: r.left + r.width / 2,
          };
        };
        const themeSurface = (rootEl) =>
          rootEl?.querySelector?.(
            ".feature-diagram, .fd-app-screen, .fd-route-screen",
          ) || rootEl;
        const themeValues = (rootEl) => {
          const surface = themeSurface(rootEl);
          if (!surface) return { accent: "", bezel: "", bg: "" };
          const surfaceStyle = getComputedStyle(surface);
          const rootStyle = rootEl ? getComputedStyle(rootEl) : null;
          return {
            accent: surfaceStyle.getPropertyValue("--fd-accent").trim(),
            bezel:
              surfaceStyle.getPropertyValue("--fd-bezel").trim() ||
              rootStyle?.getPropertyValue("--fd-bezel").trim() ||
              "",
            bg: surfaceStyle.getPropertyValue("--fd-bg").trim(),
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
            ? parseFloat(getComputedStyle(host).getPropertyValue("--fd-fit")) ||
              1
            : 1;
          const r = el.getBoundingClientRect();
          return {
            className: el.className,
            width: r.width / fit,
            height: r.height / fit,
          };
        });
        const frameStrips = [
          ...document.querySelectorAll(".fd-frame-strip-scroll"),
        ].map((strip) => {
          const sr = strip.getBoundingClientRect();
          const current = strip.querySelector(
            ".fd-frame-thumb.is-current, .fd-frame.is-current",
          );
          const cr = current?.getBoundingClientRect();
          return {
            stripCenter: sr.left + sr.width / 2,
            currentCenter: cr ? cr.left + cr.width / 2 : null,
            delta: cr
              ? cr.left + cr.width / 2 - (sr.left + sr.width / 2)
              : null,
          };
        });
        const hero = rect(document.querySelector(".hero-visual"));
        const scroller = document.querySelector(".screenshot-scroller");
        const cards = scroller
          ? [...scroller.querySelectorAll(".screenshot-card")]
          : [];
        const galleryCards = cards.map((card, index) => ({
          index,
          theme: card.getAttribute("data-mock-theme") || "",
          ...themeValues(card),
          rect: rect(card),
        }));
        const featureThemes = [
          ...document.querySelectorAll(
            "#drawing,#animation,#editing,#advanced,#audio,#save,#workspace,#widget,#export",
          ),
        ].map((el) => ({
          id: el.id,
          ...themeValues(el),
        }));
        return {
          accent,
          accentStrong,
          accentStrongDark,
          buttons: buttons.map(({ el, ...rest }) => rest),
          frames,
          frameStrips,
          hero,
          scrollWidth: Math.max(
            document.documentElement.scrollWidth,
            document.body?.scrollWidth || 0,
          ),
          clientWidth: document.documentElement.clientWidth,
          gallery: scroller
            ? {
                count: cards.length,
                cards: galleryCards,
              }
            : null,
          featureThemes,
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
        if (
          button.background !== state.accent ||
          button.border !== state.accent
        ) {
          failures.push({
            id,
            kind: "button-not-theme-accent",
            button,
            accent: state.accent,
          });
        }
      }
      for (const frame of state.frames) {
        if (
          Math.abs(frame.width - 50) > 1.5 ||
          Math.abs(frame.height - 50) > 1.5
        ) {
          failures.push({ id, kind: "frame-not-50x50", frame });
        }
      }
      for (const strip of state.frameStrips) {
        if (strip.currentCenter !== null && Math.abs(strip.delta) > 2) {
          failures.push({ id, kind: "current-frame-not-centered", strip });
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
          failures.push({
            id,
            kind: "gallery-card-count",
            gallery: state.gallery,
          });
        }
        const target = 320 / 569;
        for (const card of state.gallery.cards) {
          if (!card.rect || Math.abs(card.rect.ratio - target) > 0.025) {
            failures.push({ id, kind: "gallery-card-ratio", card, target });
          }
        }
        const populated = state.gallery.cards.filter(
          (card) => card.theme && card.accent && card.bezel,
        );
        if (populated.length !== 6) {
          failures.push({
            id,
            kind: "gallery-theme-missing",
            cards: state.gallery.cards,
          });
        } else {
          const accents = new Set(populated.map((card) => card.accent));
          const bezels = new Set(populated.map((card) => card.bezel));
          if (accents.size !== 6 || bezels.size !== 6) {
            failures.push({
              id,
              kind: "gallery-theme-duplicate",
              cards: populated,
            });
          }
        }

        await page.locator(".screenshot-scroller").evaluate((el) => {
          el.scrollLeft = el.scrollWidth;
        });
        await page.waitForTimeout(160);
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
          (end.lastLeft < end.scrollerLeft - 2 ||
            end.lastRight > end.scrollerRight + 2)
        ) {
          failures.push({ id, kind: "gallery-last-card-clipped", end });
        }
      }

      if (route === "/features/" && state.featureThemes.length) {
        if (state.featureThemes.length !== 9) {
          failures.push({
            id,
            kind: "features-theme-count",
            themes: state.featureThemes,
          });
        }
        const populated = state.featureThemes.filter(
          (theme) => theme.id && theme.accent && theme.bezel && theme.bg,
        );
        if (populated.length !== 9) {
          failures.push({
            id,
            kind: "features-theme-missing",
            themes: state.featureThemes,
          });
        } else {
          const accents = new Set(populated.map((theme) => theme.accent));
          const bezels = new Set(populated.map((theme) => theme.bezel));
          if (accents.size !== 9 || bezels.size !== 9) {
            failures.push({
              id,
              kind: "features-theme-duplicate",
              themes: populated,
            });
          }
        }
      }

      const hoverTargets = page.locator(".btn-primary, .btn-accent");
      const count = await hoverTargets.count();
      for (let i = 0; i < count; i++) {
        const target = hoverTargets.nth(i);
        if (!(await target.isVisible())) continue;
        await target.hover();
        const bg = await target.evaluate(
          (el) => getComputedStyle(el).backgroundColor,
        );
        if (bg !== state.accent) {
          failures.push({
            id,
            kind: "button-hover-not-theme-accent",
            index: i,
            bg,
            accent: state.accent,
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
        "theme-accent-only normal/hover",
        "legacy accent aliases",
        "50x50 frames",
        "current frame centered",
        "hero 320:569 ratio",
        "all six app-preview ratios",
        "six distinct app-preview themes",
        "nine distinct features themes",
        "app preview end visibility",
        "horizontal overflow",
      ],
    },
    null,
    2,
  ),
);
