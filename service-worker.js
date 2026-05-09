/* Saints matchday Loop · service worker
   Minimal pass-through SW so Android Chrome shows the full Install banner
   instead of the lighter Add-to-Home-Screen prompt.
   Caches the app shell on install + cache-on-fetch for everything else.
*/
const CACHE = 'saints-v2';
const SHELL = [
  './',
  './southampton-stmarys-loop.html',
  './saints-manifest.json',
  './southampton-logo.png',
  './southampton-logo-192.png',
  './southampton-logo-512.png',
  './stmarys-map.jpg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL).catch(() => {})) // tolerate missing assets
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Bypass cross-origin (Google Fonts handles its own caching, YouTube thumbs etc.)
  if (url.origin !== self.location.origin) return;

  const isHtml = e.request.mode === 'navigate'
    || e.request.headers.get('accept')?.includes('text/html')
    || url.pathname.endsWith('.html')
    || url.pathname === '/';

  if (isHtml) {
    // Network-first for HTML — always pick up the latest deploy
    e.respondWith(
      fetch(e.request).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./southampton-stmarys-loop.html')))
    );
    return;
  }

  // Cache-first for everything else (images, JSON, fonts)
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      if (res.ok) caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match('./southampton-stmarys-loop.html')))
  );
});
