import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";
import fs from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const outDir = "artifacts/autonomous-browser-audit/mock-captures";
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch(launchOptions());
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  locale: "ja-JP",
});
const page = await context.newPage();
const manifest = [];

for (const route of ["/", "/features/"]) {
  await page.goto(baseURL + route, { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: `
    html { scroll-behavior: auto !important; }
    *, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition: none !important; }
    .scroll-top-btn { display:none !important; }
  `,
  });
  await page.waitForTimeout(300);

  const mocks = page.locator(".fd-app-screen, .fd-route-screen");
  const count = await mocks.count();
  for (let i = 0; i < count; i++) {
    const mock = mocks.nth(i);
    await mock.scrollIntoViewIfNeeded();
    await page.waitForTimeout(80);
    const meta = await mock.evaluate((el, index) => {
      const rect = el.getBoundingClientRect();
      const section = el.closest("section");
      const card = el.closest(".screenshot-card");
      return {
        index,
        sectionId: section?.id || null,
        inGallery: !!card,
        classes: el.className,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    }, i);
    const routeName = route === "/" ? "home" : "features";
    const sectionName = (
      meta.sectionId || (meta.inGallery ? "gallery" : "screen")
    ).replace(/[^a-zA-Z0-9_-]+/g, "-");
    const fileName = `${routeName}__${String(i + 1).padStart(2, "0")}__${sectionName}.png`;
    await mock.screenshot({
      path: path.join(outDir, fileName),
      animations: "disabled",
    });
    manifest.push({ route, fileName, ...meta });
  }
}

await fs.writeFile(
  path.join(outDir, "manifest.json"),
  JSON.stringify(manifest, null, 2),
);
await browser.close();
console.log(`captured ${manifest.length} isolated screen mocks`);
