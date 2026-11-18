// PrepperFamily.org — Service Worker v1 (PWA)
// Estrategia: las páginas se intentan en red primero y se guardan al
// visitarlas (biblioteca offline); los archivos del sitio se sirven
// desde la caché cuando ya están guardados. Sin conexión y sin copia
// guardada, se muestra /offline.html.
const CACHE = 'prepperfamily-v24';
const CORE = [
  '/',
 '/es/', '/en/',
  '/manifest.webmanifest',
  '/offline.html',
  '/assets/css/tipografia-sitio.css?v=2',
  '/assets/images/header/logo.webp',
  '/assets/images/header/logo-app.webp',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/search-index-es.json',
  '/assets/search-index-en.json',
  '/assets/js/pwa-install.js?v=2',
  '/es/guardados/', '/en/saved/'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navegación (páginas): red primero, luego caché, luego offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(cache => cache.put(req, copy));
        return res;
      }).catch(() =>
        caches.match(req).then(cached => cached || caches.match('/offline.html'))
      )
    );
    return;
  }

  // Archivos del sitio (CSS, imágenes, JSON): caché primero.
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(req, copy));
        }
        return res;
      });
    })
  );
});
