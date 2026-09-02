import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseURL = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:8787';
const outDir = 'artifacts/autonomous-browser-audit/complete-scroll';
const routes = ['/', '/about/', '/features/', '/premium/', '/community/', '/help/', '/faq/', '/news/', '/contact/', '/privacy/', '/terms/', '/404.html'];
const viewports = [
  { name: 'sp', width: 390, height: 844 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'pc', width: 1440, height: 1000 }
];
await fs.mkdir(outDir, { recursive: true });
const findings = [];
let screenshots = 0;
const slug = s => s.replace(/^\//, '').replace(/[^a-zA-Z0-9_-]+/g, '-') || 'home';

const browser = await chromium.launch({ headless: true });
for (const vp of viewports) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, locale: 'ja-JP' });
  const page = await context.newPage();
  for (const route of routes) {
    const name = slug(route);
    await page.goto(baseURL + route, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto';
      document.body.style.scrollBehavior = 'auto';
    });
    await page.waitForTimeout(350);
    const positions = await page.evaluate(() => {
      const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      const step = Math.max(300, Math.round(innerHeight * 0.7));
      const out = [0];
      for (let y = step; y < max; y += step) out.push(y);
      if (max > 0) out.push(max);
      return [...new Set(out)];
    });
    for (let i = 0; i < positions.length; i++) {
      await page.evaluate(y => scrollTo({ top: y, behavior: 'auto' }), positions[i]);
      await page.waitForTimeout(300);
      const state = await page.evaluate(() => {
        const de = document.documentElement;
        const candidates = [...document.querySelectorAll('main h1,main h2,main h3,main h4,main p,main a,main button,main img,main svg,main input,main textarea')];
        const visible = candidates.filter(el => {
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.05) return false;
          const r = el.getBoundingClientRect();
          return r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < innerHeight;
        });
        return {
          y: Math.round(scrollY),
          docHeight: de.scrollHeight,
          viewportHeight: innerHeight,
          scrollWidth: de.scrollWidth,
          clientWidth: de.clientWidth,
          visibleCount: visible.length
        };
      });
      if (state.scrollWidth > state.clientWidth + 2) findings.push({ viewport: vp.name, route, kind: 'horizontal-overflow', step: i, state });
      if (state.visibleCount === 0 && state.docHeight > state.viewportHeight + 50) findings.push({ viewport: vp.name, route, kind: 'empty-main-viewport', step: i, state });
      const file = path.join(outDir, `${vp.name}__${name}__${String(i).padStart(3, '0')}.png`);
      await page.screenshot({ path: file });
      screenshots++;
    }
    const hiddenReveals = await page.locator('.reveal:not(.is-visible)').count();
    const hiddenStaggerItems = await page.locator('.stagger-grid > :not(.is-visible)').count();
    if (hiddenReveals) findings.push({ viewport: vp.name, route, kind: 'unrevealed-elements', count: hiddenReveals });
    if (hiddenStaggerItems) findings.push({ viewport: vp.name, route, kind: 'unrevealed-stagger-items', count: hiddenStaggerItems });

    // Playwright's fullPage capture can rasterize off-viewport reveal elements from their
    // pre-animation state even after the page has been walked. Keep the interaction audit
    // above faithful to production, then freeze every reveal/stagger item only for this
    // final evidence shot so the artifact is a trustworthy whole-page visual reference.
    await page.evaluate(() => {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
      document.querySelectorAll('.stagger-grid > *').forEach(el => el.classList.add('is-visible'));
      const style = document.createElement('style');
      style.setAttribute('data-audit-fullpage-freeze', '');
      style.textContent = `
        .reveal,
        .stagger-grid > * {
          opacity: 1 !important;
          transform: none !important;
          transition: none !important;
          animation-delay: 0s !important;
        }
        .reveal h2 { clip-path: none !important; }
      `;
      document.head.appendChild(style);
      scrollTo(0, 0);
    });
    await page.waitForTimeout(180);
    const full = path.join(outDir, `${vp.name}__${name}__full.png`);
    await page.screenshot({ path: full, fullPage: true });
    screenshots++;
  }
  await context.close();
}
await browser.close();
await fs.writeFile(path.join(outDir, 'report.json'), JSON.stringify({ findings, screenshots }, null, 2));
console.log(JSON.stringify({ findings: findings.length, screenshots, byKind: findings.reduce((a,x)=>((a[x.kind]=(a[x.kind]||0)+1),a),{}) }, null, 2));
if (findings.length) process.exitCode = 1;
