import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck, RefreshCw, ArrowLeft } from 'lucide-react';
import { useAuthStore } from './useAuthStore';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { Alert } from '../../../shared/components/Alert';

export const VerifyEmailPage: React.FC = () => {
  const { pendingVerificationEmail, resendVerification, error, clearError } = useAuthStore();
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

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center space-y-6">
        <div className="inline-flex p-4 rounded-3xl bg-cyan-500/10 text-cyan-400">
          <MailCheck className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Verify Your Email
          </h1>
          <p className="text-sm text-slate-300">
            To protect user identity and comply with biometric security regulations, an active, verified email is mandatory before using facial recognition or enrollment.
          </p>
          {pendingVerificationEmail && (
            <div className="inline-block px-3 py-1 bg-slate-800 rounded-full text-xs font-mono text-cyan-300 mt-2">
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

          <Link to="/signin" className="block">
            <Button
              variant="outline"
              className="w-full"
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
