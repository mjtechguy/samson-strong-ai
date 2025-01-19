import { supabase } from '../config/supabase';
import { logger } from './logging';

export const initializeServices = async (): Promise<void> => {
  try {
    logger.info('Initializing services');

    // Get current session with retries
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        break;
      } catch (error) {
        const isLastAttempt = attempt === MAX_RETRIES - 1;
        if (isLastAttempt) throw error;

        logger.warn(`Session fetch attempt ${attempt + 1} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)));
      }
    }

    // Set up auth state change listener
    supabase.auth.onAuthStateChange((event, session) => {
      logger.debug('Auth state changed', { event });
      
      if (event === 'SIGNED_OUT') {
        // Clear any cached data
        logger.debug('User signed out, clearing cache');
      }
    });

    logger.info('Services initialized successfully');
  } catch (error) {
    logger.error('Services initialization failed:', error);
    throw new Error('Failed to initialize services. Please check your connection and try again.');
  }
};