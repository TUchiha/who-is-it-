import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '../features/home/HomePage';
import { SignInPage } from '../features/auth/ui/SignInPage';
import { SignUpPage } from '../features/auth/ui/SignUpPage';
import { VerifyEmailPage } from '../features/auth/ui/VerifyEmailPage';
import { AuthGuard } from '../features/auth/ui/AuthGuard';
import { EnrollmentPage } from '../features/faceEnrollment/ui/EnrollmentPage';
import { IdentifyPersonPage } from '../features/identifyPerson/ui/IdentifyPersonPage';
import { FirstLoginGuard } from '../features/faceEnrollment/ui/FirstLoginGuard';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* Mandatory 1st-Login Face Enrollment Route */}
      <Route
        path="/enroll"
        element={
          <AuthGuard>
            <EnrollmentPage />
          </AuthGuard>
        }
      />

      {/* Live Camera Identify Person Route */}
      <Route
        path="/identify"
        element={
          <AuthGuard>
            <FirstLoginGuard>
              <IdentifyPersonPage />
            </FirstLoginGuard>
          </AuthGuard>
        }
      />

      {/* Other protected routes protected by FirstLoginGuard */}
      <Route
        path="/objects"
        element={
          <AuthGuard>
            <FirstLoginGuard>
              <div className="max-w-4xl mx-auto p-4 text-center py-16">
                <h2 className="text-2xl font-bold mb-2">Object Detection</h2>
                <p className="text-slate-400">On-device vision pipeline loading...</p>
              </div>
            </FirstLoginGuard>
          </AuthGuard>
        }
      />

      <Route
        path="/unlock"
        element={
          <div className="max-w-md mx-auto p-4 text-center py-16">
            <h2 className="text-2xl font-bold mb-2">Face Unlock</h2>
            <p className="text-slate-400">On-device liveness &amp; matching...</p>
          </div>
        }
      />

      <Route
        path="/privacy"
        element={
          <AuthGuard>
            <FirstLoginGuard>
              <div className="max-w-4xl mx-auto p-4 text-center py-16">
                <h2 className="text-2xl font-bold mb-2">Privacy Center</h2>
                <p className="text-slate-400">Visibility and data deletion controls...</p>
              </div>
            </FirstLoginGuard>
          </AuthGuard>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
