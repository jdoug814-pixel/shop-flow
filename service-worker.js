const CACHE_NAME = "autoflow-cache-v1";
const ASSETS = [
  "index.html",
  "style.css",
  "app.js",
  "manifest.json",
  "icon.png"
];

// Install Event - cache core shell assets
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching app shell assets");
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event - clear old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - network first, fallback to cache
self.addEventListener("fetch", (e) => {
  // Let the browser handle standard API requests normally (like the NHTSA VIN API)
  if (e.request.url.includes("nhtsa.dot.gov")) {
    return;
  }
  
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Clone response and cache it
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, resClone);
        });
        return res;
      })
      .catch(() => {
        // Fallback to cache if offline
        return caches.match(e.request);
      })
  );
});
