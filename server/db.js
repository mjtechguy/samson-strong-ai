import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { SCHEMA } from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.VITE_POSTGRES_HOST,
  port: parseInt(process.env.VITE_POSTGRES_PORT),
  user: process.env.VITE_POSTGRES_USER,
  password: process.env.VITE_POSTGRES_PASSWORD,
  database: process.env.VITE_POSTGRES_DB,
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('Initializing database...');
    
    // Test the connection
    await client.query('SELECT NOW()');
    console.log('Database connection successful');

    // Create tables
    for (const [table, schema] of Object.entries(SCHEMA)) {
      await client.query(schema);
      console.log(`Initialized table: ${table}`);
    }

    console.log('Database initialization complete');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
  }
}