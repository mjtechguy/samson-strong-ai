import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { toast } from 'react-hot-toast';
import { settingsService } from '../services/settings/service';
import { logger } from '../services/logging';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [appTitle, setAppTitle] = useState('Fitness AI');
  const [logoUrl, setLogoUrl] = useState('');
  const { login, isLoading, error: loginError } = useUserStore();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      logger.debug('Loading app settings');
      
      const [title, logo] = await Promise.all([
        settingsService.getSetting('app_title'),
        settingsService.getSetting('app_logo_url')
      ]);

      // Only update if we got actual values
      if (title?.trim()) setAppTitle(title);
      if (logo) setLogoUrl(logo);
      
      logger.debug('App settings loaded', { title, hasLogo: !!logo });
    } catch (error) {
      logger.error('Failed to load app settings:', error);
      // Keep default values if settings fail to load
      logger.debug('Using default app settings');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors
    useUserStore.setState({ error: null });

    try {
      if (!email.trim() || !password.trim()) {
        toast.error('Please enter both email and password');
        return;
      }

      await login(email.trim(), password);
      navigate('/chat');
    } catch (error: any) {
      // Error is already handled in the store and displayed via loginError
      return;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={appTitle || 'App Logo'}
              className="h-16 w-auto mb-4 object-contain"
              onError={(e) => {
                logger.warn('Failed to load logo:', e);
                setLogoUrl(''); // Fall back to text title
              }}
            />
          ) : (
            <h1 className="text-3xl font-bold text-indigo-600 mb-4">
              {appTitle}
            </h1>
          )}
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          {loginError && (
            <p className="mt-2 text-center text-sm text-red-600">
              {loginError}
            </p>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign up
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};