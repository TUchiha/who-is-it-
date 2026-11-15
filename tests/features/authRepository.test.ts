import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthRepositoryImpl } from '../../src/features/auth/data/authRepositoryImpl';

describe('AuthRepositoryImpl', () => {
  let repo: AuthRepositoryImpl;
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, val: string) => {
        mockStorage[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
    });

    const mockDataSource = {
      signUp: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: new Error('Rate limit exceeded') }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: new Error('Invalid login credentials') }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      resendVerification: vi.fn().mockResolvedValue({ error: null }),
    };

    repo = new AuthRepositoryImpl(mockDataSource as any);
  });

  it('allows quick persona demo sign in seamlessly', async () => {
    const res = await repo.signIn({
      email: 'demo@example.com',
      password: 'any-password',
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.value.user.email).toBe('demo@example.com');
      expect(res.value.user.isEmailVerified).toBe(true);
    }
  });

  it('allows quick persona newuser sign in with fresh ID', async () => {
    const res = await repo.signIn({
      email: 'newuser@example.com',
      password: 'any-password',
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.value.user.email).toBe('newuser@example.com');
      expect(res.value.user.id.startsWith('99999999-')).toBe(true);
    }
  });

  it('signs up and persists local credentials when cloud is rate-limited', async () => {
    const res = await repo.signUp({
      displayName: 'Alice Engineer',
      email: 'alice@vision.ai',
      password: 'Password123!',
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.value.email).toBe('alice@vision.ai');
      expect(res.value.displayName).toBe('Alice Engineer');
    }

    // Now test signing in with those exact local credentials
    const loginRes = await repo.signIn({
      email: 'alice@vision.ai',
      password: 'Password123!',
    });

    expect(loginRes.success).toBe(true);
    if (loginRes.success) {
      expect(loginRes.value.user.email).toBe('alice@vision.ai');
    }
  });

  it('rejects incorrect password for locally registered user', async () => {
    await repo.signUp({
      displayName: 'Bob Scientist',
      email: 'bob@vision.ai',
      password: 'CorrectPassword1!',
    });

    const badLogin = await repo.signIn({
      email: 'bob@vision.ai',
      password: 'WrongPassword!',
    });

    expect(badLogin.success).toBe(false);
    if (!badLogin.success) {
      expect(badLogin.error.type).toBe('AUTH_INVALID_CREDENTIALS');
    }
  });

  it('restores active session from localStorage', async () => {
    await repo.signUp({
      displayName: 'Carol Developer',
      email: 'carol@vision.ai',
      password: 'Password123!',
    });

    const sessionRes = await repo.getCurrentSession();
    expect(sessionRes.success).toBe(true);
    if (sessionRes.success) {
      expect(sessionRes.value?.user.email).toBe('carol@vision.ai');
    }
  });

  it('clears session on signOut', async () => {
    await repo.signUp({
      displayName: 'Dave Ops',
      email: 'dave@vision.ai',
      password: 'Password123!',
    });

    await repo.signOut();
    const sessionRes = await repo.getCurrentSession();
    expect(sessionRes.success).toBe(true);
    if (sessionRes.success) {
      expect(sessionRes.value).toBeNull();
    }
  });
});
