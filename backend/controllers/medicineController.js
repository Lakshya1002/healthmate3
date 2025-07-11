// backend/controllers/medicineController.js

import db from '../config/db.js';

/**
 * @desc    Get all medicines for the logged-in user
 * @route   GET /api/medicines
 * @access  Private
 */
export const getAllMedicines = async (req, res) => {
  try {
    const [medicines] = await db.query(
      'SELECT * FROM medicines WHERE user_id = ? ORDER BY start_date DESC',
      [req.user.id]
    );
    res.status(200).json(medicines);
  } catch (error) {
    console.error('Get All Medicines Error:', error);
    res.status(500).json({ message: 'Server error while fetching medicines.' });
  }
};

/**
 * @desc    Add a new medicine for the logged-in user
 * @route   POST /api/medicines
 * @access  Private
 */
export const addMedicine = async (req, res) => {
  const { name, dosage, frequency, start_date, end_date, notes, quantity, refill_threshold } = req.body;
  const userId = req.user.id;

  if (!name || !dosage || !frequency || !start_date) {
    return res.status(400).json({ message: 'Please provide name, dosage, frequency, and start date.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO medicines (user_id, name, dosage, frequency, start_date, end_date, notes, quantity, refill_threshold) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, name, dosage, frequency, start_date, end_date || null, notes || null, quantity || null, refill_threshold || null]
    );
    const [newMedicine] = await db.query('SELECT * FROM medicines WHERE id = ?', [result.insertId]);
    res.status(201).json(newMedicine[0]);
  } catch (error) {
    console.error('Add Medicine Error:', error);
    res.status(500).json({ message: 'Server error while adding medicine.' });
  }
};

/**
 * @desc    Update an existing medicine for the logged-in user
 * @route   PUT /api/medicines/:id
 * @access  Private
 */
export const updateMedicine = async (req, res) => {
  const medicineId = req.params.id;
  const userId = req.user.id;
  const { name, dosage, frequency, start_date, end_date, notes, quantity, refill_threshold } = req.body;

  if (!name || !dosage || !frequency || !start_date) {
    return res.status(400).json({ message: 'Please provide name, dosage, frequency, and start date.' });
  }

  try {
    const [medicines] = await db.query('SELECT id FROM medicines WHERE id = ? AND user_id = ?', [medicineId, userId]);
    if (medicines.length === 0) {
      return res.status(404).json({ message: 'Medicine not found or you do not have permission to edit it.' });
    }

    await db.query(
      'UPDATE medicines SET name = ?, dosage = ?, frequency = ?, start_date = ?, end_date = ?, notes = ?, quantity = ?, refill_threshold = ? WHERE id = ?',
      [name, dosage, frequency, start_date, end_date || null, notes || null, quantity || null, refill_threshold || null, medicineId]
    );
    
    const [updatedMedicine] = await db.query('SELECT * FROM medicines WHERE id = ?', [medicineId]);
    res.status(200).json(updatedMedicine[0]);

  } catch (error) {
    console.error('Update Medicine Error:', error);
    res.status(500).json({ message: 'Server error while updating medicine.' });
  }
};

/**
 * @desc    Delete a medicine for the logged-in user
 * @route   DELETE /api/medicines/:id
 * @access  Private
 */
export const deleteMedicine = async (req, res) => {
  const medicineId = req.params.id;
  const userId = req.user.id;

  try {
    const [result] = await db.query(
      'DELETE FROM medicines WHERE id = ? AND user_id = ?',
      [medicineId, userId]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ id: medicineId, message: 'Medicine removed successfully.' });
    } else {
      res.status(404).json({ message: 'Medicine not found or you do not have permission to delete it.' });
    }
  } catch (error) {
    console.error('Delete Medicine Error:', error);
    res.status(500).json({ message: 'Server error while deleting medicine.' });
  }
};

/**
 * @desc    Get medicine statistics for the logged-in user
 * @route   GET /api/medicines/stats
 * @access  Private
 */
export const getMedicineStats = async (req, res) => {
  try {
    const query = `
      SELECT
        COUNT(*) AS totalMedicines,
        SUM(CASE WHEN end_date IS NULL OR end_date >= CURDATE() THEN 1 ELSE 0 END) AS activeMedicines,
        SUM(CASE WHEN end_date < CURDATE() THEN 1 ELSE 0 END) AS completedMedicines
      FROM medicines
      WHERE user_id = ?
    `;
    const [stats] = await db.query(query, [req.user.id]);
    
    const userStats = {
        totalMedicines: stats[0].totalMedicines || 0,
        activeMedicines: stats[0].activeMedicines || 0,
        completedMedicines: stats[0].completedMedicines || 0
    };

    res.status(200).json(userStats);
  } catch (error) {
    console.error('Get Medicine Stats Error:', error);
    res.status(500).json({ message: 'Server error while fetching stats.' });
  }
};

/**
 * @desc    Get medicine name suggestions
 * @route   GET /api/medicines/suggestions
 * @access  Private
 */
export const getMedicineSuggestions = async (req, res) => {
  const { q } = req.query; // q for query

  if (!q || q.length < 2) {
    return res.json([]); // Return empty array if query is too short
  }

  try {
    const searchQuery = `${q}%`; // Search for names starting with the query
    const [suggestions] = await db.query(
      'SELECT name FROM common_medicines WHERE name LIKE ? LIMIT 10',
      [searchQuery]
    );
    
    const suggestionNames = suggestions.map(row => row.name);
    
    res.status(200).json(suggestionNames);
  } catch (error) {
    console.error('Get Medicine Suggestions Error:', error);
    res.status(500).json({ message: 'Server error while fetching suggestions.' });
  }
};
