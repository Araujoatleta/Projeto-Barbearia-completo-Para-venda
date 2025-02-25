/*
  # Barbershop Management System Database Schema

  1. Tables
    - users: Store user information and authentication
    - appointments: Store appointment bookings
    - services: Available barbershop services
    - loyalty_points: Track user points and rewards
    - chat_messages: Store chat history
    - feedback: Store user feedback and ratings
    - notifications: Store user notifications
    - barbers: Store barber information
    
  2. Security
    - Passwords are hashed using bcrypt
    - JWT for authentication
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK(role IN ('client', 'barber', 'admin')) DEFAULT 'client',
  loyalty_level TEXT CHECK(loyalty_level IN ('bronze', 'silver', 'gold')) DEFAULT 'bronze',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Barbers table
CREATE TABLE IF NOT EXISTS barbers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  specialties TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- in minutes
  price DECIMAL(10,2) NOT NULL,
  points_earned INTEGER DEFAULT 0
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  barber_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  appointment_date DATETIME NOT NULL,
  status TEXT CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id),
  FOREIGN KEY (barber_id) REFERENCES barbers(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Loyalty points table
CREATE TABLE IF NOT EXISTS loyalty_points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  points INTEGER DEFAULT 0,
  transaction_type TEXT CHECK(transaction_type IN ('earned', 'spent')) NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER,
  message TEXT NOT NULL,
  is_bot_message BOOLEAN DEFAULT false,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  appointment_id INTEGER NOT NULL,
  rating INTEGER CHECK(rating BETWEEN 1 AND 5) NOT NULL,
  comment TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK(type IN ('appointment', 'points', 'promotion', 'system')) NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);