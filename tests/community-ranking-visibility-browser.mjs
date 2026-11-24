import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";
import assert from "node:assert/strict";

const base = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const ids = ["aaaaaaaaaaa", "bbbbbbbbbbb", "ccccccccccc"];
const available = new Map(ids.map((id) => [id, true]));
let checks = 0;
let rankingReads = 0;
const app = await chromium.launch(launchOptions());
try {
  const page = await app.newPage({
    viewport: { width: 390, height: 844 },
    locale: "ja-JP",
  });
  await page.route("**/api/community?**", async (route) => {
    const query = new URL(route.request().url()).searchParams;
    if (query.has("playbackId")) {
      checks++;
      const id = query.get("playbackId");
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: available.get(id) === true ? "available" : "private",
        }),
      });
    }
    if (query.get("view") === "daily") {
      rankingReads++;
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          metric: "periodBookmarks",
          works: ids
            .filter((id) => available.get(id) === true)
            .map((id, i) => ({
              workId: id,
              title: "Artwork " + id,
              channelName: "Creator " + id,
              bookmarkCount: 100 - i,
              repostCount: 5 - i,
              periodBookmarkCount: 10 - i,
              thumbnailUrl: "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg",
              youtubeUrl: "https://www.youtube.com/watch?v=" + id,
            })),
        }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ works: [], unavailableReason: null }),
    });
  });
  await page.route("https://i.ytimg.com/**", (route) =>
    route.fulfill({ status: 404, body: "" }),
  );
  await page.goto(base + "/community/?lang=ja", {
    waitUntil: "domcontentloaded",
  });
  await page.locator('[data-community-tab="daily"]').click();
  await page.waitForFunction(
    () =>
      document.querySelectorAll("[data-community-gallery] .community-card")
        .length === 3,
  );
  assert.deepEqual(
    await page.locator(".community-card .rank-badge").allTextContents(),
    ["1", "2", "3"],
  );
  assert.deepEqual(
    await page
      .locator(".community-card")
      .first()
      .locator(".community-counts span")
      .allTextContents(),
    ["ブックマーク: 100", "リポスト: 5", "期間内ブックマーク: 10"],
  );
  assert.equal(checks, 0, "A ranking fetch must not trigger a playback check");
  // Cards rendered by a tab switch are shown, not left at the reveal
  // animation's opacity 0 (only the first render used to be revealed). The
  // tabs now sit right under the page's opening lines, so the cards start
  // below a phone's first screen: bring them into view as a visitor would.
  await page.locator("[data-community-gallery]").scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    [
      ...document.querySelectorAll("[data-community-gallery] .community-card"),
    ].every((card) => getComputedStyle(card).opacity === "1"),
  );

  // An already-displayed work becomes private. Resuming fetches an entirely
  // new public-only order, with no placeholder and no extra visibility request.
  available.set(ids[1], false);
  await page.evaluate(() =>
    document.dispatchEvent(new Event("visibilitychange")),
  );
  await page.waitForFunction(
    () =>
      document.querySelectorAll("[data-community-gallery] .community-card")
        .length === 2,
  );
  assert.deepEqual(
    await page.locator(".community-card .rank-badge").allTextContents(),
    ["1", "2"],
  );
  assert.equal(await page.locator(".community-card--unavailable").count(), 0);
  assert.ok(
    !(await page.locator("[data-community-gallery]").innerText()).includes(
      ids[1],
    ),
  );
  assert.equal(checks, 0);

  // If another work becomes private between refresh and opening, a single
  // live playback check blocks opening and refreshes the compact order.
  available.set(ids[0], false);
  await page.locator(".community-card").first().click();
  await page.waitForFunction(
    () =>
      document.querySelectorAll("[data-community-gallery] .community-card")
        .length === 1,
  );
  assert.deepEqual(
    await page.locator(".community-card .rank-badge").allTextContents(),
    ["1"],
  );
  assert.ok(
    !(await page.locator("[data-community-gallery]").innerText()).includes(
      ids[0],
    ),
  );
  assert.equal(checks, 1);
  assert.equal(rankingReads, 3);
  console.log("Community compact ranking and privacy browser checks passed", {
    rankingReads,
    checks,
    visible: 1,
  });
} finally {
  await app.close();
}
