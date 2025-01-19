#!/usr/bin/env node
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { SCHEMA } from '../server/schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const { Pool } = pg;

const pool = new Pool({
  host: process.env.VITE_POSTGRES_HOST,
  port: parseInt(process.env.VITE_POSTGRES_PORT),
  user: process.env.VITE_POSTGRES_USER,
  password: process.env.VITE_POSTGRES_PASSWORD,
  database: process.env.VITE_POSTGRES_DB,
  ssl: false
});

async function resetDatabase() {
  const client = await pool.connect();
  try {
    console.log('Connected to database');
    console.log('Resetting database...');

    await client.query('BEGIN');

    // Drop all tables
    await client.query(`
      DROP TABLE IF EXISTS user_programs CASCADE;
      DROP TABLE IF EXISTS programs CASCADE;
      DROP TABLE IF EXISTS messages CASCADE;
      DROP TABLE IF EXISTS fitness_goals CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // Create tables
    for (const [table, schema] of Object.entries(SCHEMA)) {
      await client.query(schema);
      console.log(`Created table: ${table}`);
    }

    await client.query('COMMIT');
    console.log('Database reset successfully');
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error resetting database:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

resetDatabase();