import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false }
});

export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hotels (
      id SERIAL PRIMARY KEY,
      image TEXT,
      title VARCHAR(140) NOT NULL,
      description TEXT NOT NULL,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
