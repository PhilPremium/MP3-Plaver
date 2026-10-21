/*
  Service Worker: speichert die App auf dem iPhone, damit sie offline startet.
  Bei jeder Änderung an index.html die Versionsnummer in CACHE erhöhen,
  sonst bleibt auf dem iPhone die alte Version.
*/
var CACHE = 'mp3player-v1';
var FILES = ['./', './index.html'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE)
      .then(function (cache) { return cache.addAll(FILES); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(function (cached) {
      if (cached) return cached;
      return fetch(event.request).catch(function () {
        return caches.match('./index.html');
      });
    })
  );
});
