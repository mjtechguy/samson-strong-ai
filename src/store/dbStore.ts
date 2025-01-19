import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { logger } from '../services/logging';

interface DBState {
  isConnected: boolean;
  error: string | null;
  checkConnection: () => Promise<void>;
}

export const useDBStore = create<DBState>((set) => ({
  isConnected: true,
  error: null,
  checkConnection: async () => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Check if Supabase is connected by making a simple query
        const { error } = await supabase
          .from('users')
          .select('id')
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        
        set({ isConnected: true, error: null });
        logger.debug('Database connection check successful');
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.warn(`Database connection attempt ${attempt} failed:`, error);

        if (attempt === MAX_RETRIES) {
          set({ 
            isConnected: false, 
            error: `Unable to connect to database. Please check your internet connection and try again.`
          });
          return;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      }
    }
  }
}));