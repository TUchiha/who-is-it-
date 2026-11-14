-- Enable pgvector extension for biometric vector nearest neighbor search
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  visibility TEXT NOT NULL DEFAULT 'nobody' CHECK (visibility IN ('nobody', 'contacts', 'all')),
  allow_identification BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Consents table (Strict GDPR Art. 9 + BIPA record keeping)
CREATE TABLE IF NOT EXISTS public.consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  revoked_at TIMESTAMPTZ,
  jurisdiction_acknowledged TEXT NOT NULL DEFAULT 'GDPR_BIPA_CCPA',
  UNIQUE (user_id, version)
);

-- 3. Face Templates (Server-only access, pgvector index)
CREATE TABLE IF NOT EXISTS public.face_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  model_version TEXT NOT NULL,
  embedding vector(192) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  statutory_expiry TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + INTERVAL '3 years')
);

-- Create HNSW cosine distance index for 192-d face vector search
CREATE INDEX IF NOT EXISTS face_templates_embedding_idx
  ON public.face_templates
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- 4. Approved Contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  approved BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, contact_user_id)
);

-- 5. Lookup Audit Logs (Target user can audit who searched for them)
CREATE TABLE IF NOT EXISTS public.lookup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  caller_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  result TEXT NOT NULL CHECK (result IN ('matched', 'no_match_or_hidden'))
);

-- 6. Rate Limits (Window counters)
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  window_start TIMESTAMPTZ NOT NULL,
  count INT NOT NULL DEFAULT 1,
  UNIQUE(user_id, window_start)
);

-- 7. WebAuthn Passkey Credentials
CREATE TABLE IF NOT EXISTS public.webauthn_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  transports TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

--------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.face_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webauthn_credentials ENABLE ROW LEVEL SECURITY;

-- Profiles: Authenticated users can read other users' public profile only when permitted by visibility
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Consents: Users can view their own consent status
CREATE POLICY "Users can read own consents"
  ON public.consents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consents"
  ON public.consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consents"
  ON public.consents FOR UPDATE
  USING (auth.uid() = user_id);

-- NON-NEGOTIABLE DESIGN RULE 2:
-- "Matching against OTHER people runs server-side only. Other users' embeddings never reach any client."
-- face_templates table has NO client policies. All client queries return 0 rows or deny.
-- Only edge functions using service_role key can read/write face_templates.

-- Contacts: Users manage their own contacts list
CREATE POLICY "Users manage own contacts"
  ON public.contacts FOR ALL
  USING (auth.uid() = user_id);

-- Lookup Logs: NON-NEGOTIABLE DESIGN RULE:
-- Target can read audit log of who looked them up. No client writes allowed.
CREATE POLICY "Targets can view their lookup logs"
  ON public.lookup_logs FOR SELECT
  USING (auth.uid() = target_user_id);

-- Rate limits and WebAuthn: Server-only access via Edge Functions. No client RLS policies.
