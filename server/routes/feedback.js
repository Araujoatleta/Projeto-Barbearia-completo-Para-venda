import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// Get all feedback for a barber
router.get('/barber/:barberId', (req, res) => {
  try {
    const feedback = db.prepare(`
      SELECT f.*, 
             a.appointment_date,
             s.name as service_name,
             CASE WHEN f.is_anonymous THEN 'Anonymous' ELSE u.name END as client_name
      FROM feedback f
      JOIN appointments a ON f.appointment_id = a.id
      JOIN services s ON a.service_id = s.id
      JOIN users u ON a.client_id = u.id
      WHERE a.barber_id = ?
      ORDER BY f.created_at DESC
    `).all(req.params.barberId);

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit feedback for an appointment
router.post('/', (req, res) => {
  try {
    const { appointment_id, rating, comment, is_anonymous } = req.body;

    // Verify appointment belongs to user
    const appointment = db.prepare(`
      SELECT * FROM appointments 
      WHERE id = ? AND client_id = ? AND status = 'completed'
    `).get(appointment_id, req.user.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found or not completed' });
    }

    // Check if feedback already exists
    const existingFeedback = db.prepare('SELECT * FROM feedback WHERE appointment_id = ?')
      .get(appointment_id);

    if (existingFeedback) {
      return res.status(400).json({ message: 'Feedback already submitted for this appointment' });
    }

    const result = db.prepare(`
      INSERT INTO feedback (appointment_id, rating, comment, is_anonymous)
      VALUES (?, ?, ?, ?)
    `).run(appointment_id, rating, comment, is_anonymous);

    // Update barber rating
    db.prepare(`
      UPDATE barbers
      SET rating = (
        SELECT AVG(f.rating)
        FROM feedback f
        JOIN appointments a ON f.appointment_id = a.id
        WHERE a.barber_id = ?
      )
      WHERE id = ?
    `).run(appointment.barber_id, appointment.barber_id);

    const newFeedback = db.prepare('SELECT * FROM feedback WHERE id = ?')
      .get(result.lastInsertRowid);

    res.status(201).json(newFeedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update feedback
router.put('/:id', (req, res) => {
  try {
    const { rating, comment, is_anonymous } = req.body;

    // Verify feedback belongs to user
    const feedback = db.prepare(`
      SELECT f.* FROM feedback f
      JOIN appointments a ON f.appointment_id = a.id
      WHERE f.id = ? AND a.client_id = ?
    `).get(req.params.id, req.user.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    db.prepare(`
      UPDATE feedback
      SET rating = ?, comment = ?, is_anonymous = ?
      WHERE id = ?
    `).run(rating, comment, is_anonymous, req.params.id);

    const updatedFeedback = db.prepare('SELECT * FROM feedback WHERE id = ?')
      .get(req.params.id);

    res.json(updatedFeedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete feedback
router.delete('/:id', (req, res) => {
  try {
    // Verify feedback belongs to user
    const feedback = db.prepare(`
      SELECT f.* FROM feedback f
      JOIN appointments a ON f.appointment_id = a.id
      WHERE f.id = ? AND a.client_id = ?
    `).get(req.params.id, req.user.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    db.prepare('DELETE FROM feedback WHERE id = ?').run(req.params.id);

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;