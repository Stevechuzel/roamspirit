const CACHE_NAME = 'roamspirit-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap'
];

// Install — cache core assets
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(function(res){
        // Cache successful responses
        if(res && res.status === 200){
          var resClone = res.clone();
          caches.open(CACHE_NAME).then(function(cache){
            cache.put(e.request, resClone);
          });
        }
        return res;
      })
      .catch(function(){
        // Fallback to cache if offline
        return caches.match(e.request).then(function(cached){
          return cached || caches.match('/index.html');
        });
      })
  );
});
