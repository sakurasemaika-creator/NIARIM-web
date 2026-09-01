import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseURL = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:8787';
const outDir = process.env.AUDIT_OUT_DIR || 'artifacts/autonomous-browser-audit';
const routes = ['/', '/about/', '/features/', '/premium/', '/community/', '/help/', '/faq/', '/news/', '/contact/', '/privacy/', '/terms/', '/404.html'];
const viewports = [
  { name: 'sp', width: 390, height: 844 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'pc', width: 1440, height: 1000 }
];

await fs.mkdir(outDir, { recursive: true });
const report = { generatedAt: new Date().toISOString(), baseURL, findings: [], screenshots: [] };
const severeKinds = new Set([
  'page-error', 'console-error', 'horizontal-overflow', 'broken-image',
  'nav-open', 'nav-close', 'nav-clipped', 'language-menu', 'language-restore',
  'faq-open', 'help-search', 'scroll-top', 'empty-viewport'
]);

const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
const slug = value => value.replace(/^\//, '').replace(/[^a-zA-Z0-9_-]+/g, '-') || 'home';
const finding = (vp, route, kind, detail) => report.findings.push({ viewport: vp, route, kind, detail });
async function screenshot(page, vp, routeName, suffix, fullPage = false) {
  const file = path.join(outDir, `${vp}__${routeName}__${suffix}.png`);
  await page.screenshot({ path: file, fullPage });
  report.screenshots.push(file);
}

async function inspectViewport(page, vp, route, label) {
  const state = await page.evaluate(() => {
    const de = document.documentElement;
    const broken = [...document.images]
      .filter(img => img.complete && img.naturalWidth === 0)
      .map(img => img.currentSrc || img.src);
    const visible = [...document.querySelectorAll('body *')].filter(el => {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.05) return false;
      const r = el.getBoundingClientRect();
      if (r.width < 12 || r.height < 8) return false;
      return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
    });
    const substantive = visible.filter(el => {
      if (el.matches('html,body,header,main,footer,section,div,span')) return false;
      return (el.textContent || '').trim().length > 0 || el.matches('img,svg,canvas,video,input,textarea,button,a');
    });
    return {
      scrollWidth: Math.max(de.scrollWidth, document.body?.scrollWidth || 0),
      clientWidth: de.clientWidth,
      broken,
      substantiveCount: substantive.length,
      y: Math.round(scrollY),
      height: innerHeight,
      docHeight: de.scrollHeight
    };
  });
  if (state.scrollWidth > state.clientWidth + 2) finding(vp, route, 'horizontal-overflow', { label, ...state });
  state.broken.forEach(src => finding(vp, route, 'broken-image', { label, src }));
  if (state.substantiveCount === 0 && state.docHeight > state.height + 50) finding(vp, route, 'empty-viewport', { label, ...state });
}

async function exerciseLanguage(page, vp, route, routeName, navToggle) {
  let reopenedNav = false;
  const trigger = page.locator('.lang-trigger').first();
  if (!(await trigger.count())) return;
  if (!(await trigger.isVisible()) && navToggle && await navToggle.isVisible()) {
    await navToggle.click();
    await page.waitForTimeout(450);
    reopenedNav = true;
  }
  if (!(await trigger.isVisible())) return;

  const original = await page.evaluate(() => document.documentElement.lang);
  await trigger.click();
  await page.waitForTimeout(180);
  const menu = page.locator('.lang-menu').first();
  if (!(await menu.isVisible())) {
    finding(vp, route, 'language-menu', 'Language menu did not open');
  } else {
    await screenshot(page, vp, routeName, '02-language-open');
    const choices = menu.locator('button[data-lang-switch]');
    const count = await choices.count();
    let target = null;
    for (let i = 0; i < count; i++) {
      const code = await choices.nth(i).getAttribute('data-lang-switch');
      if (code && code !== original) { target = choices.nth(i); break; }
    }
    if (target) {
      await target.click();
      await page.waitForTimeout(220);
      await screenshot(page, vp, routeName, '03-language-changed');
      const changed = await page.evaluate(() => document.documentElement.lang);
      if (changed === original) finding(vp, route, 'language-menu', 'Language did not change');

      if (reopenedNav && navToggle && !(await trigger.isVisible())) {
        await navToggle.click();
        await page.waitForTimeout(450);
      }
      if (await trigger.isVisible()) {
        await trigger.click();
        await page.waitForTimeout(120);
        const restore = page.locator(`.lang-menu button[data-lang-switch="${original}"]`).first();
        if (await restore.count()) {
          await restore.click();
          await page.waitForTimeout(220);
        }
      }
      const restored = await page.evaluate(() => document.documentElement.lang);
      if (restored !== original) finding(vp, route, 'language-restore', { original, restored });
    }
  }
  if (navToggle && await navToggle.isVisible() && (await navToggle.getAttribute('aria-expanded')) === 'true') {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(450);
  }
}

const browser = await chromium.launch({ headless: true });
for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    locale: 'ja-JP',
    reducedMotion: 'no-preference'
  });
  const page = await context.newPage();
  let currentRoute = '';
  page.on('pageerror', err => finding(vp.name, currentRoute, 'page-error', String(err)));
  page.on('console', msg => {
    if (msg.type() === 'error') finding(vp.name, currentRoute, 'console-error', msg.text());
  });

  for (const route of routes) {
    currentRoute = route;
    const routeName = slug(route);
    await page.goto(baseURL + route, { waitUntil: 'networkidle' });
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(450);
    await screenshot(page, vp.name, routeName, '00-top');
    await inspectViewport(page, vp.name, route, 'top');

    const navToggle = page.locator('.nav-toggle').first();
    if (await navToggle.count() && await navToggle.isVisible()) {
      await navToggle.click();
      await page.waitForTimeout(450);
      await screenshot(page, vp.name, routeName, '01-nav-open');
      const nav = await page.locator('.main-nav').first().evaluate(el => ({
        expanded: document.querySelector('.nav-toggle')?.getAttribute('aria-expanded'),
        clientHeight: el.clientHeight,
        scrollHeight: el.scrollHeight,
        overflowY: getComputedStyle(el).overflowY,
        rect: el.getBoundingClientRect().toJSON()
      }));
      if (nav.expanded !== 'true') finding(vp.name, route, 'nav-open', nav);
      if (nav.scrollHeight > nav.clientHeight + 2 && !['auto', 'scroll'].includes(nav.overflowY)) finding(vp.name, route, 'nav-clipped', nav);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(450);
      if ((await navToggle.getAttribute('aria-expanded')) !== 'false') finding(vp.name, route, 'nav-close', 'Escape did not close menu');
    }

    await exerciseLanguage(page, vp.name, route, routeName, navToggle);

    // FAQ interaction: open each of the first six questions independently.
    const faqs = page.locator('.faq-question');
    for (let i = 0, n = Math.min(await faqs.count(), 6); i < n; i++) {
      const q = faqs.nth(i);
      await q.scrollIntoViewIfNeeded();
      await page.waitForTimeout(160);
      await q.click();
      await page.waitForTimeout(260);
      if ((await q.getAttribute('aria-expanded')) !== 'true') finding(vp.name, route, 'faq-open', `FAQ ${i + 1} failed`);
      await screenshot(page, vp.name, routeName, `faq-${String(i + 1).padStart(2, '0')}`);
      await q.click();
      await page.waitForTimeout(120);
    }

    // Search using text taken from the currently displayed language so the test is language-independent.
    if (route === '/help/') {
      const input = page.locator('#help-search-input').first();
      const firstCard = page.locator('[data-help-card]').first();
      if (await input.count() && await firstCard.count()) {
        const query = await firstCard.evaluate(el => {
          const title = el.querySelector('h3,h4')?.textContent || el.textContent || '';
          return title.trim().slice(0, Math.min(5, title.trim().length));
        });
        await input.fill(query);
        await page.waitForTimeout(220);
        await screenshot(page, vp.name, routeName, 'help-search');
        if ((await page.locator('[data-help-card]:visible').count()) === 0) finding(vp.name, route, 'help-search', { query });
        await input.fill('');
        await page.waitForTimeout(120);
      }
    }

    // Native client-side validation only. Do not send contact data.
    if (route === '/contact/') {
      const form = page.locator('form').first();
      const submit = form.locator('button[type="submit"], input[type="submit"]').first();
      if (await form.count() && await submit.count()) {
        await submit.click();
        await page.waitForTimeout(120);
        await screenshot(page, vp.name, routeName, 'contact-validation');
        const invalid = await form.locator('input[required],textarea[required],select[required]').evaluateAll(els => els.filter(el => !el.checkValidity()).length);
        if (invalid === 0) finding(vp.name, route, 'contact-validation', 'Empty required fields were considered valid');
      }
    }

    // Walk through the page as a user would. This triggers IntersectionObserver reveals and
    // catches sections that become blank/clipped only during real scrolling.
    const scrollStops = await page.evaluate(() => {
      const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      const step = Math.max(320, Math.round(innerHeight * 0.72));
      const values = [];
      for (let y = step; y < max; y += step) values.push(y);
      values.push(max);
      return [...new Set(values)].slice(0, 24);
    });
    for (let i = 0; i < scrollStops.length; i++) {
      await page.evaluate(y => scrollTo({ top: y, behavior: 'auto' }), scrollStops[i]);
      await page.waitForTimeout(360);
      await inspectViewport(page, vp.name, route, `scroll-${i + 1}`);
      await screenshot(page, vp.name, routeName, `scroll-${String(i + 1).padStart(2, '0')}`);
    }

    // Recalculate true bottom after reveal/injected layout has settled.
    await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'auto' }));
    await page.waitForTimeout(400);
    await screenshot(page, vp.name, routeName, '90-bottom');
    await inspectViewport(page, vp.name, route, 'bottom');

    const topBtn = page.locator('.scroll-top-btn').first();
    if (await topBtn.count() && await topBtn.isVisible()) {
      await topBtn.click();
      try {
        await page.waitForFunction(() => scrollY < 10, null, { timeout: 3500 });
      } catch {
        finding(vp.name, route, 'scroll-top', { y: await page.evaluate(() => scrollY) });
      }
      await screenshot(page, vp.name, routeName, '91-scroll-top');
    }

    // Final whole-page shot only after every reveal section has actually been visited.
    await screenshot(page, vp.name, routeName, '99-full-after-walk', true);

    const unnamed = await page.locator('button:visible').evaluateAll(btns => btns
      .map((b, i) => ({ i, name: (b.getAttribute('aria-label') || b.getAttribute('title') || b.textContent || '').trim() }))
      .filter(x => !x.name));
    if (unnamed.length) finding(vp.name, route, 'unnamed-buttons', unnamed);
  }
  await context.close();
}
await browser.close();

await fs.writeFile(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
const counts = report.findings.reduce((acc, item) => ((acc[item.kind] = (acc[item.kind] || 0) + 1), acc), {});
console.log(JSON.stringify({ totalFindings: report.findings.length, byKind: counts, screenshots: report.screenshots.length }, null, 2));
if (report.findings.some(item => severeKinds.has(item.kind))) process.exitCode = 1;
