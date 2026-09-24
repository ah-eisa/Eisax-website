const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const base = process.env.PREVIEW_BASE || 'http://127.0.0.1:8765';
  const browser = await chromium.launch({ headless: true });
  try {
    const sitemap = fs.readFileSync(path.join(__dirname, '../sitemap.xml'), 'utf8');
    const pages = ['privacy', 'terms', 'disclaimer'];
    for (const name of pages) {
      for (const [route, lang, other] of [[`/${name}`, 'en', `/ar/${name}`], [`/ar/${name}`, 'ar', `/${name}`]]) {
        assert.ok(sitemap.includes(`https://eisax.com${route}</loc>`), `Sitemap omits ${route}`);
        for (const width of [320, 390]) {
          const page = await browser.newPage({ viewport: { width, height: 800 } });
          const errors = [];
          page.on('pageerror', error => errors.push(error.message));
          const response = await page.goto(base + route, { waitUntil: 'networkidle' });
          assert.equal(response.status(), 200, route);
          assert.match(response.headers()['content-security-policy'] || '', /static\.cloudflareinsights\.com\/beacon\.min\.js\//, `${route} preview must apply production CSP`);
          const result = await page.evaluate(() => {
            const article = document.querySelector('.legal-card');
            const scrollRegion = document.querySelector('[role="region"]');
            const table = document.querySelector('.legal-table');
            const bbox = article.getBoundingClientRect();
            const regionBox = scrollRegion?.getBoundingClientRect();
            return {
              lang: document.documentElement.lang,
              dir: document.documentElement.dir,
              bodyDir: document.body.dir,
              canonical: document.querySelector('link[rel="canonical"]')?.href,
              alternates: [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map(a => [a.hreflang, a.href]),
              h1: document.querySelectorAll('h1').length,
              articleInsideViewport: bbox.left >= -1 && bbox.right <= innerWidth + 1,
              tableContained: !table || (regionBox.left >= -1 && regionBox.right <= innerWidth + 1 && scrollRegion.scrollWidth > scrollRegion.clientWidth),
              links: [...document.querySelectorAll('.footer-links a')].map(a => a.getAttribute('href')),
              stylesheet: !!document.querySelector('link[href="/styles.css?v=7ae0245"]')
            };
          });
          assert.equal(result.lang, lang, route);
          assert.equal(result.dir || 'ltr', lang === 'ar' ? 'rtl' : 'ltr', route);
          if (lang === 'ar') assert.equal(result.bodyDir, 'rtl', route);
          assert.equal(result.canonical, `https://eisax.com${route}`, route);
          assert.ok(result.alternates.some(([language, href]) => language === (lang === 'ar' ? 'en' : 'ar') && href === `https://eisax.com${other}`), route);
          assert.equal(result.h1, 1, route);
          assert.ok(result.articleInsideViewport, `${route} article clips at ${width}px`);
          assert.ok(result.tableContained, `${route} table clips at ${width}px`);
          assert.ok(result.links.includes(route), route);
          assert.ok(result.stylesheet, route);
          assert.deepEqual(errors, [], `${route} script errors`);
          await page.close();
        }
      }
    }

    const page = await browser.newPage();
    const beacon = 'https://static.cloudflareinsights.com/beacon.min.js/v31edd6df95cf4e85bb4c19e7a9bdbcba1788362987495';
    await page.route('https://static.cloudflareinsights.com/**', route => route.fulfill({ contentType: 'text/javascript', body: 'window.__beaconAllowed = true' }));
    const home = await page.goto(base + '/', { waitUntil: 'networkidle' });
    assert.match(home.headers()['content-security-policy'] || '', /static\.cloudflareinsights\.com\/beacon\.min\.js\//, 'Home preview must apply production CSP');
    const csp = await page.evaluate(() => new Promise(resolve => {
      const script = document.createElement('script');
      script.src = 'https://static.cloudflareinsights.com/beacon.min.js/v31edd6df95cf4e85bb4c19e7a9bdbcba1788362987495';
      script.onload = () => resolve(window.__beaconAllowed === true);
      script.onerror = () => resolve(false);
      document.body.append(script);
      setTimeout(() => resolve(false), 5000);
    }));
    assert.ok(csp, `CSP blocks Cloudflare's versioned beacon: ${beacon}`);
    await page.close();
    console.log('Legal language routes, mobile table bounds, and versioned Cloudflare beacon CSP passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
