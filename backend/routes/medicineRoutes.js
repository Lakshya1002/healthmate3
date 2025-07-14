// backend/routes/medicineRoutes.js

import express from 'express';
import { 
    getAllMedicines, 
    addMedicine, 
    updateMedicine, 
    deleteMedicine,
    getMedicineStats,
    getMedicineSuggestions,
    refillMedicine // ✅ ADDED: Import the new refill function
} from '../controllers/medicineController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// All medicine routes are protected
router.use(protect);

router.route('/stats')
    .get(getMedicineStats);

router.route('/suggestions')
    .get(getMedicineSuggestions);

router.route('/')
    .get(getAllMedicines)
    .post(addMedicine);

router.route('/:id')
    .put(updateMedicine)
    .delete(deleteMedicine);

// ✅ ADDED: New route to handle refilling a medicine
router.route('/:id/refill')
    .put(refillMedicine);

export default router;
