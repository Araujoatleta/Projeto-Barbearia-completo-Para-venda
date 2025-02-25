import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// Get all products
router.get('/', (req, res) => {
  try {
    const products = db.prepare(`
      SELECT * FROM products
      WHERE is_active = 1
      ORDER BY category, name
    `).all();

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product by ID
router.get('/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product (admin only)
router.post('/', (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, description, price, category, stock_quantity, points_earned, image_url } = req.body;

    const result = db.prepare(`
      INSERT INTO products (name, description, price, category, stock_quantity, points_earned, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, description, price, category, stock_quantity, points_earned, image_url);

    const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product (admin only)
router.put('/:id', (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, description, price, category, stock_quantity, points_earned, image_url, is_active } = req.body;

    db.prepare(`
      UPDATE products
      SET name = ?, description = ?, price = ?, category = ?, 
          stock_quantity = ?, points_earned = ?, image_url = ?, is_active = ?
      WHERE id = ?
    `).run(name, description, price, category, stock_quantity, points_earned, image_url, is_active, req.params.id);

    const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product (admin only)
router.delete('/:id', (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    db.prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;