// backend/controllers/authController.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import Joi from 'joi';
import { OAuth2Client } from 'google-auth-library'; // ✅ Import Google Auth Library

// --- Google Auth Client ---
const client = new OAuth2Client(process.env.OAUTH_CLIENT_ID);

// --- Helper Function ---
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
      console.error('FATAL ERROR: JWT_SECRET is not defined.');
      process.exit(1);
  }
  return jwt.sign({ id }, secret, {
    expiresIn: '30d',
  });
};


// --- Validation Schemas ---
const registerSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

// --- Controller Functions ---

/**
 * @desc    Handle Google Sign-In
 * @route   POST /api/auth/google
 * @access  Public
 */
export const googleLogin = async (req, res) => {
    const { credential } = req.body; // This is the token from Google

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.OAUTH_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        
        const { email, name } = payload;

        // Check if user already exists
        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        let user = existingUsers[0];

        // If user doesn't exist, create a new one
        if (!user) {
            const [result] = await db.query(
                'INSERT INTO users (username, email) VALUES (?, ?)',
                [name, email]
            );
            const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
            user = newUser[0];
        }

        // Generate our own JWT for the user to use with our API
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


export const register = async (req, res) => {
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { username, email, password } = req.body;

  try {
    const [existingUsers] = await db.query('SELECT email FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
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

    if (!user.password) {
        return res.status(401).json({ message: 'This account was created with a social provider. Please use Google Sign-In.' });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
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

export const getMe = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, username, email, created_at FROM users WHERE id = ?', [req.user.id]);
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
