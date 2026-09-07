import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const widths = [390, 760, 1280, 1440];
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
    const sharedContainer = document.querySelector("main .section .container");
    const scroller = document.querySelector(".screenshot-scroller");
    const communityCard = scroller?.querySelector(".screenshot-card-community");
    const communityScreen = communityCard?.querySelector(".hero-community-mini");

    return {
      hero: rect(heroContainer),
      shared: rect(sharedContainer),
      screenshotCount: scroller?.querySelectorAll(":scope > .screenshot-card").length ?? 0,
      communityCard: rect(communityCard),
      communityScreen: rect(communityScreen),
      communityTitle:
        communityScreen?.querySelector(".hero-community-appbar > strong")?.textContent?.trim() ?? "",
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

  if (state.screenshotCount < 7 || !state.communityCard || !state.communityScreen) {
    failures.push({ width, kind: "community-preview-missing", state });
  } else {
    const widthDelta = Math.abs(state.communityCard.width - state.communityScreen.width);
    const heightDelta = Math.abs(state.communityCard.height - state.communityScreen.height);
    if (widthDelta > 11 || heightDelta > 11) {
      failures.push({
        width,
        kind: "community-preview-size",
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
        "App Preview contains the Community reproduction",
        "Community reproduction fills its preview device",
        "Community reproduction contains title and four work cards",
      ],
    },
    null,
    2,
  ),
);
