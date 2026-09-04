import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const outDir =
  process.env.AUDIT_OUT_DIR || "artifacts/multilang-responsive-audit";

const routes = [
  "/",
  "/about/",
  "/features/",
  "/premium/",
  "/community/",
  "/help/",
  "/faq/",
  "/news/",
  "/contact/",
  "/privacy/",
  "/terms/",
  "/404.html",
];

const languages = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"];
const viewports = [
  { name: "sp", width: 390, height: 844 },
  { name: "pc", width: 1440, height: 1000 },
];

const slug = (value) =>
  value.replace(/^\//, "").replace(/[^a-zA-Z0-9_-]+/g, "-") || "home";

await fs.mkdir(outDir, { recursive: true });
const report = {
  generatedAt: new Date().toISOString(),
  baseURL,
  routes,
  languages,
  viewports,
  findings: [],
  measurements: [],
  screenshots: [],
};

const finding = (viewport, language, route, kind, detail) => {
  report.findings.push({ viewport, language, route, kind, detail });
};

async function applyLanguage(page, language) {
  await page.evaluate((lang) => {
    if (window.NIARIM_I18N?.applyLang) {
      window.NIARIM_I18N.applyLang(lang, { persist: false });
    } else {
      document.documentElement.lang = lang;
    }
  }, language);
  await page.waitForTimeout(220);
}

async function inspect(page, viewport, language, route) {
  const state = await page.evaluate(() => {
    const de = document.documentElement;
    const ratio = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        width: r.width,
        height: r.height,
        ratio: r.height ? r.width / r.height : null,
        top: r.top,
        left: r.left,
        right: r.right,
        bottom: r.bottom,
        centerX: r.left + r.width / 2,
      };
    };
    const resolveColor = (value) => {
      const probe = document.createElement("i");
      probe.style.color = value;
      probe.style.display = "none";
      document.body.appendChild(probe);
      const result = getComputedStyle(probe).color;
      probe.remove();
      return result;
    };

    const root = getComputedStyle(document.documentElement);
    const brandAccent = resolveColor(root.getPropertyValue("--color-accent").trim());
    const hero = document.querySelector(".hero-visual");
    const heroTitle = document.querySelector(".hero-title");
    const heroSubtitle = document.querySelector(".hero-subtitle");
    const heroButtons = [...document.querySelectorAll(".hero .hero-actions .btn")].map(
      (el) => ({
        text: (el.textContent || "").trim(),
        rect: ratio(el),
        background: getComputedStyle(el).backgroundColor,
        color: getComputedStyle(el).color,
        primary: el.classList.contains("btn-primary"),
      }),
    );

    const mocks = [...document.querySelectorAll(".fd-app-screen, .fd-route-screen")].map(
      (el) => ({
        className: el.className,
        ...ratio(el),
      }),
    );

    const frameThumbs = [...document.querySelectorAll(".fd-frame-thumb, .fd-frame")].map(
      (el) => ({
        className: el.className,
        width: el.getBoundingClientRect().width,
        height: el.getBoundingClientRect().height,
      }),
    );

    const frameStrips = [...document.querySelectorAll(".fd-frame-strip-scroll")].map(
      (strip) => {
        const sr = strip.getBoundingClientRect();
        const current = strip.querySelector(
          ".fd-frame-thumb.is-current, .fd-frame.is-current",
        );
        const cr = current?.getBoundingClientRect();
        return {
          stripCenter: sr.left + sr.width / 2,
          currentCenter: cr ? cr.left + cr.width / 2 : null,
          delta: cr ? cr.left + cr.width / 2 - (sr.left + sr.width / 2) : null,
        };
      },
    );

    const sliders = [...document.querySelectorAll(".fd-sheet-slider, .fd-mini-slider")].map(
      (el) => {
        const r = el.getBoundingClientRect();
        const fill = el.querySelector("i,span");
        const fr = fill?.getBoundingClientRect();
        return {
          className: el.className,
          width: r.width,
          height: r.height,
          fillHeight: fr?.height || 0,
          fillColor: fill ? getComputedStyle(fill).backgroundColor : null,
        };
      },
    );

    const palette = (selector) =>
      [...document.querySelectorAll(selector)].map((el) => {
        const cs = getComputedStyle(el);
        return {
          id: el.id || el.getAttribute("data-mock-theme") || el.className,
          accent: cs.getPropertyValue("--fd-accent").trim(),
          bezel: cs.getPropertyValue("--fd-bezel").trim(),
          bg: cs.getPropertyValue("--fd-bg").trim(),
        };
      });

    const homeFeaturePalettes = palette(
      '[data-mock-theme="row1"],[data-mock-theme="row2"],[data-mock-theme="row3"],[data-mock-theme="row4"],[data-mock-theme="row5"]',
    );
    const galleryPalettes = palette(".screenshot-card[data-mock-theme]");
    const featurePalettes = palette(
      "#drawing,#animation,#editing,#advanced,#audio,#save,#workspace,#widget,#export",
    );

    const screenshotScroller = document.querySelector(".screenshot-scroller");
    let gallery = null;
    if (screenshotScroller) {
      const cards = [...screenshotScroller.querySelectorAll(".screenshot-card")];
      gallery = {
        cardCount: cards.length,
        clientWidth: screenshotScroller.clientWidth,
        scrollWidth: screenshotScroller.scrollWidth,
        maxScrollLeft:
          screenshotScroller.scrollWidth - screenshotScroller.clientWidth,
        first: ratio(cards[0]),
        last: ratio(cards[cards.length - 1]),
      };
    }

    return {
      lang: document.documentElement.lang,
      viewportWidth: innerWidth,
      documentClientWidth: de.clientWidth,
      documentScrollWidth: Math.max(de.scrollWidth, document.body?.scrollWidth || 0),
      brandAccent,
      hero: ratio(hero),
      heroTitle: ratio(heroTitle),
      heroSubtitle: ratio(heroSubtitle),
      heroButtons,
      mocks,
      frameThumbs,
      frameStrips,
      sliders,
      homeFeaturePalettes,
      galleryPalettes,
      featurePalettes,
      gallery,
    };
  });

  report.measurements.push({ viewport, language, route, ...state });

  if (state.lang !== language) {
    finding(viewport, language, route, "language-not-applied", {
      expected: language,
      actual: state.lang,
    });
  }

  if (state.documentScrollWidth > state.documentClientWidth + 2) {
    finding(viewport, language, route, "horizontal-overflow", {
      clientWidth: state.documentClientWidth,
      scrollWidth: state.documentScrollWidth,
    });
  }

  if (route === "/" && state.hero) {
    const target = 320 / 569;
    if (Math.abs(state.hero.ratio - target) > 0.018) {
      finding(viewport, language, route, "hero-ratio", {
        expected: target,
        actual: state.hero.ratio,
        width: state.hero.width,
        height: state.hero.height,
      });
    }
    if (state.hero.right > state.viewportWidth + 1 || state.hero.left < -1) {
      finding(viewport, language, route, "hero-clipped", state.hero);
    }
  }

  for (const mock of state.mocks) {
    const target = 320 / 569;
    if (mock.width > 0 && mock.height > 0 && Math.abs(mock.ratio - target) > 0.035) {
      finding(viewport, language, route, "mock-ratio", {
        className: mock.className,
        expected: target,
        actual: mock.ratio,
        width: mock.width,
        height: mock.height,
      });
    }
  }

  for (const frame of state.frameThumbs) {
    const isFrameCell = /fd-frame-thumb|fd-frame(?:\s|$)/.test(frame.className);
    if (!isFrameCell) continue;
    if (Math.abs(frame.width - 50) > 1.5 || Math.abs(frame.height - 50) > 1.5) {
      finding(viewport, language, route, "frame-not-50x50", frame);
    }
  }

  for (const strip of state.frameStrips) {
    if (strip.currentCenter !== null && Math.abs(strip.delta) > 2) {
      finding(viewport, language, route, "current-frame-not-centered", strip);
    }
  }

  for (const slider of state.sliders) {
    if (slider.height > 0 && Math.abs(slider.height - 4) > 1) {
      finding(viewport, language, route, "slider-track-height", slider);
    }
    if (slider.fillHeight > 0 && Math.abs(slider.fillHeight - slider.height) > 1) {
      finding(viewport, language, route, "slider-fill-height", slider);
    }
  }

  for (const button of state.heroButtons) {
    if (button.rect?.right > state.viewportWidth + 1 || button.rect?.left < -1) {
      finding(viewport, language, route, "hero-button-clipped", button);
    }
    if (button.primary && button.background !== state.brandAccent) {
      finding(viewport, language, route, "primary-button-not-theme-accent", {
        expected: state.brandAccent,
        actual: button.background,
        text: button.text,
      });
    }
  }

  const assertDistinct = (items, kind) => {
    const populated = items.filter((item) => item.accent && item.bezel && item.bg);
    if (populated.length < 2) return;
    const accents = new Set(populated.map((item) => item.accent));
    const bezels = new Set(populated.map((item) => item.bezel));
    if (accents.size !== populated.length || bezels.size !== populated.length) {
      finding(viewport, language, route, kind, populated);
    }
  };

  if (route === "/") {
    assertDistinct(state.homeFeaturePalettes, "home-feature-palette-duplicate");
    assertDistinct(state.galleryPalettes, "gallery-palette-duplicate");
  }
  if (route === "/features/") {
    assertDistinct(state.featurePalettes, "features-palette-duplicate");
  }

  if (route === "/" && state.gallery?.cardCount) {
    await page.locator(".screenshot-scroller").evaluate((el) => {
      el.scrollLeft = el.scrollWidth;
    });
    await page.waitForTimeout(180);
    const endState = await page.evaluate(() => {
      const scroller = document.querySelector(".screenshot-scroller");
      const cards = scroller
        ? [...scroller.querySelectorAll(".screenshot-card")]
        : [];
      const last = cards[cards.length - 1];
      if (!scroller || !last) return null;
      const sr = scroller.getBoundingClientRect();
      const lr = last.getBoundingClientRect();
      return {
        scrollLeft: scroller.scrollLeft,
        maxScrollLeft: scroller.scrollWidth - scroller.clientWidth,
        scrollerLeft: sr.left,
        scrollerRight: sr.right,
        lastLeft: lr.left,
        lastRight: lr.right,
        lastWidth: lr.width,
      };
    });
    if (endState) {
      if (Math.abs(endState.scrollLeft - endState.maxScrollLeft) > 2) {
        finding(viewport, language, route, "gallery-cannot-reach-end", endState);
      }
      if (
        endState.lastRight > endState.scrollerRight + 2 ||
        endState.lastLeft < endState.scrollerLeft - 2
      ) {
        finding(viewport, language, route, "gallery-last-card-clipped", endState);
      }
    }
  }
}

const browser = await chromium.launch({ headless: true });

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();

  for (const route of routes) {
    for (const language of languages) {
      await page.goto(baseURL + route, { waitUntil: "networkidle" });
      await page.evaluate(() => {
        document.documentElement.style.scrollBehavior = "auto";
        document.body.style.scrollBehavior = "auto";
        scrollTo(0, 0);
      });
      await applyLanguage(page, language);
      await inspect(page, vp.name, language, route);

      const file = path.join(
        outDir,
        `${vp.name}__${language}__${slug(route)}__top.png`,
      );
      await page.screenshot({ path: file, fullPage: false });
      report.screenshots.push(file);

      if (route === "/" || route === "/features/") {
        const full = path.join(
          outDir,
          `${vp.name}__${language}__${slug(route)}__full.png`,
        );
        await page.screenshot({ path: full, fullPage: true });
        report.screenshots.push(full);
      }
    }
  }

  await context.close();
}

await browser.close();
await fs.writeFile(
  path.join(outDir, "report.json"),
  JSON.stringify(report, null, 2),
);

const summary = {
  generatedAt: report.generatedAt,
  checkedCombinations: viewports.length * languages.length * routes.length,
  findings: report.findings.length,
  byKind: report.findings.reduce((acc, item) => {
    acc[item.kind] = (acc[item.kind] || 0) + 1;
    return acc;
  }, {}),
};
await fs.writeFile(
  path.join(outDir, "summary.json"),
  JSON.stringify(summary, null, 2),
);

console.log(JSON.stringify(summary, null, 2));
if (report.findings.length) process.exitCode = 1;
