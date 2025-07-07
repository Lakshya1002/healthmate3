// backend/config/db.js

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create a connection pool for efficient database connection management.
// A pool prevents the overhead of creating a new connection for every query.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'healthmate',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Asynchronously test the database connection on startup.
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL Database connected successfully.');
    connection.release(); // Return the connection to the pool
  } catch (err) {
    console.error('Error connecting to MySQL database:', err);
    // Exit the process if the database connection fails, as the app cannot run without it.
    process.exit(1); 
  }
};

testConnection();

export default pool;
