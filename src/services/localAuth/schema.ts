import { Database } from 'better-sqlite3';

export const initLocalDB = (db: Database) => {
  // Create local admins table
  db.exec(`
    CREATE TABLE IF NOT EXISTS local_admins (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
};