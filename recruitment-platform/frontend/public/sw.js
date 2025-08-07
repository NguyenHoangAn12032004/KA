// Service Worker for PWA
const CACHE_NAME = 'recruitment-platform-v1.2.0';
const API_CACHE_NAME = 'recruitment-api-v1.0.0';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/favicon.ico'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/jobs',
  '/api/companies',
  '/api/auth/me'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHE_NAME).then((cache) => {
        console.log('📁 Caching static assets');
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { credentials: 'same-origin' })));
      }).catch((error) => {
        console.warn('⚠️ Failed to cache some static assets:', error);
      }),
      
      // Cache API responses
      caches.open(API_CACHE_NAME).then((cache) => {
        console.log('🔄 Preparing API cache');
        return Promise.resolve();
      })
    ]).then(() => {
      console.log('✅ Service Worker installed successfully');
      return self.skipWaiting(); // Immediately activate
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker activated');
      return self.clients.claim(); // Take control immediately
    })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - network first with cache fallback
    event.respondWith(handleApiRequest(request));
  } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    // Static assets - cache first with network fallback
    event.respondWith(handleStaticAsset(request));
  } else {
    // Navigation requests - network first with cache fallback, serve index.html for SPA
    event.respondWith(handleNavigation(request));
  }
});

// Handle API requests - Network first strategy
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // Try network first
    console.log('🌐 Fetching from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses (but not error responses)
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
      console.log('💾 Cached API response:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('📡 Network failed, checking cache:', request.url);
    
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('📁 Serving from cache:', request.url);
      return cachedResponse;
    }
    
    // No cache available, return offline response
    console.log('❌ No cache available for:', request.url);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Offline - Không có kết nối mạng',
        cached: false 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static assets - Cache first strategy  
async function handleStaticAsset(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    console.log('📁 Serving static asset from cache:', request.url);
    return cachedResponse;
  }
  
  // Cache miss, fetch from network
  try {
    console.log('🌐 Fetching static asset from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
      console.log('💾 Cached static asset:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('❌ Failed to fetch static asset:', request.url);
    
    // Return a placeholder for failed images
    if (request.url.match(/\.(png|jpg|jpeg|gif|svg)$/)) {
      return new Response('', { 
        status: 200, 
        statusText: 'OK',
        headers: { 'Content-Type': 'image/svg+xml' }
      });
    }
    
    throw error;
  }
}

// Handle navigation requests - Network first with SPA fallback
async function handleNavigation(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Try network first for navigation
    console.log('🌐 Fetching navigation from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      return networkResponse;
    }
  } catch (error) {
    console.warn('📡 Navigation network failed:', request.url);
  }
  
  // Network failed or returned error, try to serve cached index.html for SPA routing
  const cachedIndex = await cache.match('/');
  if (cachedIndex) {
    console.log('📁 Serving cached index.html for SPA routing');
    return cachedIndex;
  }
  
  // Last resort offline page
  return new Response(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Offline - Recruitment Platform</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .icon { font-size: 64px; margin-bottom: 20px; }
        h1 { color: #333; margin-bottom: 20px; }
        p { color: #666; line-height: 1.6; }
        .retry-btn { background: #1976d2; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; margin-top: 20px; }
        .retry-btn:hover { background: #1565c0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">📡</div>
        <h1>Bạn đang offline</h1>
        <p>Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.</p>
        <button class="retry-btn" onclick="window.location.reload()">Thử lại</button>
      </div>
    </body>
    </html>
  `, {
    status: 200,
    headers: { 'Content-Type': 'text/html' }
  });
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle offline actions when back online
  try {
    // Implement offline action queue here
    console.log('✅ Background sync completed');
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Bạn có thông báo mới',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore', 
        title: 'Xem chi tiết',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close', 
        title: 'Đóng',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Recruitment Platform', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('💬 Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('🔧 Service Worker script loaded');
