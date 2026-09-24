import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const widths = [1024, 1180, 1280, 1440, 1920];
const issues = [];
const browser = await chromium.launch(launchOptions);

for (const width of widths) {
  const context = await browser.newContext({
    viewport: { width, height: 1200 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(baseURL + "/", { waitUntil: "networkidle" });
  await page.waitForFunction(
    () =>
      [...document.scripts].some((script) =>
        script.src.includes("/js/user-request-fixes.js"),
      ),
  );
  await page.waitForFunction(
    () => typeof window.__niarimInstallRealAppCaptures === "function",
    null,
    { timeout: 10000 },
  );
  await page.evaluate(() => window.__niarimInstallRealAppCaptures(document));
  await page.waitForFunction(
    () => {
      const expected = [...document.querySelectorAll(".feature-row[data-mock-theme]")]
        .filter((row) => ["row1", "row2", "row3", "row4", "row5"].includes(row.dataset.mockTheme))
        .length;
      return expected > 0 &&
        document.querySelectorAll(".feature-row .real-app-capture").length >= expected;
    },
    null,
    { timeout: 10000 },
  );

  const rows = await page.locator(".feature-row").evaluateAll((nodes) =>
    nodes.map((row) => {
      const copy = row.querySelector(":scope > .feature-copy");
      const media = row.querySelector(":scope > .feature-media");
      const capture = media?.querySelector(".real-app-capture");
      if (!copy || !media || !capture) return null;
      const cr = copy.getBoundingClientRect();
      const mr = media.getBoundingClientRect();
      const rr = capture.getBoundingClientRect();
      return {
        theme: row.getAttribute("data-mock-theme") || "",
        copy: { left: cr.left, right: cr.right, top: cr.top, width: cr.width },
        media: { left: mr.left, right: mr.right, top: mr.top, width: mr.width },
        capture: { left: rr.left, right: rr.right, top: rr.top, width: rr.width },
      };
    }).filter(Boolean),
  );

  for (const row of rows) {
    if (row.media.left < 0 || row.media.right > width + 1)
      issues.push({ width, kind: "home-media-outside", row });
    if (row.capture.left < row.media.left - 2 || row.capture.right > row.media.right + 2)
      issues.push({ width, kind: "home-capture-outside-media", row });
    const mediaCenter = (row.media.left + row.media.right) / 2;
    const captureCenter = (row.capture.left + row.capture.right) / 2;
    if (Math.abs(mediaCenter - captureCenter) > 3)
      issues.push({ width, kind: "home-capture-center-axis-drift", row });
  }
  await context.close();
}

await browser.close();
console.log(JSON.stringify({ widths, issues: issues.length, details: issues }, null, 2));
if (issues.length) process.exit(1);
