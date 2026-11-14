import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { useAuthStore } from './useAuthStore';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Card } from '../../../shared/components/Card';
import { Alert } from '../../../shared/components/Alert';

const signUpSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name too long'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[a-z]/, 'Must include a lowercase letter')
    .regex(/[0-9]/, 'Must include a number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const validationResult = signUpSchema.safeParse(formData);
    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    const success = await signUp({
      displayName: formData.displayName,
      email: formData.email,
      password: formData.password,
    });

    if (success) {
      navigate('/verify-email');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 mb-1">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Create Your Account
          </h1>
          <p className="text-sm text-slate-400">
            Set up credentials for secure on-device & server biometric matching
          </p>
        </div>

        {error && <Alert type="error" message={error} onDismiss={clearError} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name / Display Name"
            name="displayName"
            type="text"
            placeholder="Ada Lovelace"
            value={formData.displayName}
            onChange={handleChange}
            error={fieldErrors['displayName']}
            leftIcon={<User className="w-4 h-4" />}
            autoComplete="name"
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="ada@example.com"
            value={formData.email}
            onChange={handleChange}
            error={fieldErrors['email']}
            leftIcon={<Mail className="w-4 h-4" />}
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
            error={fieldErrors['password']}
            helperText="At least 8 characters with upper, lower, & number"
            leftIcon={<Lock className="w-4 h-4" />}
            autoComplete="new-password"
            required
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={fieldErrors['confirmPassword']}
            leftIcon={<Lock className="w-4 h-4" />}
            autoComplete="new-password"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Create Account
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/signin" className="text-cyan-400 hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
};
