-- ✅ STEP 1: Drop the old database if it exists to prevent conflicts
DROP DATABASE IF EXISTS healthmate;

-- ✅ STEP 2: Create a new, clean database
CREATE DATABASE healthmate;

-- ✅ STEP 3: Select the new database to use for subsequent commands
USE healthmate;

-- ✅ STEP 4: Create the `users` table for authentication
-- This was the missing table causing the error.
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ✅ STEP 5: Create the `medicines` table with all required columns
-- This version is updated to match the backend controller's expectations.
CREATE TABLE medicines (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  dosage VARCHAR(50),
  frequency VARCHAR(100), -- This was missing
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ✅ STEP 6: Create the `health_logs` table for health tracking
-- This version adds the necessary user_id to link logs to a user.
CREATE TABLE health_logs (
  log_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  log_date DATE NOT NULL,
  blood_pressure VARCHAR(20),
  heart_rate INT,
  temperature DECIMAL(4,1),
  weight DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ✅ STEP 7: Create the `schedules` table for future reminder features
CREATE TABLE schedules (
  schedule_id INT PRIMARY KEY AUTO_INCREMENT,
  medicine_id INT,
  intake_time TIME,
  frequency ENUM('daily', 'alternate', 'custom') DEFAULT 'daily',
  day_of_week VARCHAR(50), -- e.g., "Mon,Wed,Fri"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
);

-- ✅ STEP 8: Create the `notes` table for general user notes
CREATE TABLE notes (
  note_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  note_date DATE,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE reminders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    medicine_id INT NOT NULL,
    reminder_time TIME NOT NULL,
    status ENUM('scheduled', 'taken', 'skipped') NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
);

-- ✅ NEW: STEP 5: Create the `push_subscriptions` table
CREATE TABLE push_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    endpoint TEXT NOT NULL,
    p256dh VARCHAR(255) NOT NULL,
    auth VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (user_id, endpoint(255)), -- Use a prefix for the TEXT key
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- This command creates a new table to store a permanent log of every
-- dose that is marked as 'taken' or 'skipped'.
CREATE TABLE dose_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  medicine_id INT NOT NULL,
  reminder_id INT NOT NULL,
  status ENUM('taken', 'skipped') NOT NULL,
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
  FOREIGN KEY (reminder_id) REFERENCES reminders(id) ON DELETE CASCADE
);


select * from users;
select * from health_logs;
select * from medicines;
select * from  notes;
select * from schedules;
select * from reminders;
select * from push_subscriptions;
ALTER TABLE medicines
ADD COLUMN quantity INT,
ADD COLUMN refill_threshold INT;



-- Create a new table to store a list of common medicine names
CREATE TABLE common_medicines (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE
);

INSERT INTO common_medicines (name) VALUES
('Paracetamol'), ('Ibuprofen'), ('Aspirin'), ('Amoxicillin'), ('Azithromycin'),
('Metformin'), ('Atorvastatin'), ('Omeprazole'), ('Losartan'), ('Amlodipine'),
('Lisinopril'), ('Simvastatin'), ('Metoprolol'), ('Levothyroxine'), ('Gabapentin'),
('Hydrochlorothiazide'), ('Sertraline'), ('Furosemide'), ('Acetaminophen'), ('Citalopram'),
('Escitalopram'), ('Trazodone'), ('Prednisone'), ('Tramadol'), ('Clonazepam'),
('Alprazolam'), ('Warfarin'), ('Cyclobenzaprine'), ('Zolpidem'), ('Tamsulosin'),
('Carvedilol'), ('Potassium Chloride'), ('Allopurinol'), ('Meloxicam'), ('Rosuvastatin'),
('Montelukast'), ('Ranitidine'), ('Venlafaxine'), ('Duloxetine'), ('Fluoxetine'),
('Bupropion'), ('Cetirizine'), ('Loratadine'), ('Diphenhydramine'),
('Famotidine'), ('Esomeprazole'), ('Lansoprazole'), ('Pantoprazole'), ('Diclofenac'),
('Naproxen'), ('Celecoxib'), ('Codeine'), ('Oxycodone'), ('Hydrocodone'),
('Morphine'), ('Fentanyl'), ('Diazepam'), ('Lorazepam'), ('Clonidine'),
('Amitriptyline'), ('Nortriptyline'), ('Insulin Glargine'), ('Insulin Lispro'), ('Glipizide'),
('Glyburide'), ('Pioglitazone'), ('Sitagliptin'), ('Januvia'), ('Victoza'),
('Trulicity'), ('Ozempic'), ('Spironolactone'), ('Finasteride'), ('Doxycycline'),
('Ciprofloxacin'), ('Levofloxacin'), ('Clindamycin'), ('Metronidazole'), ('Sulfamethoxazole'),
('Trimethoprim'), ('Valacyclovir'), ('Acyclovir'), ('Oseltamivir'), ('Tamiflu'),
('Albuterol'), ('Fluticasone'), ('Salmeterol'), ('Budesonide'), ('Formoterol'),
('Tiotropium'), ('Ipratropium'), ('Singulair'), ('Advair'), ('Symbicort'),
('Spiriva'), ('ProAir'), ('Ventolin'), ('Flovent'), ('Qvar');




ALTER TABLE users
ADD COLUMN password_reset_token VARCHAR(255) NULL,
ADD COLUMN password_reset_expires DATETIME NULL;

-- Make the password column nullable to allow for Google Sign-In users
ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL;


-- Add new columns to the reminders table for advanced scheduling

ALTER TABLE reminders
ADD COLUMN frequency VARCHAR(50) NOT NULL DEFAULT 'daily',
ADD COLUMN week_days VARCHAR(255) NULL,
ADD COLUMN day_interval INT NULL;


ALTER TABLE users
ADD COLUMN timezone VARCHAR(255) NULL;
