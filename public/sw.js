const CACHE = "11-52-v0.1";
self.addEventListener("install", (event) => {
  const scope = self.registration.scope;
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([scope, new URL("manifest.webmanifest", scope).href])));
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
