// backend/server.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import pool from './config/db.js'; // .js extension is often needed with type: "module"

// Import routes
import authRoutes from './routes/authRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Body parser for JSON format
app.use(express.urlencoded({ extended: false })); // Body parser for URL-encoded data

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);

// Basic route for testing
app.get('/', (req, res) => {
    res.send('HealthMate API is running...');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
