import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { logger } from '../services/logging';

const configSchema = z.object({
  url: z.string().url(),
  anonKey: z.string().min(1),
});

const config = {
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

try {
  configSchema.parse(config);
} catch (error) {
  logger.error('Invalid Supabase configuration:', error);
  throw new Error('Database configuration is invalid. Please check your environment variables.');
}

export const supabase = createClient(config.url, config.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  }
});
