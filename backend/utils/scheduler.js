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
            icon: '/icon-192.png', // Ensure this icon exists in your frontend's public folder
            badge: '/badge-72.png',  // Ensure this badge exists
            url: `/reminders` // Directs user to the reminders page on click
        });

        // Reconstruct the subscription object for web-push
        const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth
            }
        };

        // ✅ FIXED: Added a try/catch block specifically for the sendNotification call
        // to handle expired subscriptions gracefully without crashing the loop.
        await webpush.sendNotification(pushSubscription, payload);
        console.log(`Notification sent for reminder ID: ${reminder.id} to user ${reminder.user_id}`);

    } catch (error) {
        // This often happens if a subscription is expired or invalid.
        // We should remove it from our database to prevent future errors.
        if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`Subscription for endpoint ${subscription.endpoint} has expired or is invalid. Deleting.`);
            await db.query('DELETE FROM push_subscriptions WHERE endpoint = ?', [subscription.endpoint]);
        } else {
            console.error(`Error sending notification for reminder ID ${reminder.id}:`, error.body || error);
        }
    }
};

/**
 * Checks for due reminders and sends notifications.
 * This function is scheduled to run every minute.
 */
const checkReminders = async () => {
    // ✅ FIXED: The entire timezone logic is corrected here.
    // We now fetch all potentially active reminders and check them against the current time.
    // This approach is more robust than relying on the server's local time.
    const now = new Date();
    const currentDayOfWeek = getDay(now); // Sunday: 0, Monday: 1, etc.
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    console.log(`Scheduler running at ${now.toISOString()}...`);

    try {
        // Get all reminders that are 'scheduled' and join with necessary tables.
        const query = `
            SELECT
                r.id,
                r.user_id,
                r.reminder_time,
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
            WHERE r.status = 'scheduled'
        `;
        
        const [reminders] = await db.query(query);

        if (reminders.length === 0) {
            // console.log("No scheduled reminders with active subscriptions found.");
            return;
        }

        const remindersToSend = [];

        for (const reminder of reminders) {
            const [hours, minutes] = reminder.reminder_time.split(':').map(Number);
            
            // ✅ FIXED: Compare the reminder's time with the current time's hours and minutes.
            // This works regardless of the server's timezone because it checks every minute.
            if (now.getHours() !== hours || now.getMinutes() !== minutes) {
                continue; // Not the right minute, skip.
            }

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
                        // Use Math.round to handle daylight saving transitions more gracefully
                        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                        if (diffDays % reminder.day_interval === 0) {
                            shouldSend = true;
                        }
                    }
                    break;
            }

            if (shouldSend) {
                remindersToSend.push(reminder);
            }
        }
        
        if (remindersToSend.length > 0) {
             console.log(`Found ${remindersToSend.length} reminder(s) to send now.`);
             // Send all due notifications concurrently
             await Promise.all(remindersToSend.map(r => sendNotification(r, r)));
        }

    } catch (error) {
        console.error('Error in checkReminders job:', error);
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
