// Import required packages
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Import routes
const medicineRoutes = require("./routes/medicineRoutes");
const authRoutes = require("./routes/authRoutes"); // ✅ NEW: Auth routes

// Initialize express app
const app = express();

// Middleware to parse JSON and allow frontend connection
app.use(cors());             // allows requests from frontend (React)
app.use(express.json());     // parses JSON data in request bodies

// Routes middleware
app.use("/api/auth", authRoutes);           // ✅ NEW: Register/login
app.use("/api/medicines", medicineRoutes);  // Medicines (will protect this soon)

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
