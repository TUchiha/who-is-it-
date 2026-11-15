const parseEnv = () => {
  const url =
    (import.meta.env.VITE_SUPABASE_URL as string) ||
    (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string) ||
    'http://localhost:54321';

  const key =
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
    (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) ||
    (import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string) ||
    'local-anon-key-placeholder';

  const appEnv =
    (import.meta.env.VITE_APP_ENV as 'development' | 'production' | 'test') ||
    'development';

  return {
    VITE_SUPABASE_URL: url,
    VITE_SUPABASE_ANON_KEY: key,
    VITE_APP_ENV: appEnv,
  };
};

export const env = parseEnv();
