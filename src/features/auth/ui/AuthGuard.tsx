import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './useAuthStore';
import { Loader } from '../../../shared/components/Loader';

export interface AuthGuardProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireEmailVerification = true,
}) => {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <Loader fullScreen label="Checking authentication..." />;
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (requireEmailVerification && !user.isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
};
