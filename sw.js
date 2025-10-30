// Cache name unique to this quiz PWA
const CACHE_NAME = "quiz-hiv-aids-cache-v2";

// List of files to precache for offline use
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./app.js",
  "./manifest.json",
  "./questions.json",
  // CSS files
  "./assets/css/app.css",
  "./assets/css/theme.css",
  "./assets/styles.css",
  // Images
  "./assets/img/hero.png",
  "./assets/img/icon-192.png",
  "./assets/img/icon-512.png",
  // Audio files
  "./audio/presentation.mp3",
  "./audio/q1.mp3",
  "./audio/q2.mp3",
  "./audio/q3.mp3",
  "./audio/q4.mp3",
  "./audio/q5.mp3",
  "./audio/q6.mp3",
  // Data files
  "./data/presentation.json"
];

// Install event - precache all files
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Precaching files");
        return cache.addAll(PRECACHE_URLS);
      })
      .catch((error) => {
        console.error("[Service Worker] Precaching failed:", error);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  
  // Only handle GET requests
  if (request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // If we have a cached response, return it
        if (cachedResponse) {
          // Still fetch from network in background to update cache (stale-while-revalidate)
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, networkResponse.clone());
                });
              }
            })
            .catch(() => {
              // Network fetch failed, but we already have cached response
            });
          
          return cachedResponse;
        }

        // No cached response, try network
        return fetch(request)
          .then((networkResponse) => {
            // Check if valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
              return networkResponse;
            }

            // Clone the response as it can only be consumed once
            const responseToCache = networkResponse.clone();

            // Cache the new response for future use
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });

            return networkResponse;
          })
          .catch((error) => {
            console.error("[Service Worker] Fetch failed:", error);
            // Could return a custom offline page here if needed
            throw error;
          });
      })
  );
});

// Listen for messages from the client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
