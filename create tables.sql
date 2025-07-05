-- ✅ STEP 1: Drop the old database if it exists to prevent conflicts
DROP DATABASE IF EXISTS healthmate;

-- ✅ STEP 2: Create a new, clean database
CREATE DATABASE healthmate;

-- ✅ STEP 3: Select the new database to use for subsequent commands
USE healthmate;

-- ✅ STEP 4: Create the `medicines` table with all required columns
-- This is the main table for storing medicine information.
CREATE TABLE medicines (
  medicine_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  dosage VARCHAR(50),
  method ENUM('pill', 'syrup', 'tablet', 'injection') DEFAULT 'pill',
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ✅ STEP 5: Create the `schedules` table for future reminder features
CREATE TABLE schedules (
  schedule_id INT PRIMARY KEY AUTO_INCREMENT,
  medicine_id INT,
  intake_time TIME,
  frequency ENUM('daily', 'alternate', 'custom') DEFAULT 'daily',
  day_of_week VARCHAR(50), -- e.g., "Mon,Wed,Fri"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE CASCADE
);

-- ✅ STEP 6: Create the `health_logs` table for future health tracking
CREATE TABLE health_logs (
  log_id INT PRIMARY KEY AUTO_INCREMENT,
  log_date DATE UNIQUE,
  blood_pressure VARCHAR(20),
  heart_rate INT,
  temperature DECIMAL(4,1),
  weight DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ✅ STEP 7: Create the `notes` table for general user notes
CREATE TABLE notes (
  note_id INT PRIMARY KEY AUTO_INCREMENT,
  note_date DATE UNIQUE,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
