const CACHE_NAME = 'ezlist-cache-v2';

const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Saving files to cache...');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting(); 
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      console.log('[Service Worker] You are offline. Loading from cache...');
      return caches.match(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Deleting old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});