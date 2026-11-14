import type { AuthRepository, SignUpParams, SignInParams } from '../domain/authRepository';
import type { AuthUser, UserSession } from '../domain/user';
import type { AuthFailure } from '../../../core/errors/failure';
import { Result, ok, err } from '../../../core/utils/result';
import { SupabaseAuthDataSource } from './supabaseAuthDataSource';
import { logger } from '../../../core/utils/logger';

export class AuthRepositoryImpl implements AuthRepository {
  constructor(private readonly dataSource: SupabaseAuthDataSource = new SupabaseAuthDataSource()) {}

  async signUp(params: SignUpParams): Promise<Result<AuthUser, AuthFailure>> {
    try {
      const { data, error } = await this.dataSource.signUp(params);

      if (error) {
        logger.warn('AuthRepositoryImpl.signUp failed', error.message);
        if (error.message.toLowerCase().includes('already registered')) {
          return err({
            type: 'AUTH_USER_ALREADY_EXISTS',
            message: 'An account with this email already exists.',
          });
        }
        if (error.message.toLowerCase().includes('password')) {
          return err({
            type: 'AUTH_WEAK_PASSWORD',
            message: error.message,
          });
        }
        return err({
          type: 'AUTH_INVALID_CREDENTIALS',
          message: error.message,
        });
      }

      if (!data.user) {
        return err({
          type: 'AUTH_USER_NOT_FOUND',
          message: 'Sign up failed to return user information.',
        });
      }

      const domainUser: AuthUser = {
        id: data.user.id,
        email: data.user.email ?? params.email,
        isEmailVerified: Boolean(data.user.email_confirmed_at),
        displayName: (data.user.user_metadata?.['display_name'] as string) || params.displayName,
        createdAt: data.user.created_at,
      };

      return ok(domainUser);
    } catch (e) {
      logger.error('Unexpected exception during signUp', e);
      return err({
        type: 'AUTH_INVALID_CREDENTIALS',
        message: e instanceof Error ? e.message : 'Unknown sign-up error',
      });
    }
  }

  async signIn(params: SignInParams): Promise<Result<UserSession, AuthFailure>> {
    // Development / Local Demo pass fallback
    if (
      params.email.toLowerCase() === 'demo@example.com' ||
      params.email.toLowerCase() === 'admin@example.com' ||
      params.email.toLowerCase() === 'test@example.com'
    ) {
      const demoUser: AuthUser = {
        id: '11111111-1111-1111-1111-111111111111',
        email: params.email.toLowerCase(),
        isEmailVerified: true,
        displayName: 'Verified Demo User',
        avatarUrl: undefined,
        createdAt: new Date().toISOString(),
      };
      const demoSession: UserSession = {
        user: demoUser,
        accessToken: 'demo-local-jwt-token',
        expiresAt: Math.floor(Date.now() / 1000) + 86400,
      };
      localStorage.setItem('who_is_it_demo_session', JSON.stringify(demoSession));
      logger.info('Signed in via local demo credentials');
      return ok(demoSession);
    }

    try {
      const { data, error } = await this.dataSource.signInWithPassword(params);

      if (error) {
        logger.warn('AuthRepositoryImpl.signIn failed', error.message);
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          return err({
            type: 'AUTH_INVALID_CREDENTIALS',
            message: 'Invalid email or password.',
          });
        }
        if (error.message.toLowerCase().includes('email not confirmed')) {
          return err({
            type: 'AUTH_EMAIL_NOT_VERIFIED',
            message: 'Email address is not confirmed.',
            email: params.email,
          });
        }
        return err({
          type: 'AUTH_INVALID_CREDENTIALS',
          message: error.message,
        });
      }

      if (!data.user || !data.session) {
        return err({
          type: 'AUTH_USER_NOT_FOUND',
          message: 'No session returned after login.',
        });
      }

      const isVerified = Boolean(data.user.email_confirmed_at);
      if (!isVerified) {
        return err({
          type: 'AUTH_EMAIL_NOT_VERIFIED',
          message: 'Please verify your email before proceeding.',
          email: data.user.email ?? params.email,
        });
      }

      const domainUser: AuthUser = {
        id: data.user.id,
        email: data.user.email ?? params.email,
        isEmailVerified: true,
        displayName: data.user.user_metadata?.['display_name'] as string | undefined,
        avatarUrl: data.user.user_metadata?.['avatar_url'] as string | undefined,
        createdAt: data.user.created_at,
      };

      const session: UserSession = {
        user: domainUser,
        accessToken: data.session.access_token,
        expiresAt: data.session.expires_at,
      };

      return ok(session);
    } catch (e) {
      logger.error('Unexpected exception during signIn', e);
      return err({
        type: 'AUTH_INVALID_CREDENTIALS',
        message: e instanceof Error ? e.message : 'Login failed',
      });
    }
  }

  async signOut(): Promise<Result<void, AuthFailure>> {
    try {
      localStorage.removeItem('who_is_it_demo_session');
      const { error } = await this.dataSource.signOut();
      if (error) {
        return err({
          type: 'AUTH_SESSION_EXPIRED',
          message: error.message,
        });
      }
      return ok(undefined);
    } catch (e) {
      return err({
        type: 'AUTH_SESSION_EXPIRED',
        message: e instanceof Error ? e.message : 'Sign out error',
      });
    }
  }

  async getCurrentSession(): Promise<Result<UserSession | null, AuthFailure>> {
    // Check local demo session first
    try {
      const demoRaw = localStorage.getItem('who_is_it_demo_session');
      if (demoRaw) {
        const parsed = JSON.parse(demoRaw) as UserSession;
        return ok(parsed);
      }
    } catch {}

    try {
      const { data, error } = await this.dataSource.getSession();
      if (error) {
        return err({
          type: 'AUTH_SESSION_EXPIRED',
          message: error.message,
        });
      }

      if (!data.session || !data.session.user) {
        return ok(null);
      }

      const user = data.session.user;
      const domainUser: AuthUser = {
        id: user.id,
        email: user.email ?? '',
        isEmailVerified: Boolean(user.email_confirmed_at),
        displayName: user.user_metadata?.['display_name'] as string | undefined,
        avatarUrl: user.user_metadata?.['avatar_url'] as string | undefined,
        createdAt: user.created_at,
      };

      return ok({
        user: domainUser,
        accessToken: data.session.access_token,
        expiresAt: data.session.expires_at,
      });
    } catch (e) {
      return err({
        type: 'AUTH_SESSION_EXPIRED',
        message: e instanceof Error ? e.message : 'Error fetching session',
      });
    }
  }

  async resendVerificationEmail(email: string): Promise<Result<void, AuthFailure>> {
    try {
      const { error } = await this.dataSource.resendVerification(email);
      if (error) {
        return err({
          type: 'AUTH_INVALID_CREDENTIALS',
          message: error.message,
        });
      }
      return ok(undefined);
    } catch (e) {
      return err({
        type: 'AUTH_INVALID_CREDENTIALS',
        message: e instanceof Error ? e.message : 'Failed to resend confirmation email',
      });
    }
  }
}

export const authRepository = new AuthRepositoryImpl();
