/**
 * SERVICE WORKER - Portal Estiba VLC
 * Permite que la app funcione offline, se cargue más rápido,
 * y ahora soporta Notificaciones Push.
 *
 * Incluye intento para solucionar el error 403 de Imgur
 * al no enviar la cabecera Referer para esas imágenes.
 * También cachea recursos de Supabase y sus APIs.
 */

const CACHE_NAME = 'estiba-vlc-v13'; // Actualizado: Fix bloqueo chatbot y visibilidad

// Recursos locales que SIEMPRE deben cachearse (fallarán la instalación si no existen)
const localResources = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './supabase.js',
  './config-features.js',
  // Servicios Premium
  './services/premium.js',
  './services/stripe.js',
  './components/FeatureLock.js',
  // Chatbot
  './chatbot/index.html',
  './chatbot/chat-app.js',
  './chatbot/chat-styles.css',
  './chatbot/ai-engine.js',
  './chatbot/pwa-data-bridge.js',
  './chatbot/voice-handler.js',
  './chatbot/supabase.js',
  './chatbot/premium-check.js',
  './chatbot/service-worker.js',
  './chatbot/manifest.json'
];

// Recursos externos que se cachearán bajo demanda (no bloquean la instalación)
const externalResources = [
  // Imágenes de Imgur
  'https://i.imgur.com/Q91Pi44.png', // Icono principal (y usado en notificaciones)
  'https://i.imgur.com/7F1BWQ2.jpeg', // Logo principal
  'https://i.imgur.com/xcHiyAn.jpeg', // Img login/foro
  'https://i.imgur.com/bSOecVC.jpeg', // Img dashboard/noticias
  'https://i.imgur.com/guKCoFy.jpeg', // Img contratacion
  'https://i.imgur.com/C3UpaWV.jpeg', // Img jornales/sueldometro
  'https://i.imgur.com/gUw97fH.jpeg', // Img puertas
  'https://i.imgur.com/iHJOi0K.jpeg', // Img censo
  // CDNs externos
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js',
  'https://js.stripe.com/v3/',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Instalación - cachear recursos estáticos
self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        // Primero cachear recursos locales (críticos)
        console.log('[Service Worker] Cacheando recursos locales');
        await cache.addAll(localResources.map(url => new Request(url, { cache: 'reload' })));

        // Luego intentar cachear recursos externos (no bloquean si fallan)
        console.log('[Service Worker] Intentando cachear recursos externos');
        const externalPromises = externalResources.map(async url => {
          try {
            const request = new Request(url, {
              cache: 'reload',
              mode: 'cors',
              credentials: 'omit'
            });
            const response = await fetch(request);
            if (response.ok) {
              await cache.put(url, response);
              console.log('[Service Worker] Cacheado:', url);
            }
          } catch (err) {
            console.warn('[Service Worker] No se pudo cachear:', url);
          }
        });
        await Promise.allSettled(externalPromises);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación - limpiar cachés antiguos
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim()) // Permite que el Service Worker tome control de las pestañas existentes
  );
});

// Fetch - estrategia: Network First, fallback a Cache (para datos dinámicos y externos)
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Para APIs de terceros (Google Sheets, Supabase) y Imgur: Network First, fallback a Cache
  // Esto es crucial para datos dinámicos y para obtener las imágenes más recientes de Imgur.
  if (url.hostname.includes('docs.google.com') ||
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('script.google.com') ||
      url.hostname.includes('supabase.co') || // Añadido para tus llamadas a Supabase
      url.hostname.includes('imgur.com') ) { // Añadido para tus imágenes de Imgur
    
    let fetchOptions = {};
    // === INTENTO DE SOLUCIÓN PARA IMGUR 403 ===
    // Intentar no enviar el Referer para las peticiones a Imgur
    // Esto podría evitar el bloqueo por hotlinking.
    if (url.hostname.includes('imgur.com')) {
        fetchOptions.referrerPolicy = 'no-referrer';
    }
    // ==========================================

    event.respondWith(
      fetch(request, fetchOptions) // Pasamos las opciones para modificar la petición
        .then(response => {
          // Si la respuesta es exitosa y es una petición GET, cachearla
          if (response && response.status === 200 && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Si falla la red (incluido el 403), intenta desde caché
          return caches.match(request);
        })
    );
    return;
  }

  // Para recursos estáticos propios de la aplicación (HTML, CSS, JS local, imágenes locales): Cache First, fallback a Network
  // Esto asegura carga rápida de la shell de la app.
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Encontrado en cache, pero actualizar en background para futuras visitas (Stale-While-Revalidate)
          fetch(request)
            .then(networkResponse => {
              if (networkResponse && networkResponse.status === 200 && request.method === 'GET') {
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(request, networkResponse.clone()); // Clonar para poder usarla y cachearla
                });
              }
            })
            .catch(() => {
              // Ignorar errores de red en background
            });
          return cachedResponse;
        }

        // No está en cache, ir a la red
        return fetch(request)
          .then(networkResponse => {
            // Cachear si es exitoso y es una petición GET
            // Solo cachear URLs con esquema http/https (no chrome-extension, etc.)
            const url = new URL(request.url);
            const isHttpOrHttps = url.protocol === 'http:' || url.protocol === 'https:';

            if (networkResponse && networkResponse.status === 200 && request.method === 'GET' && isHttpOrHttps) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(error => {
            console.warn('[Service Worker] Error fetching:', request.url, error);
            // Si la petición falla y no hay caché, puedes devolver una página offline.
            // return caches.match('./offline.html'); // Descomentar si tienes una página offline.
            throw error; // O simplemente lanzar el error si no hay fallback específico
          });
      })
  );
});

// Mensaje para forzar actualización (para el botón de "Hay una nueva versión de la app disponible...")
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ===============================================
// LÓGICA PARA NOTIFICACIONES PUSH (COMIENZO)
// ===============================================

self.addEventListener('push', (event) => {
  // Parsea los datos que vienen del backend
  const data = event.data ? event.data.json() : {};
  // Valores por defecto si el backend no los envía
  const {
    title = 'Nueva Contratación en Estiba VLC',
    body = '¡Se ha publicado una nueva contratación en el puerto!',
    url = '/?page=contratacion',
    page = 'contratacion'
  } = data;

  // Determinar el texto del botón de acción según la página
  let actionTitle = 'Ver';
  if (page === 'calculadora') {
    actionTitle = 'Abrir Oráculo';
  } else if (page === 'contratacion') {
    actionTitle = 'Abrir Parte';
  } else if (page === 'jornales') {
    actionTitle = 'Ver Jornales';
  }

  const options = {
    body: body,
    // Usamos el icono que ya tienes en tu manifest y está en Imgur
    icon: 'https://i.imgur.com/Q91Pi44.png',
    badge: 'https://i.imgur.com/Q91Pi44.png', // Badge para móviles
    vibrate: [200, 100, 200], // Patrón de vibración
    data: {
      url: url, // La URL a la que navegará el usuario al hacer clic en la notificación
      page: page, // Página de destino para navegación interna
      dateOfArrival: Date.now(),
      primaryKey: 'push-notification-id-' + Date.now(), // ID único para evitar notificaciones duplicadas
    },
    actions: [
      {
        action: `ver-${page}`,
        title: actionTitle,
      },
      // Puedes añadir más acciones si lo necesitas, por ejemplo, 'Descartar'
    ],
  };

  // Muestra la notificación
  event.waitUntil(self.registration.showNotification(title, options));
});

// Manejar el clic en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Cierra la notificación al hacer clic

  // Extraer page y url de los datos de la notificación
  let targetPage = event.notification.data.page;
  let targetUrl = event.notification.data.url;

  // Si no hay page pero sí url, intentar extraer page del url
  if (!targetPage && targetUrl) {
    const urlParams = new URLSearchParams(targetUrl.split('?')[1]);
    targetPage = urlParams.get('page') || 'contratacion';
  }

  // Si no hay targetPage, usar default
  if (!targetPage) {
    targetPage = 'contratacion';
  }

  // Si no hay targetUrl, construirlo
  if (!targetUrl) {
    targetUrl = `/?page=${targetPage}`;
  }

  // Abre una nueva ventana o enfoca una existente
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una ventana abierta a tu dominio, intenta enfocarla
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          // Enviar mensaje al cliente para que navegue a la página correcta
          client.postMessage({
            type: 'NAVIGATE_TO_PAGE',
            page: targetPage
          });
          return client.focus(); // Enfoca la ventana existente
        }
      }
      // Si no hay ninguna ventana abierta, abre una nueva con el query parameter
      return clients.openWindow(targetUrl);
    })
  );
});

// ===============================================
// LÓGICA PARA NOTIFICACIONES PUSH (FIN)
// ===============================================
