import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Camera, KeyRound, Sparkles, UserPlus, Shield, User } from 'lucide-react';
import { useAuthStore } from './useAuthStore';
import { faceTemplateRepository } from '../../faceEnrollment/data/faceTemplateRepository';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Card } from '../../../shared/components/Card';
import { Alert } from '../../../shared/components/Alert';

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, isLoading, error, clearError, pendingVerificationEmail } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isAutoCreating, setIsAutoCreating] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError();
  };

  const handlePostLoginRedirect = async () => {
    const { user } = useAuthStore.getState();
    if (user) {
      const enrolled = await faceTemplateRepository.isUserEnrolled(user.id);
      if (!enrolled) {
        navigate('/enroll', { replace: true });
        return;
      }
    }
    navigate(from === '/' ? '/identify' : from, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await signIn({
      email: formData.email,
      password: formData.password,
    });

    if (success) {
      await handlePostLoginRedirect();
    } else if (pendingVerificationEmail) {
      navigate('/verify-email');
    }
  };

  const handleQuickSignIn = async (email: string) => {
    setFormData({
      email,
      password: 'DemoPassword123!',
    });
    const success = await signIn({
      email,
      password: 'DemoPassword123!',
    });
    if (success) {
      await handlePostLoginRedirect();
    }
  };

  const handleAutoCreateAndSignIn = async () => {
    if (!formData.email || !formData.password) return;
    setIsAutoCreating(true);
    clearError();

    const ok = await signUp({
      displayName: formData.email.split('@')[0] || 'User',
      email: formData.email,
      password: formData.password,
    });

    setIsAutoCreating(false);
    if (ok) {
      navigate('/enroll', { replace: true });
    }
  };

  const isUserNotFound = error?.toLowerCase().includes('no account') || error?.toLowerCase().includes('not found');

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

        {/* 1-Click Quick Test Personas */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/80 border border-indigo-100 shadow-subtle space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>1-Click Test Personas</span>
            </p>
            <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-100/60 px-2 py-0.5 rounded-full">
              Zero Setup
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickSignIn('demo@example.com')}
              disabled={isLoading}
              className="flex flex-col items-center p-2 rounded-xl border border-slate-200/80 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-subtle transition-all text-center group"
            >
              <User className="w-4 h-4 text-indigo-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800">Demo User</span>
              <span className="text-[10px] text-slate-400">Enrolled</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSignIn('newuser@example.com')}
              disabled={isLoading}
              className="flex flex-col items-center p-2 rounded-xl border border-emerald-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-subtle transition-all text-center group"
            >
              <Camera className="w-4 h-4 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800">New User</span>
              <span className="text-[10px] text-emerald-600 font-medium">Test 5 Snaps</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSignIn('admin@example.com')}
              disabled={isLoading}
              className="flex flex-col items-center p-2 rounded-xl border border-slate-200/80 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-subtle transition-all text-center group"
            >
              <Shield className="w-4 h-4 text-slate-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800">Admin</span>
              <span className="text-[10px] text-slate-400">Full Access</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="space-y-2">
            <Alert type="error" message={error} onDismiss={clearError} />
            {isUserNotFound && formData.email && (
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between gap-2">
                <span className="text-xs text-indigo-900 font-medium">
                  Create this account right now?
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={handleAutoCreateAndSignIn}
                  isLoading={isAutoCreating}
                  className="text-xs px-3 py-1.5"
                  leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                >
                  Create &amp; Sign In
                </Button>
              </div>
            )}
          </div>
        )}

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

        {/* Alternative Unlock Options */}
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
