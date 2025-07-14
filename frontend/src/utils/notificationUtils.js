// frontend/src/utils/notificationUtils.js

import { getVapidPublicKey, subscribeToPush } from '../api';

/**
 * Converts a VAPID public key from a URL-safe base64 string to a Uint8Array.
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Subscribes the user to push notifications and returns a status object.
 * @returns {Promise<object>} A promise that resolves to a status object.
 */
export async function subscribeUserToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.error('Push notifications are not supported by this browser.');
    return { status: 'unsupported' };
  }

  try {
    // ✅ FIXED: Use navigator.serviceWorker.ready to ensure the service worker is active.
    // This promise resolves only when the service worker is installed and activated,
    // which is the key to preventing race conditions.
    const swRegistration = await navigator.serviceWorker.ready;
    console.log('Service Worker is active and ready.');

    let subscription = await swRegistration.pushManager.getSubscription();

    if (subscription) {
      console.log('User is already subscribed.');
      return { status: 'already-subscribed' };
    }

    const { data } = await getVapidPublicKey();
    if (!data || !data.publicKey) {
      console.error('VAPID public key not received from server.');
      throw new Error('Server is not configured for push notifications.');
    }
    const applicationServerKey = urlBase64ToUint8Array(data.publicKey);

    subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
    console.log('User subscribed successfully:', subscription);

    await subscribeToPush(subscription);
    return { status: 'success' };

  } catch (error) {
    console.error("Failed to subscribe the user: ", error);
    if (Notification.permission === 'denied') {
      return { status: 'denied' };
    }
    return { status: 'error', error: error };
  }
}

/**
 * Registers the service worker.
 */
export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }
}
