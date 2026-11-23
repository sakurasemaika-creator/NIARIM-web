import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const widths = [1024, 1180, 1280, 1440, 1920];
const issues = [];
const browser = await chromium.launch(launchOptions());

for (const width of widths) {
  const context = await browser.newContext({
    viewport: { width, height: 1200 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(baseURL + "/", { waitUntil: "networkidle" });
  // The home rebuilt on 2026-11-09 (ea80ca47) shows the real captures as
  // phone + PC pairs in #nr-gallery (no mock rows to install captures into).
  if ((await page.locator("#nr-gallery").count()) > 0) {
    const cards = await page.evaluate(async () => {
      const items = [
        ...document.querySelectorAll("#nr-gallery .nr-gallery-item"),
      ];
      const out = [];
      for (const item of items) {
        item.scrollIntoView({ block: "center" });
        const visual = item.querySelector(".nr-gallery-visual");
        const shots = [...item.querySelectorAll(".nr-shot")];
        for (const img of item.querySelectorAll("img"))
          await img.decode().catch(() => {});
        const vr = visual?.getBoundingClientRect();
        const box = (el) => {
          const r = el.getBoundingClientRect();
          return { left: r.left, right: r.right, width: r.width };
        };
        const shotBoxes = shots.map(box);
        out.push({
          name: item.querySelector("[data-capture]")?.dataset.capture || "",
          visual: vr
            ? { left: vr.left, right: vr.right, width: vr.width }
            : null,
          shots: shotBoxes,
          loaded: [...item.querySelectorAll("img")].every(
            (img) => img.complete && img.naturalWidth > 0,
          ),
        });
      }
      return out;
    });
    if (cards.length !== 9)
      issues.push({ width, kind: "home-gallery-count", actual: cards.length });
    for (const card of cards) {
      if (!card.visual || !card.shots.length) {
        issues.push({ width, kind: "home-gallery-capture-missing", card });
        continue;
      }
      if (!card.loaded)
        issues.push({ width, kind: "home-gallery-capture-not-loaded", card });
      if (card.visual.left < 0 || card.visual.right > width + 1)
        issues.push({ width, kind: "home-media-outside", card });
      const left = Math.min(...card.shots.map((shot) => shot.left));
      const right = Math.max(...card.shots.map((shot) => shot.right));
      if (left < card.visual.left - 2 || right > card.visual.right + 2)
        issues.push({ width, kind: "home-capture-outside-media", card });
      const visualCenter = (card.visual.left + card.visual.right) / 2;
      if (Math.abs(visualCenter - (left + right) / 2) > 3)
        issues.push({ width, kind: "home-capture-center-axis-drift", card });
    }
    await context.close();
    continue;
  }
  await page.waitForFunction(() =>
    [...document.scripts].some((script) =>
      script.src.includes("/js/user-request-fixes.js"),
    ),
  );
  await page.waitForFunction(
    () => typeof window.__niarimInstallRealAppCaptures === "function",
    null,
    { timeout: 10000 },
  );
  const installState = await page.evaluate(() => {
    window.__niarimInstallRealAppCaptures(document);
    const rows = [
      ...document.querySelectorAll(".feature-row[data-mock-theme]"),
    ].filter((row) =>
      ["row1", "row2", "row3", "row4", "row5"].includes(row.dataset.mockTheme),
    );
    return {
      expected: rows.length,
      installed: rows.filter((row) => row.querySelector(".real-app-capture"))
        .length,
      missing: rows
        .filter((row) => !row.querySelector(".real-app-capture"))
        .map((row) => row.dataset.mockTheme),
    };
  });
  if (
    installState.expected === 0 ||
    installState.installed !== installState.expected
  ) {
    issues.push({
      width,
      kind: "home-capture-install-incomplete",
      installState,
    });
    await context.close();
    continue;
  }

  const rows = await page.locator(".feature-row").evaluateAll((nodes) =>
    nodes
      .filter((row) =>
        ["row1", "row2", "row3", "row4", "row5"].includes(
          row.dataset.mockTheme,
        ),
      )
      .map((row) => {
        const copy = row.querySelector(":scope > .feature-copy");
        const media = row.querySelector(":scope > .feature-media");
        const capture = media?.querySelector(".real-app-capture");
        if (!copy || !media || !capture) return null;
        const cr = copy.getBoundingClientRect();
        const mr = media.getBoundingClientRect();
        const rr = capture.getBoundingClientRect();
        return {
          theme: row.getAttribute("data-mock-theme") || "",
          copy: {
            left: cr.left,
            right: cr.right,
            top: cr.top,
            width: cr.width,
          },
          media: {
            left: mr.left,
            right: mr.right,
            top: mr.top,
            width: mr.width,
          },
          capture: {
            left: rr.left,
            right: rr.right,
            top: rr.top,
            width: rr.width,
          },
        };
      })
      .filter(Boolean),
  );

  for (const row of rows) {
    if (row.media.left < 0 || row.media.right > width + 1)
      issues.push({ width, kind: "home-media-outside", row });
    if (
      row.capture.left < row.media.left - 2 ||
      row.capture.right > row.media.right + 2
    )
      issues.push({ width, kind: "home-capture-outside-media", row });
    const mediaCenter = (row.media.left + row.media.right) / 2;
    const captureCenter = (row.capture.left + row.capture.right) / 2;
    if (Math.abs(mediaCenter - captureCenter) > 3)
      issues.push({ width, kind: "home-capture-center-axis-drift", row });
  }
  await context.close();
}

await browser.close();
console.log(
  JSON.stringify({ widths, issues: issues.length, details: issues }, null, 2),
);
if (issues.length) process.exit(1);
