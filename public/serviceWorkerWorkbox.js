importScripts('workbox-sw.prod.v2.1.3.js');

const workboxSW = new self.WorkboxSW();

workboxSW.router.registerRoute(
  /.*(?:googleapis|gstatic)\.com.*$/,
  workboxSW.strategies.staleWhiteRevalidate({
    cacheName: 'google-fonts',
  })
);

workboxSW.precache([
  {
    "url": "favicon.ico",
    "revision": "2cab47d9e04d664d93c8d91aec59e812"
  },
  {
    "url": "index.html",
    "revision": "c718e70a52cc82b0f24ef1b922ef7f02"
  },
  {
    "url": "manifest.json",
    "revision": "f6f95a473a117e3e69faa027cb4beec0"
  },
  {
    "url": "offline.html",
    "revision": "4b8e95f6d7a1012c3e6f7f421a117ce5"
  },
  {
    "url": "serviceWorker.js",
    "revision": "2d2ef38346f13211fccbfaf876739d2c"
  },
  {
    "url": "serviceWorkerBase.js",
    "revision": "effb80147d76fed632cf915399304654"
  },
  {
    "url": "src/css/app.css",
    "revision": "f27b4d5a6a99f7b6ed6d06f6583b73fa"
  },
  {
    "url": "src/css/feed.css",
    "revision": "c65e9dcadca77192de53bd819ff09a7b"
  },
  {
    "url": "src/css/help.css",
    "revision": "1c6d81b27c9d423bece9869b07a7bd73"
  },
  {
    "url": "src/images/main-image-lg.jpg",
    "revision": "31b19bffae4ea13ca0f2178ddb639403"
  },
  {
    "url": "src/images/main-image-sm.jpg",
    "revision": "c6bb733c2f39c60e3c139f814d2d14bb"
  },
  {
    "url": "src/images/main-image.jpg",
    "revision": "5c66d091b0dc200e8e89e56c589821fb"
  },
  {
    "url": "src/images/sf-boat.jpg",
    "revision": "0f282d64b0fb306daf12050e812d6a19"
  },
  {
    "url": "src/js/app.js",
    "revision": "46d6f4de66c0b1d8f05568ff069499a7"
  },
  {
    "url": "src/js/feed.js",
    "revision": "6fe78dc3f9d7e1bbe15614d8b9c1f7b4"
  },
  {
    "url": "src/js/fetch.js",
    "revision": "6b82fbb55ae19be4935964ae8c338e92"
  },
  {
    "url": "src/js/idb.js",
    "revision": "017ced36d82bea1e08b08393361e354d"
  },
  {
    "url": "src/js/material.min.js",
    "revision": "713af0c6ce93dbbce2f00bf0a98d0541"
  },
  {
    "url": "src/js/promise.js",
    "revision": "10c2238dcd105eb23f703ee53067417f"
  },
  {
    "url": "src/js/utility.js",
    "revision": "ccc99ae92721bbbdb2c9e3939cb6d8b8"
  },
  {
    "url": "workbox-sw.prod.v2.1.3.js",
    "revision": "a9890beda9e5f17e4c68f42324217941"
  }
]);
