const CACHE_NAME = 'kumi-lab-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/acerca.html',
  '/categorias.html',
  '/contacto.html',
  '/producto.html',
  '/assets/style.css',
  '/js/main.js',
  '/js/catalog.js',
  '/js/product.js',
  '/assets/images/logo-kumi.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
