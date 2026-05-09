/* Saints matchday Loop · static file server
   Zero-dependency Node server. Routes `/` to the Saints HTML, serves
   every other file from the project root with appropriate MIME types
   and cache headers. Listens on the port Railway provides via $PORT.
*/
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const ENTRY = '/southampton-stmarys-loop.html';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
  '.txt':  'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2':'font/woff2'
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];

  // Decode URL (handles %20 etc.)
  try { urlPath = decodeURIComponent(urlPath); } catch (e) { /* ignore */ }

  // Root → Saints HTML
  if (urlPath === '/' || urlPath === '') urlPath = ENTRY;

  // Resolve and prevent directory traversal
  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback: serve the Saints HTML for any unmatched path (SPA-style)
      const fallback = path.join(ROOT, ENTRY);
      fs.stat(fallback, (e2, s2) => {
        if (e2 || !s2.isFile()) {
          res.statusCode = 404;
          res.end('Not found');
          return;
        }
        sendFile(fallback, res);
      });
      return;
    }
    sendFile(filePath, res);
  });
});

function sendFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';

  res.setHeader('Content-Type', mime);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Cache rules
  if (ext === '.html' || filePath.endsWith('service-worker.js')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  } else if (filePath.endsWith('saints-manifest.json')) {
    res.setHeader('Content-Type', 'application/manifest+json');
    res.setHeader('Cache-Control', 'public, max-age=300');
  } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp'].includes(ext)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }

  if (filePath.endsWith('service-worker.js')) {
    res.setHeader('Service-Worker-Allowed', '/');
  }

  fs.createReadStream(filePath)
    .on('error', () => { res.statusCode = 500; res.end('Server error'); })
    .pipe(res);
}

server.listen(PORT, '0.0.0.0', () => {
  console.log('Saints Loop listening on port', PORT);
});
