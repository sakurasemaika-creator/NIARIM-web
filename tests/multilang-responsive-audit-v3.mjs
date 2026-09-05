import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";
import fs from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const outDir =
  process.env.AUDIT_OUT_DIR || "artifacts/multilang-responsive-audit-v3";
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
const languages = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"];
const viewports = [
  { name: "sp360", width: 360, height: 800 },
  { name: "sp390", width: 390, height: 844 },
  { name: "pc", width: 1440, height: 1000 },
];

await fs.mkdir(outDir, { recursive: true });
const findings = [];
const measurements = [];
const browser = await chromium.launch(launchOptions());
const add = (id, kind, detail) => findings.push({ id, kind, detail });

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  for (const route of routes) {
    for (const language of languages) {
      await page.goto(baseURL + route, { waitUntil: "networkidle" });
      await page.evaluate((lang) => {
        window.NIARIM_I18N?.applyLang?.(lang, { persist: false });
        document.documentElement.style.scrollBehavior = "auto";
        document.body.style.scrollBehavior = "auto";
        scrollTo(0, 0);
      }, language);
      await page.waitForTimeout(220);

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
            centerX: r.left + r.width / 2,
          };
        };
        const root = getComputedStyle(document.documentElement);
        const resolveColor = (value) => {
          if (!value) return "";
          const probe = document.createElement("i");
          probe.style.color = value;
          probe.style.display = "none";
          document.body.appendChild(probe);
          const color = getComputedStyle(probe).color;
          probe.remove();
          return color;
        };
        const textOverflows = [
          ...document.querySelectorAll(
            "main h1, main h2, main h3, main p, main li, main .btn, main label",
          ),
        ]
          .filter((el) => {
            if (el.closest(".visually-hidden, [aria-hidden='true']"))
              return false;
            const cs = getComputedStyle(el);
            if (cs.display === "none" || cs.visibility === "hidden")
              return false;
            const r = el.getBoundingClientRect();
            if (!r.width || !r.height) return false;
            return (
              el.scrollWidth > el.clientWidth + 2 &&
              !["auto", "scroll"].includes(cs.overflowX)
            );
          })
          .slice(0, 20)
          .map((el) => ({
            tag: el.tagName,
            cls: el.className,
            text: (el.textContent || "").trim().slice(0, 100),
            clientWidth: el.clientWidth,
            scrollWidth: el.scrollWidth,
          }));
        const buttons = [
          ...document.querySelectorAll(".btn-primary, .btn-accent"),
        ].map((el) => ({
          text: (el.textContent || "").trim(),
          background: getComputedStyle(el).backgroundColor,
          rect: rect(el),
        }));
        const verticalScreens = [
          ...document.querySelectorAll(".fd-app-screen, .fd-route-screen"),
        ].map((host) => {
          const targets = [
            ["export-start", host.querySelector(".fd-export-start")],
            [
              "workspace-last-row",
              [...host.querySelectorAll(".fd-workspace-row")].at(-1),
            ],
          ].filter(([, el]) => el);
          return {
            className: host.className,
            host: rect(host),
            targets: targets.map(([name, el]) => ({
              name,
              rect: rect(el),
              display: getComputedStyle(el).display,
              visibility: getComputedStyle(el).visibility,
            })),
          };
        });
        const workspaceControls = [
          ...document.querySelectorAll(".fd-workspace-row"),
        ].map((row) => ({
          check: rect(row.querySelector(".fd-check")),
          drag: rect(row.querySelector(".fd-drag-mark")),
        }));
        const cards = [
          ...document.querySelectorAll(
            ".screenshot-scroller > .screenshot-card",
          ),
        ].map((el) => {
          const cs = getComputedStyle(el);
          return {
            theme: el.getAttribute("data-mock-theme"),
            borderColor: cs.borderColor,
            bezel: cs.getPropertyValue("--fd-bezel").trim(),
            rect: rect(el),
          };
        });
        return {
          lang: document.documentElement.lang,
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: Math.max(
            document.documentElement.scrollWidth,
            document.body?.scrollWidth || 0,
          ),
          accent: resolveColor(root.getPropertyValue("--color-accent").trim()),
          textOverflows,
          buttons,
          hero: rect(document.querySelector(".hero-visual")),
          verticalScreens,
          workspaceControls,
          cards,
        };
      });

      const id = `${vp.name}/${language}${route}`;
      measurements.push({ id, ...state });
      if (state.lang !== language)
        add(id, "language-not-applied", { actual: state.lang });
      if (state.scrollWidth > state.clientWidth + 2)
        add(id, "page-horizontal-overflow", {
          clientWidth: state.clientWidth,
          scrollWidth: state.scrollWidth,
        });
      if (state.textOverflows.length)
        add(id, "translated-text-overflow", state.textOverflows);
      for (const button of state.buttons) {
        if (button.background !== state.accent)
          add(id, "button-not-active-theme-accent", {
            expected: state.accent,
            ...button,
          });
        if (
          button.rect &&
          (button.rect.left < -1 || button.rect.right > state.clientWidth + 1)
        )
          add(id, "button-clipped", button);
      }
      if (route === "/" && state.hero) {
        const target = 320 / 569;
        const ratio = state.hero.width / state.hero.height;
        if (Math.abs(ratio - target) > 0.018)
          add(id, "hero-ratio", {
            expected: target,
            actual: ratio,
            hero: state.hero,
          });
      }
      for (const screen of state.verticalScreens) {
        if (!screen.host) continue;
        for (const target of screen.targets) {
          if (
            !target.rect ||
            target.display === "none" ||
            target.visibility === "hidden"
          )
            continue;
          if (
            target.rect.bottom > screen.host.bottom + 2 ||
            target.rect.top < screen.host.top - 2
          )
            add(id, "mock-vertical-control-clipped", {
              screen: screen.className,
              host: screen.host,
              target,
            });
        }
      }
      for (const controls of state.workspaceControls) {
        if (
          controls.check &&
          (Math.abs(controls.check.width - 15) > 1 ||
            Math.abs(controls.check.height - 15) > 1)
        )
          add(id, "workspace-checkbox-geometry", controls.check);
        if (
          controls.drag &&
          (Math.abs(controls.drag.width - 14) > 1 ||
            Math.abs(controls.drag.height - 10) > 1)
        )
          add(id, "workspace-drag-handle-geometry", controls.drag);
      }
      if (route === "/") {
        if (state.cards.length !== 6)
          add(id, "app-preview-card-count", { actual: state.cards.length });
        for (const card of state.cards)
          if (!card.bezel) add(id, "app-preview-bezel-token-missing", card);
        const scroller = page.locator(".screenshot-scroller");
        if (await scroller.count()) {
          await scroller.evaluate((el) => {
            el.scrollTo({ left: el.scrollWidth, behavior: "instant" });
          });
          await page.waitForTimeout(180);
          const end = await page.evaluate(() => {
            const s = document.querySelector(".screenshot-scroller");
            const last = s?.querySelector(
              ":scope > .screenshot-card:last-of-type",
            );
            if (!s || !last) return null;
            const sr = s.getBoundingClientRect();
            const lr = last.getBoundingClientRect();
            return {
              scrollLeft: s.scrollLeft,
              maxScrollLeft: s.scrollWidth - s.clientWidth,
              scrollerLeft: sr.left,
              scrollerRight: sr.right,
              lastLeft: lr.left,
              lastRight: lr.right,
            };
          });
          if (
            end &&
            (end.lastLeft < end.scrollerLeft - 2 ||
              end.lastRight > end.scrollerRight + 2 ||
              end.maxScrollLeft - end.scrollLeft > 2)
          )
            add(id, "app-preview-last-card-clipped", end);
        }
      }
    }
  }
  await context.close();
}
await browser.close();

const report = {
  generatedAt: new Date().toISOString(),
  combinations: viewports.length * languages.length * routes.length,
  findings,
  measurements,
};
await fs.writeFile(
  path.join(outDir, "report.json"),
  JSON.stringify(report, null, 2),
);
console.log(
  JSON.stringify(
    {
      ok: findings.length === 0,
      combinations: report.combinations,
      findings: findings.length,
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
