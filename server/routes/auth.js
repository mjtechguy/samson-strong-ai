import express from 'express';
import { supabase } from '../../src/config/supabase.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { user } = data;
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    const { data: goals, error: goalsError } = await supabase
      .from('fitness_goals')
      .select('goal')
      .eq('user_id', user.id);

    if (goalsError) {
      return res.status(500).json({ error: 'Failed to fetch user goals' });
    }

    res.json({
      ...profile,
      fitnessGoals: goals.map(row => row.goal)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
