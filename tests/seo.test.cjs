const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const pages = new Map([
  ['/', 'index.html'], ['/ar/', 'ar/index.html'],
  ['/products/', 'products/index.html'], ['/ar/products/', 'ar/products/index.html'],
  ['/privacy', 'privacy.html'], ['/ar/privacy', 'ar/privacy.html'],
  ['/terms', 'terms.html'], ['/ar/terms', 'ar/terms.html'],
  ['/disclaimer', 'disclaimer.html'], ['/ar/disclaimer', 'ar/disclaimer.html']
]);

function publicHtmlFiles(directory = root) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (['node_modules', 'screenshots', 'docs', 'tests', '.git', 'preview-dist'].includes(entry.name)) return [];
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return publicHtmlFiles(full);
    return entry.name.endsWith('.html') ? [path.relative(root, full).replaceAll('\\', '/')] : [];
  });
}

const allowedHtml = new Set([...pages.values(), '404.html']);
assert.deepEqual(new Set(publicHtmlFiles()), allowedHtml, 'Unexpected deployable HTML, possibly a retired generated page');

for (const [route, file] of pages) {
  const html = read(file);
  const expectedUrl = `https://eisax.com${route}`;
  assert.match(html, new RegExp(`<link rel="canonical" href="${expectedUrl.replaceAll('.', '\\.')}"`), file);
  assert.ok(!html.includes('EisaX'), `${file}: legacy brand capitalization`);
  assert.ok(!html.includes('One umbrella. Five products.'), `${file}: legacy positioning`);
  const otherRoute = route.startsWith('/ar/') ? route.replace(/^\/ar/, '') : `/ar${route}`;
  assert.ok(html.includes(`hreflang="${route.startsWith('/ar/') ? 'en' : 'ar'}" href="https://eisax.com${otherRoute}"`), `${file}: reciprocal locale`);
}
assert.ok(!read('404.html').includes('EisaX'));
assert.ok(!read('main.js').includes('EisaX'));

for (const file of ['index.html', 'ar/index.html']) {
  const html = read(file);
  const block = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/);
  assert.ok(block, `${file}: Organization JSON-LD missing`);
  const organization = JSON.parse(block[1]);
  assert.equal(organization['@type'], 'Organization');
  assert.equal(organization['@id'], 'https://eisax.com/#organization');
  assert.equal(organization.name, 'EISAX');
  assert.equal(organization.legalName, 'EISAX FZ-LLC');
  assert.equal(organization.url, 'https://eisax.com/');
  assert.equal(organization.logo, 'https://eisax.com/assets/logo-mark.webp');
  assert.equal(organization.address?.addressCountry, 'AE');
  assert.ok(!organization.sameAs, 'Do not assert unverified social profiles');
}

const sitemap = read('sitemap.xml');
const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.deepEqual(new Set(listed), new Set([...pages.keys()].map(route => `https://eisax.com${route}`)), 'Sitemap must contain exactly the current indexable canonical pages');
assert.equal(listed.length, pages.size, 'Duplicate sitemap URL');
assert.ok(read('robots.txt').includes('Sitemap: https://eisax.com/sitemap.xml'));

const redirectLines = read('_redirects').split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#'));
const redirects = new Map();
for (const line of redirectLines) {
  const [source, destination, status, extra] = line.split(/\s+/);
  assert.ok(source?.startsWith('/') && destination?.startsWith('/') && status === '301' && !extra, `Invalid redirect: ${line}`);
  assert.ok(!redirects.has(source), `Duplicate redirect: ${source}`);
  redirects.set(source, destination);
  const pathname = destination.split('#')[0];
  assert.ok(pages.has(pathname), `Redirect destination is not a canonical page: ${line}`);
  const fragment = destination.split('#')[1];
  if (fragment) assert.ok(read(pages.get(pathname)).includes(`id="${fragment}"`), `Missing redirect anchor: ${line}`);
}
for (const source of ['/platform', '/ar-platform', '/ar-products', '/eisax-agent', '/eisax-planner', '/eisax-lab', '/insights', '/partnerships.html', '/ar-partnerships', '/legal', '/ar.html']) {
  assert.ok(redirects.has(source), `Missing known legacy redirect: ${source}`);
}
console.log(`${pages.size} canonical pages, Organization data, sitemap, robots and ${redirects.size} redirects verified.`);
