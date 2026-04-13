const CACHE_NAME = 'sudoku-v16';
const APP_SHELL = [
  '/sudoku/',
  '/sudoku/index.html',
  '/sudoku/manifest.webmanifest',
  '/sudoku/icons/icon.svg',
  '/sudoku/icons/icon-maskable.svg',
  '/sudoku/sw.js'
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
      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/sudoku/index.html');
        }
        return new Response('Offline', {
          status: 503,
          statusText: 'Offline'
        });
      });
    })
  );
});
