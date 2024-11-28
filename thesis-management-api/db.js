const { Pool } = require("pg");
require("dotenv").config();

// Initialize the PostgreSQL pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  options: "-c search_path='thesis-management,public'",
});

// Reusable query function
const dbQuery = async (query, params) => {
  try {
    const result = await pool.query(query, params);
    return result;
  } catch (err) {
    console.error("Database query error:", err);
    throw err; // Re-throw the error for higher-level handling
  }
};

// Export both the pool and the query function
module.exports = { pool, dbQuery };
