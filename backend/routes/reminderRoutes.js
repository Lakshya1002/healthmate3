// backend/routes/reminderRoutes.js

import express from 'express';
import { 
    getReminders, 
    addReminder, 
    updateReminderStatus,
    deleteReminder 
} from '../controllers/reminderController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getReminders)
    .post(addReminder);

router.route('/:id')
    .put(updateReminderStatus)
    .delete(deleteReminder);

export default router;
