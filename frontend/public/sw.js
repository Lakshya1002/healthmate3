// frontend/public/sw.js

/**
 * This is the service worker file. It runs in the background, separate from the web page,
 * and is responsible for handling push notifications.
 */

// Listen for a 'push' event from the server
self.addEventListener('push', event => {
  // The server sends data as a JSON string, so we parse it
  const data = event.data.json();

  // Prepare the options for the notification
  const options = {
    body: data.body,
    // Use the icon from the server, or a high-quality placeholder if not provided
    icon: data.icon || 'https://placehold.co/192x192/4f46e5/ffffff?text=HM',
    // Use the badge from the server, or a placeholder if not provided
    badge: data.badge || 'https://placehold.co/72x72/ffffff/4f46e5?text=H',
    vibrate: [200, 100, 200], // Vibration pattern
    data: {
      url: data.url || '/', // The URL to open when the notification is clicked
    },
  };

  // Tell the browser to show the notification.
  // The 'waitUntil' ensures the service worker doesn't terminate before the notification is shown.
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Listen for a click on the notification
self.addEventListener('notificationclick', event => {
  // Close the notification pop-up
  event.notification.close();

  // Open the app or a specific URL when the notification is clicked
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
