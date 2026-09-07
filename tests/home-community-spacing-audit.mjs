import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const widths = [
  320, 360, 375, 390, 430, 520, 559, 560, 600, 640, 641, 700, 759, 760, 900,
  1024, 1280, 1440,
];
const failures = [];

for (const width of widths) {
  await page.setViewportSize({ width, height: 844 });
  await page.goto("http://127.0.0.1:8787/", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  const state = await page.evaluate(() => {
    const rect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        left: r.left,
        right: r.right,
        top: r.top,
        bottom: r.bottom,
        width: r.width,
        height: r.height,
      };
    };

    const heroContainer = document.querySelector(".hero > .container");
    const heroCopy = document.querySelector(".hero-copy");
    const heroShowcase = document.querySelector(".hero-showcase");
    const heroTitle = document.querySelector(".hero-title");
    const heroActions = document.querySelector(".hero-actions");
    const sharedContainer = document.querySelector("main .section .container");
    const scroller = document.querySelector(".screenshot-scroller");
    const communityCard = scroller?.querySelector(".screenshot-card-community");
    const communityScreen = communityCard?.querySelector(
      ".hero-community-mini",
    );
    const cardStyle = communityCard ? getComputedStyle(communityCard) : null;

    return {
      hero: rect(heroContainer),
      copy: rect(heroCopy),
      showcase: rect(heroShowcase),
      title: rect(heroTitle),
      actions: rect(heroActions),
      shared: rect(sharedContainer),
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      screenshotCount:
        scroller?.querySelectorAll(":scope > .screenshot-card").length ?? 0,
      communityCard: rect(communityCard),
      communityScreen: rect(communityScreen),
      communityBorderLeft: cardStyle
        ? parseFloat(cardStyle.borderLeftWidth) || 0
        : 0,
      communityBorderRight: cardStyle
        ? parseFloat(cardStyle.borderRightWidth) || 0
        : 0,
      communityBorderTop: cardStyle
        ? parseFloat(cardStyle.borderTopWidth) || 0
        : 0,
      communityBorderBottom: cardStyle
        ? parseFloat(cardStyle.borderBottomWidth) || 0
        : 0,
      communityTitle:
        communityScreen
          ?.querySelector(".hero-community-appbar > strong")
          ?.textContent?.trim() ?? "",
      communityWorks:
        communityScreen?.querySelectorAll(".hero-community-work").length ?? 0,
    };
  });

  if (!state.hero || !state.shared) {
    failures.push({ width, kind: "missing-container", state });
  } else {
    const leftDelta = Math.abs(state.hero.left - state.shared.left);
    const rightDelta = Math.abs(state.hero.right - state.shared.right);
    if (leftDelta > 1 || rightDelta > 1) {
      failures.push({
        width,
        kind: "hero-gutter-mismatch",
        leftDelta,
        rightDelta,
        hero: state.hero,
        shared: state.shared,
      });
    }
  }

  if (state.scrollWidth > state.clientWidth + 1) {
    failures.push({ width, kind: "horizontal-overflow", state });
  }

  if (width < 760) {
    if (
      state.title &&
      (state.title.left < state.hero.left - 1 ||
        state.title.right > state.hero.right + 1)
    ) {
      failures.push({ width, kind: "hero-title-outside-container", state });
    }
    if (
      state.actions &&
      (state.actions.left < state.hero.left - 1 ||
        state.actions.right > state.hero.right + 1)
    ) {
      failures.push({ width, kind: "hero-actions-outside-container", state });
    }
  }

  /* Compact widths intentionally keep copy and product UI side by side. The
     important invariant there is a real gap between both columns, not vertical
     stacking. */
  if (
    width >= 560 &&
    width <= 640 &&
    state.copy &&
    state.showcase &&
    state.copy.right > state.showcase.left - 1
  ) {
    failures.push({ width, kind: "hero-compact-columns-overlap", state });
  }

  /* 641-759px is the dedicated one-column transition band. */
  if (
    width >= 641 &&
    width < 760 &&
    state.copy &&
    state.showcase &&
    state.showcase.top < state.copy.bottom - 1
  ) {
    failures.push({ width, kind: "hero-transition-column-overlap", state });
  }

  if (
    state.screenshotCount < 7 ||
    !state.communityCard ||
    !state.communityScreen
  ) {
    failures.push({ width, kind: "community-preview-missing", state });
  } else {
    const expectedInnerWidth =
      state.communityCard.width -
      state.communityBorderLeft -
      state.communityBorderRight;
    const expectedInnerHeight =
      state.communityCard.height -
      state.communityBorderTop -
      state.communityBorderBottom;
    const widthDelta = Math.abs(
      expectedInnerWidth - state.communityScreen.width,
    );
    const heightDelta = Math.abs(
      expectedInnerHeight - state.communityScreen.height,
    );
    if (widthDelta > 1 || heightDelta > 1) {
      failures.push({
        width,
        kind: "community-preview-size",
        expectedInnerWidth,
        expectedInnerHeight,
        widthDelta,
        heightDelta,
        card: state.communityCard,
        screen: state.communityScreen,
      });
    }
    if (state.communityTitle !== "作品広場" || state.communityWorks !== 4) {
      failures.push({ width, kind: "community-preview-content", state });
    }
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
      widths,
      checks: [
        "Hero uses the same left/right container gutters as lower Home sections",
        "560-640px compact copy/device columns keep a real horizontal gap",
        "641-759px transition Hero stays non-overlapping and single-column",
        "Hero title and actions stay inside the shared container",
        "No horizontal overflow appears across the full responsive width ladder",
        "App Preview contains the Community reproduction",
        "Community reproduction fills the device content box inside its bezel",
        "Community reproduction contains title and four work cards",
      ],
    },
    null,
    2,
  ),
);
