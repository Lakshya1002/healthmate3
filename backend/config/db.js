// backend/config/db.js

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    console.error(
        'FATAL ERROR: Database environment variables are not defined.'
    );
    process.exit(1);
}

// Create a connection pool for efficient database connection management.
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
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