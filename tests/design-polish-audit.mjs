import { chromium } from 'playwright';

const baseURL = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:8787';
const viewports = [
  { name: 'sp', width: 390, height: 844 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'pc', width: 1440, height: 1000 }
];

const findings = [];
const browser = await chromium.launch({ headless: true });

for (const vp of viewports) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, locale: 'ja-JP' });
  const page = await context.newPage();
  await page.goto(baseURL + '/', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';
  });

  const state = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.feature-row')].map((el, index) => {
      const cs = getComputedStyle(el);
      return {
        index,
        paddingLeft: parseFloat(cs.paddingLeft),
        paddingRight: parseFloat(cs.paddingRight),
        radius: parseFloat(cs.borderTopLeftRadius),
        background: cs.backgroundColor
      };
    });

    const cards = [...document.querySelectorAll('.screenshot-scroller .screenshot-card')].map((el, index) => {
      const cs = getComputedStyle(el);
      const child = el.firstElementChild;
      const childCs = child ? getComputedStyle(child) : null;
      return {
        index,
        radius: parseFloat(cs.borderTopLeftRadius),
        overflow: cs.overflow,
        ratio: el.getBoundingClientRect().width / el.getBoundingClientRect().height,
        childRadius: childCs ? parseFloat(childCs.borderTopLeftRadius) : null
      };
    });

    const body = getComputedStyle(document.body);
    const footer = document.querySelector('.site-footer');
    const footerCs = footer ? getComputedStyle(footer) : null;
    return {
      rows,
      cards,
      bodyBackgroundImage: body.backgroundImage,
      footerBackgroundImage: footerCs?.backgroundImage || null,
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });

  const minInlinePadding = vp.name === 'sp' ? 16 : 24;
  state.rows.forEach(row => {
    if (row.paddingLeft < minInlinePadding || row.paddingRight < minInlinePadding) {
      findings.push({ viewport: vp.name, kind: 'feature-padding', row });
    }
    if (row.radius < 16) findings.push({ viewport: vp.name, kind: 'feature-radius', row });
  });

  state.cards.forEach(card => {
    if (card.radius < 14) findings.push({ viewport: vp.name, kind: 'screenshot-radius', card });
    if (!['hidden', 'clip'].includes(card.overflow)) findings.push({ viewport: vp.name, kind: 'screenshot-clipping', card });
    if (Math.abs(card.ratio - 9 / 16) > .035) findings.push({ viewport: vp.name, kind: 'screenshot-ratio', card });
    if (card.index >= 2 && card.childRadius !== null && card.childRadius < 10) {
      findings.push({ viewport: vp.name, kind: 'screenshot-inner-radius', card });
    }
  });

  if (!state.bodyBackgroundImage || state.bodyBackgroundImage === 'none') {
    findings.push({ viewport: vp.name, kind: 'background-depth', actual: state.bodyBackgroundImage });
  }
  if (state.footerBackgroundImage && state.footerBackgroundImage !== 'none') {
    findings.push({ viewport: vp.name, kind: 'footer-gradient-regression', actual: state.footerBackgroundImage });
  }
  if (state.pageOverflow > 2) findings.push({ viewport: vp.name, kind: 'horizontal-overflow', amount: state.pageOverflow });

  await context.close();
}

await browser.close();

console.log(JSON.stringify({ designPolishFindings: findings.length, findings }, null, 2));
if (findings.length) process.exit(1);
