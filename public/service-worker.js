const CACHE_NAME = "tripshield-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/dashboard.html",
  "/tracking.html",
  "/offline.html",
  "/css/style.css",
  "/js/app.js",
  "/images/icon-192.png",
  "/images/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request)
          .catch(() => caches.match("/offline.html"));
      })
  );
});
