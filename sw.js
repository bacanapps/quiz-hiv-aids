// Cache name unique to this quiz PWA
const VERSION = "v202512102020"; const CACHE_NAME = `quiz-modern-cache-${VERSION}`;

// List of files to precache for offline use.  Includes core app files, data files,
// hero image, audio description, and remote libraries loaded via CDN.
const PRECACHE_URLS = [
  "./",
  "index.html",
  "app.js",
  "manifest.json",
  "data/presentation.json",
  "data/questions.json",
  "assets/img/hero.png",
  "assets/audio/presentation.mp3",
  "assets/audio/q1.mp3",
  "assets/audio/q2.mp3",
  "assets/audio/q3.mp3",
  "assets/audio/q4.mp3",
  "assets/audio/q5.mp3",
  "assets/audio/q6.mp3",
  "assets/audio/q7.mp3",
  "assets/audio/q8.mp3",
  "assets/audio/q9.mp3",
  "assets/audio/q10.mp3",
  "assets/audio/q11.mp3",
  "assets/audio/success-fanfare-trumpets-6185.mp3",
  // External libraries
  "https://unpkg.com/react@17/umd/react.development.js",
  "https://unpkg.com/react-dom@17/umd/react-dom.development.js",
  "https://unpkg.com/@babel/standalone/babel.min.js",
  "https://unpkg.com/howler/dist/howler.min.js",
  "https://cdn.tailwindcss.com"
];

// On install, open the cache and add all precache URLs
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// On activate, clear old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      })
    ))
  );
  // Take control of all clients immediately
  return self.clients.claim();
});

// Fetch handler: serve precached assets, otherwise try network then cache
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  // Serve from cache if the request matches our precache list
  if (PRECACHE_URLS.includes(requestUrl.pathname) || PRECACHE_URLS.includes(event.request.url)) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(resp => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, resp.clone());
            return resp;
          });
        });
      })
    );
  } else {
    // Network first for any other request; fallback to cache if offline
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});