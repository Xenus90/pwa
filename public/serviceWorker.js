// Will be emitted after the installation:
self.addEventListener('install', event => {
  console.log('[Service worker (install)]: ', event);
});

// Will be emitted after the activation.
// May take time if there is open tab or a previous version worker is working:
self.addEventListener('activate', event => {
  console.log('[Service worker (activate)]: ', event);
  return self.clients.claim();
});

// Will be emitted on every 'fetch' request (via HTML (like <img src="..." />) or JS (our code)):
self.addEventListener('fetch', event => {
  console.log('[Service worker (fetch)]: ', event);
  event.respondWith(fetch(event.request));
});