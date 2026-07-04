// Bibelgrekiska — network-first service worker
const CACHE = "bibelgrekiska-v3";

// För-cacha fonterna så att grekiskan (Cardo) alltid finns, även offline.
const PRECACHE = [
  "fonts/cardo-greek.woff2",
  "fonts/cardo-greek-bold.woff2",
  "fonts/spectral-regular.woff2",
  "fonts/spectral-medium.woff2",
  "fonts/spectral-semibold.woff2",
  "fonts/spectral-italic.woff2",
];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    try { await (await caches.open(CACHE)).addAll(PRECACHE); } catch (_) {}
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  // HTML-navigeringar hämtas alltid färskt från nätet (förbi webbläsarens
  // HTTP-cache) så att en ny version slår igenom direkt. Övriga resurser:
  // nätet först, cache som offline-fallback.
  const navigering = req.mode === "navigate";

  e.respondWith((async () => {
    try {
      const res = await fetch(navigering ? new Request(req, { cache: "reload" }) : req);
      if (res && res.ok && new URL(req.url).origin === self.location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      return res;
    } catch (err) {                                  // offline → cache
      const cached = await caches.match(req);
      if (cached) return cached;
      throw err;
    }
  })());
});
