// // // const CACHE_NAME = 'vpmg-cache-v1';
// // // const urlsToCache = [
// // //   'https://cdn.neverbounce.com/widget/dist/NeverBounce.js',
// // //   'https://cdn.neverbounce.com/widget/font/font-icons.woff?70983604',
// // //   'https://js.paystack.co/v2/inline.js'
// // // ];

// // // self.addEventListener('install', event => {
// // //   event.waitUntil(
// // //     caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
// // //   );
// // // });

// // // self.addEventListener('fetch', event => {
// // //   event.respondWith(
// // //     caches.match(event.request).then(response => response || fetch(event.request))
// // //   );
// // // });
// // const CACHE_NAME = 'vpmg-cache-v1';
// // const urlsToCache = [
// //   'https://cdn.neverbounce.com/widget/dist/NeverBounce.js',
// //   'https://cdn.neverbounce.com/widget/font/font-icons.woff?70983604',
// //   'https://js.paystack.co/v2/inline.js'
// // ];

// // self.addEventListener('install', event => {
// //   event.waitUntil(
// //     caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
// //   );
// // });

// // self.addEventListener('fetch', event => {
// //   event.respondWith(
// //     caches.match(event.request).then(response => response || fetch(event.request))
// //   );
// // });
// const CACHE_NAME = 'vpmg-cache-v1';
// const urlsToCache = [
//   'https://cdn.neverbounce.com/widget/dist/NeverBounce.js',
//   'https://cdn.neverbounce.com/widget/font/font-icons.woff?70983604',
//   'https://js.paystack.co/v2/inline.js'
// ];

// self.addEventListener('install', event => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
//   );
// });

// self.addEventListener('fetch', event => {
//   event.respondWith(
//     caches.match(event.request).then(response => response || fetch(event.request))
//   );
// });