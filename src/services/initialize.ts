import { initializeServices } from './core';
import { authService } from './authService';
import { logger } from './logging';
import { useUserStore } from '../store/userStore';
import { supabase } from '../config/supabase';
import { settingsService } from './settings/service';
import { useChatStore } from '../store/chatStore';

let initialized = false;

export const initializeApp = async (): Promise<void> => {
  if (initialized) {
    logger.debug('App already initialized');
    return;
  }

  try {
    logger.info('Initializing application');

    // Initialize core services
    await initializeServices();

    // Load initial settings
    try {
      const [apiKey, model, systemPrompt] = await Promise.all([
        settingsService.getSetting('openai_api_key'),
        settingsService.getSetting('openai_model'),
        settingsService.getSetting('ai_system_prompt')
      ]);

      if (!apiKey) {
        logger.warn('OpenAI API key not configured in database settings');
      }
      if (!model) {
        logger.warn('OpenAI model not configured in database settings');
      }
      if (!systemPrompt) {
        logger.warn('AI system prompt not configured in database settings');
      }
    } catch (error) {
      logger.error('Failed to load initial settings:', error);
    }

    // Set up auth state listener
    supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info('Auth state changed', { event, sessionExists: !!session });
      
      const userStore = useUserStore.getState();
      const chatStore = useChatStore.getState();
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          // Only proceed if we're not already authenticated
          if (!userStore.isAuthenticated) {
            chatStore.unsubscribeFromMessages();
            userStore.setLoading(true);

            // Check if user is admin
            const isAdmin = session.user.email === import.meta.env.VITE_DEFAULT_ADMIN_EMAIL;

            // Update user metadata
            if (isAdmin) {
              await supabase.auth.updateUser({
                data: { is_admin: true }
              });
            }

            // Get user profile
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileError) {
              if (profileError.code === 'PGRST116') {
                // Profile doesn't exist, create it
                const { data: newProfile, error: createError } = await supabase
                  .from('users')
                  .insert({
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User',
                    age: 30,
                    weight: 70,
                    height: 170,
                    sex: 'other',
                    fitnessGoals: [],
                    experienceLevel: 'beginner',
                    unitSystem: 'metric',
                    is_admin: isAdmin,
                    is_profile_complete: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  })
                  .select()
                  .single();

                if (createError) throw createError;
                if (!newProfile) throw new Error('Failed to create user profile');

                useUserStore.setState({
                  user: newProfile,
                  isAuthenticated: true,
                  error: null,
                  isLoading: false
                });
              } else {
                throw profileError;
              }
            } else if (profile) {
              useUserStore.setState({
                user: profile,
                isAuthenticated: true,
                error: null,
                isLoading: false
              });
            }

            chatStore.subscribeToMessages();
          }
        } catch (error) {
          logger.error('Failed to load user profile', error);
          
          await supabase.auth.signOut();
          
          useUserStore.setState({ 
            user: null,
            isAuthenticated: false,
            error: 'Failed to load profile. Please try logging in again.',
            isLoading: false
          });
        }
      } else if (event === 'SIGNED_OUT') {
        if (userStore.isAuthenticated) {
          chatStore.clearMessages();
          chatStore.unsubscribeFromMessages();

          useUserStore.setState({
            user: null,
            isAuthenticated: false,
            error: null,
            isLoading: false
          });
        }
      }
    });

    initialized = true;
    logger.info('Application initialized successfully');
  } catch (error) {
    logger.error('Application initialization failed:', error);
    throw error;
  }
};
