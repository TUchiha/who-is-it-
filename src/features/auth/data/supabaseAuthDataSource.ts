import type { SupabaseClient } from '@supabase/supabase-js';
import type { SignUpParams, SignInParams } from '../domain/authRepository';
import { supabase } from '../../../core/supabase/supabaseClient';

export class SupabaseAuthDataSource {
  constructor(private readonly client: SupabaseClient = supabase) {}

  async signUp(params: SignUpParams) {
    return this.client.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          display_name: params.displayName,
        },
      },
    });
  }

  async signInWithPassword(params: SignInParams) {
    return this.client.auth.signInWithPassword({
      email: params.email,
      password: params.password,
    });
  }

  async signOut() {
    return this.client.auth.signOut();
  }

  async getSession() {
    return this.client.auth.getSession();
  }

  async resendVerification(email: string) {
    return this.client.auth.resend({
      type: 'signup',
      email,
    });
  }
}
