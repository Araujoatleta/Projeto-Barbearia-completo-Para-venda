import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'barbershop.db');

let db;

// Initialize database
async function initializeDatabase() {
  try {
    // Ensure the database directory exists
    await fs.mkdir(path.dirname(dbPath), { recursive: true });

    // Remove any existing lock file
    try {
      await fs.unlink(`${dbPath}.lock`);
    } catch (err) {
      // Ignore error if lock file doesn't exist
    }

    // Open database with proper configuration
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
      mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE
    });

    // Enable foreign keys and WAL mode
    await db.run('PRAGMA foreign_keys = ON');
    await db.run('PRAGMA journal_mode = WAL');
    await db.run('PRAGMA busy_timeout = 5000');

    // Create tables if they don't exist
    await db.exec(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT CHECK(role IN ('client', 'barber', 'admin', 'inactive')) DEFAULT 'client',
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
        points_awarded BOOLEAN DEFAULT 0,
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

      -- Loyalty levels configuration table
      CREATE TABLE IF NOT EXISTS loyalty_levels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT UNIQUE CHECK(level IN ('bronze', 'silver', 'gold')) NOT NULL,
        points_required INTEGER NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Chat messages table
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT 0,
        is_bot_message BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (receiver_id) REFERENCES users(id)
      );

      -- Notifications table
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT CHECK(type IN ('chat', 'appointment', 'system', 'loyalty')) NOT NULL,
        is_read BOOLEAN DEFAULT 0,
        action_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      -- Promotions table
      CREATE TABLE IF NOT EXISTS promotions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        discount_type TEXT CHECK(discount_type IN ('percentage', 'fixed')) NOT NULL,
        discount_value DECIMAL(10,2) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        min_loyalty_level TEXT CHECK(min_loyalty_level IN ('bronze', 'silver', 'gold')),
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert default loyalty levels if they don't exist
    await db.run(`
      INSERT OR IGNORE INTO loyalty_levels (level, points_required, description) VALUES
      ('bronze', 0, 'Entry level membership'),
      ('silver', 1000, 'Intermediate level membership with special perks'),
      ('gold', 2500, 'Premium level membership with exclusive benefits')
    `);

    // Check if admin user exists
    const adminExists = await db.get('SELECT * FROM users WHERE email = ?', ['admin@luxurycuts.com']);
    
    if (!adminExists) {
      // Insert default admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.run(`
        INSERT INTO users (name, email, password_hash, role)
        VALUES (?, ?, ?, ?)
      `, ['Admin User', 'admin@luxurycuts.com', hashedPassword, 'admin']);

      // Insert test client user
      const clientPassword = await bcrypt.hash('client123', 10);
      await db.run(`
        INSERT INTO users (name, email, password_hash, role)
        VALUES (?, ?, ?, ?)
      `, ['Test Client', 'client@test.com', clientPassword, 'client']);

      // Insert sample services
      await db.run(`
        INSERT INTO services (name, description, duration, price, category, points_earned) VALUES
        ('Executive Cut', 'Premium haircut with hot towel service', 45, 45.00, 'haircut', 45),
        ('Luxury Shave', 'Traditional straight razor shave', 30, 35.00, 'beard', 35),
        ('Beard Sculpting', 'Professional beard trimming and styling', 30, 30.00, 'beard', 30),
        ('VIP Package', 'Haircut, shave, and facial treatment', 90, 89.00, 'combo', 100)
      `);

      console.log('Default data created');
    }

    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Initialize database connection
try {
  db = await initializeDatabase();
  console.log('Database connected successfully');
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

// Handle cleanup on process termination
process.on('SIGINT', async () => {
  try {
    if (db) {
      await db.close();
      console.log('Database connection closed');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error closing database:', error);
    process.exit(1);
  }
});

// Handle other termination signals
process.on('SIGTERM', async () => {
  try {
    if (db) {
      await db.close();
      console.log('Database connection closed');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error closing database:', error);
    process.exit(1);
  }
});

export default db;