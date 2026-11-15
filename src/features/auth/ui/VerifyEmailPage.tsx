import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MailCheck, RefreshCw, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuthStore } from './useAuthStore';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { Alert } from '../../../shared/components/Alert';

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const { pendingVerificationEmail, resendVerification, signIn, error, clearError } = useAuthStore();
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleResend = async () => {
    if (!pendingVerificationEmail) return;
    setResending(true);
    setResendStatus(null);
    clearError();

    const ok = await resendVerification(pendingVerificationEmail);
    setResending(false);
    if (ok) {
      setResendStatus('A fresh confirmation link has been sent to your inbox.');
    }
  };

  const handleBypassToEnroll = async () => {
    // Allows developers to immediately test face enrollment without waiting for email confirmation
    const emailToUse = pendingVerificationEmail || 'demo@example.com';
    await signIn({ email: emailToUse, password: 'DemoPassword123!' });
    navigate('/enroll', { replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-md text-center space-y-6 bg-white border border-slate-200 shadow-card">
        <div className="inline-flex p-4 rounded-3xl bg-indigo-50 text-indigo-600 border border-indigo-100">
          <MailCheck className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Verify Your Email
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            A confirmation link was sent to your email. Click the link in your inbox to verify your account and activate biometric security.
          </p>
          {pendingVerificationEmail && (
            <div className="inline-block px-3.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-mono text-indigo-700 font-bold mt-2">
              {pendingVerificationEmail}
            </div>
          )}
        </div>

        {error && <Alert type="error" message={error} onDismiss={clearError} />}
        {resendStatus && <Alert type="success" message={resendStatus} />}

        <div className="space-y-3 pt-2">
          {pendingVerificationEmail && (
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleResend}
              isLoading={resending}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Resend Verification Link
            </Button>
          )}

          {/* Development Bypass to Face Registration */}
          <Button
            variant="primary"
            className="w-full"
            onClick={handleBypassToEnroll}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Continue Directly to Face Registration
          </Button>

          <Link to="/signin" className="block">
            <Button
              variant="ghost"
              className="w-full text-slate-500 hover:text-slate-900"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Sign In
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
