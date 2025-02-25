/*
  # Fix Loyalty System

  1. New Tables
    - `loyalty_levels` table for configurable loyalty tiers
      - `level` (text, primary key)
      - `points_required` (integer)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Changes
    - Add points_awarded column to appointments table
    - Add loyalty_level column to users table
*/

-- Create loyalty levels table
CREATE TABLE IF NOT EXISTS loyalty_levels (
  level TEXT PRIMARY KEY CHECK(level IN ('bronze', 'silver', 'gold')),
  points_required INTEGER NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add points_awarded column to appointments
ALTER TABLE appointments ADD COLUMN points_awarded BOOLEAN DEFAULT 0;

-- Insert default loyalty levels
INSERT OR IGNORE INTO loyalty_levels (level, points_required, description) VALUES
('bronze', 0, 'Entry level membership'),
('silver', 1000, 'Intermediate level membership with special perks'),
('gold', 2500, 'Premium level membership with exclusive benefits');