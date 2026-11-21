import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const outputDir = "artifacts/home-cls";
const threshold = 0.1;
const cases = [
  { id: "en-pc-1440", lang: "en", width: 1440, height: 1000 },
  { id: "en-pc-1280", lang: "en", width: 1280, height: 900 },
  { id: "fr-pc-1440", lang: "fr", width: 1440, height: 900 },
  { id: "ja-pc-1440", lang: "ja", width: 1440, height: 900 },
];
const slowNetwork = {
  offline: false,
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
  connectionType: "cellular3g",
};

await fs.mkdir(outputDir, { recursive: true });
const browser = await chromium.launch(launchOptions());
const results = [];
const issues = [];

try {
  for (const testCase of cases) {
    const context = await browser.newContext({
      viewport: { width: testCase.width, height: testCase.height },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
    });

    try {
      const page = await context.newPage();
      const pageErrors = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));

      await page.addInitScript(() => {
        const timing = { entries: [] };
        window.__niarimHomeLayoutShifts = timing;

        if (!("PerformanceObserver" in window)) return;

        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.hadRecentInput) continue;

            timing.entries.push({
              startTime: entry.startTime,
              value: entry.value,
              sources: (entry.sources || []).map((source) => {
                const rect = (value) =>
                  value
                    ? {
                        x: value.x,
                        y: value.y,
                        width: value.width,
                        height: value.height,
                      }
                    : null;
                const node = source.node;

                return {
                  node: node
                    ? {
                        tagName: node.tagName,
                        id: node.id || "",
                        className:
                          typeof node.className === "string"
                            ? node.className
                            : "",
                      }
                    : null,
                  previousRect: rect(source.previousRect),
                  currentRect: rect(source.currentRect),
                };
              }),
            });
          }
        });

        observer.observe({ type: "layout-shift", buffered: true });
      });

      const client = await context.newCDPSession(page);
      await client.send("Network.enable");
      await client.send("Network.setCacheDisabled", { cacheDisabled: true });
      await client.send("Network.emulateNetworkConditions", slowNetwork);

      const response = await page.goto(
        baseURL + "/?lang=" + encodeURIComponent(testCase.lang),
        { waitUntil: "networkidle", timeout: 60000 },
      );

      if (!response?.ok()) {
        throw new Error("Homepage returned HTTP " + response?.status());
      }

      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1500);

      const metrics = await page.evaluate(() => {
        const entries = window.__niarimHomeLayoutShifts?.entries || [];
        let maxWindowValue = 0;
        let windowValue = 0;
        let windowStart = null;
        let lastTime = null;
        let currentWindow = [];
        let maxWindow = [];

        for (const entry of entries) {
          if (
            windowStart === null ||
            entry.startTime - lastTime > 1000 ||
            entry.startTime - windowStart > 5000
          ) {
            if (windowValue > maxWindowValue) {
              maxWindowValue = windowValue;
              maxWindow = currentWindow;
            }
            windowStart = entry.startTime;
            windowValue = 0;
            currentWindow = [];
          }

          windowValue += entry.value;
          currentWindow.push(entry);
          lastTime = entry.startTime;
        }

        if (windowValue > maxWindowValue) {
          maxWindowValue = windowValue;
          maxWindow = currentWindow;
        }

        const rect = (selector) => {
          const element = document.querySelector(selector);
          if (!element) return null;
          const value = element.getBoundingClientRect();

          return {
            x: Math.round(value.x * 10) / 10,
            y: Math.round(value.y * 10) / 10,
            width: Math.round(value.width * 10) / 10,
            height: Math.round(value.height * 10) / 10,
          };
        };

        return {
          lang: document.documentElement.lang,
          fontStatus: document.fonts.status,
          hakkouLoaded: document.fonts.check('16px "HakkouMincho"'),
          kuramubonLoaded: document.fonts.check('16px "Kuramubon"'),
          cls: Number(maxWindowValue.toFixed(3)),
          layoutShiftCount: entries.length,
          maxWindow,
          fonts: performance
            .getEntriesByType("resource")
            .filter((entry) => /\.woff2(?:\?|$)/i.test(entry.name))
            .map((entry) => ({
              name: entry.name.split("/").pop(),
              durationMs: Math.round(entry.duration),
              transferSize: entry.transferSize,
            })),
          hero: rect(".nr-hero"),
          heroGrid: rect(".nr-hero-grid"),
          heroCopy: rect(".nr-hero-copy"),
          heroWordmark: rect(".nr-hero-wordmark"),
          heroLead: rect(".nr-hero-lead"),
          heroShowcase: rect(".nr-hero-showcase"),
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth: document.documentElement.clientWidth,
        };
      });

      await page.screenshot({
        path: path.join(outputDir, testCase.id + ".png"),
        fullPage: false,
        animations: "disabled",
      });

      const result = { ...testCase, ...metrics, pageErrors };
      results.push(result);

      if (metrics.lang !== testCase.lang) {
        issues.push({
          id: testCase.id,
          kind: "wrong-language",
          expected: testCase.lang,
          actual: metrics.lang,
        });
      }
      if (metrics.cls > threshold) {
        issues.push({
          id: testCase.id,
          kind: "cls-over-budget",
          expectedMaximum: threshold,
          actual: metrics.cls,
          sources: metrics.maxWindow,
        });
      }
      if (metrics.documentWidth > metrics.viewportWidth + 2) {
        issues.push({
          id: testCase.id,
          kind: "horizontal-overflow",
          documentWidth: metrics.documentWidth,
          viewportWidth: metrics.viewportWidth,
        });
      }
      if (pageErrors.length) {
        issues.push({
          id: testCase.id,
          kind: "page-error",
          errors: pageErrors,
        });
      }
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

const report = {
  generatedAt: new Date().toISOString(),
  threshold,
  network: slowNetwork,
  results,
  issues,
};

await fs.writeFile(
  path.join(outputDir, "report.json"),
  JSON.stringify(report, null, 2),
);

console.log(JSON.stringify(report, null, 2));

if (issues.length) {
  process.exitCode = 1;
}
