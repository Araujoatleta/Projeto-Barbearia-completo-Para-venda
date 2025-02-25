import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// Get all available rewards
router.get('/', (req, res) => {
  try {
    const rewards = db.prepare(`
      SELECT *
      FROM rewards
      WHERE is_active = 1
      ORDER BY points_required
    `).all();

    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Redeem reward
router.post('/redeem/:id', (req, res) => {
  try {
    const reward = db.prepare('SELECT * FROM rewards WHERE id = ?').get(req.params.id);
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }

    const userPoints = db.prepare(`
      SELECT SUM(points) as total_points
      FROM loyalty_points
      WHERE user_id = ?
    `).get(req.user.id);

    if (userPoints.total_points < reward.points_required) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    // Deduct points
    db.prepare(`
      INSERT INTO loyalty_points (user_id, points, transaction_type, description, reference_id)
      VALUES (?, ?, 'spent', ?, ?)
    `).run(req.user.id, -reward.points_required, `Redeemed ${reward.name}`, reward.id);

    res.json({ message: 'Reward redeemed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;