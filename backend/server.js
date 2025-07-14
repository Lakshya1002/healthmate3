// backend/server.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import webpush from 'web-push';

import pool from './config/db.js';
import { startScheduler } from './utils/scheduler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import healthLogRoutes from './routes/healthLogRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Load environment variables
dotenv.config();

// ✅ FIXED: Add a strict check for VAPID keys on startup.
// The server will now refuse to start if the keys are missing from your .env file,
// preventing it from running in a broken state.
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.error(
        'FATAL ERROR: VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY are not defined in your .env file. ' +
        'Please generate them using `npx web-push generate-vapid-keys` and add them to your .env file.'
    );
    process.exit(1); // Exit the process with an error code
}

// Configure web-push with the now-guaranteed keys
webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL || 'admin@example.com'}`, // Use an email from .env or a default
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);
console.log('VAPID keys configured successfully for web-push.');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/health-logs', healthLogRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/notifications', notificationRoutes);

// Basic route for testing
app.get('/', (req, res) => {
    res.send('HealthMate API is running...');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Start the reminder scheduler when the server starts
    startScheduler();
});
