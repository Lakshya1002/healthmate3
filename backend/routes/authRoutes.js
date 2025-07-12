// backend/routes/authRoutes.js

import express from 'express';
import { register, login, getMe, googleLogin } from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin); // ✅ New route for Google Sign-In
router.get('/me', protect, getMe);

export default router;
