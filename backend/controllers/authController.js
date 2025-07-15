// backend/controllers/authController.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import Joi from 'joi';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import nodemailer from 'nodemailer'; // This is used to send real emails via Gmail

const client = new OAuth2Client(process.env.OAUTH_CLIENT_ID);

// --- Helper Functions & Schemas ---

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
      console.error('FATAL ERROR: JWT_SECRET is not defined in your .env file.');
      process.exit(1);
  }
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

const registerSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    timezone: Joi.string().required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

// --- Controller Functions ---

export const googleLogin = async (req, res) => {
    const { credential, timezone } = req.body;
    try {
        const ticket = await client.verifyIdToken({ idToken: credential, audience: process.env.OAUTH_CLIENT_ID });
        const payload = ticket.getPayload();
        const { email, name } = payload;
        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        let user = existingUsers[0];
        if (!user) {
            const [result] = await db.query('INSERT INTO users (username, email, timezone) VALUES (?, ?, ?)', [name, email, timezone]);
            const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
            user = newUser[0];
        } else if (!user.timezone && timezone) {
            await db.query('UPDATE users SET timezone = ? WHERE id = ?', [timezone, user.id]);
        }
        const token = generateToken(user.id);
        res.status(200).json({ id: user.id, username: user.username, email: user.email, token: token });
    } catch (error) {
        console.error('Google Login Error:', error);
        res.status(401).json({ message: 'Google Sign-In failed. Please try again.' });
    }
};

export const register = async (req, res) => {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const { username, email, password, timezone } = req.body;
    try {
        const [existingUsers] = await db.query('SELECT email FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) return res.status(409).json({ message: 'A user with this email already exists.' });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const [result] = await db.query('INSERT INTO users (username, email, password, timezone) VALUES (?, ?, ?, ?)', [username, email, hashedPassword, timezone]);
        res.status(201).json({ id: result.insertId, username: username, email: email, token: generateToken(result.insertId) });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during user registration.' });
    }
};

export const login = async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  const { email, password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });
    if (!user.password) return res.status(401).json({ message: 'This account was created with a social provider. Please use Google Sign-In.' });
    if (await bcrypt.compare(password, user.password)) {
      res.json({ id: user.id, username: user.username, email: user.email, token: generateToken(user.id) });
    } else {
      res.status(401).json({ message: 'Invalid credentials.' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

export const getMe = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, username, email, timezone, created_at FROM users WHERE id = ?', [req.user.id]);
        const user = users[0];
        if (user) res.status(200).json(user);
        else res.status(404).json({ message: 'User not found.' });
    } catch (error) {
        console.error('GetMe Error:', error);
        res.status(500).json({ message: 'Server error fetching user profile.' });
    }
};


/**
 * @desc    Handle forgot password request
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            // Security best practice: don't reveal if the email exists or not.
            return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // Token expires in 1 hour

        await db.query(
            'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
            [user.id, token, expires]
        );

        // This uses your real email credentials from the .env file to send the email.
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_PORT == 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const resetUrl = `http://localhost:5173/reset-password/${token}`;

        await transporter.sendMail({
            from: `"HealthMate" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Your HealthMate Password Reset Request',
            html: `<p>You requested a password reset. Click this link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p><p>This link will expire in one hour.</p>`,
        });

        console.log(`Password reset email sent to ${user.email}`);
        res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: 'Server error while processing request.' });
    }
};

/**
 * @desc    Reset password using token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ message: 'Token and new password are required.' });
    }

    try {
        const [tokens] = await db.query('SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > NOW()', [token]);
        const resetToken = tokens[0];

        if (!resetToken) {
            return res.status(400).json({ message: 'Invalid or expired password reset token.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, resetToken.user_id]);

        await db.query('DELETE FROM password_reset_tokens WHERE id = ?', [resetToken.id]);

        res.status(200).json({ message: 'Password has been reset successfully.' });

    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Server error while resetting password.' });
    }
};
