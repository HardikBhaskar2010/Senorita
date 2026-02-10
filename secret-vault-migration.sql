-- ============================================
-- SECRET VAULT FEATURE MIGRATION (CLEAN)
-- ============================================

-- ============================================
-- 1. VAULT SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.vault_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL UNIQUE
    CHECK (user_name IN ('Cookie', 'Senorita')),
  vault_password TEXT NOT NULL,
  is_setup BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. SECRET VAULT TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.secret_vault (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL
    CHECK (user_name IN ('Cookie', 'Senorita')),
  item_type TEXT NOT NULL
    CHECK (item_type IN ('text', 'image', 'file')),
  title TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size INTEGER,
  is_synced BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_secret_vault_user
ON public.secret_vault(user_name);

CREATE INDEX IF NOT EXISTS idx_secret_vault_synced
ON public.secret_vault(is_synced);

CREATE INDEX IF NOT EXISTS idx_secret_vault_created
ON public.secret_vault(created_at DESC);

-- ============================================
-- 4. ENABLE RLS
-- ============================================
ALTER TABLE public.vault_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secret_vault ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. RLS POLICIES (OPEN FOR NOW - SAFE FOR DEV)
-- ============================================

-- Vault settings
DROP POLICY IF EXISTS "vault_settings_select" ON public.vault_settings;
CREATE POLICY "vault_settings_select"
ON public.vault_settings
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "vault_settings_insert" ON public.vault_settings;
CREATE POLICY "vault_settings_insert"
ON public.vault_settings
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "vault_settings_update" ON public.vault_settings;
CREATE POLICY "vault_settings_update"
ON public.vault_settings
FOR UPDATE
USING (true);

-- Secret vault
DROP POLICY IF EXISTS "secret_vault_select" ON public.secret_vault;
CREATE POLICY "secret_vault_select"
ON public.secret_vault
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "secret_vault_insert" ON public.secret_vault;
CREATE POLICY "secret_vault_insert"
ON public.secret_vault
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "secret_vault_update" ON public.secret_vault;
CREATE POLICY "secret_vault_update"
ON public.secret_vault
FOR UPDATE
USING (true);

DROP POLICY IF EXISTS "secret_vault_delete" ON public.secret_vault;
CREATE POLICY "secret_vault_delete"
ON public.secret_vault
FOR DELETE
USING (true);

-- ============================================
-- 6. UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Vault settings trigger
DROP TRIGGER IF EXISTS update_vault_settings_updated_at
ON public.vault_settings;

CREATE TRIGGER update_vault_settings_updated_at
BEFORE UPDATE ON public.vault_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Secret vault trigger
DROP TRIGGER IF EXISTS update_secret_vault_updated_at
ON public.secret_vault;

CREATE TRIGGER update_secret_vault_updated_at
BEFORE UPDATE ON public.secret_vault
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 7. REALTIME SUBSCRIPTIONS (SAFE)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'vault_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime
    ADD TABLE public.vault_settings;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'secret_vault'
  ) THEN
    ALTER PUBLICATION supabase_realtime
    ADD TABLE public.secret_vault;
  END IF;
END $$;

-- ============================================
-- 8. HELPER FUNCTIONS
-- ============================================

-- Check if vault is setup
CREATE OR REPLACE FUNCTION public.is_vault_setup(p_user_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.vault_settings
    WHERE user_name = p_user_name
      AND is_setup = true
  );
END;
$$;

-- Get synced item count
CREATE OR REPLACE FUNCTION public.get_synced_vault_count(p_user_name TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.secret_vault
    WHERE user_name = p_user_name
      AND is_synced = true
  );
END;
$$;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
