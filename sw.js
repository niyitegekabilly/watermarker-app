const CACHE_NAME = 'watermark-studio-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/services/watermarkService.ts',
  '/components/Icons.tsx',
  '/components/Sidebar.tsx',
  '/components/PreviewModal.tsx'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only cache http/https requests (excludes chrome-extension://, blob:, etc.)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResp) => {
      if (cachedResp) return cachedResp;

      return fetch(event.request).then((networkResp) => {
        // Check for valid response
        if (!networkResp || networkResp.status !== 200 || networkResp.type === 'error') {
          return networkResp;
        }

        // Cache the new resource (including CDNs like esm.sh, tailwind, fonts)
        const responseToCache = networkResp.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResp;
      });
    })
  );
});