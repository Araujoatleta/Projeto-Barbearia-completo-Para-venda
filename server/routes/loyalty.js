import express from 'express';
import db from '../database/db.js';
import { createNotification } from './notifications.js';

const router = express.Router();

// Get user's loyalty points and level
router.get('/points', async (req, res) => {
  try {
    const points = await db.get(`
      SELECT COALESCE(SUM(points), 0) as total_points
      FROM loyalty_points
      WHERE user_id = ?
    `, [req.user.id]);

    const levels = await db.all(`
      SELECT level, points_required, description
      FROM loyalty_levels
      ORDER BY points_required ASC
    `);

    const currentLevel = await db.get(`
      SELECT loyalty_level
      FROM users
      WHERE id = ?
    `, [req.user.id]);

    // Calculate progress to next level
    let nextLevel = null;
    let progress = 0;
    let pointsToNextLevel = 0;

    for (let i = 0; i < levels.length; i++) {
      if (points.total_points < levels[i].points_required) {
        nextLevel = levels[i];
        if (i > 0) {
          progress = ((points.total_points - levels[i-1].points_required) / 
                     (levels[i].points_required - levels[i-1].points_required)) * 100;
          pointsToNextLevel = levels[i].points_required - points.total_points;
        }
        break;
      }
    }

    res.json({
      points: points.total_points,
      currentLevel: currentLevel.loyalty_level,
      nextLevel: nextLevel?.level,
      progress: Math.min(Math.max(progress, 0), 100),
      pointsToNextLevel,
      levels
    });
  } catch (error) {
    console.error('Error fetching loyalty points:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get points history
router.get('/history', async (req, res) => {
  try {
    const history = await db.all(`
      SELECT 
        lp.*,
        CASE 
          WHEN lp.reference_id IS NOT NULL AND lp.transaction_type = 'earned' THEN
            (SELECT name FROM services WHERE id = (SELECT service_id FROM appointments WHERE id = lp.reference_id))
          ELSE NULL
        END as service_name
      FROM loyalty_points lp
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [req.user.id]);

    res.json(history);
  } catch (error) {
    console.error('Error fetching points history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update loyalty level requirements
router.put('/levels', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { levels } = req.body;
    
    // Validate levels
    if (!Array.isArray(levels) || levels.length !== 3) {
      return res.status(400).json({ message: 'Invalid levels data' });
    }

    // Update each level
    for (const level of levels) {
      await db.run(`
        UPDATE loyalty_levels
        SET points_required = ?, description = ?, updated_at = CURRENT_TIMESTAMP
        WHERE level = ?
      `, [level.points_required, level.description, level.level]);
    }

    // Get updated levels
    const updatedLevels = await db.all('SELECT * FROM loyalty_levels ORDER BY points_required ASC');
    res.json(updatedLevels);
  } catch (error) {
    console.error('Error updating loyalty levels:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Complete appointment and award points
router.post('/complete-appointment/:id', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const appointment = await db.get(`
      SELECT 
        a.*,
        s.points_earned,
        u.loyalty_level,
        (SELECT COALESCE(SUM(points), 0) FROM loyalty_points WHERE user_id = a.client_id) as total_points
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      JOIN users u ON a.client_id = u.id
      WHERE a.id = ? AND a.status = 'confirmed'
    `, [req.params.id]);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found or already completed' });
    }

    // Start transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // Mark appointment as completed
      await db.run(`
        UPDATE appointments
        SET status = 'completed', points_awarded = 1
        WHERE id = ?
      `, [req.params.id]);

      // Award points
      await db.run(`
        INSERT INTO loyalty_points (user_id, points, transaction_type, description, reference_id)
        VALUES (?, ?, 'earned', 'Points from completed appointment', ?)
      `, [appointment.client_id, appointment.points_earned, appointment.id]);

      // Check if user should level up
      const levels = await db.all('SELECT * FROM loyalty_levels ORDER BY points_required ASC');
      const newTotalPoints = appointment.total_points + appointment.points_earned;
      
      let newLevel = appointment.loyalty_level;
      for (const level of levels) {
        if (newTotalPoints >= level.points_required) {
          newLevel = level.level;
        }
      }

      // Update user's loyalty level if changed
      if (newLevel !== appointment.loyalty_level) {
        await db.run(`
          UPDATE users
          SET loyalty_level = ?
          WHERE id = ?
        `, [newLevel, appointment.client_id]);

        // Create notification for level up
        await createNotification(
          appointment.client_id,
          'Loyalty Level Up!',
          `Congratulations! You've reached ${newLevel} level!`,
          'loyalty',
          '/profile'
        );
      }

      await db.run('COMMIT');

      res.json({ 
        message: 'Appointment completed and points awarded',
        pointsAwarded: appointment.points_earned,
        newLevel
      });
    } catch (error) {
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;