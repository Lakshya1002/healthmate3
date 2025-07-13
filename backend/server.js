// backend/server.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import webpush from 'web-push';

import pool from './config/db.js';
import { startScheduler } from './utils/scheduler.js'; // ✅ Import the scheduler

// Import routes
import authRoutes from './routes/authRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import healthLogRoutes from './routes/healthLogRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Load environment variables
dotenv.config();

// Configure web-push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:your-email@example.com', // Replace with your email
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
    console.log('VAPID keys configured for web-push.');
} else {
    console.warn('VAPID keys not configured. Push notifications will be disabled.');
}


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
    // ✅ Start the reminder scheduler when the server starts
    startScheduler();
});