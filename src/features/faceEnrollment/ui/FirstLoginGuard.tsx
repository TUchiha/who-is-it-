import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../auth/ui/useAuthStore';
import { faceTemplateRepository } from '../data/faceTemplateRepository';
import { Loader } from '../../../shared/components/Loader';

export const FirstLoginGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuthStore();
  const location = useLocation();

  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkEnrollment = async () => {
      if (!user) {
        setIsCheckingEnrollment(false);
        return;
      }

      const enrolled = await faceTemplateRepository.isUserEnrolled(user.id);
      if (mounted) {
        setIsEnrolled(enrolled);
        setIsCheckingEnrollment(false);
      }
    };

    if (!authLoading && user) {
      checkEnrollment();
    } else if (!authLoading && !user) {
      setIsCheckingEnrollment(false);
    }

    return () => {
      mounted = false;
    };
  }, [user, authLoading, location.pathname]);

  if (authLoading || isCheckingEnrollment) {
    return <Loader fullScreen label="Checking biometric enrollment status..." />;
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // If user is NOT enrolled and is trying to access anything other than /enroll, force enrollment
  if (!isEnrolled && location.pathname !== '/enroll') {
    return <Navigate to="/enroll" replace />;
  }

  return <>{children}</>;
};
