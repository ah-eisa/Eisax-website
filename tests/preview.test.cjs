const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const base = process.env.PREVIEW_BASE || 'http://127.0.0.1:8765';
  const targets = [
    ['home-en', '/', 'en'], ['home-ar', '/ar/', 'ar'],
    ['products-en', '/products/', 'en'], ['products-ar', '/ar/products/', 'ar']
  ];
  const results = [];
  fs.mkdirSync(path.resolve(__dirname, '../screenshots'), { recursive: true });
  for (const width of [1440, 390]) {
    for (const [name, route, lang] of targets) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
      await page.addInitScript(() => localStorage.setItem('eisax-lang', 'invalid-legacy-value'));
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      const response = await page.goto(base + route, { waitUntil: 'networkidle' });
      const result = await page.evaluate(() => ({
        lang: document.documentElement.lang,
        dir: document.documentElement.dir || 'ltr',
        title: document.title,
        available: document.querySelectorAll('[data-registry-grid="available"] .registry-card').length,
        future: document.querySelectorAll('[data-registry-grid="future"] .registry-card').length,
        academy: !!document.querySelector('#academy'),
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 2,
        brokenLocalLinks: [...document.querySelectorAll('a[href^="#"]')].filter(a => !document.querySelector(a.getAttribute('href'))).map(a => a.getAttribute('href')),
        unnamedLinks: [...document.querySelectorAll('a')].filter(a => !(a.textContent.trim() || a.getAttribute('aria-label') || a.querySelector('img[alt]'))).length,
        unnamedButtons: [...document.querySelectorAll('button')].filter(b => !(b.textContent.trim() || b.getAttribute('aria-label'))).length,
        missingImageAlt: document.querySelectorAll('img:not([alt])').length,
        h1Count: document.querySelectorAll('h1').length,
        canonical: !!document.querySelector('link[rel="canonical"]'),
        structuredData: !!document.querySelector('script[type="application/ld+json"]')
      }));
      const row = { name, width, status: response.status(), errors, ...result };
      if (width === 390 && name.startsWith('home-')) {
        const toggle = page.locator('#mobileToggle');
        await toggle.click();
        row.mobileDrawerOpens = await page.locator('#mobileDrawer').getAttribute('aria-hidden') === 'false';
        await page.keyboard.press('Escape');
        row.mobileDrawerCloses = await page.locator('#mobileDrawer').getAttribute('aria-hidden') === 'true';
      }
      results.push(row);
      await page.screenshot({ path: path.resolve(__dirname, `../screenshots/${name}-${width}.png`), fullPage: true });
      if (row.status !== 200 || row.lang !== lang || row.dir !== (lang === 'ar' ? 'rtl' : 'ltr') || row.available !== 7 || row.future !== 2 || !row.academy || row.horizontalOverflow || errors.length || row.brokenLocalLinks.length || row.unnamedLinks || row.unnamedButtons || row.missingImageAlt || row.h1Count !== 1 || !row.canonical || !row.structuredData || row.mobileDrawerOpens === false || row.mobileDrawerCloses === false) {
        throw new Error(JSON.stringify(row));
      }
      await page.close();
    }
  }
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})().catch(e => { console.error(e); process.exit(1); });
