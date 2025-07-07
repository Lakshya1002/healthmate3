// backend/routes/healthLogRoutes.js

import express from 'express';
import {
    getAllHealthLogs,
    addHealthLog,
    updateHealthLog,
    deleteHealthLog,
} from '../controllers/healthLogController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes below this middleware
router.use(protect);

router.route('/')
    .get(getAllHealthLogs)
    .post(addHealthLog);

router.route('/:id')
    .put(updateHealthLog)
    .delete(deleteHealthLog);

export default router;
