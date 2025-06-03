const CACHE_NAME = 'sharewave-v5.1-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  // Add paths to icons once they are created, e.g.:
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add paths to external libraries if you want to cache them.
  // Note: Caching external resources can be tricky due to CORS and update policies.
  // For this initial setup, we'll focus on local assets.
  // 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  // 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'
];

// Install event: cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // It's important to cache the root '/' for proper PWA start_url behavior
        // and also the specific index.html for direct navigation.
        return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'reload' })));
      })
      .then(() => {
        console.log('All required assets cached during install.');
        return self.skipWaiting(); // Activate the new service worker immediately
      })
      .catch(error => {
        console.error('Failed to cache assets during install:', error);
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('Service worker activated and old caches cleaned.');
      return self.clients.claim(); // Take control of all open clients
    })
  );
});

// Fetch event: serve cached assets or fetch from network
self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  // For navigation requests, try network first, then cache, then offline page (optional)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If network fails, try to serve the main page from cache
          return caches.match('/index.html') || caches.match('/');
        })
        // Optional: Add a specific offline.html page to serve when everything fails
        // .catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // For other requests (CSS, JS, images), use a cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network, then cache it
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
              return networkResponse;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
          console.error('Fetch failed; returning offline page instead.', error);
          // Optional: You could return a fallback image or data here for specific failed requests.
          // For instance, if event.request.url.endsWith('.png'), return caches.match('/fallback.png');
        });
      })
  );
});
