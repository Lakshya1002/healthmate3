// backend/utils/scheduler.js

import cron from 'node-cron';
import db from '../config/db.js';
import webpush from 'web-push';
import { getDay } from 'date-fns';

/**
 * Sends a push notification to a user.
 * @param {object} subscription The user's push subscription object.
 * @param {object} reminder The reminder details.
 */
const sendNotification = async (subscription, reminder) => {
    try {
        const payload = JSON.stringify({
            title: `Time for your ${reminder.medicine_name}!`,
            body: `It's time to take your ${reminder.dosage} dose.`,
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            url: `/reminders` // Directs user to the reminders page
        });

        // Reconstruct the subscription object for web-push
        const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth
            }
        };

        await webpush.sendNotification(pushSubscription, payload);
        console.log(`Notification sent for reminder ID: ${reminder.id}`);
    } catch (error) {
        // This often happens if a subscription is expired or invalid.
        // We should remove it from our database.
        if (error.statusCode === 410 || error.statusCode === 404) {
            console.log('Subscription has expired or is no longer valid. Deleting.');
            await db.query('DELETE FROM push_subscriptions WHERE endpoint = ?', [subscription.endpoint]);
        } else {
            console.error('Error sending notification:', error);
        }
    }
};

/**
 * Checks for due reminders and sends notifications.
 * This function is scheduled to run every minute.
 */
const checkReminders = async () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // Format: HH:MM
    const currentDayOfWeek = getDay(now); // Sunday: 0, Monday: 1, etc.
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    console.log(`Checking for reminders at ${currentTime} on ${dayNames[currentDayOfWeek]}...`);

    try {
        // SQL query to get all reminders due at the current time,
        // joining with medicines and push_subscriptions tables.
        const query = `
            SELECT
                r.id,
                r.user_id,
                r.frequency,
                r.week_days,
                r.day_interval,
                m.name AS medicine_name,
                m.dosage,
                m.start_date,
                ps.endpoint,
                ps.p256dh,
                ps.auth
            FROM reminders r
            JOIN medicines m ON r.medicine_id = m.id
            JOIN push_subscriptions ps ON r.user_id = ps.user_id
            WHERE r.reminder_time = ? AND r.status = 'scheduled'
        `;
        
        const [reminders] = await db.query(query, [currentTime]);

        if (reminders.length === 0) {
            return; // No reminders due right now
        }

        console.log(`Found ${reminders.length} potential reminder(s) to send.`);

        for (const reminder of reminders) {
            // Check if the medicine schedule is currently active
            const startDate = new Date(reminder.start_date);
            if (now < startDate) continue; // Skip if start date is in the future

            let shouldSend = false;

            // Logic to determine if the reminder should be sent based on frequency
            switch (reminder.frequency) {
                case 'daily':
                    shouldSend = true;
                    break;
                case 'weekly':
                    if (reminder.week_days && reminder.week_days.includes(dayNames[currentDayOfWeek])) {
                        shouldSend = true;
                    }
                    break;
                case 'interval':
                    if (reminder.day_interval > 0) {
                        const diffTime = Math.abs(now - startDate);
                        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                        if (diffDays % reminder.day_interval === 0) {
                            shouldSend = true;
                        }
                    }
                    break;
            }

            if (shouldSend) {
                await sendNotification(reminder, reminder);
            }
        }
    } catch (error) {
        console.error('Error checking reminders:', error);
    }
};

/**
 * Initializes and starts the cron job.
 */
export const startScheduler = () => {
    // Schedule the checkReminders function to run every minute.
    cron.schedule('* * * * *', checkReminders);
    console.log('Reminder scheduler started. Will check every minute.');
};
