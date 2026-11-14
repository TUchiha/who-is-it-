import { create } from 'zustand';
import type { AuthUser, UserSession } from '../domain/user';
import type { SignInParams, SignUpParams } from '../domain/authRepository';
import { authRepository } from '../data/authRepositoryImpl';
import { SignInUseCase } from '../domain/signInUseCase';
import { SignUpUseCase } from '../domain/signUpUseCase';
import { SignOutUseCase } from '../domain/signOutUseCase';
import { GetSessionUseCase } from '../domain/getSessionUseCase';
import { mapFailureToUserMessage } from '../../../core/errors/errorMapper';
import { logger } from '../../../core/utils/logger';

interface AuthState {
  user: AuthUser | null;
  session: UserSession | null;
  isLoading: boolean;
  error: string | null;
  pendingVerificationEmail: string | null;

  // Actions
  initialize: () => Promise<void>;
  signIn: (params: SignInParams) => Promise<boolean>;
  signUp: (params: SignUpParams) => Promise<boolean>;
  signOut: () => Promise<void>;
  resendVerification: (email: string) => Promise<boolean>;
  clearError: () => void;
  setPendingVerificationEmail: (email: string | null) => void;
}

const signInUseCase = new SignInUseCase(authRepository);
const signUpUseCase = new SignUpUseCase(authRepository);
const signOutUseCase = new SignOutUseCase(authRepository);
const getSessionUseCase = new GetSessionUseCase(authRepository);

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,
  pendingVerificationEmail: null,

  initialize: async () => {
    set({ isLoading: true, error: null });
    const result = await getSessionUseCase.execute();
    if (result.success && result.value) {
      set({
        user: result.value.user,
        session: result.value,
        isLoading: false,
      });
      logger.info('Auth session restored successfully');
    } else {
      set({
        user: null,
        session: null,
        isLoading: false,
      });
    }
  },

  signIn: async (params: SignInParams) => {
    set({ isLoading: true, error: null });
    const result = await signInUseCase.execute(params);

    if (result.success) {
      set({
        user: result.value.user,
        session: result.value,
        isLoading: false,
        pendingVerificationEmail: null,
      });
      return true;
    } else {
      const message = mapFailureToUserMessage(result.error);
      const pendingEmail =
        result.error.type === 'AUTH_EMAIL_NOT_VERIFIED' ? result.error.email : null;
      set({
        error: message,
        isLoading: false,
        pendingVerificationEmail: pendingEmail,
      });
      return false;
    }
  },

  signUp: async (params: SignUpParams) => {
    set({ isLoading: true, error: null });
    const result = await signUpUseCase.execute(params);

    if (result.success) {
      set({
        isLoading: false,
        pendingVerificationEmail: params.email,
        error: null,
      });
      return true;
    } else {
      set({
        error: mapFailureToUserMessage(result.error),
        isLoading: false,
      });
      return false;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    await signOutUseCase.execute();
    set({
      user: null,
      session: null,
      isLoading: false,
      error: null,
    });
  },

  resendVerification: async (email: string) => {
    const result = await authRepository.resendVerificationEmail(email);
    if (!result.success) {
      set({ error: mapFailureToUserMessage(result.error) });
      return false;
    }
    return true;
  },

  clearError: () => set({ error: null }),
  setPendingVerificationEmail: (email) => set({ pendingVerificationEmail: email }),
}));
