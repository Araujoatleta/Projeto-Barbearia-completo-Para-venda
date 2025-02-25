import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await db.all('SELECT * FROM services WHERE is_active = 1');
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await db.get('SELECT * FROM services WHERE id = ?', [req.params.id]);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create service (admin only)
router.post('/', async (req, res) => {
  try {
    const { name, description, duration, price, category, points_earned, image_url } = req.body;

    const result = await db.run(`
      INSERT INTO services (name, description, duration, price, category, points_earned, image_url, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `, [name, description, duration, price, category, points_earned, image_url]);

    const newService = await db.get('SELECT * FROM services WHERE id = ?', [result.lastID]);
    res.status(201).json(newService);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update service (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { name, description, duration, price, category, points_earned, image_url, is_active } = req.body;

    await db.run(`
      UPDATE services
      SET name = ?, description = ?, duration = ?, price = ?, 
          category = ?, points_earned = ?, image_url = ?, is_active = ?
      WHERE id = ?
    `, [name, description, duration, price, category, points_earned, image_url, is_active, req.params.id]);

    const updatedService = await db.get('SELECT * FROM services WHERE id = ?', [req.params.id]);
    res.json(updatedService);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete service (admin only)
router.delete('/:id', async (req, res) => {
  try {
    await db.run('UPDATE services SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;