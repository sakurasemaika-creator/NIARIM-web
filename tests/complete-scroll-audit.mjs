import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";
import fs from "node:fs/promises";
import path from "node:path";
import pngjs from "pngjs";

const { PNG } = pngjs;
const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const outDir = "artifacts/autonomous-browser-audit/complete-scroll";
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
const viewports = [
  { name: "sp", width: 390, height: 844 },
  { name: "tablet", width: 834, height: 1112 },
  { name: "pc", width: 1440, height: 1000 },
];
await fs.mkdir(outDir, { recursive: true });
const findings = [];
let screenshots = 0;
const slug = (s) =>
  s.replace(/^\//, "").replace(/[^a-zA-Z0-9_-]+/g, "-") || "home";

async function verifyRevealObservers(page) {
  // A coarse 70%-viewport sweep can jump completely over a short reveal/grid. Real users
  // continuously scroll, so after the screenshot sweep directly bring any still-pending
  // layout-visible targets into view and only report them if IntersectionObserver still
  // fails to reveal them. This keeps the audit strict without treating synthetic jumps as
  // production bugs.
  // Element handles are snapshotted first because successful reveals immediately disappear
  // from the `.reveal:not(.is-visible)` locator; iterating a live locator by index could skip
  // every other target as that result set shrinks.
  const revealTargets = await page
    .locator(".reveal:not(.is-visible)")
    .filter({ visible: true })
    .elementHandles();
  for (const target of revealTargets) {
    await target.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(180);
  }

  const staggerGrids = await page
    .locator(".stagger-grid")
    .filter({ visible: true })
    .elementHandles();
  for (const grid of staggerGrids) {
    const hiddenChildren = await grid.evaluate(
      (el) =>
        [...el.children].filter(
          (child) => !child.classList.contains("is-visible"),
        ).length,
    );
    if (!hiddenChildren) continue;
    await grid.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(180);
  }

  return page.evaluate(() => {
    const layoutVisible = (el) => {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") return false;
      const r = el.getBoundingClientRect();
      return r.width > 1 && r.height > 1;
    };

    const unrevealed = [
      ...document.querySelectorAll(".reveal:not(.is-visible)"),
    ]
      .filter(layoutVisible)
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        className: el.className,
        text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 100),
      }));

    const unrevealedStagger = [...document.querySelectorAll(".stagger-grid")]
      .filter(layoutVisible)
      .flatMap((grid) =>
        [...grid.children]
          .filter(
            (child) =>
              !child.classList.contains("is-visible") && layoutVisible(child),
          )
          .map((child) => ({
            gridClassName: grid.className,
            childClassName: child.className,
            text: (child.textContent || "")
              .replace(/\s+/g, " ")
              .trim()
              .slice(0, 100),
          })),
      );

    return { unrevealed, unrevealedStagger };
  });
}

async function stitchFullPage(page, vp, routeName) {
  // Chromium/Playwright can leave large off-viewport areas blank in one-shot fullPage
  // screenshots even after those regions rendered correctly during a real scroll. Build the
  // overview from ordinary viewport screenshots taken while every slice is genuinely in the
  // viewport. This makes the full-page artifact evidence of the same rendering users see.
  const metrics = await page.evaluate(() => ({
    docHeight: document.documentElement.scrollHeight,
    viewportHeight: innerHeight,
  }));
  const max = Math.max(0, metrics.docHeight - metrics.viewportHeight);
  const positions = [];
  for (let y = 0; y < max; y += metrics.viewportHeight) positions.push(y);
  if (!positions.length || positions[positions.length - 1] !== max)
    positions.push(max);

  await page.evaluate(() => {
    document
      .querySelectorAll(".reveal")
      .forEach((el) => el.classList.add("is-visible"));
    document
      .querySelectorAll(".stagger-grid > *")
      .forEach((el) => el.classList.add("is-visible"));
    let style = document.querySelector("style[data-audit-fullpage-freeze]");
    if (!style) {
      style = document.createElement("style");
      style.setAttribute("data-audit-fullpage-freeze", "");
      document.head.appendChild(style);
    }
    style.textContent = `
      .reveal,
      .stagger-grid > * {
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
        animation-delay: 0s !important;
      }
      .reveal h2 { clip-path: none !important; }
      html.audit-stitch-tail .site-header,
      html.audit-stitch-tail .scroll-top-btn,
      html.audit-stitch-tail .cursor-orbit,
      html.audit-stitch-tail .feature-nav {
        visibility: hidden !important;
      }
    `;
  });

  let output = null;
  for (let i = 0; i < positions.length; i++) {
    const y = positions[i];
    await page.evaluate(
      ({ y, hideChrome }) => {
        document.documentElement.classList.toggle(
          "audit-stitch-tail",
          hideChrome,
        );
        scrollTo({ top: y, behavior: "auto" });
      },
      { y, hideChrome: i > 0 },
    );
    await page.waitForTimeout(120);

    const buffer = await page.screenshot({
      fullPage: false,
      animations: "disabled",
    });
    const slice = PNG.sync.read(buffer);
    if (!output)
      output = new PNG({ width: slice.width, height: metrics.docHeight });
    const copyHeight = Math.max(
      0,
      Math.min(slice.height, metrics.docHeight - y),
    );
    if (copyHeight > 0)
      PNG.bitblt(slice, output, 0, 0, slice.width, copyHeight, 0, y);
  }

  await page.evaluate(() => {
    document.documentElement.classList.remove("audit-stitch-tail");
    scrollTo(0, 0);
  });

  const full = path.join(outDir, `${vp}__${routeName}__full.png`);
  await fs.writeFile(full, PNG.sync.write(output));
  screenshots++;
}

const browser = await chromium.launch(launchOptions());
for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    locale: "ja-JP",
  });
  const page = await context.newPage();
  for (const route of routes) {
    const name = slug(route);
    await page.goto(baseURL + route, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = "auto";
      document.body.style.scrollBehavior = "auto";
    });
    await page.waitForTimeout(350);
    const positions = await page.evaluate(() => {
      const max = Math.max(
        0,
        document.documentElement.scrollHeight - innerHeight,
      );
      const step = Math.max(300, Math.round(innerHeight * 0.7));
      const out = [0];
      for (let y = step; y < max; y += step) out.push(y);
      if (max > 0) out.push(max);
      return [...new Set(out)];
    });
    for (let i = 0; i < positions.length; i++) {
      await page.evaluate(
        (y) => scrollTo({ top: y, behavior: "auto" }),
        positions[i],
      );
      await page.waitForTimeout(300);
      const state = await page.evaluate(() => {
        const de = document.documentElement;
        const main = document.querySelector("main");
        const mainRect = main?.getBoundingClientRect();
        const mainVisibleHeight = mainRect
          ? Math.max(
              0,
              Math.min(innerHeight, mainRect.bottom) -
                Math.max(0, mainRect.top),
            )
          : 0;
        const candidates = [
          ...document.querySelectorAll(
            "main h1,main h2,main h3,main h4,main p,main a,main button,main img,main svg,main input,main textarea",
          ),
        ];
        const visible = candidates.filter((el) => {
          const cs = getComputedStyle(el);
          if (
            cs.display === "none" ||
            cs.visibility === "hidden" ||
            Number(cs.opacity) < 0.05
          )
            return false;
          const r = el.getBoundingClientRect();
          return (
            r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < innerHeight
          );
        });
        return {
          y: Math.round(scrollY),
          docHeight: de.scrollHeight,
          viewportHeight: innerHeight,
          scrollWidth: de.scrollWidth,
          clientWidth: de.clientWidth,
          visibleCount: visible.length,
          mainVisibleHeight: Math.round(mainVisibleHeight),
        };
      });
      if (state.scrollWidth > state.clientWidth + 2)
        findings.push({
          viewport: vp.name,
          route,
          kind: "horizontal-overflow",
          step: i,
          state,
        });
      // Do not report the normal footer-only tail of a page as an empty main viewport. Only
      // treat it as a gap when main itself occupies a substantial part of the viewport.
      if (
        state.visibleCount === 0 &&
        state.docHeight > state.viewportHeight + 50 &&
        state.mainVisibleHeight > state.viewportHeight * 0.35
      ) {
        findings.push({
          viewport: vp.name,
          route,
          kind: "empty-main-viewport",
          step: i,
          state,
        });
      }
      const file = path.join(
        outDir,
        `${vp.name}__${name}__${String(i).padStart(3, "0")}.png`,
      );
      await page.screenshot({ path: file });
      screenshots++;
    }

    const observerState = await verifyRevealObservers(page);
    if (observerState.unrevealed.length) {
      findings.push({
        viewport: vp.name,
        route,
        kind: "unrevealed-elements",
        count: observerState.unrevealed.length,
        elements: observerState.unrevealed,
      });
    }
    if (observerState.unrevealedStagger.length) {
      findings.push({
        viewport: vp.name,
        route,
        kind: "unrevealed-stagger-items",
        count: observerState.unrevealedStagger.length,
        elements: observerState.unrevealedStagger,
      });
    }

    await stitchFullPage(page, vp.name, name);
  }
  await context.close();
}
await browser.close();
await fs.writeFile(
  path.join(outDir, "report.json"),
  JSON.stringify({ findings, screenshots }, null, 2),
);
console.log(
  JSON.stringify(
    {
      findings: findings.length,
      screenshots,
      byKind: findings.reduce(
        (a, x) => ((a[x.kind] = (a[x.kind] || 0) + 1), a),
        {},
      ),
    },
    null,
    2,
  ),
);
if (findings.length) process.exitCode = 1;
