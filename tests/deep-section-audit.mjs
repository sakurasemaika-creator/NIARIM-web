import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";
import fs from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const outDir =
  process.env.AUDIT_OUT_DIR ||
  "artifacts/autonomous-browser-audit/deep-sections";
const viewports = [
  { name: "sp", width: 390, height: 844 },
  { name: "tablet", width: 834, height: 1112 },
  { name: "pc", width: 1440, height: 1000 },
];
const targets = [
  { route: "/", selector: "main > section", name: "home" },
  { route: "/features/", selector: ".feature-section[id]", name: "features" },
];

await fs.mkdir(outDir, { recursive: true });
const report = { findings: [], screenshots: [] };
const browser = await chromium.launch(launchOptions());

function add(viewport, route, kind, detail) {
  report.findings.push({ viewport, route, kind, detail });
}

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    locale: "ja-JP",
    reducedMotion: "no-preference",
    hasTouch: vp.name !== "pc",
  });
  const page = await context.newPage();
  let routeNow = "";
  page.on("pageerror", (error) =>
    add(vp.name, routeNow, "page-error", String(error)),
  );
  page.on("console", (msg) => {
    if (msg.type() === "error")
      add(vp.name, routeNow, "console-error", msg.text());
  });

  for (const target of targets) {
    routeNow = target.route;
    await page.goto(baseURL + target.route, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = "auto";
      document.body.style.scrollBehavior = "auto";
    });
    await page.waitForTimeout(400);

    const sections = page.locator(target.selector);
    const count = await sections.count();
    if (!count) add(vp.name, target.route, "missing-sections", target.selector);

    for (let i = 0; i < count; i++) {
      const section = sections.nth(i);
      const id =
        (await section.getAttribute("id")) ||
        `section-${String(i + 1).padStart(2, "0")}`;

      // Match normal in-page anchor navigation instead of Playwright's
      // scrollIntoViewIfNeeded(), whose centering heuristics can place the section behind
      // a sticky header even when the site's scroll-padding-top is correct.
      await section.evaluate((el) =>
        el.scrollIntoView({
          block: "start",
          inline: "nearest",
          behavior: "auto",
        }),
      );
      await page.waitForTimeout(320);

      const state = await section.evaluate((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        const substantive = [
          ...el.querySelectorAll(
            "h1,h2,h3,h4,p,a,button,img,svg,.feature-diagram,.fd-app-screen,.fd-route-screen",
          ),
        ].filter((node) => {
          const s = getComputedStyle(node);
          const nr = node.getBoundingClientRect();
          return (
            s.display !== "none" &&
            s.visibility !== "hidden" &&
            Number(s.opacity) > 0.05 &&
            nr.width > 1 &&
            nr.height > 1
          );
        }).length;
        const mocks = [
          ...el.querySelectorAll(".fd-app-screen,.fd-route-screen"),
        ].map((node) => {
          const mr = node.getBoundingClientRect();
          return {
            className: node.className,
            width: Math.round(mr.width),
            height: Math.round(mr.height),
            ratio: mr.height ? mr.width / mr.height : 0,
            opacity: Number(getComputedStyle(node).opacity),
            visibleReveal:
              !node.closest(".reveal") ||
              node.closest(".reveal").classList.contains("is-visible"),
          };
        });
        return {
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
          width: Math.round(r.width),
          height: Math.round(r.height),
          display: cs.display,
          visibility: cs.visibility,
          opacity: Number(cs.opacity),
          substantive,
          mocks,
        };
      });

      if (
        state.width < 1 ||
        state.height < 1 ||
        state.display === "none" ||
        state.visibility === "hidden" ||
        state.opacity < 0.05 ||
        state.substantive === 0
      ) {
        add(vp.name, target.route, "empty-section", { id, ...state });
      }
      for (const mock of state.mocks) {
        if (
          mock.opacity < 0.99 ||
          !mock.visibleReveal ||
          Math.abs(mock.ratio - 9 / 16) > 0.03
        ) {
          add(vp.name, target.route, "screen-mock", { id, ...mock });
        }
      }

      const safeId = id.replace(/[^a-zA-Z0-9_-]+/g, "-");
      const file = path.join(
        outDir,
        `${vp.name}__${target.name}__${String(i + 1).padStart(2, "0")}__${safeId}.png`,
      );
      await page.screenshot({ path: file, fullPage: false });
      report.screenshots.push(file);
    }
  }
  await context.close();
}

await browser.close();
await fs.writeFile(
  path.join(outDir, "report.json"),
  JSON.stringify(report, null, 2),
);
const counts = report.findings.reduce(
  (acc, item) => ((acc[item.kind] = (acc[item.kind] || 0) + 1), acc),
  {},
);
console.log(
  JSON.stringify(
    {
      deepSectionFindings: report.findings.length,
      byKind: counts,
      screenshots: report.screenshots.length,
    },
    null,
    2,
  ),
);
if (report.findings.length) process.exitCode = 1;
