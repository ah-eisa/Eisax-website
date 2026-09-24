// Deterministic static rendering for Cloudflare Pages. The published HTML is
// complete without JavaScript; registry facts are not client-side injected.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const pages = ['index.html', 'ar/index.html', 'products/index.html', 'ar/products/index.html'];
const check = process.argv.includes('--check');
// Git may check out the same generated files as LF or CRLF on Windows.
const normalizeLineEndings = value => value.replace(/\r\n?/g, '\n');
const registryScope = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'product-registry.js'), 'utf8'), registryScope);
const products = registryScope.window.EISAX_REGISTRY;
if (!Array.isArray(products) || products.length !== 9) throw new Error('Expected nine approved registry entries');

const labels = {
  en: {
    finance: 'Financial Technology', communication: 'Communication', education: 'Education', future: 'Future / R&D',
    maturity: 'Maturity', access: 'Access', audience: 'Audience', commercial: 'Commercial model',
    ready: 'Production or near-ready', futureStage: 'Future — no MVP',
    restricted: 'Restricted access', login: 'Sign-in required', 'public-tool': 'Public tool', 'public-demo': 'Public demo',
    'public-app': 'Public app', 'public-preview': 'Public preview', 'not-available': 'Not available',
    open: 'Visit product →', protected: 'Open protected application →'
  },
  ar: {
    finance: 'التقنية المالية', communication: 'التواصل', education: 'التعليم', future: 'المستقبل والبحث',
    maturity: 'النضج', access: 'الوصول', audience: 'الجمهور', commercial: 'النموذج التجاري',
    ready: 'منتج قائم أو قريب من الإطلاق', futureStage: 'مستقبلي — بلا منتج أولي',
    restricted: 'وصول محمي', login: 'تسجيل دخول', 'public-tool': 'أداة عامة', 'public-demo': 'عرض عام',
    'public-app': 'تطبيق عام', 'public-preview': 'معاينة عامة', 'not-available': 'غير متاح',
    open: 'زيارة المنتج ←', protected: 'فتح التطبيق المحمي ←'
  }
};
const audienceAr = {
  investment: 'المؤسسات المالية وفرق الأبحاث', wealthgate: 'مديرو الثروات والمؤسسات المالية',
  planner: 'الأفراد ومقدمو الخدمات المالية', savebuddy: 'البنوك والمحافظ الإلكترونية وشركات التقنية المالية',
  brevoya: 'الأفراد والفرق متعددة اللغات', equiz: 'المعلمون والمتعلمون', academy: 'المتعلمون المهنيون',
  digital: 'المهتمون بالبحث', lab: 'شركاء البحث والابتكار'
};
const commercialAr = p => p.sector === 'future' ?
  (p.id === 'lab' ? 'ليست منتجًا تجاريًا' : 'غير محدد') :
  (p.sector === 'finance' ? 'ترخيص مؤسسي / SaaS / اشتراك بحسب التشغيل' : 'اشتراك بحدود مجانية');
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function facts(p, lang) {
  const l = labels[lang];
  const pairs = [
    [l.maturity, p.maturity.startsWith('future') ? l.futureStage : l.ready],
    [l.access, l[p.access]],
    [l.audience, lang === 'ar' ? audienceAr[p.id] : p.audience],
    [l.commercial, lang === 'ar' ? commercialAr(p) : p.commercial]
  ];
  if (pairs.some(([key, value]) => !key || !value)) throw new Error(`Incomplete facts for ${p.id}/${lang}`);
  return `<dl class="registry-facts">\n${pairs.map(([key, value]) => `    <div class="registry-fact"><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join('\n')}\n  </dl>`;
}

function activeCard(p, lang) {
  const l = labels[lang];
  const cta = p.access === 'login' || p.access === 'restricted' ? l.protected : l.open;
  return `  <article class="product-card registry-card" id="${esc(p.id)}">\n` +
    `  <div class="product-top"><span class="product-pill">${esc(l[p.sector])}</span><span class="product-badge">${esc(l.ready)}</span></div>\n` +
    `  <h3>${esc(p.name)}</h3>\n  <p class="product-sub">${esc(p[lang])}</p>\n  ${facts(p, lang)}\n` +
    `  <a class="text-link" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${esc(cta)}</a>\n  </article>`;
}

function futureItem(p, lang) {
  const l = labels[lang];
  return `  <article class="research-item" id="${esc(p.id)}">\n` +
    `  <span class="product-pill">${esc(l.futureStage)}</span>\n  <h3>${esc(p.name)}</h3>\n  <p>${esc(p[lang])}</p>\n  ${facts(p, lang)}\n  </article>`;
}

function replaceBlock(html, kind, content) {
  const start = `<!-- registry:${kind}:start -->`;
  const end = `<!-- registry:${kind}:end -->`;
  const first = html.indexOf(start);
  const last = html.indexOf(end);
  if (first < 0 || last < first || html.indexOf(start, first + 1) >= 0 || html.indexOf(end, last + 1) >= 0) {
    throw new Error(`Expected exactly one ${kind} registry block`);
  }
  return html.slice(0, first + start.length) + '\n' + content + '\n        ' + html.slice(last);
}

const mainPath = path.join(root, 'main.js');
const main = normalizeLineEndings(fs.readFileSync(mainPath, 'utf8'));
const marker = '// Fail-safe Storage Helper';
const markerAt = main.indexOf(marker);
if (markerAt < 0) throw new Error('main.js storage boundary missing');
const i18n = vm.runInNewContext(main.slice(0, markerAt) + '\ni18n;', {});
const used = new Set(['page.title', 'page.desc']);
const pending = new Map();

for (const relative of pages) {
  const lang = relative.startsWith('ar/') ? 'ar' : 'en';
  let html = normalizeLineEndings(fs.readFileSync(path.join(root, relative), 'utf8'));
  const available = products.filter(p => p.sector !== 'future');
  const future = products.filter(p => p.sector === 'future');
  html = replaceBlock(html, 'available', `<div class="products-grid" data-registry-grid="available">\n${available.map(p => activeCard(p, lang)).join('\n')}\n</div>`);
  html = replaceBlock(html, 'future', `<div class="research-grid" data-registry-grid="future">\n${future.map(p => futureItem(p, lang)).join('\n')}\n</div>`);
  pending.set(relative, html);
}

for (const relative of ['index.html', 'ar/index.html']) {
  const lang = relative.startsWith('ar/') ? 'ar' : 'en';
  let html = pending.get(relative);
  html = html.replace(/<([a-z][\w-]*)\b([^>]*\bdata-i18n="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/gi, (whole, tag, attrs, key, content) => {
    used.add(key);
    const translation = i18n[lang]?.[key];
    if (typeof translation !== 'string') throw new Error(`Missing ${lang} translation: ${key}`);
    if (/<[a-z]/i.test(content)) throw new Error(`Nested markup under data-i18n=${key}`);
    return `<${tag}${attrs}>${esc(translation)}</${tag}>`;
  });
  pending.set(relative, html);
}

for (const [relative, content] of pending) {
  const destination = path.join(root, relative);
  const existing = normalizeLineEndings(fs.readFileSync(destination, 'utf8'));
  if (check && existing !== content) throw new Error(`Generated HTML is stale: ${relative}`);
  if (!check && existing !== content) fs.writeFileSync(destination, content, 'utf8');
}

// The runtime dictionary contains only keys still used in public HTML.
const compact = Object.fromEntries(['en', 'ar'].map(lang => [lang,
  Object.fromEntries([...used].sort().map(key => {
    if (typeof i18n[lang]?.[key] !== 'string') throw new Error(`Missing ${lang} translation: ${key}`);
    return [key, i18n[lang][key]];
  }))
]));
const renderedMain = `// Bilingual UI behavior; visible content is also pre-rendered in HTML.\nconst i18n = ${JSON.stringify(compact, null, 2)};\n\n` + main.slice(markerAt);
if (check && main !== renderedMain) throw new Error('main.js contains unused or stale translations');
if (!check && main !== renderedMain) fs.writeFileSync(mainPath, renderedMain, 'utf8');
console.log(check ? 'Static pages and translations are current.' : 'Rendered static registry cards and synchronized public translations.');
