// backend/controllers/authController.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import Joi from 'joi';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.OAUTH_CLIENT_ID);

// Helper function to generate a JWT
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
      console.error('FATAL ERROR: JWT_SECRET is not defined in your .env file.');
      process.exit(1); // Exit if the secret is missing
  }
  return jwt.sign({ id }, secret, {
    expiresIn: '30d',
  });
};

// --- Validation Schemas ---
// ✅ ADDED: timezone to the register schema
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
// ✅ UPDATED: Now accepts and handles timezone from the frontend
export const googleLogin = async (req, res) => {
    const { credential, timezone } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.OAUTH_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        
        const { email, name } = payload;

        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        let user = existingUsers[0];

        if (!user) {
            // If user is new, save them with their timezone
            const [result] = await db.query(
                'INSERT INTO users (username, email, timezone) VALUES (?, ?, ?)',
                [name, email, timezone]
            );
            const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
            user = newUser[0];
        } else if (!user.timezone && timezone) {
            // If an existing user doesn't have a timezone set, update it
            await db.query('UPDATE users SET timezone = ? WHERE id = ?', [timezone, user.id]);
        }


        const token = generateToken(user.id);

        res.status(200).json({
            id: user.id,
            username: user.username,
            email: user.email,
            token: token,
        });

    } catch (error) {
        console.error('Google Login Error:', error);
        res.status(401).json({ message: 'Google Sign-In failed. Please try again.' });
    }
};

// ✅ UPDATED: Now accepts and saves the user's timezone on registration
export const register = async (req, res) => {
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { username, email, password, timezone } = req.body;

  try {
    const [existingUsers] = await db.query('SELECT email FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      'INSERT INTO users (username, email, password, timezone) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, timezone]
    );

    res.status(201).json({
      id: result.insertId,
      username: username,
      email: email,
      token: generateToken(result.insertId),
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during user registration.' });
  }
};

export const login = async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
      return res.status(400).json({ message: error.details[0].message });
  }
  
  const { email, password } = req.body;

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }
    
    if (!user.password) {
        return res.status(401).json({ message: 'This account was created with a social provider. Please use Google Sign-In.' });
    }

    if (await bcrypt.compare(password, user.password)) {
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials.' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// ✅ UPDATED: Now returns the timezone along with other user data
export const getMe = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, username, email, timezone, created_at FROM users WHERE id = ?', [req.user.id]);
        const user = users[0];

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (error) {
        console.error('GetMe Error:', error);
        res.status(500).json({ message: 'Server error fetching user profile.' });
    }
};
