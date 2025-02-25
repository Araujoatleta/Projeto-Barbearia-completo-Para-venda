import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// Get all appointments
router.get('/', async (req, res) => {
  try {
    let query = `
      SELECT 
        a.*,
        s.name as service_name,
        s.price as service_price,
        u.name as client_name,
        b.name as barber_name
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      JOIN users u ON a.client_id = u.id
      JOIN barbers br ON a.barber_id = br.id
      JOIN users b ON br.user_id = b.id
    `;

    // If user is not admin, only show their appointments
    if (req.user.role !== 'admin') {
      query += ' WHERE a.client_id = ?';
    }

    query += ' ORDER BY a.appointment_date DESC';

    const appointments = await db.all(
      query,
      req.user.role !== 'admin' ? [req.user.id] : []
    );

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new appointment
router.post('/', async (req, res) => {
  try {
    const { service_id, barber_id, appointment_date } = req.body;

    const result = await db.run(`
      INSERT INTO appointments (client_id, service_id, barber_id, appointment_date, status)
      VALUES (?, ?, ?, ?, 'confirmed')
    `, [req.user.id, service_id, barber_id, appointment_date]);

    res.status(201).json({ id: result.lastID });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel appointment
router.post('/:id/cancel', async (req, res) => {
  try {
    const result = await db.run(`
      UPDATE appointments
      SET status = 'cancelled'
      WHERE id = ? AND client_id = ?
    `, [req.params.id, req.user.id]);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

