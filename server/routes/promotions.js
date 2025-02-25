import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// Get all active promotions
router.get('/', async (req, res) => {
  try {
    const promotions = await db.all(`
      SELECT *
      FROM promotions
      WHERE is_active = 1
      ORDER BY created_at DESC
    `);

    res.json(promotions);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create promotion (admin only)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      discount_type,
      discount_value,
      start_date,
      end_date,
      min_loyalty_level = null
    } = req.body;

    const result = await db.run(`
      INSERT INTO promotions (
        name, description, discount_type, discount_value,
        start_date, end_date, min_loyalty_level, is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      name,
      description,
      discount_type,
      discount_value,
      start_date,
      end_date,
      min_loyalty_level
    ]);

    const newPromotion = await db.get('SELECT * FROM promotions WHERE id = ?', [result.lastID]);
    res.status(201).json(newPromotion);
  } catch (error) {
    console.error('Error creating promotion:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update promotion (admin only)
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      description,
      discount_type,
      discount_value,
      start_date,
      end_date,
      min_loyalty_level
    } = req.body;

    const result = await db.run(`
      UPDATE promotions
      SET name = ?, description = ?, discount_type = ?,
          discount_value = ?, start_date = ?, end_date = ?,
          min_loyalty_level = ?
      WHERE id = ? AND is_active = 1
    `, [
      name,
      description,
      discount_type,
      discount_value,
      start_date,
      end_date,
      min_loyalty_level,
      req.params.id
    ]);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    const updatedPromotion = await db.get('SELECT * FROM promotions WHERE id = ?', [req.params.id]);
    res.json(updatedPromotion);
  } catch (error) {
    console.error('Error updating promotion:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete promotion (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.run('UPDATE promotions SET is_active = 0 WHERE id = ?', [req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    res.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;