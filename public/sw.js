const CACHE_NAME = "kockulator-v2";
const APP_SHELL = [
  "/manifest.webmanifest",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  if (!requestUrl.protocol.startsWith("http")) return;

  // Always prefer the network for page navigations so new Netlify deploys
  // show up immediately without requiring users to clear cache manually.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => response)
        .catch(() => caches.match("/") || caches.match("/manifest.webmanifest"))
    );
    return;
  }

  const isStaticAsset =
    requestUrl.pathname.startsWith("/_next/static/") ||
    requestUrl.pathname.startsWith("/icons/") ||
    requestUrl.pathname === "/manifest.webmanifest";

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached && isStaticAsset) return cached;

      return fetch(event.request)
        .then((response) => {
          if (!response.ok || !response.url.startsWith("http")) {
            return response;
          }

          if (isStaticAsset) {
            const cloned = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, cloned))
              .catch(() => {
                // Ignore unsupported schemes such as browser extension assets.
              });
          }

          return response;
        })
        .catch(() => cached);
    })
  );
});
