import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../database/db.js';

const router = express.Router();

// Get all barbers
router.get('/', async (req, res) => {
  try {
    const barbers = await db.all(`
      SELECT 
        b.*,
        u.name,
        u.email,
        u.profile_image,
        u.phone
      FROM barbers b
      JOIN users u ON b.user_id = u.id
      WHERE u.role = 'barber'
    `);

    res.json(barbers);
  } catch (error) {
    console.error('Error fetching barbers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create barber (admin only)
router.post('/', async (req, res) => {
  const { name, email, password, bio, specialties, years_experience, phone } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    // Check if email exists
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const userResult = await db.run(`
      INSERT INTO users (name, email, password_hash, role, phone)
      VALUES (?, ?, ?, 'barber', ?)
    `, [name, email, hashedPassword, phone || null]);

    // Create barber profile
    const barberResult = await db.run(`
      INSERT INTO barbers (user_id, bio, specialties, years_experience, is_available)
      VALUES (?, ?, ?, ?, 1)
    `, [userResult.lastID, bio || null, specialties || null, years_experience || 0]);

    // Get the created barber
    const newBarber = await db.get(`
      SELECT 
        b.*,
        u.name,
        u.email,
        u.profile_image,
        u.phone
      FROM barbers b
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?
    `, [barberResult.lastID]);

    res.status(201).json(newBarber);
  } catch (error) {
    console.error('Error creating barber:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update barber
router.put('/:id', async (req, res) => {
  const { bio, specialties, years_experience, is_available, name, phone } = req.body;

  try {
    // Get barber to update
    const barber = await db.get('SELECT user_id FROM barbers WHERE id = ?', [req.params.id]);
    if (!barber) {
      return res.status(404).json({ message: 'Barber not found' });
    }

    // Update barber profile
    await db.run(`
      UPDATE barbers
      SET bio = ?, specialties = ?, years_experience = ?, is_available = ?
      WHERE id = ?
    `, [bio || null, specialties || null, years_experience || 0, is_available, req.params.id]);

    // Update user info
    await db.run(`
      UPDATE users
      SET name = ?, phone = ?
      WHERE id = ?
    `, [name, phone || null, barber.user_id]);

    // Get updated barber
    const updatedBarber = await db.get(`
      SELECT 
        b.*,
        u.name,
        u.email,
        u.profile_image,
        u.phone
      FROM barbers b
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?
    `, [req.params.id]);

    res.json(updatedBarber);
  } catch (error) {
    console.error('Error updating barber:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete barber
router.delete('/:id', async (req, res) => {
  try {
    const barber = await db.get('SELECT user_id FROM barbers WHERE id = ?', [req.params.id]);
    if (!barber) {
      return res.status(404).json({ message: 'Barber not found' });
    }

    // Soft delete - deactivate barber and update user role
    await db.run('UPDATE barbers SET is_available = 0 WHERE id = ?', [req.params.id]);
    await db.run('UPDATE users SET role = "inactive" WHERE id = ?', [barber.user_id]);

    res.json({ message: 'Barber deleted successfully' });
  } catch (error) {
    console.error('Error deleting barber:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;