import React, { useEffect, useState } from 'react';
import { useDBStore } from '../../store/dbStore';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface DBErrorBoundaryProps {
  children: React.ReactNode;
}

export const DBErrorBoundary: React.FC<DBErrorBoundaryProps> = ({ children }) => {
  const { error, checkConnection } = useDBStore();
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const CHECK_INTERVAL = 30000; // 30 seconds
    const interval = setInterval(checkConnection, CHECK_INTERVAL);
    checkConnection();
    return () => clearInterval(interval);
  }, [checkConnection]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await checkConnection();
    } finally {
      setIsRetrying(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-red-100">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Connection Issue
            </h2>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            >
              {isRetrying ? (
                <>
                  <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Retrying...
                </>
              ) : (
                'Try Again'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};