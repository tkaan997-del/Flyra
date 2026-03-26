const CACHE_NAME = "flyra-cache-v2";

const urlsToCache = [
  "/",
  "/index.html",
  "/planner.html",
  "/styles.css",
  "/planner.js",
  "/app.js",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/impressum.html",
  "/datenschutz.html"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
          return Promise.resolve();
        })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (!request || request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(request.url);
  const isHttpRequest = requestUrl.protocol === "http:" || requestUrl.protocol === "https:";
  const isSameOriginRequest = requestUrl.origin === self.location.origin;

  if (!isHttpRequest || !isSameOriginRequest) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          const responseClone = networkResponse.clone();
          return caches.open(CACHE_NAME).then((cache) => {
            return cache.put(request, responseClone).then(() => networkResponse);
          });
        })
        .catch(() => {
          return caches.match("/index.html");
        });
    })
  );
});
