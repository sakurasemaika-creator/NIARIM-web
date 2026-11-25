/**
 * The home page's first view at every width from 320 to 1920px: the hero
 * (wordmark, the plain sentence of what NIARIM is, the actions and the
 * release line on the left; the real app on an upright phone on the right,
 * or under the copy on narrow screens) and the frame strip of the bouncing
 * ball below it.
 *
 * At each width it checks that nothing scrolls sideways, that the hero's text
 * and actions stay inside the viewport, that the phone capture has loaded at
 * the capture's own 320:569 ratio, that the phone sits beside the copy without
 * overlapping it (or under it when the columns stack), and that the frame
 * strip starts below the copy and covers neither the copy nor the phone.
 * Screenshots and metrics go to
 * artifacts/autonomous-browser-audit/home-width-sweep.
 */
import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";
import fs from "node:fs/promises";
import path from "node:path";

const base = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const widths = [
  320, 360, 390, 414, 480, 560, 600, 640, 700, 760, 820, 900, 1024, 1100, 1280,
  1366, 1440, 1600, 1920,
];
const height = 800;
const tolerance = 1.5;
const ratioTarget = 320 / 569;
const outDir = path.resolve(
  "artifacts/autonomous-browser-audit/home-width-sweep",
);
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch(launchOptions());
const metrics = [];
const failures = [];

for (const width of widths) {
  const context = await browser.newContext({
    viewport: { width, height },
    locale: "ja-JP",
  });
  const page = await context.newPage();
  await page.goto(base + "/?lang=ja", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(
    () => {
      const img = document.querySelector(
        ".nr-hero-phone:not(.nr-hero-phone--side) img",
      );
      return img?.complete && img.naturalWidth > 0;
    },
    null,
    { timeout: 10000 },
  );

  const row = await page.evaluate(() => {
    const rect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const round = (v) => Math.round(v * 10) / 10;
      return {
        left: round(r.left),
        top: round(r.top + scrollY),
        right: round(r.right),
        bottom: round(r.bottom + scrollY),
        width: round(r.width),
        height: round(r.height),
      };
    };
    const img = document.querySelector(
      ".nr-hero-phone:not(.nr-hero-phone--side) img",
    );
    const parts = [
      ".nr-hero-wordmark",
      ".nr-hero-concept",
      ".nr-hero-strap",
      ".nr-hero-lead",
      ".nr-store-row",
      ".nr-store-notice",
    ].map((selector) => [selector, rect(document.querySelector(selector))]);
    return {
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      copy: rect(document.querySelector(".nr-hero-copy")),
      phone: rect(
        document.querySelector(".nr-hero-phone:not(.nr-hero-phone--side)"),
      ),
      capture: rect(img),
      natural: img ? [img.naturalWidth, img.naturalHeight] : null,
      strip: rect(document.querySelector(".nr-frames")),
      parts: Object.fromEntries(parts),
    };
  });
  metrics.push(row);
  const fail = (kind, detail) => failures.push({ width, kind, ...detail });

  if (row.scrollWidth > row.width + 1)
    fail("horizontal-scroll", { scrollWidth: row.scrollWidth });
  for (const [selector, box] of Object.entries(row.parts)) {
    if (!box) fail("missing-hero-part", { selector });
    else if (box.left < -tolerance || box.right > row.width + tolerance)
      fail("hero-part-outside-viewport", { selector, box });
  }
  if (!row.capture || !row.natural?.[0]) {
    fail("phone-capture-not-loaded", {});
  } else {
    const ratio = row.capture.width / row.capture.height;
    if (Math.abs(ratio - ratioTarget) > 0.02)
      fail("phone-capture-ratio", { ratio });
    if (row.capture.left < -tolerance || row.capture.right > row.width + 1)
      fail("phone-outside-viewport", { capture: row.capture });
  }
  if (row.copy && row.phone) {
    const sideBySide = row.phone.left >= row.copy.right - tolerance;
    const stacked = row.phone.top >= row.copy.bottom - tolerance;
    if (!sideBySide && !stacked)
      fail("phone-overlaps-copy", { copy: row.copy, phone: row.phone });
  }
  // The strip follows the copy; on narrow screens the phone comes after the
  // strip (the animation shows within the first screen), on wide ones it is
  // beside the copy. None of the three may cover another.
  const overlap = (a, b) =>
    a &&
    b &&
    a.left < b.right - tolerance &&
    b.left < a.right - tolerance &&
    a.top < b.bottom - tolerance &&
    b.top < a.bottom - tolerance;
  if (!row.strip) fail("missing-frame-strip", {});
  else {
    if (row.strip.top < row.copy.bottom - tolerance)
      fail("frame-strip-over-copy", { strip: row.strip, copy: row.copy });
    if (overlap(row.strip, row.phone))
      fail("frame-strip-over-phone", { strip: row.strip, phone: row.phone });
  }

  await page.screenshot({
    path: path.join(outDir, `home-${width}x${height}.png`),
    fullPage: false,
  });
  await context.close();
}

await fs.writeFile(
  path.join(outDir, "metrics.json"),
  JSON.stringify(metrics, null, 2) + "\n",
);
await browser.close();

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exitCode = 1;
} else {
  console.log(
    JSON.stringify(
      {
        ok: true,
        widths: widths.length,
        checks: [
          "no horizontal scroll",
          "wordmark, sentence, lead, actions and release line inside the viewport",
          "phone capture loaded at 320:569",
          "phone beside the copy or under it, never over it",
          "frame strip below the copy, clear of the phone",
        ],
      },
      null,
      2,
    ),
  );
}
