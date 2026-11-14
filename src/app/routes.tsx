import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '../features/home/HomePage';
import { SignInPage } from '../features/auth/ui/SignInPage';
import { SignUpPage } from '../features/auth/ui/SignUpPage';
import { VerifyEmailPage } from '../features/auth/ui/VerifyEmailPage';
import { AuthGuard } from '../features/auth/ui/AuthGuard';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* Protected routes */}
      <Route
        path="/objects"
        element={
          <AuthGuard>
            <div className="max-w-4xl mx-auto p-4 text-center py-16">
              <h2 className="text-2xl font-bold mb-2">Object Detection</h2>
              <p className="text-slate-400">Phase 3 module: Web Worker vision pipeline loading...</p>
            </div>
          </AuthGuard>
        }
      />

      <Route
        path="/unlock"
        element={
          <div className="max-w-md mx-auto p-4 text-center py-16">
            <h2 className="text-2xl font-bold mb-2">Face Unlock</h2>
            <p className="text-slate-400">Phase 4 module: On-device liveness &amp; matching...</p>
          </div>
        }
      />

      <Route
        path="/identify"
        element={
          <AuthGuard>
            <div className="max-w-4xl mx-auto p-4 text-center py-16">
              <h2 className="text-2xl font-bold mb-2">Identify Person</h2>
              <p className="text-slate-400">Phase 7 module: Server-side matching pipeline...</p>
            </div>
          </AuthGuard>
        }
      />

      <Route
        path="/privacy"
        element={
          <AuthGuard>
            <div className="max-w-4xl mx-auto p-4 text-center py-16">
              <h2 className="text-2xl font-bold mb-2">Privacy Center</h2>
              <p className="text-slate-400">Phase 5 module: Visibility and data deletion...</p>
            </div>
          </AuthGuard>
        }
      />

      <Route
        path="/consent"
        element={
          <AuthGuard requireEmailVerification={false}>
            <div className="max-w-4xl mx-auto p-4 text-center py-16">
              <h2 className="text-2xl font-bold mb-2">Biometric Consent</h2>
              <p className="text-slate-400">Phase 2 module: Versioned consent flow...</p>
            </div>
          </AuthGuard>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
