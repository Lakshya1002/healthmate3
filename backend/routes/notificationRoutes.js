// backend/routes/notificationRoutes.js

import express from 'express';
import { subscribe, getVapidPublicKey } from '../controllers/notificationController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// All notification routes are protected
router.use(protect);

// Route to get the VAPID public key
router.get('/vapid-public-key', getVapidPublicKey);

// Route to subscribe a user to push notifications
router.post('/subscribe', subscribe);

export default router;
