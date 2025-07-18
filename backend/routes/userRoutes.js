// backend/routes/userRoutes.js

import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes in this file are protected
router.use(protect);

router.route('/profile')
    .get(getUserProfile)
    .put(updateUserProfile);

export default router;
