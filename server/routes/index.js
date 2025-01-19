import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    res.json({ status: 'healthy' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ 
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Execute query with results
router.post('/query', async (req, res) => {
  const { query, params } = req.body;
  const client = await pool.connect();
  
  try {
    const result = await client.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Query failed:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Execute command without results
router.post('/exec', async (req, res) => {
  const { query, params } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query(query, params);
    res.json({ success: true });
  } catch (error) {
    console.error('Command failed:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

export default router;