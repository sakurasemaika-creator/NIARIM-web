import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";
import fs from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const outDir = process.env.AUDIT_OUT_DIR || "artifacts/visual-audit";
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
const report = {
  generatedAt: new Date().toISOString(),
  baseURL,
  findings: [],
  screenshots: [],
};

function slug(s) {
  return s.replace(/^\//, "").replace(/[^a-zA-Z0-9_-]+/g, "-") || "home";
}
function addFinding(viewport, route, kind, detail) {
  report.findings.push({ viewport, route, kind, detail });
}
async function shot(page, vp, routeName, suffix, fullPage = false) {
  const p = path.join(outDir, `${vp}__${routeName}__${suffix}.png`);
  await page.screenshot({ path: p, fullPage });
  report.screenshots.push(p);
}

const browser = await chromium.launch(launchOptions());
for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error")
      addFinding(vp.name, page.url(), "console-error", msg.text());
  });
  page.on("pageerror", (err) =>
    addFinding(vp.name, page.url(), "page-error", String(err)),
  );

  for (const route of routes) {
    const routeName = slug(route);
    await page.goto(baseURL + route, { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(450);
    await shot(page, vp.name, routeName, "00-base", true);

    const metrics = await page.evaluate(() => {
      const de = document.documentElement;
      const body = document.body;
      const bad = [];
      const hasIntentionalClipAncestor = (el) => {
        let p = el.parentElement;
        while (p && p !== document.body) {
          const cs = getComputedStyle(p);
          const ox = cs.overflowX;
          if (["auto", "scroll", "hidden", "clip"].includes(ox)) return true;
          if (
            p.classList.contains("marquee-track") ||
            p.classList.contains("marquee")
          )
            return true;
          p = p.parentElement;
        }
        return false;
      };
      for (const el of document.querySelectorAll("body *")) {
        if (el.closest(".form-honeypot")) continue;
        if (el.closest(".marquee-track, .marquee")) continue;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        if (r.width <= 0 || r.height <= 0 || cs.position === "fixed") continue;
        if (
          (r.right > de.clientWidth + 2 || r.left < -2) &&
          !hasIntentionalClipAncestor(el)
        ) {
          const raw =
            el.getAttribute("aria-label") ||
            el.id ||
            (typeof el.className === "string" ? el.className : "") ||
            el.tagName;
          bad.push({
            label: String(raw).slice(0, 120),
            left: Math.round(r.left),
            right: Math.round(r.right),
            width: Math.round(r.width),
          });
        }
      }
      const brokenImages = [...document.images]
        .filter((img) => img.complete && img.naturalWidth === 0)
        .map((img) => img.currentSrc || img.src)
        .slice(0, 20);
      const clippedText = [
        ...document.querySelectorAll("h1,h2,h3,h4,p,a,button"),
      ]
        .filter((el) => {
          const cs = getComputedStyle(el);
          if (cs.display === "none" || cs.visibility === "hidden") return false;
          if (cs.textOverflow === "ellipsis") return false;
          return (
            el.scrollWidth > el.clientWidth + 3 &&
            ["hidden", "clip"].includes(cs.overflowX)
          );
        })
        .map((el) => ({
          tag: el.tagName,
          text: (el.textContent || "").trim().slice(0, 100),
          clientWidth: el.clientWidth,
          scrollWidth: el.scrollWidth,
        }))
        .slice(0, 20);

      const screenMocks = [
        ...document.querySelectorAll(".fd-app-screen, .fd-route-screen"),
      ].map((el, i) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        const reveal = el.closest(".reveal");
        return {
          i,
          cls: el.className,
          width: Math.round(r.width),
          height: Math.round(r.height),
          ratio: r.height ? r.width / r.height : 0,
          display: cs.display,
          visibility: cs.visibility,
          opacity: Number(cs.opacity),
          revealClass: reveal?.className || null,
        };
      });

      return {
        clientWidth: de.clientWidth,
        scrollWidth: Math.max(de.scrollWidth, body?.scrollWidth || 0),
        overflowers: bad.slice(0, 30),
        brokenImages,
        clippedText,
        screenMocks,
        title: document.title,
        h1: document.querySelector("h1")?.textContent?.trim() || "",
      };
    });
    if (metrics.scrollWidth > metrics.clientWidth + 2)
      addFinding(vp.name, route, "horizontal-overflow", metrics);
    if (metrics.overflowers.length)
      addFinding(vp.name, route, "offscreen-elements", metrics.overflowers);
    if (metrics.brokenImages.length)
      addFinding(vp.name, route, "broken-images", metrics.brokenImages);
    if (metrics.clippedText.length)
      addFinding(vp.name, route, "clipped-text", metrics.clippedText);
    if (!metrics.title)
      addFinding(vp.name, route, "missing-title", "document.title is empty");
    if (route !== "/404.html" && !metrics.h1)
      addFinding(vp.name, route, "missing-h1", "No h1 found");

    for (const mock of metrics.screenMocks) {
      if (
        mock.width < 1 ||
        mock.height < 1 ||
        mock.display === "none" ||
        mock.visibility === "hidden" ||
        mock.opacity < 0.99
      ) {
        addFinding(vp.name, route, "hidden-screen-mock", mock);
      }
      const target = 9 / 16;
      if (mock.width > 0 && Math.abs(mock.ratio - target) > 0.025) {
        addFinding(vp.name, route, "screen-mock-ratio", mock);
      }
      if (
        mock.revealClass &&
        !mock.revealClass.split(/\s+/).includes("is-visible")
      ) {
        addFinding(vp.name, route, "screen-mock-reveal", mock);
      }
    }

    // Header / mobile navigation. Wait until its transition is fully settled before capture.
    const navToggle = page.locator(".nav-toggle").first();
    if ((await navToggle.count()) && (await navToggle.isVisible())) {
      await navToggle.click();
      await page.waitForTimeout(450);
      await shot(page, vp.name, routeName, "01-nav-open");
      const navState = await page.evaluate(() => {
        const t = document.querySelector(".nav-toggle");
        const n = document.querySelector(".main-nav");
        if (!t || !n) return null;
        const r = n.getBoundingClientRect();
        return {
          expanded: t.getAttribute("aria-expanded"),
          navClientHeight: n.clientHeight,
          navScrollHeight: n.scrollHeight,
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
          viewport: innerHeight,
          overflowY: getComputedStyle(n).overflowY,
        };
      });
      if (navState?.expanded !== "true")
        addFinding(vp.name, route, "nav-toggle", navState);
      if (
        navState &&
        navState.navScrollHeight > navState.navClientHeight + 2 &&
        !["auto", "scroll"].includes(navState.overflowY)
      ) {
        addFinding(vp.name, route, "nav-content-clipped", navState);
      }
      await page.keyboard.press("Escape");
      await page.waitForTimeout(450);
      if ((await navToggle.getAttribute("aria-expanded")) !== "false")
        addFinding(
          vp.name,
          route,
          "nav-escape-close",
          "Escape did not close navigation",
        );
    }

    // Language dropdown: change once, capture, then restore the original language.
    const langTrigger = page.locator(".lang-trigger").first();
    if ((await langTrigger.count()) && (await langTrigger.isVisible())) {
      await langTrigger.click();
      await page.waitForTimeout(180);
      const menu = page.locator(".lang-menu").first();
      if (!(await menu.isVisible()))
        addFinding(
          vp.name,
          route,
          "language-menu",
          "Language menu did not become visible",
        );
      else {
        await shot(page, vp.name, routeName, "02-language-open");
        const current = menu.locator('button[aria-pressed="true"]').first();
        const currentLang = await current.getAttribute("data-lang");
        const choices = menu.locator("button");
        const count = await choices.count();
        let targetIndex = -1;
        for (let i = 0; i < count; i++) {
          const code = await choices.nth(i).getAttribute("data-lang");
          if (code && code !== currentLang) {
            targetIndex = i;
            break;
          }
        }
        if (targetIndex >= 0) {
          await choices.nth(targetIndex).click();
          await page.waitForTimeout(250);
          await shot(page, vp.name, routeName, "03-language-changed");
          if (currentLang) {
            await langTrigger.click();
            await page.waitForTimeout(100);
            const restore = page
              .locator(`.lang-menu button[data-lang="${currentLang}"]`)
              .first();
            if (await restore.count()) await restore.click();
            await page.waitForTimeout(220);
          }
        }
      }
    }

    const faqButtons = page.locator(".faq-question");
    const faqCount = Math.min(await faqButtons.count(), 6);
    for (let i = 0; i < faqCount; i++) {
      const q = faqButtons.nth(i);
      if (!(await q.isVisible())) continue;
      await q.scrollIntoViewIfNeeded();
      await q.click();
      await page.waitForTimeout(260);
      if ((await q.getAttribute("aria-expanded")) !== "true")
        addFinding(vp.name, route, "faq-open", `FAQ ${i + 1} failed to open`);
      await shot(
        page,
        vp.name,
        routeName,
        `faq-${String(i + 1).padStart(2, "0")}`,
      );
      await q.click();
      await page.waitForTimeout(100);
    }

    if (route === "/help/") {
      const search = page.locator("#help-search-input").first();
      if ((await search.count()) && (await search.isVisible())) {
        const firstTitle = (
          (await page.locator("[data-help-card] h3").first().textContent()) ||
          ""
        ).trim();
        const query = firstTitle.slice(0, Math.min(4, firstTitle.length));
        if (query) {
          await search.fill(query);
          await page.waitForTimeout(220);
          await shot(page, vp.name, routeName, "help-search");
          const visibleItems = await page
            .locator("[data-help-card]:visible")
            .count();
          if (visibleItems === 0)
            addFinding(vp.name, route, "help-search-empty", {
              query,
              firstTitle,
            });
          await search.fill("");
          await page.waitForTimeout(100);
        }
      }
    }

    if (route === "/contact/") {
      const form = page.locator("form").first();
      if (await form.count()) {
        const required = form.locator(
          "input[required], textarea[required], select[required]",
        );
        const submit = form
          .locator('button[type="submit"], input[type="submit"]')
          .first();
        if (
          (await required.count()) &&
          (await submit.count()) &&
          (await submit.isVisible())
        ) {
          await submit.click();
          await page.waitForTimeout(120);
          const invalid = await required.evaluateAll(
            (els) => els.filter((e) => !e.checkValidity()).length,
          );
          if (invalid === 0)
            addFinding(
              vp.name,
              route,
              "contact-validation",
              "Required fields were unexpectedly valid when empty",
            );
          await shot(page, vp.name, routeName, "contact-validation");
        }
      }
    }

    // Walk through the page as a user would. This triggers IntersectionObserver states and
    // leaves one viewport screenshot at each meaningful scroll step.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(160);
    const scrollPlan = await page.evaluate(() => {
      const maxY = Math.max(
        0,
        document.documentElement.scrollHeight - innerHeight,
      );
      if (!maxY) return [0];
      const step = Math.max(320, Math.floor(innerHeight * 0.72));
      const ys = [];
      for (let y = 0; y < maxY; y += step) ys.push(y);
      ys.push(maxY);
      // Cap very long legal/help pages while still sampling the whole range.
      if (ys.length <= 14) return ys;
      const out = [];
      for (let i = 0; i < 14; i++) out.push(Math.round((maxY * i) / 13));
      return [...new Set(out)];
    });
    for (let i = 0; i < scrollPlan.length; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), scrollPlan[i]);
      await page.waitForTimeout(360);
      await shot(
        page,
        vp.name,
        routeName,
        `scroll-${String(i).padStart(2, "0")}`,
      );
    }

    await page.evaluate(() =>
      window.scrollTo(
        0,
        Math.max(0, document.documentElement.scrollHeight - innerHeight),
      ),
    );
    await page.waitForTimeout(220);
    await shot(page, vp.name, routeName, "90-bottom");
    const topBtn = page.locator(".scroll-top-btn").first();
    if ((await topBtn.count()) && (await topBtn.isVisible())) {
      await topBtn.click();
      try {
        await page.waitForFunction(() => window.scrollY < 10, null, {
          timeout: 3000,
        });
      } catch {
        addFinding(
          vp.name,
          route,
          "scroll-top",
          `scrollY remained ${await page.evaluate(() => window.scrollY)}`,
        );
      }
      await shot(page, vp.name, routeName, "91-after-scroll-top");
    }

    const unnamed = await page.locator("button:visible").evaluateAll((btns) =>
      btns
        .map((b, i) => ({
          i,
          name: (
            b.getAttribute("aria-label") ||
            b.getAttribute("title") ||
            b.textContent ||
            ""
          ).trim(),
        }))
        .filter((x) => !x.name),
    );
    if (unnamed.length) addFinding(vp.name, route, "unnamed-buttons", unnamed);
  }
  await context.close();
}
await browser.close();

await fs.writeFile(
  path.join(outDir, "report.json"),
  JSON.stringify(report, null, 2),
);
const byKind = Object.groupBy
  ? Object.groupBy(report.findings, (x) => x.kind)
  : report.findings.reduce((a, x) => ((a[x.kind] ??= []).push(x), a), {});
console.log(
  JSON.stringify(
    {
      totalFindings: report.findings.length,
      byKind: Object.fromEntries(
        Object.entries(byKind).map(([k, v]) => [k, v.length]),
      ),
      screenshots: report.screenshots.length,
    },
    null,
    2,
  ),
);
if (
  report.findings.some((f) =>
    [
      "page-error",
      "horizontal-overflow",
      "broken-images",
      "nav-toggle",
      "nav-escape-close",
      "nav-content-clipped",
      "hidden-screen-mock",
      "screen-mock-ratio",
      "screen-mock-reveal",
    ].includes(f.kind),
  )
)
  process.exitCode = 1;
