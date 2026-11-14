import type { Result } from '../../../core/utils/result';
import type { AuthFailure } from '../../../core/errors/failure';
import type { AuthUser, UserSession } from './user';

export interface SignUpParams {
  readonly email: string;
  readonly password: string;
  readonly displayName: string;
}

export interface SignInParams {
  readonly email: string;
  readonly password: string;
}

export interface AuthRepository {
  signUp(params: SignUpParams): Promise<Result<AuthUser, AuthFailure>>;
  signIn(params: SignInParams): Promise<Result<UserSession, AuthFailure>>;
  signOut(): Promise<Result<void, AuthFailure>>;
  getCurrentSession(): Promise<Result<UserSession | null, AuthFailure>>;
  resendVerificationEmail(email: string): Promise<Result<void, AuthFailure>>;
}
