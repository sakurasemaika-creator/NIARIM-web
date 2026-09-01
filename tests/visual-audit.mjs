import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseURL = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:8787';
const outDir = process.env.AUDIT_OUT_DIR || 'artifacts/visual-audit';
const routes = [
  '/', '/about/', '/features/', '/premium/', '/community/', '/help/',
  '/faq/', '/news/', '/contact/', '/privacy/', '/terms/', '/404.html'
];
const viewports = [
  { name: 'sp', width: 390, height: 844 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'pc', width: 1440, height: 1000 }
];

await fs.mkdir(outDir, { recursive: true });
const report = { generatedAt: new Date().toISOString(), baseURL, findings: [], screenshots: [] };

function slug(s) {
  return s.replace(/^\//, '').replace(/[^a-zA-Z0-9_-]+/g, '-') || 'home';
}
function addFinding(viewport, route, kind, detail) {
  report.findings.push({ viewport, route, kind, detail });
}

const browser = await chromium.launch({ headless: true });
for (const vp of viewports) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') addFinding(vp.name, page.url(), 'console-error', msg.text());
  });
  page.on('pageerror', err => addFinding(vp.name, page.url(), 'page-error', String(err)));

  for (const route of routes) {
    const routeName = slug(route);
    await page.goto(baseURL + route, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(150);

    const baseShot = path.join(outDir, `${vp.name}__${routeName}__00-base.png`);
    await page.screenshot({ path: baseShot, fullPage: true });
    report.screenshots.push(baseShot);

    const metrics = await page.evaluate(() => {
      const de = document.documentElement;
      const body = document.body;
      const bad = [];
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        if (r.width > 0 && r.height > 0 && cs.position !== 'fixed') {
          if (r.right > de.clientWidth + 2 || r.left < -2) {
            const label = (el.getAttribute('aria-label') || el.id || el.className || el.tagName).toString().slice(0,120);
            bad.push({ label, left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) });
          }
        }
      }
      return {
        clientWidth: de.clientWidth,
        scrollWidth: Math.max(de.scrollWidth, body?.scrollWidth || 0),
        overflowers: bad.slice(0, 30),
        title: document.title,
        h1: document.querySelector('h1')?.textContent?.trim() || ''
      };
    });
    if (metrics.scrollWidth > metrics.clientWidth + 2) {
      addFinding(vp.name, route, 'horizontal-overflow', metrics);
    }
    if (metrics.overflowers.length) {
      addFinding(vp.name, route, 'offscreen-elements', metrics.overflowers);
    }
    if (!metrics.title) addFinding(vp.name, route, 'missing-title', 'document.title is empty');
    if (route !== '/404.html' && !metrics.h1) addFinding(vp.name, route, 'missing-h1', 'No h1 found');

    // Header/nav interaction on compact layouts.
    const navToggle = page.locator('.nav-toggle').first();
    if (await navToggle.count() && await navToggle.isVisible()) {
      await navToggle.click();
      await page.waitForTimeout(120);
      const shot = path.join(outDir, `${vp.name}__${routeName}__01-nav-open.png`);
      await page.screenshot({ path: shot, fullPage: false });
      report.screenshots.push(shot);
      const expanded = await navToggle.getAttribute('aria-expanded');
      if (expanded !== 'true') addFinding(vp.name, route, 'nav-toggle', `aria-expanded=${expanded}`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(80);
      if ((await navToggle.getAttribute('aria-expanded')) !== 'false') addFinding(vp.name, route, 'nav-escape-close', 'Escape did not close navigation');
    }

    // Language selector: change and restore without destructive navigation.
    const lang = page.locator('select.language-select, select[data-language-select], select#language-select').first();
    if (await lang.count() && await lang.isVisible()) {
      const options = await lang.locator('option').evaluateAll(opts => opts.map(o => o.value));
      if (options.length > 1) {
        const original = await lang.inputValue();
        const target = options.find(v => v && v !== original);
        if (target) {
          await lang.selectOption(target);
          await page.waitForTimeout(100);
          const shot = path.join(outDir, `${vp.name}__${routeName}__02-language.png`);
          await page.screenshot({ path: shot, fullPage: false });
          report.screenshots.push(shot);
          await lang.selectOption(original || options[0]);
        }
      }
    }

    // FAQ accordions. Capture first several independently, closing before next.
    const faqButtons = page.locator('.faq-question');
    const faqCount = Math.min(await faqButtons.count(), 6);
    for (let i = 0; i < faqCount; i++) {
      const q = faqButtons.nth(i);
      if (!await q.isVisible()) continue;
      await q.scrollIntoViewIfNeeded();
      await q.click();
      await page.waitForTimeout(120);
      const expanded = await q.getAttribute('aria-expanded');
      if (expanded !== 'true') addFinding(vp.name, route, 'faq-open', `FAQ ${i + 1} aria-expanded=${expanded}`);
      const shot = path.join(outDir, `${vp.name}__${routeName}__faq-${String(i+1).padStart(2,'0')}.png`);
      await page.screenshot({ path: shot, fullPage: false });
      report.screenshots.push(shot);
      await q.click();
    }

    // Help search behavior.
    if (route === '/help/') {
      const search = page.locator('input[type="search"], .help-search input, #help-search').first();
      if (await search.count() && await search.isVisible()) {
        await search.fill('レイヤー');
        await page.waitForTimeout(150);
        const shot = path.join(outDir, `${vp.name}__${routeName}__help-search.png`);
        await page.screenshot({ path: shot, fullPage: false });
        report.screenshots.push(shot);
        const visibleItems = await page.locator('.help-item:visible, .help-card:visible, .help-topic:visible').count();
        if (visibleItems === 0) addFinding(vp.name, route, 'help-search-empty', 'Search for レイヤー yielded no visible help entries');
        await search.fill('');
      }
    }

    // Contact form: exercise client-side validation only; never submit real data.
    if (route === '/contact/') {
      const form = page.locator('form').first();
      if (await form.count()) {
        const required = form.locator('input[required], textarea[required], select[required]');
        if (await required.count()) {
          const submit = form.locator('button[type="submit"], input[type="submit"]').first();
          if (await submit.count() && await submit.isVisible()) {
            await submit.click();
            await page.waitForTimeout(80);
            const invalid = await required.evaluateAll(els => els.filter(e => !e.checkValidity()).length);
            if (invalid === 0) addFinding(vp.name, route, 'contact-validation', 'Required fields were unexpectedly valid when empty');
            const shot = path.join(outDir, `${vp.name}__${routeName}__contact-validation.png`);
            await page.screenshot({ path: shot, fullPage: false });
            report.screenshots.push(shot);
          }
        }
      }
    }

    // Scroll behavior and page-top control.
    await page.evaluate(() => window.scrollTo(0, Math.max(0, document.documentElement.scrollHeight - innerHeight)));
    await page.waitForTimeout(180);
    const bottomShot = path.join(outDir, `${vp.name}__${routeName}__90-bottom.png`);
    await page.screenshot({ path: bottomShot, fullPage: false });
    report.screenshots.push(bottomShot);
    const topBtn = page.locator('.scroll-top-btn').first();
    if (await topBtn.count() && await topBtn.isVisible()) {
      await topBtn.click();
      await page.waitForTimeout(350);
      const y = await page.evaluate(() => window.scrollY);
      if (y > 10) addFinding(vp.name, route, 'scroll-top', `scrollY remained ${y}`);
    }

    // Non-destructive visible controls audit: buttons should have accessible text/name.
    const unnamed = await page.locator('button:visible').evaluateAll(btns => btns.map((b, i) => ({
      i,
      name: (b.getAttribute('aria-label') || b.getAttribute('title') || b.textContent || '').trim()
    })).filter(x => !x.name));
    if (unnamed.length) addFinding(vp.name, route, 'unnamed-buttons', unnamed);
  }
  await context.close();
}
await browser.close();

await fs.writeFile(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
const byKind = Object.groupBy ? Object.groupBy(report.findings, x => x.kind) : report.findings.reduce((a,x)=>((a[x.kind]??=[]).push(x),a),{});
console.log(JSON.stringify({ totalFindings: report.findings.length, byKind: Object.fromEntries(Object.entries(byKind).map(([k,v]) => [k, v.length])), screenshots: report.screenshots.length }, null, 2));
if (report.findings.some(f => ['page-error','horizontal-overflow','nav-toggle','nav-escape-close'].includes(f.kind))) process.exitCode = 1;
