import { UserProfile } from '../types/user';
import { supabase } from '../config/supabase';
import { logger } from './logging';

export const authService = {
  createDefaultAdmin: async (): Promise<void> => {
    const adminEmail = import.meta.env.VITE_DEFAULT_ADMIN_EMAIL;
    const adminPassword = import.meta.env.VITE_DEFAULT_ADMIN_PASSWORD;
    const adminName = import.meta.env.VITE_DEFAULT_ADMIN_NAME;
    
    if (!adminEmail || !adminPassword || !adminName) {
      logger.warn('Admin credentials not configured, skipping admin creation');
      return;
    }

    try {
      // First check if admin already exists
      const { data: existingAdmin } = await supabase
        .from('users')
        .select('id')
        .eq('email', adminEmail)
        .maybeSingle();

      if (existingAdmin) {
        logger.info('Admin user already exists');
        return;
      }

      // Create admin user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          data: { name: adminName }
        }
      });

      if (signUpError) {
        // If user exists but no profile, create profile
        if (signUpError.message.includes('already registered')) {
          const { data: { user } } = await supabase.auth.signInWithPassword({
            email: adminEmail,
            password: adminPassword
          });

          if (user) {
            await supabase.from('users').upsert({
              id: user.id,
              email: adminEmail,
              name: adminName,
              age: 30,
              weight: 70,
              height: 170,
              sex: 'other',
              fitnessGoals: [],
              experienceLevel: 'beginner',
              unitSystem: 'metric',
              is_admin: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'id'
            });
          }
        } else {
          throw signUpError;
        }
      }

      logger.info('Admin user created/verified successfully');
    } catch (error) {
      logger.warn('Admin initialization skipped:', error);
      // Don't throw - we want the app to continue even if admin creation fails
    }
  }
};
