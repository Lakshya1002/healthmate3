// backend/controllers/healthLogController.js

import db from '../config/db.js';
import Joi from 'joi';

// --- Validation Schema ---
const healthLogSchema = Joi.object({
    log_date: Joi.date().required(),
    blood_pressure: Joi.string().max(20).allow(null, ''),
    heart_rate: Joi.number().integer().min(0).allow(null, ''),
    temperature: Joi.number().allow(null, ''),
    weight: Joi.number().min(0).allow(null, ''),
    notes: Joi.string().allow(null, ''),
});

// Helper to convert empty strings to null for database insertion
const toNull = (value) => (value === '' || value === undefined ? null : value);

/**
 * @desc    Add a health log for the logged-in user
 * @route   POST /api/health-logs
 * @access  Private
 */
export const addHealthLog = async (req, res) => {
    const { error } = healthLogSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const userId = req.user.id;
    const { log_date, blood_pressure, heart_rate, temperature, weight, notes } = req.body;

    const sql = `
        INSERT INTO health_logs (user_id, log_date, blood_pressure, heart_rate, temperature, weight, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        userId,
        toNull(log_date),
        toNull(blood_pressure),
        toNull(heart_rate),
        toNull(temperature),
        toNull(weight),
        toNull(notes),
    ];

    try {
        const [result] = await db.query(sql, values);
        const [newLog] = await db.query('SELECT * FROM health_logs WHERE log_id = ?', [result.insertId]);
        res.status(201).json(newLog[0]);
    } catch (err) {
        console.error("Error adding health log:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * @desc    Get all health logs for the logged-in user
 * @route   GET /api/health-logs
 * @access  Private
 */
export const getAllHealthLogs = async (req, res) => {
    const userId = req.user.id;
    const sql = `SELECT * FROM health_logs WHERE user_id = ? ORDER BY log_date DESC`;

    try {
        const [results] = await db.query(sql, [userId]);
        res.status(200).json(results);
    } catch (err) {
        console.error("Error fetching health logs:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * @desc    Update a health log for the logged-in user
 * @route   PUT /api/health-logs/:id
 * @access  Private
 */
export const updateHealthLog = async (req, res) => {
    const { error } = healthLogSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const userId = req.user.id;
    const logId = req.params.id;
    const { log_date, blood_pressure, heart_rate, temperature, weight, notes } = req.body;

    const sql = `
        UPDATE health_logs 
        SET log_date = ?, blood_pressure = ?, heart_rate = ?, temperature = ?, weight = ?, notes = ?
        WHERE log_id = ? AND user_id = ?
    `;

    const values = [
        toNull(log_date),
        toNull(blood_pressure),
        toNull(heart_rate),
        toNull(temperature),
        toNull(weight),
        toNull(notes),
        logId,
        userId,
    ];

    try {
        const [result] = await db.query(sql, values);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Health log not found or you are not authorized to edit it." });
        }
        const [updatedLog] = await db.query('SELECT * FROM health_logs WHERE log_id = ?', [logId]);
        res.status(200).json(updatedLog[0]);
    } catch (err) {
        console.error("Error updating health log:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * @desc    Delete a health log for the logged-in user
 * @route   DELETE /api/health-logs/:id
 * @access  Private
 */
export const deleteHealthLog = async (req, res) => {
    const userId = req.user.id;
    const logId = req.params.id;

    const sql = `DELETE FROM health_logs WHERE log_id = ? AND user_id = ?`;

    try {
        const [result] = await db.query(sql, [logId, userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Health log not found or you are not authorized to delete it." });
        }
        res.status(200).json({ message: "Health log deleted successfully" });
    } catch (err) {
        console.error("Error deleting health log:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
