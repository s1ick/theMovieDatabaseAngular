const CACHE_NAME = 'movie-db-v1.0.0';
const urlsToCache = [
  '/',
  '/styles.css',
  '/main.js',
  '/assets/',
  // Добавь другие важные ресурсы
];

// Установка
self.addEventListener('install', (event) => {
  console.log('🛠️ Service Worker: Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Кэшируем ресурсы');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Активация
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Удаляем старый кэш:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  // Пропускаем не-GET запросы и chrome-extension
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Возвращаем из кэша если есть
        if (response) {
          return response;
        }

        // Иначе делаем сетевой запрос
        return fetch(event.request)
          .then((response) => {
            // Клонируем ответ
            const responseToCache = response.clone();

            // Кэшируем успешные ответы
            if (response.status === 200) {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          })
          .catch(() => {
            // Fallback для ошибок
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});
