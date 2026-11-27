const CACHE_PREFIX = "ldn-vitrine-";
const CACHE_NAME = `${CACHE_PREFIX}v17`;
const APP_FILES = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/v2/site/styles.css",
  "/v2/site/app.js",
  "/v2/site/catalog.js",
  "/assets/icon-192.png",
  "/assets/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  if (event.request.method !== "GET" || requestUrl.origin !== self.location.origin) return;

  const path = requestUrl.pathname;
  const refreshableAsset =
    path === "/v2/site/app.js" ||
    path === "/v2/site/catalog.js" ||
    path === "/v2/site/styles.css" ||
    path === "/manifest.webmanifest";

  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match("/index.html")));
    return;
  }

  // Keep the storefront's code fresh after publication, while retaining
  // the last cached copy as an offline fallback.
  if (refreshableAsset) {
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
