const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const base = process.env.PREVIEW_BASE || 'http://127.0.0.1:8765';
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [route, lang, counterpart] of [['/security', 'en', '/ar/security'], ['/ar/security', 'ar', '/security']]) {
      const html = fs.readFileSync(path.join(__dirname, '..', lang === 'ar' ? 'ar/security.html' : 'security.html'), 'utf8');
      assert.doesNotMatch(html, /\[VERIFY\]|security@eisax\.com|mandatory MFA|ISO 27001|SOC 2|self.approval|hosting region|retention period/i, route);
      assert.match(html, /mailto:partnerships@eisax\.com/, route);
      assert.ok(html.includes(lang === 'ar' ? 'للقراءة فقط ويستخدم بيانات اصطناعية' : 'read-only and uses synthetic data'), route);
      assert.ok(html.includes(lang === 'ar' ? 'وقد تتطلب وظائف المؤسسات وصولًا خاضعًا للتحكم' : 'Enterprise functionality may require controlled access'), route);
      for (const width of [1440, 768, 390, 320]) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        const errors = [];
        const assetFailures = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('response', response => {
          if (response.url().startsWith(base) && response.status() >= 400) assetFailures.push(`${response.status()} ${response.url()}`);
        });
        const response = await page.goto(base + route, { waitUntil: 'networkidle' });
        assert.equal(response.status(), 200, route);
        const initial = await page.evaluate(() => ({
          lang: document.documentElement.lang,
          dir: document.documentElement.dir,
          bodyDir: document.body.dir,
          title: document.title,
          canonical: document.querySelector('link[rel="canonical"]')?.href,
          stylesheet: !!document.querySelector('link[href="/styles.css?v=security-20260930"]'),
          card: !!document.querySelector('.legal-card'),
          overflow: document.documentElement.scrollWidth > innerWidth,
          sectionCount: document.querySelectorAll('.legal-card h2').length,
          footerLink: document.querySelector('.footer-links a[href$="/security"]')?.textContent,
          internalLinks: [...document.querySelectorAll('a[href^="/"]')].map(a => a.getAttribute('href').split('#')[0]).filter(Boolean)
        }));
        assert.equal(initial.lang, lang, route);
        assert.equal(initial.dir || 'ltr', lang === 'ar' ? 'rtl' : 'ltr', route);
        if (lang === 'ar') assert.equal(initial.bodyDir, 'rtl', route);
        assert.equal(initial.canonical, `https://eisax.com${route}`, route);
        assert.ok(initial.title.includes('EISAX') && initial.stylesheet && initial.card && initial.sectionCount === 3, route);
        assert.ok(!initial.overflow, `${route} overflows at ${width}px`);
        assert.ok(initial.footerLink, `${route} missing footer link`);
        if (width !== 320) {
          const capture = path.join(__dirname, '..', 'screenshots', `security-${lang}-${width}.png`);
          fs.mkdirSync(path.dirname(capture), { recursive: true });
          await page.screenshot({ path: capture, fullPage: true });
        }
        for (const link of new Set(initial.internalLinks)) {
          const linked = await page.request.get(base + link);
          assert.equal(linked.status(), 200, `${route}: broken ${link}`);
        }
        await page.locator('#themeToggle').click();
        assert.equal(await page.locator('html').getAttribute('data-theme'), 'light', route);
        await page.reload({ waitUntil: 'networkidle' });
        assert.equal(await page.locator('html').getAttribute('data-theme'), 'light', `${route}: theme did not persist`);
        if (width === 390) {
          await page.locator('#langToggle').click();
          await page.waitForURL('**' + counterpart);
          assert.equal(new URL(page.url()).pathname, counterpart, route);
        }
        assert.deepEqual(errors, [], `${route}: script errors`);
        assert.deepEqual(assetFailures, [], `${route}: asset failures`);
        await page.close();
      }
    }
    console.log('Security routes, responsive bounds, theme and language toggles, claims, and internal links passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
