// backend/routes/medicineRoutes.js

import express from 'express';
import { 
    getAllMedicines, 
    addMedicine, 
    updateMedicine, 
    deleteMedicine,
    getMedicineStats,
    getMedicineSuggestions // ✅ Import the new function
} from '../controllers/medicineController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// All medicine routes are protected
router.use(protect);

router.route('/stats')
    .get(getMedicineStats);

// ✅ ADDED: Route for getting suggestions
router.route('/suggestions')
    .get(getMedicineSuggestions);

router.route('/')
    .get(getAllMedicines)
    .post(addMedicine);

router.route('/:id')
    .put(updateMedicine)
    .delete(deleteMedicine);

export default router;
