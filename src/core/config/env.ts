import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(10),
  VITE_APP_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(import.meta.env);
  if (!result.success) {
    console.warn(
      '⚠️ Missing or invalid environment variables. Falling back to development defaults for local preview.',
      result.error.format()
    );
    return {
      VITE_SUPABASE_URL: (import.meta.env.VITE_SUPABASE_URL as string) || 'http://localhost:54321',
      VITE_SUPABASE_ANON_KEY: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'local-anon-key-placeholder',
      VITE_APP_ENV: 'development' as const,
    };
  }
  return result.data;
};

export const env = parseEnv();
