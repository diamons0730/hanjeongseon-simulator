const CACHE_NAME = "hanjeongseon-drag-v4";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "./manifest.json",
  "./icons/icon.svg"
];

function cacheSuccessfulResponse(event, request, response) {
  if (!response.ok) return;
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.put(request, response.clone()))
      .catch((error) => console.error("서비스 워커 캐시 저장 실패:", error))
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(request).then((response) => {
        cacheSuccessfulResponse(event, request, response);
        return response;
      }).catch(async (error) => {
        const cached = await caches.match(request);
        if (cached) return cached;
        throw error;
      })
    );
    return;
  }
});
