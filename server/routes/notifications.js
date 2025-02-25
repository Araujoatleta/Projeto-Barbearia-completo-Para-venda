import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// Get user's notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await db.all(`
      SELECT *
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [req.user.id]);

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    await db.run(`
      UPDATE notifications
      SET is_read = 1
      WHERE id = ? AND user_id = ?
    `, [req.params.id, req.user.id]);

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create notification (internal use)
export async function createNotification(userId, title, message, type, actionUrl = null) {
  try {
    await db.run(`
      INSERT INTO notifications (user_id, title, message, type, action_url)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, title, message, type, actionUrl]);
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

export { router as default };
