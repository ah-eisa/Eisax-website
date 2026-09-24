(function () {
  const entries = window.EISAX_REGISTRY;
  if (!Array.isArray(entries)) return;
  const ar = location.pathname.startsWith('/ar/');
  const labels = ar ? {
    finance: 'التقنية المالية', communication: 'التواصل', education: 'التعليم', future: 'المستقبل والبحث',
    maturity: 'النضج', access: 'الوصول', audience: 'الجمهور', commercial: 'النموذج التجاري',
    ready: 'منتج قائم أو قريب من الإطلاق', futureStage: 'مستقبلي — بلا منتج أولي',
    restricted: 'وصول محمي', login: 'تسجيل دخول', 'public-tool': 'أداة عامة', 'public-demo': 'عرض عام',
    'public-app': 'تطبيق عام', 'public-preview': 'معاينة عامة', 'not-available': 'غير متاح',
    open: 'زيارة المنتج ←', protected: 'فتح التطبيق المحمي ←', none: 'لا يوجد تطبيق متاح',
    research: 'فكرة بحثية، وليست منتجًا متاحًا أو خدمة منظمة.'
  } : {
    finance: 'Financial Technology', communication: 'Communication', education: 'Education', future: 'Future / R&D',
    maturity: 'Maturity', access: 'Access', audience: 'Audience', commercial: 'Commercial model',
    ready: 'Production or near-ready', futureStage: 'Future — no MVP',
    restricted: 'Restricted access', login: 'Sign-in required', 'public-tool': 'Public tool', 'public-demo': 'Public demo',
    'public-app': 'Public app', 'public-preview': 'Public preview', 'not-available': 'Not available',
    open: 'Visit product →', protected: 'Open protected application →', none: 'No application available',
    research: 'Research direction, not an available product or regulated service.'
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
  function el(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content) node.textContent = content;
    return node;
  }
  function card(p) {
    const article = el('article', 'product-card registry-card');
    article.id = p.id;
    const top = el('div', 'product-top');
    top.append(el('span', 'product-pill', labels[p.sector]));
    top.append(el('span', 'product-badge' + (p.sector === 'future' ? ' badge-lab' : ''), p.maturity.startsWith('future') ? labels.futureStage : labels.ready));
    article.append(top, el('h3', '', p.name), el('p', 'product-sub', p[ar ? 'ar' : 'en']));
    const facts = el('dl', 'registry-facts');
    [[labels.maturity, p.maturity.startsWith('future') ? labels.futureStage : labels.ready],
      [labels.access, labels[p.access]], [labels.audience, ar ? audienceAr[p.id] : p.audience], [labels.commercial, ar ? commercialAr(p) : p.commercial]]
      .forEach(([name, value]) => { const row = el('div', 'registry-fact'); row.append(el('dt', '', name), el('dd', '', value)); facts.append(row); });
    article.append(facts);
    if (p.url) {
      const link = el('a', 'text-link', p.access === 'login' || p.access === 'restricted' ? labels.protected : labels.open);
      link.href = p.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      article.append(link);
    } else article.append(el('span', 'registry-unavailable', labels.none));
    return article;
  }
  document.querySelectorAll('[data-registry-grid]').forEach(grid => {
    const kind = grid.dataset.registryGrid;
    grid.replaceChildren(...entries.filter(p => kind === 'future' ? p.sector === 'future' : p.sector !== 'future').map(card));
  });
})();
