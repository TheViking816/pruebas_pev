/**
 * Service Worker para Chatbot PWA
 * Cache de recursos estáticos para funcionamiento offline
 */

const CACHE_NAME = 'chatbot-ia-v14';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './chat-styles.css',
  './chat-app.js',
  './ai-engine.js',
  './voice-handler.js',
  './pwa-data-bridge.js',
  './manifest.json',
  '../supabase.js'
];

// Instalación: cachear recursos
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cacheando recursos');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// Activación: limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  return self.clients.claim();
});

// Fetch: estrategia Network First, fallback a Cache
self.addEventListener('fetch', (event) => {
  // Ignorar requests que no sean GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorar requests a APIs externas
  if (
    event.request.url.includes('supabase.co') ||
    event.request.url.includes('googleapis.com') ||
    event.request.url.includes('gstatic.com') ||
    event.request.url.includes('imgur.com')
  ) {
    return event.respondWith(fetch(event.request));
  }

  // Network First para el chatbot
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clonar respuesta para guardar en caché
        const responseClone = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return response;
      })
      .catch(() => {
        // Si falla la red, buscar en caché
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[SW] Sirviendo desde caché:', event.request.url);
            return cachedResponse;
          }

          // Si no está en caché, devolver error
          return new Response('Offline - Recurso no disponible', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// Mensajes desde la app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
