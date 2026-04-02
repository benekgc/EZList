// Jak kiedyś zaktualizujesz apkę, zmień to np. na 'ezlist-cache-v2'
const CACHE_NAME = 'ezlist-cache-v1';

// Lista plików, które chcemy pobrać i zapisać offline
const FILES_TO_CACHE = [
  './',             // Główny katalog (bardzo ważne!)
  './index.html',   // Twój kod
  './manifest.json',// Twój manifest
  './icon-192.png', // Twoje ikony
  './icon-512.png'
];

// 1. Etap instalacji: pobieramy pliki i wrzucamy do Cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Zapisywanie plików w pamięci podręcznej...');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  // Zmusza nowy Service Worker do natychmiastowego przejęcia kontroli
  self.skipWaiting(); 
});

// 2. Etap działania: przechwytujemy zapytania z apki (tzw. Cache First)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Jeśli plik jest w pamięci telefonu, zwracamy go natychmiast (działa offline!)
      if (response) {
        return response;
      }
      // Jeśli go nie ma (np. jakiś link do zewnętrznej strony), próbujemy pobrać z sieci
      return fetch(event.request);
    })
  );
});

// 3. Etap aktywacji: sprzątanie starych wersji
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Usuwanie starego cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});