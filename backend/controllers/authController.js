// backend/controllers/authController.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

// --- Helper Function ---
/**
 * Generates a JSON Web Token (JWT) for a given user ID.
 * @param {number} id - The user's ID.
 * @returns {string} - The generated JWT.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'a_secure_jwt_secret_replace_it', {
    expiresIn: '30d',
  });
};


// --- Controller Functions ---

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  const { username, email, password } = req.body;

  // Validate incoming data
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields (username, email, password).' });
  }

  try {
    // Check if a user with the given email already exists
    const [existingUsers] = await db.query('SELECT email FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    // Hash the user's password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the new user into the database
    const [result] = await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    // Respond with the newly created user's info and a JWT
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

/**
 * @desc    Authenticate a user and get a token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  const { email, password } = req.body;
  
  // Validate incoming data
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide both email and password.' });
  }

  try {
    // Find the user by email
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    // If user exists, compare the provided password with the stored hashed password
    if (user && (await bcrypt.compare(password, user.password))) {
      // Passwords match, send back user info and token
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      // User not found or password incorrect. Use a generic message for security.
      res.status(401).json({ message: 'Invalid credentials.' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

/**
 * @desc    Get the current logged-in user's profile
 * @route   GET /api/auth/me
 * @access  Private (requires token)
 */
export const getMe = async (req, res) => {
    // The user's ID is attached to the request object by the `protect` middleware.
    try {
        const [users] = await db.query('SELECT id, username, email, created_at FROM users WHERE id = ?', [req.user.id]);
        const user = users[0];

        if (user) {
            res.status(200).json(user);
        } else {
            // This case is unlikely if the token is valid but good practice to have.
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (error) {
        console.error('GetMe Error:', error);
        res.status(500).json({ message: 'Server error fetching user profile.' });
    }
};
