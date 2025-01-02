// sw.js

const CACHE_NAME = 'daily-sync-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/styles.css',
  '/scripts/app.js',
  '/assets/icons/budget-icon.svg',
  '/assets/icons/mood-icon.svg',
  '/assets/icons/emergency-icon.svg',
  // Füge weitere Ressourcen hinzu, die gecached werden sollen
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames.map((cacheName) => {
        if (!cacheWhitelist.includes(cacheName)) {
          return caches.delete(cacheName);
        }
      })
    ))
  );
});
