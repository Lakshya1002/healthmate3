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
            `SELECT r.id, r.reminder_time, r.status, m.name as medicine_name 
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
    const { medicine_id, reminder_time } = req.body;
    const userId = req.user.id;

    if (!medicine_id || !reminder_time) {
        return res.status(400).json({ message: 'Please provide medicine and reminder time.' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO reminders (user_id, medicine_id, reminder_time) VALUES (?, ?, ?)',
            [userId, medicine_id, reminder_time]
        );
        const [newReminder] = await db.query('SELECT * FROM reminders WHERE id = ?', [result.insertId]);
        res.status(201).json(newReminder[0]);
    } catch (error) {
        console.error('Add Reminder Error:', error);
        res.status(500).json({ message: 'Server error while adding reminder.' });
    }
};

/**
 * @desc    Update a reminder's status
 * @route   PUT /api/reminders/:id
 * @access  Private
 */
export const updateReminderStatus = async (req, res) => {
    const reminderId = req.params.id;
    const { status } = req.body;
    const userId = req.user.id;

    if (!status || !['scheduled', 'taken', 'skipped'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }

    try {
        const [result] = await db.query(
            'UPDATE reminders SET status = ? WHERE id = ? AND user_id = ?',
            [status, reminderId, userId]
        );

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
