// Kablo Makara Hesaplayıcı Pro - Service Worker
// Sürümü güncellediğinizde CACHE_NAME'i değiştirin (ör: v2, v3) ki
// kullanıcıların cihazındaki eski dosyalar temizlenip yenisiyle değişsin.
const CACHE_NAME = 'makara-hesap-v1';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png'
];

// Kurulum: temel dosyaları önbelleğe al
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Aktivasyon: eski önbellekleri temizle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: önce ağı dene (güncel kalması için), olmazsa önbellekten sun (offline destek)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // Sadece başarılı, aynı-origin isteklerini önbelleğe yaz
          if (response.ok && event.request.url.startsWith(self.location.origin)) {
            cache.put(event.request, clone);
          }
        });
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
