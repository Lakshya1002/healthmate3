// backend/controllers/reminderController.js

import db from '../config/db.js';

// ... (getReminders, addReminder functions remain the same)
/**
 * @desc    Get all reminders for the logged-in user
 * @route   GET /api/reminders
 * @access  Private
 */
export const getReminders = async (req, res) => {
    try {
        const [reminders] = await db.query(
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
 * ✅ UPDATED: This function now automatically decrements medicine quantity.
 * @desc    Update a reminder's status, log the action, and update inventory.
 * @route   PUT /api/reminders/:id
 * @access  Private
 */
export const updateReminder = async (req, res) => {
    const reminderId = req.params.id;
    const userId = req.user.id;
    const { medicine_id, reminder_time, status, frequency, week_days, day_interval } = req.body;

    try {
        const [reminders] = await db.query('SELECT * FROM reminders WHERE id = ? AND user_id = ?', [reminderId, userId]);
        if (reminders.length === 0) {
            return res.status(404).json({ message: 'Reminder not found or unauthorized.' });
        }
        const reminderToUpdate = reminders[0];

        // Build the dynamic update query for the reminder
        const fields = [];
        const values = [];
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

        if (fields.length > 0) {
            const sql = `UPDATE reminders SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;
            values.push(reminderId, userId);
            await db.query(sql, values);
        }

        // ✅ NEW LOGIC: If status is 'taken', update the medicine quantity.
        if (status === 'taken') {
            const [medicines] = await db.query('SELECT dosage, quantity FROM medicines WHERE id = ?', [reminderToUpdate.medicine_id]);
            const medicine = medicines[0];

            if (medicine && medicine.quantity !== null) {
                // Parse the number from the dosage string (e.g., "2 pills" -> 2)
                const dosageString = medicine.dosage || '1';
                const match = dosageString.match(/\d+/);
                const amountToDecrement = match ? parseInt(match[0], 10) : 1;

                // Decrement quantity, ensuring it doesn't go below zero
                const newQuantity = Math.max(0, medicine.quantity - amountToDecrement);
                
                await db.query('UPDATE medicines SET quantity = ? WHERE id = ?', [newQuantity, reminderToUpdate.medicine_id]);
                console.log(`Decremented quantity for medicine ID ${reminderToUpdate.medicine_id} by ${amountToDecrement}. New quantity: ${newQuantity}`);
            }
        }

        // Log the action to dose_history (for both 'taken' and 'skipped')
        if (status && (status === 'taken' || status === 'skipped')) {
            await db.query(
                'INSERT INTO dose_history (user_id, medicine_id, reminder_id, status) VALUES (?, ?, ?, ?)',
                [userId, reminderToUpdate.medicine_id, reminderId, status]
            );
            console.log(`Logged dose action for reminder ID: ${reminderId}`);
        }

        const [updatedReminder] = await db.query('SELECT * FROM reminders WHERE id = ?', [reminderId]);
        res.status(200).json(updatedReminder[0]);

    } catch (error) {
        console.error('Update Reminder Error:', error);
        res.status(500).json({ message: 'Server error while updating reminder.' });
    }
};

// ... (deleteReminder and getDoseHistory functions remain the same)
/**
 * @desc    Delete a reminder
 * @route   DELETE /api/reminders/:id
 * @access  Private
 */
export const deleteReminder = async (req, res) => {
    const reminderId = req.params.id;
    const userId = req.user.id;

    try {
        // To maintain data integrity, we first delete related dose_history records.
        await db.query('DELETE FROM dose_history WHERE reminder_id = ? AND user_id = ?', [reminderId, userId]);
        
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

/**
 * @desc    Get the user's entire dose history.
 * @route   GET /api/reminders/history
 * @access  Private
 */
export const getDoseHistory = async (req, res) => {
    try {
        const [history] = await db.query(
            `SELECT dh.status, dh.logged_at, m.name as medicine_name
             FROM dose_history dh
             JOIN medicines m ON dh.medicine_id = m.id
             WHERE dh.user_id = ? 
             ORDER BY dh.logged_at DESC`,
            [req.user.id]
        );
        res.status(200).json(history);
    } catch (error) {
        console.error('Get Dose History Error:', error);
        res.status(500).json({ message: 'Server error while fetching dose history.' });
    }
};
