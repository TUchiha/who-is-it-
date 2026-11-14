/**
 * Pure domain user model. Zero framework or backend dependencies.
 */

export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly isEmailVerified: boolean;
  readonly displayName?: string;
  readonly avatarUrl?: string;
  readonly createdAt: string;
}

export interface UserSession {
  readonly user: AuthUser;
  readonly accessToken: string;
  readonly expiresAt?: number;
}
