const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon', '.svg': 'image/svg+xml' };
http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }
  if (pathname.includes('..') || /(^|\/)(\.|docs|tests|screenshots)(\/|$)/.test(pathname)) { res.writeHead(404).end(); return; }
  const redirects = { '/products': '/products/', '/ar/products': '/ar/products/', '/privacy': '/privacy.html', '/terms': '/terms.html', '/disclaimer': '/disclaimer.html' };
  if (redirects[pathname] && !redirects[pathname].endsWith('.html')) { res.writeHead(301, { Location: redirects[pathname] }).end(); return; }
  let relative = (redirects[pathname] || pathname).replace(/^\//, '');
  if (!relative || relative.endsWith('/')) relative += 'index.html';
  const target = path.resolve(root, relative);
  if (!target.startsWith(root + path.sep)) { res.writeHead(404).end(); return; }
  fs.readFile(target, (error, data) => {
    if (error) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
}).listen(8765, '127.0.0.1', () => console.log('Local preview: http://127.0.0.1:8765/'));
