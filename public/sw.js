const CACHE_NAME = 'fuenzer-journal-v4';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/logo.svg',
  '/og-image.svg',
  '/manifest.webmanifest',
  '/manifest.json',
  '/robots.txt',
  '/llms.txt',
];

// Install event: Precache core static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Some static assets failed to precache:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event: Clean up previous cache generations
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Network-first for navigations and APIs, Stale-While-Revalidate for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // CRITICAL: Only handle same-origin requests!
  // NEVER intercept cross-origin requests (Google APIs, Firebase Auth, Google Identity, Analytics)
  if (url.origin !== self.location.origin) {
    return;
  }

  // 1. Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            error: 'Offline Mode',
            message: 'You are currently offline. Your reflection transcript has been preserved in your local browser draft storage.',
            offline: true,
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      })
    );
    return;
  }

  // 2. Handle HTML Navigation / SPA Page requests (e.g. /archive, /insights, /app)
  const isSpaNavigation =
    request.mode === 'navigate' ||
    request.headers.get('accept')?.includes('text/html') ||
    !url.pathname.includes('.');

  if (isSpaNavigation) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const indexFallback = (await caches.match('/index.html')) || (await caches.match('/'));
          if (indexFallback) {
            return indexFallback;
          }
          return new Response('<!doctype html><html><body>Offline - Please reconnect</body></html>', {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
          });
        })
    );
    return;
  }

  // 3. Stale-While-Revalidate for static assets (JS, CSS, SVGs, Fonts)
  event.respondWith(
    caches.match(request).then(async (cachedResponse) => {
      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
        }
        return networkResponse;
      } catch {
        if (cachedResponse) {
          return cachedResponse;
        }
        return new Response('', { status: 404, statusText: 'Not in cache' });
      }
    })
  );
});

// Push & Local Notification Click Handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/app';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing open tab if available
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
