// frontend/public/sw.js

/**
 * This is the service worker file. It runs in the background, separate from the web page,
 * and is responsible for handling push notifications and other PWA features.
 */

// ✅ ADDED: A unique cache name to manage caching. The version number helps in clearing old caches.
const CACHE_NAME = 'healthmate-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/icon-192.png',
  '/badge-72.png'
];

// ✅ ADDED: The 'install' event listener.
// This runs when the service worker is first installed. It pre-caches key assets for offline use.
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// ✅ ADDED: The 'activate' event listener.
// This is a crucial step. It cleans up old caches and ensures the new service worker
// takes control of the page immediately.
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // This command tells the service worker to take control of all open clients (tabs) immediately.
      // This is the key to solving the cross-browser issue.
      return self.clients.claim();
    })
  );
});


// Listen for a 'push' event from the server
self.addEventListener('push', event => {
  if (!event.data) {
    console.error('Push event but no data');
    return;
  }
  
  const data = event.data.json();
  const title = data.title || 'HealthMate Reminder';
  
  const options = {
    body: data.body || 'You have a new notification.',
    icon: self.registration.scope + 'icon-192.png',
    badge: self.registration.scope + 'badge-72.png',
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: data.url || '/', 
    },
    requireInteraction: true,
    actions: [
        { action: 'explore', title: 'View Reminder' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Listen for a click on the notification
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clientList => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow(urlToOpen);
    })
  );
});
