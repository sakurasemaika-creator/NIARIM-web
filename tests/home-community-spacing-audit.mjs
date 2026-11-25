/* Home: the Work Plaza section (作品広場, #nr-community) at every responsive
 * width.
 *
 * This audit used to measure the old hero (.hero, .hero-copy, .hero-showcase)
 * and a coded "community" mock inside the old screenshot scroller. Both were
 * removed in the 2026-11 redesign: the hero is now .nr-hero (measured by
 * hero-rendered-layout-audit.mjs and home-width-sweep.mjs), and the Work Plaza
 * is shown as its own section with the real app capture. It now checks that
 * section, which is what visitors see:
 *   - the text column and the capture sit inside the shared page column
 *     (.nr-wrap, the same left edge as the sections around it) and never
 *     overlap each other;
 *   - the capture is the real app screen (app-captures/plaza-v5-<lang>…, in the page language), loaded,
 *     drawn at its own aspect ratio and fully inside its frame;
 *   - the space above and below the section is the site's section rhythm, not
 *     a dead band (no more than the largest normal gap between sections);
 *   - no horizontal page scroll.
 */
import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const base = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const browser = await chromium.launch(launchOptions());
const widths = [
  320, 360, 375, 390, 430, 520, 559, 560, 600, 640, 641, 700, 759, 760, 900,
  1024, 1280, 1440, 1920,
];
const langs = (process.env.AUDIT_LANGS || "ja,en,ko").split(",");
const failures = [];

for (const lang of langs) {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    await page.goto(`${base}/?lang=${lang}`, { waitUntil: "networkidle" });
    const section = page.locator("#nr-community");
    await section.scrollIntoViewIfNeeded();
    await page.locator("#nr-community .nr-plaza-capture-image").evaluate(
      (img) =>
        img.complete ||
        new Promise((resolve) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        }),
    );
    await page.waitForTimeout(300);

    const state = await page.evaluate(() => {
      const box = (el) => {
        if (!el) return null;
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
      const section = document.querySelector("#nr-community");
      const wrap = section?.querySelector(".nr-plaza-grid");
      const copy = wrap?.firstElementChild;
      const art = section?.querySelector(".nr-plaza-art");
      const frame = section?.querySelector(".nr-plaza-capture-device");
      const img = section?.querySelector(".nr-plaza-capture-image");
      const sections = [...document.querySelectorAll("main > section")];
      const at = sections.indexOf(section);
      const contentBox = (s) => {
        // The visible content of a section: its descendants with a box.
        let top = Infinity;
        let bottom = -Infinity;
        for (const el of s.querySelectorAll("*")) {
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          if (getComputedStyle(el).visibility === "hidden") continue;
          top = Math.min(top, r.top + scrollY);
          bottom = Math.max(bottom, r.bottom + scrollY);
        }
        return { top, bottom };
      };
      const gaps = [];
      for (let i = 1; i < sections.length; i++)
        gaps.push(
          contentBox(sections[i]).top - contentBox(sections[i - 1]).bottom,
        );
      // A section that is itself the page column (.nr-wrap on the section).
      const neighbour = document.querySelector("main > section.nr-wrap");
      return {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        wrap: box(wrap),
        neighbour: box(neighbour),
        copy: box(copy),
        art: box(art),
        frame: box(frame),
        image: box(img),
        src: img?.currentSrc || "",
        natural: img ? [img.naturalWidth, img.naturalHeight] : null,
        heading: section?.querySelector("h2")?.textContent.trim() || "",
        link: Boolean(section?.querySelector('a[href^="/community/"]')),
        gapAbove: at > 0 ? gaps[at - 1] : null,
        gapBelow: at < gaps.length ? gaps[at] : null,
        otherGaps: gaps.filter((_, i) => i !== at - 1 && i !== at),
      };
    });

    const fail = (kind, detail = {}) =>
      failures.push({ lang, width, kind, ...detail });
    if (!state.wrap || !state.copy || !state.art || !state.image) {
      fail("missing-plaza-section", { state });
      await page.close();
      continue;
    }
    if (state.scrollWidth > state.clientWidth + 1)
      fail("horizontal-overflow", {
        scrollWidth: state.scrollWidth,
        clientWidth: state.clientWidth,
      });
    if (state.neighbour && Math.abs(state.wrap.left - state.neighbour.left) > 1)
      fail("plaza-column-not-aligned", {
        plaza: state.wrap.left,
        page: state.neighbour.left,
      });
    for (const [name, b] of [
      ["copy", state.copy],
      ["art", state.art],
    ])
      if (b.left < state.wrap.left - 1 || b.right > state.wrap.right + 1)
        fail("outside-page-column", { block: name, box: b, wrap: state.wrap });
    const overlapX =
      Math.min(state.copy.right, state.art.right) -
      Math.max(state.copy.left, state.art.left);
    const overlapY =
      Math.min(state.copy.bottom, state.art.bottom) -
      Math.max(state.copy.top, state.art.top);
    if (overlapX > 1 && overlapY > 1)
      fail("copy-and-capture-overlap", { overlapX, overlapY });
    if (!new RegExp(`/app-captures/plaza-v5-${lang}\\.webp`).test(state.src))
      fail("not-the-real-capture", { src: state.src });
    if (!state.natural || !state.natural[0])
      fail("capture-not-loaded", { src: state.src });
    else {
      const drawn = state.image.width / state.image.height;
      const own = state.natural[0] / state.natural[1];
      if (Math.abs(drawn - own) / own > 0.02)
        fail("capture-distorted", { drawn, own });
    }
    if (
      state.frame &&
      (state.image.left < state.frame.left - 1 ||
        state.image.right > state.frame.right + 1 ||
        state.image.top < state.frame.top - 1 ||
        state.image.bottom > state.frame.bottom + 1)
    )
      fail("capture-outside-frame", {
        image: state.image,
        frame: state.frame,
      });
    if (state.image.right > state.clientWidth + 1 || state.image.left < -1)
      fail("capture-outside-viewport", { image: state.image });
    if (!state.heading || !state.link)
      fail("missing-heading-or-link", {
        heading: state.heading,
        link: state.link,
      });
    const normal = Math.max(...state.otherGaps);
    for (const [where, gap] of [
      ["above", state.gapAbove],
      ["below", state.gapBelow],
    ])
      if (gap !== null && gap > normal + 2)
        fail("dead-gap", { where, gap, largestOtherGap: normal });
    await page.close();
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
      langs,
      widths,
      checks: [
        "Work Plaza text and capture stay inside the shared page column and never overlap",
        "The capture is the real app screen, loaded, at its own aspect ratio, inside its frame",
        "The gaps above and below the section are no larger than the other section gaps",
        "No horizontal overflow across the responsive width ladder",
      ],
    },
    null,
    2,
  ),
);
