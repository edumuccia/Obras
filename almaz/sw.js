// Cache simples para a página abrir rápido e funcionar com internet fraca.
// Não deixa a obra offline de verdade: o % continua exigindo internet para gravar.
var CACHE = 'almaz-v1';
var ARQUIVOS = ['./', './index.html', './manifest.json',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-512-maskable.png'];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ARQUIVOS) }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k!==CACHE }).map(function(k){ return caches.delete(k) }));
  }).then(function(){ return self.clients.claim() }));
});

self.addEventListener('fetch', function(e){
  var url = new URL(e.request.url);
  // nunca guarda em cache as chamadas ao Apps Script: sempre precisam ir para a rede
  if (url.hostname.indexOf('script.google.com') !== -1) return;
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request).then(function(resp){
      var copia = resp.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copia) });
      return resp;
    }).catch(function(){ return caches.match(e.request) })
  );
});
