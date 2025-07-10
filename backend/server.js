// backend/server.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import pool from './config/db.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import healthLogRoutes from './routes/healthLogRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js'; // ✅ Import reminder routes

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/health-logs', healthLogRoutes);
app.use('/api/reminders', reminderRoutes); // ✅ Use reminder routes

// Basic route for testing
app.get('/', (req, res) => {
    res.send('HealthMate API is running...');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
