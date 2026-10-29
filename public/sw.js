// Service Worker for Samrajya Sovereign OS
const CACHE_NAME = 'samrajya-pwa-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Pass-through fetch event handler fulfilling Chromium PWA installability requirements
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Always network first, fall back to cache if offline
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
