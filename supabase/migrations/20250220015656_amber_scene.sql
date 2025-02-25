-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('client', 'barber', 'admin')) DEFAULT 'client',
  loyalty_level TEXT CHECK(loyalty_level IN ('bronze', 'silver', 'gold')) DEFAULT 'bronze',
  phone TEXT,
  profile_image TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Barbers table
CREATE TABLE IF NOT EXISTS barbers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  bio TEXT,
  specialties TEXT,
  years_experience INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  is_available BOOLEAN DEFAULT 1,
  schedule_start TIME DEFAULT '09:00',
  schedule_end TIME DEFAULT '18:00',
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT CHECK(category IN ('haircut', 'beard', 'combo', 'special')) DEFAULT 'haircut',
  points_earned INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  barber_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  appointment_date DATETIME NOT NULL,
  status TEXT CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')) DEFAULT 'pending',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id),
  FOREIGN KEY (barber_id) REFERENCES barbers(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Loyalty points table
CREATE TABLE IF NOT EXISTS loyalty_points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  points INTEGER NOT NULL,
  transaction_type TEXT CHECK(transaction_type IN ('earned', 'spent', 'expired', 'bonus')) NOT NULL,
  description TEXT,
  reference_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT 0,
  is_bot_message BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);

-- Insert sample services
INSERT OR IGNORE INTO services (name, description, duration, price, category, points_earned) VALUES
('Executive Cut', 'Premium haircut with hot towel service', 45, 45.00, 'haircut', 45),
('Luxury Shave', 'Traditional straight razor shave', 30, 35.00, 'beard', 35),
('Beard Sculpting', 'Professional beard trimming and styling', 30, 30.00, 'beard', 30),
('VIP Package', 'Haircut, shave, and facial treatment', 90, 89.00, 'combo', 100);