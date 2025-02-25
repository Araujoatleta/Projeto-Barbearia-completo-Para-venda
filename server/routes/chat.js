import express from 'express';
import db from '../database/db.js';
import { createNotification } from './notifications.js';

const router = express.Router();

// Get all clients with unread message count (for admin)
router.get('/clients', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const clients = await db.all(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.profile_image,
        (
          SELECT COUNT(*)
          FROM chat_messages m
          WHERE m.sender_id = u.id
          AND m.receiver_id = ?
          AND m.is_read = 0
        ) as unread_count,
        (
          SELECT created_at
          FROM chat_messages
          WHERE (sender_id = u.id OR receiver_id = u.id)
          ORDER BY created_at DESC
          LIMIT 1
        ) as last_message_at
      FROM users u
      WHERE u.role = 'client'
      AND EXISTS (
        SELECT 1 
        FROM chat_messages m 
        WHERE m.sender_id = u.id 
        OR m.receiver_id = u.id
      )
      ORDER BY last_message_at DESC
    `, [req.user.id]);

    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chat messages with specific user
router.get('/messages/:userId', async (req, res) => {
  try {
    const messages = await db.all(`
      SELECT 
        m.*,
        u.name as sender_name,
        u.profile_image as sender_image,
        u.role as sender_role
      FROM chat_messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?)
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `, [req.user.id, req.params.userId, req.params.userId, req.user.id]);

    // Mark messages as read
    if (messages.length > 0) {
      await db.run(`
        UPDATE chat_messages
        SET is_read = 1
        WHERE sender_id = ? AND receiver_id = ? AND is_read = 0
      `, [req.params.userId, req.user.id]);
    }

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/send', async (req, res) => {
  try {
    const { receiver_id, message } = req.body;

    // Validate receiver exists
    const receiver = await db.get('SELECT id, name FROM users WHERE id = ?', [receiver_id]);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const result = await db.run(`
      INSERT INTO chat_messages (sender_id, receiver_id, message, is_read, created_at)
      VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP)
    `, [req.user.id, receiver_id, message]);

    const newMessage = await db.get(`
      SELECT 
        m.*,
        u.name as sender_name,
        u.profile_image as sender_image,
        u.role as sender_role
      FROM chat_messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `, [result.lastID]);

    // Create notification for receiver
    await createNotification(
      receiver_id,
      'New Message',
      `You have a new message from ${req.user.name}`,
      'chat',
      `/chat/${req.user.id}`
    );

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread message count
router.get('/unread', async (req, res) => {
  try {
    const result = await db.get(`
      SELECT COUNT(*) as count
      FROM chat_messages
      WHERE receiver_id = ? AND is_read = 0
    `, [req.user.id]);

    res.json({ count: result.count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;