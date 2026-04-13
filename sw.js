const CACHE_NAME = 'sudoku-v16';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './sw.js',
  './icons/icon.svg',
  './icons/icon-maskable.svg',
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/sw.js',
  '/icons/icon.svg',
  '/icons/icon-maskable.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        APP_SHELL.map((asset) =>
          cache.add(new Request(asset, { cache: 'reload' }))
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) {
    event.respondWith(
      new Response('Offline-first mode blocks network-dependent third-party requests.', {
        status: 503,
        statusText: 'Unavailable Offline'
      })
    );
    return;
  }

  event.respondWith((async () => {
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) return cachedResponse;

    if (event.request.mode === 'navigate') {
      return caches.match('./index.html');
    }

    return new Response('Offline and not precached.', {
      status: 503,
      statusText: 'Offline'
    });
  })());
});
