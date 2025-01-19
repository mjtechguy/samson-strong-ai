import { create } from 'zustand';
import { UserProfile } from '../types/user';
import { supabase } from '../config/supabase';
import { toast } from 'react-hot-toast';
import { logger } from '../services/logging';

interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<{ needsProfile: boolean }>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateProfile: (userData: Partial<UserProfile>) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  register: async (email: string, password: string, name: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if user is admin
      const isAdmin = email === import.meta.env.VITE_DEFAULT_ADMIN_EMAIL;

      // Sign up with Supabase auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            name,
            is_admin: isAdmin
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!authData?.user) throw new Error('No user returned from sign up');

      // Create initial profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          name: name,
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
        });

      if (profileError) throw profileError;
      
      toast.success('Registration successful! Please log in.');
      set({ isLoading: false, error: null });
    } catch (error) {
      let message = 'Registration failed';
      
      if (error instanceof Error) {
        if (error.message.includes('already registered')) {
          message = 'User already exists with this email';
        } else {
          message = error.message;
        }
      }

      logger.error('Registration failed:', error);
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      // Sign in with Supabase auth
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;
      if (!authData?.user) throw new Error('Login failed - no user returned');

      // Check if user is admin
      const isAdmin = email === import.meta.env.VITE_DEFAULT_ADMIN_EMAIL;

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select()
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email: authData.user.email,
              name: authData.user.user_metadata.name || authData.user.email?.split('@')[0] || 'User',
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

          set({
            user: newProfile,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });

          toast.success('Login successful');
          return { needsProfile: true };
        } else {
          throw profileError;
        }
      }

      set({
        user: profile,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      toast.success('Login successful');
      return { needsProfile: !profile.is_profile_complete };
    } catch (error) {
      let message = 'Login failed';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid login credentials')) {
          message = 'Invalid email or password';
        } else {
          message = error.message;
        }
      }

      logger.error('Login failed:', error);
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await supabase.auth.signOut();
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null 
      });
      toast.success('Logged out successfully');
    } catch (error) {
      logger.error('Logout failed:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  updateProfile: async (userData: Partial<UserProfile>) => {
    try {
      const { user } = get();
      if (!user?.id) throw new Error('No user found');

      set({ isLoading: true });

      const { error } = await supabase
        .from('users')
        .update({
          ...userData,
          is_profile_complete: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      set(state => ({
        user: state.user ? { ...state.user, ...userData, is_profile_complete: true } : null,
        isLoading: false
      }));

      toast.success('Profile updated successfully');
    } catch (error) {
      logger.error('Profile update failed:', error);
      set({ isLoading: false });
      throw error;
    }
  }
}));