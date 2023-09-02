const CACHE_STATIC_NAME = 'static-v4';
const CACHE_DYNAMIC_NAME = 'dynamic-v4';

// Will be emitted after the installation:
self.addEventListener('install', event => {
  console.log('[Service worker]: installed');
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(cache => {
        console.log('[Service worker]: Precaching app shell');
        cache.addAll([
          './',
          './index.html',
          './src/js/app.js',
          './src/js/feed.js',
          './src/js/promise.js',
          './src/js/fetch.js',
          './src/js/material.min.js',
          './src/css/app.css',
          './src/css/feed.css',
          './src/images/main-image.jpg',
          'https://fonts.googleapis.com/css?family=Roboto:400,700',
          'https://fonts.googleapis.com/icon?family=Material+Icons',
          'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
        ]);
      })
  );
});

// Will be emitted after the activation.
// May take time if there is open tab or a previous version worker is working:
self.addEventListener('activate', event => {
  console.log('[Service worker]: activated');
  event.waitUntil(
    caches.keys()
      .then(keyList => {
        return Promise.all(keyList.map(key => {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('[Service worker]: removing old cache', key);
            return caches.delete(key);
          }
        }));
      })
  );
  return self.clients.claim();
});

// Will be emitted on every 'fetch' request (via HTML (like <img src="..." />) or JS (our code)):
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(res => {
              return caches.open(CACHE_DYNAMIC_NAME)
                .then(cache => {
                  // cache.put(event.request.url, res.clone());
                  return res;
                });
            })
            .catch(err => {

            });
        }
      })
  );
});