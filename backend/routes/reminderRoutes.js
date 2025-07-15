// backend/routes/reminderRoutes.js

import express from 'express';
import { 
    getReminders, 
    addReminder, 
    updateReminder,
    deleteReminder,
    getDoseHistory
} from '../controllers/reminderController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// New route to get the dose history
router.get('/history', getDoseHistory);

router.route('/')
    .get(getReminders)
    .post(addReminder);

router.route('/:id')
    .put(updateReminder)
    .delete(deleteReminder);

export default router;
