importScripts('workbox-sw.prod.v2.1.3.js');
importScripts('./src/js/idb.js');
importScripts('./src/js/utility.js');

const workboxSW = new self.WorkboxSW();

workboxSW.router.registerRoute(
  /.*(?:googleapis|gstatic)\.com.*$/,
  workboxSW.strategies.staleWhiteRevalidate({
    cacheName: 'google-fonts',
    cacheExpiration: {
      maxEntries: 3,
      maxAgeSeconds: 60 * 60 * 24 * 30,
    },
  })
);

workboxSW.router.registerRoute(
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
  workboxSW.strategies.staleWhiteRevalidate({
    cacheName: 'material-css',
  })
);

workboxSW.router.registerRoute(
  /.*(?:firebasestorage\.googleapis)\.com.*$/,
  workboxSW.strategies.staleWhiteRevalidate({
    cacheName: 'post-images',
  })
);

workboxSW.router.registerRoute(
  'https://pwagram-d032d-default-rtdb.firebaseio.com/posts.json',
  async args => {
    const res = await fetch(args.event.request);
    const clonedRes = res.clone();
    clearAllData('posts')
      .then(() => {
        return clonedRes.json();
      })
      .then(data => {
        for (let key in data) {
          writeData('posts', data[key]);
        }
      });
    ;
    return res;
  },
);

orkboxSW.router.registerRoute(
  routeData => {
    return (routeData.event.request.headers.get('accept').includes('text/html'));
  },
  async args => {
    return caches.match(args.event.request)
      .then(response => {
        if (response) {
          return response;
        } else {
          return fetch(args.event.request)
            .then(res => {
              return caches.open('dynamic')
                .then(cache => {
                  cache.put(args.event.request.url, res.clone());
                  return res;
                });
            })
            .catch(err => {
              return caches.match('/offline.html')
                .then(res => {
                  return res;
                })
            });
        }
      })
  },
);

workboxSW.precache([]);

self.addEventListener('sync', event => {
  console.log('[Service worker] Background syncing');
  if (event.tag === 'sync-new-posts') {
    event.waitUntil(
      readAllData('sync-posts')
        .then(data => {
          for (var dt of data) {
            var postData = new FormData();
            postData.append('id', dt.id);
            postData.append('title', dt.title);
            postData.append('location', dt.location);
            postData.append('rawLocationLat', dt.rawLocation.lat);
            postData.append('rawLocationLng', dt.rawLocation.lng);
            postData.append('file', dt.picture, `${dt.id}.png`);

            fetch('https://pwagram-d032d-default-rtdb.firebaseio.com/posts.json', {
              method: 'post',
              body: postData,
            })
              .then(res => {
                if (res.ok) {
                  deleteItemFromData('sync-posts', dt.id);
                }
              });
          }
        })
    );
  }
});

self.addEventListener('notificationclick', event => {
  var notification = event.notification;
  var action = event.action;
  console.log(notification, action);
  if (action === 'confirm') {
    console.log('Confirm was chosen');
    notification.close();
  } else {
    event.waitUntil(
      clients.matchAll()
        .then(clis => {
          var client = clis.find(c => {
            return c.visibilityState === 'visible';
          });
          if (client !== undefined) {
            client.navigate(notification.data.url);
            client.focus();
          } else {
            clients.openWindow(notification.data.url);
          }
          notification.close();
        })
    );
    console.log(action);
  }
});

self.addEventListener('notificationclose', event => {
  console.log(event);
});

self.addEventListener('push', event => {
  console.log('Push notification recieved');
  var data = {
    title: 'new',
    content: 'something happened',
    openUrl: '/',
  };
  if (event.data) {
    data = JSON.parse(event.data.text());
  }
  var options = {
    body: data.content,
    icon: './src/images/icons/app-icon-96x96.png',
    badge: './src/images/icons/app-icon-96x96.png',
    data: {
      url: data.openUrl,
    },
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
