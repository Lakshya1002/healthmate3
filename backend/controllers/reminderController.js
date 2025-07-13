// backend/controllers/reminderController.js

import db from '../config/db.js';

/**
 * @desc    Get all reminders for the logged-in user
 * @route   GET /api/reminders
 * @access  Private
 */
export const getReminders = async (req, res) => {
    try {
        const [reminders] = await db.query(
            // ✅ UPDATED: Select new frequency columns
            `SELECT r.id, r.medicine_id, r.reminder_time, r.status, r.frequency, r.week_days, r.day_interval, m.name as medicine_name 
             FROM reminders r
             JOIN medicines m ON r.medicine_id = m.id
             WHERE r.user_id = ? 
             ORDER BY r.reminder_time`,
            [req.user.id]
        );
        res.status(200).json(reminders);
    } catch (error) {
        console.error('Get Reminders Error:', error);
        res.status(500).json({ message: 'Server error while fetching reminders.' });
    }
};

/**
 * @desc    Add a new reminder
 * @route   POST /api/reminders
 * @access  Private
 */
export const addReminder = async (req, res) => {
    // ✅ UPDATED: Destructure new frequency fields from body
    const { medicine_id, reminder_time, frequency, week_days, day_interval } = req.body;
    const userId = req.user.id;

    if (!medicine_id || !reminder_time || !frequency) {
        return res.status(400).json({ message: 'Please provide medicine, time, and frequency.' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO reminders (user_id, medicine_id, reminder_time, frequency, week_days, day_interval) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, medicine_id, reminder_time, frequency, week_days, day_interval]
        );
        const [newReminder] = await db.query('SELECT * FROM reminders WHERE id = ?', [result.insertId]);
        res.status(201).json(newReminder[0]);
    } catch (error) {
        console.error('Add Reminder Error:', error);
        res.status(500).json({ message: 'Server error while adding reminder.' });
    }
};

/**
 * @desc    Update a reminder
 * @route   PUT /api/reminders/:id
 * @access  Private
 */
export const updateReminder = async (req, res) => {
    const reminderId = req.params.id;
    const userId = req.user.id;
    // ✅ UPDATED: Destructure all possible fields
    const { medicine_id, reminder_time, status, frequency, week_days, day_interval } = req.body;

    const fields = [];
    const values = [];

    // Build the query dynamically based on the fields provided
    if (medicine_id) { fields.push('medicine_id = ?'); values.push(medicine_id); }
    if (reminder_time) { fields.push('reminder_time = ?'); values.push(reminder_time); }
    if (frequency) { fields.push('frequency = ?'); values.push(frequency); }
    if (week_days !== undefined) { fields.push('week_days = ?'); values.push(week_days); }
    if (day_interval !== undefined) { fields.push('day_interval = ?'); values.push(day_interval); }
    if (status) {
        if (!['scheduled', 'taken', 'skipped'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided.' });
        }
        fields.push('status = ?');
        values.push(status);
    }

    if (fields.length === 0) {
        return res.status(400).json({ message: 'No fields to update were provided.' });
    }

    const sql = `UPDATE reminders SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;
    values.push(reminderId, userId);

    try {
        const [result] = await db.query(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Reminder not found or unauthorized.' });
        }

        const [updatedReminder] = await db.query('SELECT * FROM reminders WHERE id = ?', [reminderId]);
        res.status(200).json(updatedReminder[0]);
    } catch (error) {
        console.error('Update Reminder Error:', error);
        res.status(500).json({ message: 'Server error while updating reminder.' });
    }
};


/**
 * @desc    Delete a reminder
 * @route   DELETE /api/reminders/:id
 * @access  Private
 */
export const deleteReminder = async (req, res) => {
    const reminderId = req.params.id;
    const userId = req.user.id;

    try {
        const [result] = await db.query(
            'DELETE FROM reminders WHERE id = ? AND user_id = ?',
            [reminderId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Reminder not found or unauthorized.' });
        }

        res.status(200).json({ message: 'Reminder deleted successfully.' });
    } catch (error) {
        console.error('Delete Reminder Error:', error);
        res.status(500).json({ message: 'Server error while deleting reminder.' });
    }
};
