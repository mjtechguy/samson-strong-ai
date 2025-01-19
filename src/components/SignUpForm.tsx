import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { toast } from 'react-hot-toast';

export const SignUpForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [error, setError] = useState<string | null>(null);
  const { register, isLoading } = useUserStore(state => ({
    register: state.register,
    isLoading: state.isLoading
  }));

  const appTitle = import.meta.env.VITE_APP_TITLE || 'Fitness AI';
  const logoUrl = import.meta.env.VITE_APP_LOGO_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.email.trim() || !formData.password.trim()) {
      toast.error('Please enter both email and password');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      toast.error("Passwords don't match");
      return;
    }

    if (!formData.name.trim()) {
      setError("Name is required");
      toast.error("Name is required");
      return;
    }
    
    try {
      // Validate inputs
      if (!formData.email.trim() || !formData.password.trim()) {
        toast.error('Please enter both email and password');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords don't match");
        toast.error("Passwords don't match");
        return;
      }

      if (!formData.name.trim()) {
        setError("Name is required");
        toast.error("Name is required");
        return;
      }

      await register(formData.email.trim(), formData.password, formData.name.trim());
      
      // On successful registration, redirect to login
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      setError(message);
      toast.error(message);
      
      // If user already exists, offer to redirect to login
      if (message.includes('already exists')) {
        const shouldLogin = window.confirm('Would you like to log in instead?');
        if (shouldLogin) {
          navigate('/login');
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={appTitle}
              className="h-12 w-auto mb-4"
            />
          ) : (
            <h1 className="text-3xl font-bold text-indigo-600 mb-4">
              {appTitle}
            </h1>
          )}
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          {error && (
            <p className="mt-2 text-center text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};