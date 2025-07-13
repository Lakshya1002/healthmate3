// backend/routes/reminderRoutes.js

import express from 'express';
import { 
    getReminders, 
    addReminder, 
    updateReminder, // ✅ Use the new generic update function
    deleteReminder 
} from '../controllers/reminderController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getReminders)
    .post(addReminder);

router.route('/:id')
    .put(updateReminder) // ✅ Point to the correct controller function
    .delete(deleteReminder);

export default router;
