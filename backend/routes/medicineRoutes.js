const express = require('express');
const router = express.Router();
const {
  getAllMedicines,  // ✅ Correct name from your controller
  addMedicine,
  updateMedicine,
  deleteMedicine,
} = require('../controllers/medicineController');

const authenticateToken = require('../middleware/authMiddleware');

// 🔐 Protect all routes below
router.use(authenticateToken);

router.get('/', getAllMedicines);
router.post('/', addMedicine);
router.put('/:id', updateMedicine);
router.delete('/:id', deleteMedicine);

module.exports = router;
