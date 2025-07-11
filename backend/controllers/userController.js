// backend/controllers/userController.js

import db from '../config/db.js';
import bcrypt from 'bcryptjs';

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, username, email, created_at FROM users WHERE id = ?', [req.user.id]);
        
        if (users.length > 0) {
            res.json(users[0]);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Get User Profile Error:', error);
        res.status(500).json({ message: 'Server error while fetching profile.' });
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
    const { username, email, password } = req.body;
    const userId = req.user.id;

    try {
        // Fetch current user data
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = users[0];

        // Prepare update fields
        const updatedUsername = username || user.username;
        const updatedEmail = email || user.email;
        let updatedPassword = user.password;

        // If a new password is provided, hash it
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updatedPassword = await bcrypt.hash(password, salt);
        }

        // Update user in the database
        await db.query(
            'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?',
            [updatedUsername, updatedEmail, updatedPassword, userId]
        );

        // Fetch and return updated user profile (without password)
        const [updatedUsers] = await db.query('SELECT id, username, email, created_at FROM users WHERE id = ?', [userId]);

        res.json(updatedUsers[0]);

    } catch (error) {
        // Handle potential unique constraint errors (e.g., email already exists)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email or username already in use.' });
        }
        console.error('Update User Profile Error:', error);
        res.status(500).json({ message: 'Server error while updating profile.' });
    }
};
