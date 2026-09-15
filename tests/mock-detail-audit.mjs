import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const languages = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"];
const viewports = [
  { name: "sp360", width: 360, height: 800 },
  { name: "sp390", width: 390, height: 844 },
  { name: "pc", width: 1440, height: 1000 },
];
const failures = [];

const browser = await chromium.launch(launchOptions());
for (const viewport of viewports) {
  for (const language of languages) {
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    for (const route of ["/", "/features/"]) {
      await page.goto(baseURL + route, { waitUntil: "networkidle" });
      await page.evaluate((lang) => {
        window.NIARIM_I18N?.applyLang?.(lang, { persist: false });
      }, language);
      await page.waitForTimeout(250);

      const state = await page.evaluate(() => {
        const rawRect = (el) => {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return {
            left: r.left,
            right: r.right,
            top: r.top,
            bottom: r.bottom,
            width: r.width,
            height: r.height,
            centerX: r.left + r.width / 2,
          };
        };
        const fitOf = (el) => {
          const host = el?.closest(
            ".feature-diagram, .fd-app-screen, .fd-route-screen",
          );
          const v = host
            ? parseFloat(getComputedStyle(host).getPropertyValue("--fd-fit"))
            : NaN;
          return Number.isFinite(v) && v > 0 ? v : 1;
        };
        const unfit = (r, f) =>
          r
            ? Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v / f]))
            : null;
        const strips = [
          ...document.querySelectorAll(".fd-frame-strip-scroll"),
        ].map((strip) => {
          const fit = fitOf(strip);
          const rect = (el) => unfit(rawRect(el), fit);
          const sr = rect(strip);
          const current = strip.querySelector(
            ".fd-frame-thumb.is-current, .fd-frame-thumb.is-selected, .fd-frame.is-current, .fd-frame.is-active",
          );
          const cr = rect(current);
          const cursor = strip.querySelector(":scope > .fd-frame-cursor");
          const cursorRect = rect(cursor);
          const currentStyle = current ? getComputedStyle(current) : null;
          const after = getComputedStyle(strip, "::after");
          const artwork = [
            ...strip.querySelectorAll(".fd-frame-thumb .fd-art"),
          ];
          return {
            strip: sr,
            current: cr,
            cursor: cursorRect,
            delta: sr && cr ? cr.centerX - sr.centerX : null,
            cursorDelta:
              sr && cursorRect ? cursorRect.centerX - sr.centerX : null,
            currentClass: current?.className || "",
            currentBorderWidth: currentStyle?.borderTopWidth || "",
            pseudoAfterContent: after.content,
            pseudoAfterDisplay: after.display,
            artworkCount: artwork.length,
            visibleArtworkCount: artwork.filter(
              (el) => getComputedStyle(el).visibility !== "hidden",
            ).length,
          };
        });
        const sliders = [
          ...document.querySelectorAll(
            ".feature-diagram .fd-slider, .feature-diagram .fd-sheet-slider, .feature-diagram .fd-mini-slider",
          ),
        ].map((el) => {
          const fit = fitOf(el);
          const r = unfit(rawRect(el), fit);
          const fill = el.querySelector("span, i");
          const fr = unfit(rawRect(fill), fit);
          const cs = getComputedStyle(el);
          const fcs = fill ? getComputedStyle(fill) : null;
          const host = el.closest(".feature-diagram");
          const hcs = host ? getComputedStyle(host) : null;
          return {
            className: el.className,
            height: r?.height || 0,
            fillHeight: fr?.height || 0,
            fillColor: fcs?.backgroundColor || "",
            accent: hcs?.getPropertyValue("--fd-accent").trim() || "",
            overflow: cs.overflow,
          };
        });
        const mocks = [
          ...document.querySelectorAll(".screenshot-card, .feature-section"),
        ]
          .map((root) => {
            const surface = root.querySelector(
              ".feature-diagram, .fd-app-screen, .fd-route-screen",
            );
            if (!surface) return null;
            const cs = getComputedStyle(surface);
            const bezel =
              cs.getPropertyValue("--fd-bezel").trim() ||
              getComputedStyle(root).getPropertyValue("--fd-bezel").trim();
            return {
              id: root.id || root.getAttribute("data-mock-theme") || "",
              bezel,
              accent: cs.getPropertyValue("--fd-accent").trim(),
              borderColor: cs.borderTopColor,
              overflow: cs.overflow,
            };
          })
          .filter(Boolean);
        const themeRoots = [
          ...document.querySelectorAll("[data-mock-theme], .feature-section"),
        ].filter((root) => {
          const parent = root.parentElement?.closest(
            "[data-mock-theme], .feature-section",
          );
          return (
            !parent &&
            root.querySelector(
              ".feature-diagram, .fd-app-screen, .fd-route-screen",
            )
          );
        });
        const themes = themeRoots.map((root) => {
          const surface = root.matches(
            ".feature-diagram, .fd-app-screen, .fd-route-screen",
          )
            ? root
            : root.querySelector(
                ".feature-diagram, .fd-app-screen, .fd-route-screen",
              );
          const cs = getComputedStyle(surface);
          const rootStyle = getComputedStyle(root);
          return {
            id:
              root.getAttribute("data-mock-theme") || root.id || root.className,
            accent: cs.getPropertyValue("--fd-accent").trim(),
            bezel:
              cs.getPropertyValue("--fd-bezel").trim() ||
              rootStyle.getPropertyValue("--fd-bezel").trim(),
          };
        });
        const screens = [
          ...document.querySelectorAll(".fd-app-screen, .fd-route-screen"),
        ].map((screen) => {
          const before = getComputedStyle(screen, "::before");
          return {
            className: screen.className,
            beforeContent: before.content,
            beforeDisplay: before.display,
          };
        });
        const hero = document.querySelector(
          ".hero-visual.fd-canvas-screen.fd-app-screen",
        );
        const heroRect = hero ? rawRect(hero) : null;
        const heroArt = hero?.querySelector(".fd-app-canvas-stage .fd-art");
        const heroStyle = hero ? getComputedStyle(hero) : null;
        const scroller = document.querySelector(".screenshot-scroller");
        const cards = scroller
          ? [...scroller.querySelectorAll(":scope > .screenshot-card")]
          : [];
        return {
          width: document.documentElement.clientWidth,
          scrollWidth: Math.max(
            document.documentElement.scrollWidth,
            document.body?.scrollWidth || 0,
          ),
          strips,
          sliders,
          mocks,
          themes,
          screens,
          hero: hero
            ? {
                ratio: heroRect.width / heroRect.height,
                artworkVisible:
                  Boolean(heroArt) &&
                  getComputedStyle(heroArt).visibility !== "hidden",
                accent: heroStyle.getPropertyValue("--fd-accent").trim(),
                bezel: heroStyle.getPropertyValue("--fd-bezel").trim(),
                borderColor: heroStyle.borderTopColor,
              }
            : null,
          galleryCount: cards.length,
        };
      });

      const id = `${viewport.name}/${language}${route}`;
      if (state.scrollWidth > state.width + 2) {
        failures.push({ id, kind: "horizontal-overflow", state });
      }
      for (const strip of state.strips) {
        if (strip.current && Math.abs(strip.delta) > 2) {
          failures.push({ id, kind: "current-frame-not-centered", strip });
        }
        if (
          strip.current &&
          (Math.abs(strip.current.width - 50) > 1.5 ||
            Math.abs(strip.current.height - 50) > 1.5)
        ) {
          failures.push({ id, kind: "current-frame-not-50x50", strip });
        }
        if (strip.cursor && Math.abs(strip.cursorDelta) > 2) {
          failures.push({ id, kind: "frame-cursor-not-centered", strip });
        }
        if (strip.cursor && parseFloat(strip.currentBorderWidth || "0") > 1.5) {
          failures.push({ id, kind: "double-current-frame-border", strip });
        }
        if (
          strip.pseudoAfterDisplay !== "none" &&
          strip.pseudoAfterContent !== "none" &&
          strip.pseudoAfterContent !== "normal"
        ) {
          failures.push({
            id,
            kind: "legacy-pseudo-frame-marker-active",
            strip,
          });
        }
        if (strip.artworkCount > 0 && strip.visibleArtworkCount === 0) {
          failures.push({ id, kind: "frame-preview-artwork-hidden", strip });
        }
      }
      for (const slider of state.sliders) {
        if (slider.height && Math.abs(slider.height - 4) > 1) {
          failures.push({ id, kind: "slider-height", slider });
        }
        if (
          slider.fillHeight &&
          Math.abs(slider.fillHeight - slider.height) > 1
        ) {
          failures.push({ id, kind: "slider-fill-height", slider });
        }
      }
      for (const mock of state.mocks) {
        if (!mock.accent)
          failures.push({ id, kind: "mock-accent-missing", mock });
        if (!mock.bezel)
          failures.push({ id, kind: "mock-bezel-missing", mock });
        if (!mock.borderColor)
          failures.push({ id, kind: "mock-bezel-border-missing", mock });
      }
      const themedAccents = state.themes
        .map((theme) => theme.accent)
        .filter(Boolean);
      if (new Set(themedAccents).size !== themedAccents.length) {
        failures.push({
          id,
          kind: "duplicate-mock-theme-accent",
          themes: state.themes,
        });
      }
      const themedBezels = state.themes
        .map((theme) => theme.bezel)
        .filter(Boolean);
      if (new Set(themedBezels).size !== themedBezels.length) {
        failures.push({
          id,
          kind: "duplicate-mock-theme-bezel",
          themes: state.themes,
        });
      }
      for (const screen of state.screens) {
        if (
          screen.beforeDisplay !== "none" &&
          screen.beforeContent !== "none" &&
          screen.beforeContent !== "normal"
        ) {
          failures.push({ id, kind: "screen-reproduction-ad-visible", screen });
        }
      }
      if (route === "/") {
        if (!state.hero) {
          failures.push({ id, kind: "hero-screen-missing" });
        } else {
          if (Math.abs(state.hero.ratio - 320 / 569) > 0.03) {
            failures.push({ id, kind: "hero-screen-ratio", hero: state.hero });
          }
          if (!state.hero.artworkVisible) {
            failures.push({
              id,
              kind: "hero-artwork-hidden",
              hero: state.hero,
            });
          }
          if (!state.hero.accent || !state.hero.bezel) {
            failures.push({ id, kind: "hero-theme-missing", hero: state.hero });
          }
        }
        if (state.galleryCount !== 6) {
          failures.push({
            id,
            kind: "gallery-count",
            actual: state.galleryCount,
          });
        }
        const scroller = page.locator(".screenshot-scroller");
        if (await scroller.count()) {
          await scroller.evaluate((el) => {
            el.scrollLeft = el.scrollWidth;
          });
          await page.waitForTimeout(180);
          const end = await page.evaluate(() => {
            const s = document.querySelector(".screenshot-scroller");
            const last = s?.querySelector(
              ":scope > .screenshot-card:last-of-type",
            );
            if (!s || !last) return null;
            const sr = s.getBoundingClientRect();
            const lr = last.getBoundingClientRect();
            return {
              sLeft: sr.left,
              sRight: sr.right,
              lLeft: lr.left,
              lRight: lr.right,
            };
          });
          if (
            end &&
            (end.lLeft < end.sLeft - 2 || end.lRight > end.sRight + 2)
          ) {
            failures.push({ id, kind: "gallery-last-card-clipped", end });
          }
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
      combinations: viewports.length * languages.length * 2,
      checks: [
        "50x50/current center",
        "single frame cursor/no double marker",
        "frame preview artwork visible",
        "slider geometry",
        "unique theme accent/bezel",
        "no ads in screen reproductions",
        "hero screen/theme/artwork",
        "six-card gallery",
        "gallery end visibility",
        "horizontal overflow",
      ],
    },
    null,
    2,
  ),
);
