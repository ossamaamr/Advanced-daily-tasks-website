/* ============================================================
   TaskMaster Ultra – Advanced Service Worker (Premium Edition)
   Offline Support • Dynamic Cache • Versioning • Fallback
============================================================ */

const CACHE_VERSION = "taskmaster-ultra-v4";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

const STATIC_ASSETS = [
  "index.html",
  "style.css",
  "script.js",
  "login.html",
  "login.js",
  "manifest.json",

  // الصور
  "https://i.imgur.com/5zQ2YtU.png",
  "https://i.imgur.com/0p5o8qN.png",
  "https://i.imgur.com/8q1pQ1U.png",
  "https://i.imgur.com/5q0xq1H.jpeg",

  // الأصوات
  "https://cdn.pixabay.com/download/audio/2022/03/15/audio_7b1e1b3243.mp3?filename=click-124467.mp3",
  "https://cdn.pixabay.com/download/audio/2022/03/15/audio_5e8c6f6d9f.mp3?filename=success-1-6297.mp3",
  "https://cdn.pixabay.com/download/audio/2022/03/15/audio_1e8e7a69a3.mp3?filename=notification-113724.mp3",
  "https://cdn.pixabay.com/download/audio/2022/03/15/audio_2b3f4e6c2a.mp3?filename=delete-14803.mp3",
  "https://cdn.pixabay.com/download/audio/2022/03/15/audio_3a9e7c4d1b.mp3?filename=pop-94319.mp3",

  // صفحة Offline
  "offline.html"
];

/* ============================================================
   INSTALL – Cache Static Assets
============================================================ */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

/* ============================================================
   ACTIVATE – Clean Old Caches
============================================================ */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* ============================================================
   FETCH – Cache First + Network Fallback + Dynamic Cache
============================================================ */
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // تجاهل طلبات Chrome Extension
  if (request.url.startsWith("chrome-extension")) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request)
        .then((networkResponse) => {
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // fallback للصفحة Offline
          if (request.headers.get("accept").includes("text/html")) {
            return caches.match("offline.html");
          }
        });
    })
  );
});
