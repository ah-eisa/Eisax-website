const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

function intersection(a, b) {
  return Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
    Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
}
(async () => {
  const browser = await chromium.launch({ headless: true });
  const screenshots = path.resolve(__dirname, '../screenshots');
  fs.mkdirSync(screenshots, { recursive: true });
  const reports = [];
  const widths = process.env.ORBIT_WIDTH ? [Number(process.env.ORBIT_WIDTH)] : [1440, 980, 590, 390, 320];
  for (const width of widths) {
    for (const language of ['en', 'ar']) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
      await page.addInitScript(() => localStorage.setItem('eisax-theme', 'light'));
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${process.env.PREVIEW_BASE || 'http://127.0.0.1:8765'}/${language === 'ar' ? 'ar/' : ''}`, { waitUntil: 'networkidle' });
      const boxes = await page.evaluate(() => {
        const rect = element => { const r = element.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; };
        return {
          hub: rect(document.querySelector('.hub')),
          hubCore: rect(document.querySelector('.hub-core')),
          logo: rect(document.querySelector('.hub-logo-img')),
          title: rect(document.querySelector('.hub-title')),
          subtitle: rect(document.querySelector('.hub-sub')),
          nodes: [...document.querySelectorAll('.hero-visual .node')].map(node => ({ name: node.getAttribute('aria-label'), box: rect(node) })),
          viewport: innerWidth
        };
      });
      const collisions = [];
      for (let i = 0; i < boxes.nodes.length; i++) {
        for (let j = i + 1; j < boxes.nodes.length; j++) {
          if (intersection(boxes.nodes[i].box, boxes.nodes[j].box) > 10) collisions.push([boxes.nodes[i].name, boxes.nodes[j].name]);
        }
      }
      const escapes = ['logo', 'title', 'subtitle'].filter(key => {
        const b = boxes[key], h = boxes.hub;
        return b.left < h.left + 8 || b.right > h.right - 8 || b.top < h.top + 8 || b.bottom > h.bottom - 8;
      });
      const offscreen = boxes.nodes.filter(n => n.box.left < -1 || n.box.right > boxes.viewport + 1).map(n => n.name);
      const report = { width, language, nodes: boxes.nodes.length, collisions, escapes, offscreen, errors };
      reports.push(report);
      if ([1440, 590, 390].includes(width)) await page.locator('.hero-visual').screenshot({ path: path.join(screenshots, `orbit-${language}-${width}-light.png`) });
      if (width === 1440 && language === 'en') {
        for (const [node, target] of [['.node-1', '#investment'], ['.node-8', '#academy']]) {
          await page.locator(node).click();
          if (!(await page.locator(target).evaluate(element => element.classList.contains('card-highlight')))) report.errors.push(`${node} failed to highlight ${target}`);
        }
      }
      await page.close();
    }
  }
  await browser.close();
  console.log(JSON.stringify(reports, null, 2));
  if (reports.some(r => r.nodes !== 7 || r.collisions.length || r.escapes.length || r.offscreen.length || r.errors.length)) process.exit(1);
})().catch(e => { console.error(e); process.exit(1); });
