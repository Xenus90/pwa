module.exports = {
  "swSrc": "public/serviceWorkerBase.js",
  "swDest": "public/serviceWorkerWorkbox.js",
  "globDirectory": "public/",
  "globPatterns": [
    "**/*.{ico,html,json,js,css,jpg}",
    "src/images/*.{jpg,png}"
  ],
  "globIgnores": [
    "../workbox-cli-config.js",
    "help/**"
  ]
};
