// Service worker mínimo para cacheo básico (opcional)
const CACHE_NAME = "naturavida-static-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./assets/styles.css",
  "./js/config.js",
  "./js/utils.js",
  "./js/app.js"
];

self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.map(function(key){
          if(key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
});

self.addEventListener("fetch", function(event){
  event.respondWith(
    caches.match(event.request).then(function(resp){
      return resp || fetch(event.request);
    })
  );
});
