// Self-healing Service Worker: purges stale Vite/PWA caches and passes all requests directly to network
const CACHE_NAME = 'lurl-pwa-v2-clean';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => Promise.all(cacheNames.map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
      .then(() => self.registration.unregister())
      .catch(() => {})
  );
});

// Always pass through directly to network so Vite modules and live APIs never fail or serve stale cache
self.addEventListener('fetch', (event) => {
  return;
});
