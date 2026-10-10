/* Cifre e Suoni service worker: keeps the app usable offline. */
const CACHE = 'cifresuoni-2026-10-10-1';
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./fonts/bricolage-grotesque-latin-700-normal.woff2",
  "./fonts/bricolage-grotesque-latin-800-normal.woff2",
  "./fonts/instrument-sans-latin-400-normal.woff2",
  "./fonts/instrument-sans-latin-500-normal.woff2",
  "./fonts/instrument-sans-latin-600-normal.woff2",
  "./fonts/instrument-sans-latin-700-normal.woff2",
  "./fonts/spline-sans-mono-latin-400-normal.woff2",
  "./fonts/spline-sans-mono-latin-500-normal.woff2",
  "./fonts/spline-sans-mono-latin-600-normal.woff2"
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Serve from cache at once, refresh the cache from the network in the background. */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: true }) ||
        (req.mode === 'navigate' ? await cache.match('./index.html') : undefined);
      const network = fetch(req).then((res) => {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(() => cached);
      if (cached) { event.waitUntil(network); return cached; }
      return network;
    })
  );
});
