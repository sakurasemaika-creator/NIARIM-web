import { chromium } from "playwright";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const widths = [1024, 1180, 1280, 1440, 1920];
const issues = [];
const browser = await chromium.launch({ headless: true });

for (const width of widths) {
  const context = await browser.newContext({
    viewport: { width, height: 1200 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(baseURL + "/features/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);

  const sections = await page.locator(".feature-section").evaluateAll((nodes) =>
    nodes.map((section) => {
      const narrative = section.querySelector(".feature-narrative");
      const stack = section.querySelector(".feature-diagram-stack");
      if (!narrative || !stack) return null;
      const nr = narrative.getBoundingClientRect();
      const sr = stack.getBoundingClientRect();
      if (nr.width <= 1 || nr.height <= 1 || sr.width <= 1 || sr.height <= 1)
        return null;
      const diagrams = [...stack.querySelectorAll(":scope > .feature-diagram")]
        .filter((el) => {
          const cs = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return cs.display !== "none" && cs.visibility !== "hidden" && r.width > 1 && r.height > 1;
        })
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
        });
      return {
        id: section.id || "",
        narrative: { left: nr.left, right: nr.right, top: nr.top, width: nr.width },
        stack: { left: sr.left, right: sr.right, top: sr.top, width: sr.width },
        diagrams,
      };
    }).filter(Boolean),
  );

  for (const section of sections) {
    if (section.stack.left < section.narrative.left || section.stack.right > width + 1)
      issues.push({ width, section: section.id, kind: "capture-column-outside", sectionGeometry: section });
    if (section.stack.left < section.narrative.right - 2)
      issues.push({ width, section: section.id, kind: "narrative-capture-overlap", sectionGeometry: section });
    if (Math.abs(section.stack.top - section.narrative.top) > 3)
      issues.push({ width, section: section.id, kind: "top-axis-drift", sectionGeometry: section });
    for (let i = 1; i < section.diagrams.length; i++) {
      const prev = section.diagrams[i - 1];
      const next = section.diagrams[i];
      if (next.top < prev.bottom - 1)
        issues.push({ width, section: section.id, kind: "capture-stack-overlap", previous: prev, next });
      if (Math.abs(next.left - prev.left) > 2 || Math.abs(next.width - prev.width) > 2)
        issues.push({ width, section: section.id, kind: "capture-stack-axis-drift", previous: prev, next });
    }
  }
  await context.close();
}
await browser.close();
console.log(JSON.stringify({ widths, issues: issues.length, details: issues }, null, 2));
if (issues.length) process.exit(1);
