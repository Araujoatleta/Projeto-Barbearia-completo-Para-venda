import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = '7d'; // Set token expiry to 7 days

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'client', phone } = req.body;
    
    // Validate role
    if (!['client', 'admin', 'barber'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Check if user exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await db.run(`
      INSERT INTO users (name, email, password_hash, role, phone, loyalty_level)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, email, hashedPassword, role, phone, role === 'client' ? 'bronze' : null]);

    // If user is a barber, create barber profile
    if (role === 'barber') {
      await db.run(`
        INSERT INTO barbers (user_id, is_available)
        VALUES (?, 1)
      `, [result.lastID]);
    }

    const user = await db.get(`
      SELECT id, name, email, role, loyalty_level, phone, profile_image
      FROM users WHERE id = ?
    `, [result.lastID]);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.status(201).json({ token, user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user exists
    const user = await db.get(`
      SELECT id, name, email, password_hash, role, loyalty_level, phone, profile_image
      FROM users WHERE email = ?
    `, [email]);

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    // Remove password_hash from response
    const { password_hash, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.get(`
      SELECT id, name, email, role, loyalty_level, phone, profile_image
      FROM users WHERE id = ?
    `, [decoded.id]);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { name, phone, profile_image } = req.body;
    const userId = req.user.id;

    await db.run(`
      UPDATE users
      SET name = ?, phone = ?, profile_image = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, phone, profile_image, userId]);

    const updatedUser = await db.get(`
      SELECT id, name, email, role, loyalty_level, phone, profile_image
      FROM users WHERE id = ?
    `, [userId]);

    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

export default router;