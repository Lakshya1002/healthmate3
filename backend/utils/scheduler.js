// backend/utils/scheduler.js

import cron from 'node-cron';
import db from '../config/db.js';
import webpush from 'web-push';
import { DateTime } from 'luxon';

/**
 * Sends a push notification to a user.
 */
const sendNotification = async (subscription, reminder) => {
    try {
        const payload = JSON.stringify({
            title: `Time for your ${reminder.medicine_name}!`,
            body: `It's time to take your ${reminder.dosage} dose.`,
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            url: `/reminders`
        });

        const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth }
        };

        await webpush.sendNotification(pushSubscription, payload);
        console.log(`Notification sent for reminder ID: ${reminder.id} to user ${reminder.user_id}`);

    } catch (error) {
        if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`Subscription for endpoint ${subscription.endpoint} has expired. Deleting.`);
            await db.query('DELETE FROM push_subscriptions WHERE endpoint = ?', [subscription.endpoint]);
        } else {
            console.error(`Error sending notification for reminder ID ${reminder.id}:`, error.body || error);
        }
    }
};

/**
 * ✅ REWRITTEN FOR PERFORMANCE
 * This function now uses a single, powerful SQL query to find all due reminders
 * across all timezones at once, preventing event loop blocking.
 */
const checkReminders = async () => {
    console.log(`Scheduler running at UTC: ${DateTime.utc().toISO()}`);

    try {
        // This single query joins all necessary tables and uses MySQL's CONVERT_TZ function
        // to find reminders that match the current time in each user's specific timezone.
        const [reminders] = await db.query(`
            SELECT 
                r.id, r.user_id, r.frequency, r.week_days, r.day_interval,
                m.name AS medicine_name, m.dosage, m.start_date,
                ps.endpoint, ps.p256dh, ps.auth,
                u.timezone
            FROM reminders r
            JOIN users u ON r.user_id = u.id
            JOIN medicines m ON r.medicine_id = m.id
            JOIN push_subscriptions ps ON u.id = ps.user_id
            WHERE 
                u.timezone IS NOT NULL
                AND r.status = 'scheduled'
                AND r.reminder_time = DATE_FORMAT(CONVERT_TZ(NOW(), 'UTC', u.timezone), '%H:%i')
        `);

        if (reminders.length === 0) return;
        
        console.log(`Found ${reminders.length} potential reminder(s) to process.`);

        for (const reminder of reminders) {
            const nowInUserTz = DateTime.now().setZone(reminder.timezone);
            const startDate = DateTime.fromJSDate(new Date(reminder.start_date));

            if (nowInUserTz < startDate) continue;

            let shouldSend = false;
            switch (reminder.frequency) {
                case 'daily':
                    shouldSend = true;
                    break;
                case 'weekly':
                    if (reminder.week_days && reminder.week_days.includes(nowInUserTz.toFormat('EEEE'))) {
                        shouldSend = true;
                    }
                    break;
                case 'interval':
                    if (reminder.day_interval > 0) {
                        const diff = nowInUserTz.diff(startDate, 'days').as('days');
                        const diffDays = Math.floor(diff);
                        if (diffDays >= 0 && diffDays % reminder.day_interval === 0) {
                            shouldSend = true;
                        }
                    }
                    break;
            }

            if (shouldSend) {
                console.log(`Sending reminder ${reminder.id} to user ${reminder.user_id}`);
                // We don't await here to allow notifications to be sent in parallel
                sendNotification(reminder, reminder);
            }
        }
    } catch (error) {
        // This can happen if the MySQL user doesn't have permissions for timezone data.
        if (error.code === 'ER_UNKNOWN_TIME_ZONE') {
             console.error(
                'MySQL timezone data is not loaded. Please run "mysql_tzinfo_to_sql /usr/share/zoneinfo | mysql -u root -p mysql" on your database server.'
            );
        } else {
            console.error('Error in checkReminders job:', error);
        }
    }
};

export const startScheduler = () => {
    cron.schedule('* * * * *', checkReminders);
    console.log('Timezone-aware reminder scheduler started.');
};
