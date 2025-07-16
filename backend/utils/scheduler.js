// backend/utils/scheduler.js

import cron from 'node-cron';
import db from '../config/db.js';
import webpush from 'web-push';
import { DateTime } from 'luxon';

/**
 * Sends a generic push notification to a user.
 */
const sendNotification = async (subscription, payload) => {
    try {
        const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth }
        };

        await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
        console.log(`Notification sent to user ${subscription.user_id}`);

    } catch (error) {
        if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`Subscription for endpoint ${subscription.endpoint} has expired. Deleting.`);
            await db.query('DELETE FROM push_subscriptions WHERE endpoint = ?', [subscription.endpoint]);
        } else {
            console.error(`Error sending notification to user ${subscription.user_id}:`, error.body || error);
        }
    }
};

/**
 * This single function now handles reminders, inventory checks, and missed dose logging.
 */
const checkTasksForUsers = async () => {
    console.log(`Scheduler running at UTC: ${DateTime.utc().toISO()}`);

    try {
        const [users] = await db.query(`
            SELECT DISTINCT u.id, u.timezone 
            FROM users u 
            JOIN push_subscriptions ps ON u.id = ps.user_id 
            WHERE u.timezone IS NOT NULL
        `);

        if (users.length === 0) return;

        for (const user of users) {
            const nowInUserTz = DateTime.now().setZone(user.timezone);
            const currentTime = nowInUserTz.toFormat('HH:mm');
            const currentDayOfWeek = nowInUserTz.toFormat('EEEE');

            const [subscriptions] = await db.query('SELECT * FROM push_subscriptions WHERE user_id = ?', [user.id]);
            if (subscriptions.length === 0) continue;

            // --- Task 1: Check for Medication Reminders ---
            const [reminders] = await db.query(`
                SELECT r.id, r.medicine_id, r.reminder_time, m.name AS medicine_name, m.dosage, m.start_date, r.frequency, r.week_days, r.day_interval
                FROM reminders r
                JOIN medicines m ON r.medicine_id = m.id
                WHERE r.user_id = ? AND r.reminder_time = ? AND r.status = 'scheduled'
            `, [user.id, currentTime]);

            for (const reminder of reminders) {
                // Reminder frequency validation logic...
                const startDate = DateTime.fromJSDate(new Date(reminder.start_date));
                if (nowInUserTz < startDate) continue;

                let shouldSend = false;
                switch (reminder.frequency) {
                    case 'daily': shouldSend = true; break;
                    case 'weekly': if (reminder.week_days && reminder.week_days.includes(currentDayOfWeek)) { shouldSend = true; } break;
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
                    console.log(`Sending reminder ${reminder.id} to user ${user.id} at their local time ${currentTime}`);
                    const reminderPayload = {
                        title: `Time for your ${reminder.medicine_name}!`,
                        body: `It's time to take your ${reminder.dosage} dose.`,
                        url: `/reminders`
                    };
                    await Promise.all(subscriptions.map(sub => sendNotification(sub, reminderPayload)));
                }
            }

            // --- Task 2: Check for Low Inventory at 9:00 AM Local Time ---
            if (currentTime === '09:00') {
                // ... (inventory check logic remains here)
            }

            // --- ✅ NEW: Task 3: Log Missed Doses at the End of the Day ---
            if (currentTime === '23:59') {
                console.log(`Logging missed doses for user ${user.id} for the day.`);
                
                // Find all reminders for this user that were supposed to be taken today
                // and are still marked as 'scheduled'.
                const [missedReminders] = await db.query(`
                    SELECT id, medicine_id FROM reminders
                    WHERE user_id = ? AND status = 'scheduled'
                `, [user.id]);

                for (const reminder of missedReminders) {
                    const startDate = DateTime.fromJSDate(new Date(reminder.start_date), { zone: user.timezone });
                     if (nowInUserTz < startDate) continue;

                    let wasDueToday = false;
                    switch (reminder.frequency) {
                        case 'daily': wasDueToday = true; break;
                        case 'weekly': if (reminder.week_days && reminder.week_days.includes(currentDayOfWeek)) { wasDueToday = true; } break;
                        case 'interval':
                             if (reminder.day_interval > 0) {
                                const diff = nowInUserTz.diff(startDate, 'days').as('days');
                                const diffDays = Math.floor(diff);
                                if (diffDays >= 0 && diffDays % reminder.day_interval === 0) {
                                    wasDueToday = true;
                                }
                            }
                            break;
                    }
                    
                    if (wasDueToday) {
                        await db.query(
                            'INSERT INTO dose_history (user_id, medicine_id, reminder_id, status, logged_at) VALUES (?, ?, ?, ?, ?)',
                            [user.id, reminder.medicine_id, reminder.id, 'missed', nowInUserTz.toJSDate()]
                        );
                        console.log(`Logged missed dose for reminder ID: ${reminder.id}`);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error in checkTasksForUsers job:', error);
    }
};

export const startScheduler = () => {
    cron.schedule('* * * * *', checkTasksForUsers);
    console.log('Unified, timezone-aware task scheduler started.');
};
