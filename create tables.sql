-- This script is corrected to support multiple users, matching the backend code.

-- Drop the old database to ensure a clean start
DROP DATABASE IF EXISTS healthmate;

-- Create a new, clean database
CREATE DATABASE healthmate;

-- Select the new database to use
USE healthmate;

-- 🔐 STEP 1: Create the `users` table for authentication
-- This is the new, essential table for storing user accounts.
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 💊 STEP 2: Create the `medicines` table with a link to the user
CREATE TABLE medicines (
  medicine_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT, -- This column links the medicine to a user
  name VARCHAR(100) NOT NULL,
  dosage VARCHAR(50),
  method ENUM('pill', 'syrup', 'tablet', 'injection') DEFAULT 'pill',
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- Enforces the link
);

-- ❤️ STEP 3: Create the `health_logs` table with a link to the user
CREATE TABLE health_logs (
  log_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT, -- This column links the log to a user
  log_date DATE,
  blood_pressure VARCHAR(20),
  heart_rate INT,
  temperature DECIMAL(4,1),
  weight DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- Enforces the link
);

-- 📝 STEP 4: Create the `schedules` table for future reminders
CREATE TABLE schedules (
  schedule_id INT PRIMARY KEY AUTO_INCREMENT,
  medicine_id INT,
  intake_time TIME,
  frequency ENUM('daily', 'alternate', 'custom') DEFAULT 'daily',
  day_of_week VARCHAR(50), -- e.g., "Mon,Wed,Fri"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE CASCADE
);

-- 🗒️ STEP 5: Create the `notes` table for general notes (future feature)
CREATE TABLE notes (
  note_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT, -- This column links the note to a user
  note_date DATE,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- Enforces the link
);

