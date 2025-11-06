// Service Worker simple
const CACHE = 'kumi-cache-static-v1';
const ASSETS = [
  './','./index.html','./producto.html','./categorias.html','./acerca.html','./contacto.html',
  './assets/styles.css','./js/config.js','./js/utils.js','./js/app.js','./js/detail.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k!==CACHE).map(k => caches.delete(k)))));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if(url.origin===location.origin){
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }else{
    e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
  }
});
