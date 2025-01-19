import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { email, password, name, age, weight, height, sex, experienceLevel, unitSystem, fitnessGoals } = req.body;
    
    // Check if user exists
    const existingUser = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await client.query(
      `INSERT INTO users (id, email, password, name, age, weight, height, sex, experience_level, unit_system)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        Math.random().toString(36).substr(2, 9),
        email,
        hashedPassword,
        name,
        age,
        weight,
        height,
        sex,
        experienceLevel,
        unitSystem
      ]
    );

    // Add fitness goals
    for (const goal of fitnessGoals) {
      await client.query(
        'INSERT INTO fitness_goals (user_id, goal) VALUES ($1, $2)',
        [result.rows[0].id, goal]
      );
    }

    await client.query('COMMIT');

    const { password: _, ...userWithoutPassword } = result.rows[0];
    res.status(201).json({
      ...userWithoutPassword,
      fitnessGoals
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('User creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

export default router;