const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const csp = fs.readFileSync(path.join(root, '_headers'), 'utf8').match(/^  Content-Security-Policy: (.+)$/m)?.[1]?.trim();
if (!csp) throw new Error('Missing production CSP in _headers');
const pageRedirects = new Map(fs.readFileSync(path.join(root, '_redirects'), 'utf8')
  .split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#'))
  .filter(line => !line.split(/\s+/)[0].includes('*'))
  .map(line => { const [source, destination] = line.split(/\s+/); return [source, destination]; }));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon', '.svg': 'image/svg+xml' };
http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }
  if (pathname.includes('..') || /(^|\/)(\.|docs|tests|screenshots)(\/|$)/.test(pathname)) { res.writeHead(404).end(); return; }
  if (pageRedirects.has(pathname)) { res.writeHead(301, { Location: pageRedirects.get(pathname) }).end(); return; }
  const redirects = { '/products': '/products/', '/ar/products': '/ar/products/', '/privacy': '/privacy.html', '/terms': '/terms.html', '/disclaimer': '/disclaimer.html', '/ar/privacy': '/ar/privacy.html', '/ar/terms': '/ar/terms.html', '/ar/disclaimer': '/ar/disclaimer.html' };
  if (redirects[pathname] && !redirects[pathname].endsWith('.html')) { res.writeHead(301, { Location: redirects[pathname] }).end(); return; }
  let relative = (redirects[pathname] || pathname).replace(/^\//, '');
  if (!relative || relative.endsWith('/')) relative += 'index.html';
  const target = path.resolve(root, relative);
  if (!target.startsWith(root + path.sep)) { res.writeHead(404).end(); return; }
  fs.readFile(target, (error, data) => {
    if (error) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'Content-Security-Policy': csp });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
}).listen(Number(process.env.PREVIEW_PORT || 8765), '127.0.0.1', () => console.log(`Local preview: http://127.0.0.1:${process.env.PREVIEW_PORT || 8765}/`));
