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

-- Other tables remain the same as in the current schema
-- The complete schema is in the migrations files