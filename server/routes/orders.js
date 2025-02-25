import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// Get user's orders
router.get('/', (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT o.*, 
             json_group_array(json_object(
               'id', oi.id,
               'product_id', oi.product_id,
               'quantity', oi.quantity,
               'price_at_time', oi.price_at_time,
               'product_name', p.name
             )) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `).all(req.user.id);

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new order
router.post('/', (req, res) => {
  try {
    const { items } = req.body;
    let totalAmount = 0;

    // Calculate total amount and verify stock
    for (const item of items) {
      const product = db.prepare('SELECT price, stock_quantity FROM products WHERE id = ?').get(item.product_id);
      
      if (!product) {
        return res.status(400).json({ message: `Product ${item.product_id} not found` });
      }
      
      if (product.stock_quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product ${item.product_id}` });
      }
      
      totalAmount += product.price * item.quantity;
    }

    // Create order
    const result = db.prepare(`
      INSERT INTO orders (user_id, total_amount, status)
      VALUES (?, ?, 'pending')
    `).run(req.user.id, totalAmount);

    const orderId = result.lastInsertRowid;

    // Add order items and update stock
    for (const item of items) {
      const product = db.prepare('SELECT price FROM products WHERE id = ?').get(item.product_id);
      
      db.prepare(`
        INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
        VALUES (?, ?, ?, ?)
      `).run(orderId, item.product_id, item.quantity, product.price);

      db.prepare(`
        UPDATE products
        SET stock_quantity = stock_quantity - ?
        WHERE id = ?
      `).run(item.quantity, item.product_id);
    }

    const newOrder = db.prepare(`
      SELECT o.*, 
             json_group_array(json_object(
               'id', oi.id,
               'product_id', oi.product_id,
               'quantity', oi.quantity,
               'price_at_time', oi.price_at_time,
               'product_name', p.name
             )) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = ?
      GROUP BY o.id
    `).get(orderId);

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (admin only)
router.put('/:id/status', (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status } = req.body;
    
    db.prepare(`
      UPDATE orders
      SET status = ?
      WHERE id = ?
    `).run(status, req.params.id);

    const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;