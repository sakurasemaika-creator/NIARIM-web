/* Features: each section's real app captures beside (or below) its text.
 *
 * Every Features section has its text (.feature-narrative), one pair of real
 * app captures (.nr-feature-duo: the phone screen and the PC screen, built by
 * pc-paired-captures.js) and its ruled list (.spec-grid). This audit used to
 * look for .feature-diagram-stack, which the page no longer builds (the pair
 * is formed first), so it measured nothing and passed; it now measures the
 * pair and fails when it finds no sections. It also carries the checks of the
 * retired user-request-screen-mock-consistency-audit that still apply: every
 * capture is the real app screen and has loaded, no hand-drawn screen mock is
 * visible, and no fd.* placeholder token shows on the page.
 */
import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const widths = [390, 768, 1024, 1180, 1280, 1440, 1920];
const issues = [];
const browser = await chromium.launch(launchOptions());

for (const width of widths) {
  const context = await browser.newContext({
    viewport: { width, height: 1200 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(baseURL + "/features/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  // Bring every capture near the viewport so the lazy images load.
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = "auto";
    for (const duo of document.querySelectorAll(".nr-feature-duo")) {
      duo.scrollIntoView({ block: "center" });
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    await Promise.all(
      [...document.querySelectorAll(".nr-feature-duo img")].map((img) =>
        img.complete
          ? 0
          : new Promise((resolve) => {
              img.addEventListener("load", resolve, { once: true });
              img.addEventListener("error", resolve, { once: true });
              setTimeout(resolve, 5000);
            }),
      ),
    );
    window.scrollTo(0, 0);
  });

  const state = await page.evaluate(() => {
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return {
        left: r.left,
        right: r.right,
        top: r.top + scrollY,
        bottom: r.bottom + scrollY,
        width: r.width,
        height: r.height,
      };
    };
    const visible = (el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return (
        cs.display !== "none" &&
        cs.visibility !== "hidden" &&
        r.width > 1 &&
        r.height > 1
      );
    };
    const sections = [...document.querySelectorAll(".feature-section")].map(
      (section) => {
        const narrative = section.querySelector(":scope > .feature-narrative");
        const duo = section.querySelector(":scope > .nr-feature-duo");
        const spec = section.querySelector(":scope > .spec-grid");
        const captures = duo
          ? [...duo.querySelectorAll(":scope > .feature-diagram")]
              .filter(visible)
              .map((el) => {
                const img = el.querySelector("img");
                return {
                  ...box(el),
                  src: img?.currentSrc || img?.src || "",
                  loaded: Boolean(img?.naturalWidth),
                };
              })
          : [];
        return {
          id: section.id,
          column: box(section),
          narrative: narrative && visible(narrative) ? box(narrative) : null,
          duo: duo && visible(duo) ? box(duo) : null,
          spec: spec && visible(spec) ? box(spec) : null,
          captures,
        };
      },
    );
    const mocks = [
      ...document.querySelectorAll(
        ".fd-canvas-screen, .fd-app-screen, .fd-timeline-screen, .fd-topbar",
      ),
    ].filter(visible).length;
    const leaked = /\bfd\.[a-z][\w.]*/i.test(document.body.innerText);
    return {
      sections,
      mocks,
      leaked,
      clientWidth: document.documentElement.clientWidth,
    };
  });

  const fail = (section, kind, detail = {}) =>
    issues.push({ width, section, kind, ...detail });
  const measured = state.sections.filter((s) => s.narrative && s.duo);
  if (measured.length < 9)
    fail("", "sections-not-measured", {
      measured: measured.length,
      ids: state.sections.map((s) => s.id),
    });
  if (state.mocks) fail("", "hand-drawn-mock-visible", { count: state.mocks });
  if (state.leaked) fail("", "fd-token-leaked");

  for (const s of measured) {
    const { narrative, duo, spec, captures } = s;
    if (duo.left < s.column.left - 1 || duo.right > state.clientWidth + 1)
      fail(s.id, "capture-pair-outside-column", { duo, column: s.column });
    if (captures.length !== 2)
      fail(s.id, "capture-pair-incomplete", { count: captures.length });
    for (const c of captures) {
      if (!/\/app-captures\/[\w-]+\.(?:webp|avif)/.test(c.src))
        fail(s.id, "not-a-real-capture", { src: c.src });
      else if (!c.loaded) fail(s.id, "capture-not-loaded", { src: c.src });
      if (c.right > state.clientWidth + 1)
        fail(s.id, "capture-outside-viewport", { capture: c });
    }
    for (let i = 1; i < captures.length; i++) {
      const a = captures[i - 1];
      const b = captures[i];
      const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (ox > 1 && oy > 1)
        fail(s.id, "captures-overlap", { first: a, second: b });
    }
    // Beside the text: the pair starts at the text's top. Otherwise it is
    // stacked and must not overlap the text or the list.
    const beside = duo.left >= narrative.right - 2;
    if (beside) {
      if (Math.abs(duo.top - narrative.top) > 3)
        fail(s.id, "top-axis-drift", { narrative, duo });
      if (spec && spec.top < Math.max(narrative.bottom, duo.bottom) - 1)
        fail(s.id, "list-overlaps-text-or-captures", { spec, narrative, duo });
    } else {
      for (const [name, other] of [
        ["text", narrative],
        ["list", spec],
      ]) {
        if (!other) continue;
        const oy =
          Math.min(other.bottom, duo.bottom) - Math.max(other.top, duo.top);
        if (oy > 1) fail(s.id, `captures-overlap-${name}`, { duo, other });
      }
    }
  }
  await context.close();
}
await browser.close();
console.log(
  JSON.stringify({ widths, issues: issues.length, details: issues }, null, 2),
);
if (issues.length) process.exit(1);
