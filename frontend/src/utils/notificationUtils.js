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
    return { status: 'unsupported' };
  }

  try {
    const swRegistration = await navigator.serviceWorker.ready;
    let subscription = await swRegistration.pushManager.getSubscription();

    if (subscription) {
      return { status: 'already-subscribed' };
    }

    const { data } = await getVapidPublicKey();
    const applicationServerKey = urlBase64ToUint8Array(data.publicKey);

    // This is the point where the browser asks for permission.
    // The promise will not resolve until the user clicks "Allow" or "Block".
    subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

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
