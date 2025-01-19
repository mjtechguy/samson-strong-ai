import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { logger } from '../../services/logging';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user, isLoading } = useUserStore();
  const location = useLocation();

  // Show nothing while checking auth status
  if (isLoading) {
    return null;
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    logger.debug('Unauthorized access attempt', {
      path: location.pathname,
      isAuthenticated,
      hasUser: !!user,
      requireAdmin
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin requirement
  if (requireAdmin && !user.isAdmin) {
    logger.warn('Non-admin attempted to access admin route', {
      userId: user.id,
      path: location.pathname
    });
    return <Navigate to="/chat" replace />;
  }

  return <>{children}</>;
};