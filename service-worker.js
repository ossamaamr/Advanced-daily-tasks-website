const CACHE_NAME = "taskmaster-ultra-v1";
const ASSETS = [
  "/Advanced-daily-tasks-website/",
  "/Advanced-daily-tasks-website/index.html",
  "/Advanced-daily-tasks-website/style.css",
  "/Advanced-daily-tasks-website/script.js",
  "/Advanced-daily-tasks-website/login.html",
  "/Advanced-daily-tasks-website/login.js",
  "/Advanced-daily-tasks-website/manifest.json",
  "/Advanced-daily-tasks-website/assets/icon-192.png",
  "/Advanced-daily-tasks-website/assets/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
