import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Camera, KeyRound, Sparkles } from 'lucide-react';
import { useAuthStore } from './useAuthStore';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Card } from '../../../shared/components/Card';
import { Alert } from '../../../shared/components/Alert';

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isLoading, error, clearError, pendingVerificationEmail } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await signIn({
      email: formData.email,
      password: formData.password,
    });

    if (success) {
      navigate(from, { replace: true });
    } else if (pendingVerificationEmail) {
      navigate('/verify-email');
    }
  };

  const handleDemoSignIn = async () => {
    setFormData({
      email: 'demo@example.com',
      password: 'DemoPassword123!',
    });
    const success = await signIn({
      email: 'demo@example.com',
      password: 'DemoPassword123!',
    });
    if (success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-md space-y-6 bg-white border border-slate-200/90 shadow-card">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 rounded-2xl bg-indigo-50 text-indigo-600 mb-1 border border-indigo-100 shadow-subtle">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Welcome Back
          </h1>
          <p className="text-sm text-slate-500">
            Sign in to access real-time identification and privacy controls
          </p>
        </div>

        {/* 1-Click Quick Demo Sign In / Instant Pass Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 flex items-center justify-between gap-3 shadow-subtle">
          <div className="text-left">
            <p className="text-xs font-bold text-indigo-900 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Developer / Instant Pass</span>
            </p>
            <p className="text-[11px] text-slate-500 font-mono">demo@example.com</p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleDemoSignIn}
            isLoading={isLoading}
            className="text-xs px-3.5 py-1.5 shadow-sm"
          >
            Instant Pass
          </Button>
        </div>

        {error && <Alert type="error" message={error} onDismiss={clearError} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="ada@example.com"
            value={formData.email}
            onChange={handleChange}
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            autoComplete="email"
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            autoComplete="current-password"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Sign In with Password
          </Button>
        </form>

        {/* Fallback & Convenience unlock chain options */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Alternative Unlock Options
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <Link to="/unlock" className="w-full">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full justify-center"
                leftIcon={<Camera className="w-4 h-4 text-indigo-600" />}
              >
                Face Unlock
              </Button>
            </Link>
            <Link to="/passkey-login" className="w-full">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full justify-center"
                leftIcon={<KeyRound className="w-4 h-4 text-amber-500" />}
              >
                Passkey
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 hover:underline font-bold">
            Create an Account
          </Link>
        </p>
      </Card>
    </div>
  );
};
