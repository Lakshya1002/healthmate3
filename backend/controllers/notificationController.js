// backend/controllers/notificationController.js

import db from '../config/db.js';
import webpush from 'web-push';

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:your-email@example.com', // Replace with your email
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
} else {
    console.warn('VAPID keys not found. Push notifications will be disabled.');
}


/**
 * @desc    Get the VAPID public key
 * @route   GET /api/notifications/vapid-public-key
 * @access  Private
 */
export const getVapidPublicKey = (req, res) => {
    if (!process.env.VAPID_PUBLIC_KEY) {
        return res.status(500).json({ message: 'VAPID public key not configured on the server.' });
    }
    res.status(200).json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};


/**
 * @desc    Subscribe user to push notifications
 * @route   POST /api/notifications/subscribe
 * @access  Private
 */
export const subscribe = async (req, res) => {
    const subscription = req.body;
    const userId = req.user.id;

    if (!subscription || !subscription.endpoint) {
        return res.status(400).json({ message: 'Invalid subscription object provided.' });
    }

    try {
        // Store the subscription in the database
        const sql = `
            INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                p256dh = VALUES(p256dh),
                auth = VALUES(auth)
        `;
        await db.query(sql, [
            userId, 
            subscription.endpoint, 
            subscription.keys.p256dh, 
            subscription.keys.auth
        ]);

        res.status(201).json({ message: 'Subscription saved successfully.' });

        // Send a welcome notification after a short delay
        const payload = JSON.stringify({
            title: 'Welcome to HealthMate!',
            body: 'You are now subscribed to reminder notifications.',
        });
        
        // Delay ensures the frontend has time to show its success toast first
        setTimeout(() => {
            webpush.sendNotification(subscription, payload).catch(error => {
                console.error("Error sending welcome notification:", error);
            });
        }, 2000); // 2-second delay

    } catch (error)
        {
        console.error('Error saving subscription:', error);
        res.status(500).json({ message: 'Server error while saving subscription.' });
    }
};
