import React, { createContext, useContext, useEffect } from 'react';
import { useUserStore } from '../../store/userStore';
import { supabase } from '../../config/supabase';
import { logger } from '../../services/logging';
import { useChatStore } from '../../store/chatStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading, error } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info('Auth state changed', { event, sessionExists: !!session });
      
      const userStore = useUserStore.getState();
      const chatStore = useChatStore.getState();
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          if (!userStore.isAuthenticated) {
            userStore.setLoading(true);
            
            // Check if user has a profile
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            // If no profile, redirect to profile creation
            if (!profile) {
              navigate('/profile');
              return;
            }
            
            chatStore.unsubscribeFromMessages();
            useUserStore.setState({
              user: profile,
              isAuthenticated: true,
              error: null,
              isLoading: false
            });
            
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
          
          navigate('/login');
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

          navigate('/login');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};