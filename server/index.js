import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from './database/db.js';
import authRoutes from './routes/auth.js';
import appointmentRoutes from './routes/appointments.js';
import servicesRoutes from './routes/services.js';
import chatRoutes from './routes/chat.js';
import loyaltyRoutes from './routes/loyalty.js';
import feedbackRoutes from './routes/feedback.js';
import notificationRoutes from './routes/notifications.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import barberRoutes from './routes/barbers.js';
import promotionRoutes from './routes/promotions.js';
import rewardRoutes from './routes/rewards.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.use(cors());
app.use(express.json());

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// Make bcrypt available to routes
app.locals.bcrypt = bcrypt;

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', authenticateToken, appointmentRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/chat', authenticateToken, chatRoutes);
app.use('/api/loyalty', authenticateToken, loyaltyRoutes);
app.use('/api/feedback', authenticateToken, feedbackRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);
app.use('/api/products', authenticateToken, productRoutes);
app.use('/api/orders', authenticateToken, orderRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/rewards', authenticateToken, rewardRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('send-message', async (data) => {
    try {
      const message = {
        sender_id: socket.user?.id,
        receiver_id: data.receiverId,
        message: data.message,
        created_at: new Date()
      };

      io.to(`user-${data.receiverId}`).emit('receive-message', {
        ...message,
        sender: socket.user
      });

      io.to(`user-${data.receiverId}`).emit('notification', {
        type: 'chat',
        title: 'New Message',
        message: `You have a new message from ${socket.user?.name}`
      });
    } catch (error) {
      console.error('Message error:', error);
    }
  });

  socket.on('appointment-update', (data) => {
    io.to(`user-${data.clientId}`).emit('appointment-status', data);
  });

  socket.on('send-notification', (data) => {
    io.to(`user-${data.userId}`).emit('notification', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  httpServer.close(() => {
    console.log('Server shutdown complete');
    process.exit(0);
  });
});