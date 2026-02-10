-- Secret Vault Feature Migration
-- This migration adds support for Secret Vault with password protection and sync capabilities

-- ============================================
-- 1. VAULT SETTINGS TABLE
-- ============================================
-- Stores vault password for each user
CREATE TABLE IF NOT EXISTS vault_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL UNIQUE CHECK (user_name IN ('Cookie', 'Senorita')),
  vault_password TEXT NOT NULL, -- Hashed password
  is_setup BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. SECRET VAULT TABLE
-- ============================================
-- Stores vault items (text, files, images)
CREATE TABLE IF NOT EXISTS secret_vault (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL CHECK (user_name IN ('Cookie', 'Senorita')),
  item_type TEXT NOT NULL CHECK (item_type IN ('text', 'image', 'file')),
  title TEXT NOT NULL,
  content TEXT, -- For text notes
  file_url TEXT, -- For images/files
  file_name TEXT,
  file_type TEXT,
  file_size INTEGER,
  is_synced BOOLEAN DEFAULT false, -- Whether this item is synced with partner
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_secret_vault_user ON secret_vault(user_name);
CREATE INDEX IF NOT EXISTS idx_secret_vault_synced ON secret_vault(is_synced);
CREATE INDEX IF NOT EXISTS idx_secret_vault_created ON secret_vault(created_at DESC);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE vault_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE secret_vault ENABLE ROW LEVEL SECURITY;

-- Vault Settings Policies
DROP POLICY IF EXISTS "Enable read for own vault settings" ON vault_settings;
CREATE POLICY "Enable read for own vault settings"
  ON vault_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Enable insert for own vault settings" ON vault_settings;
CREATE POLICY "Enable insert for own vault settings"
  ON vault_settings FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for own vault settings" ON vault_settings;
CREATE POLICY "Enable update for own vault settings"
  ON vault_settings FOR UPDATE
  USING (true);

-- Secret Vault Policies
DROP POLICY IF EXISTS "Enable read own vault items" ON secret_vault;
CREATE POLICY "Enable read own vault items"
  ON secret_vault FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Enable insert own vault items" ON secret_vault;
CREATE POLICY "Enable insert own vault items"
  ON secret_vault FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update own vault items" ON secret_vault;
CREATE POLICY "Enable update own vault items"
  ON secret_vault FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Enable delete own vault items" ON secret_vault;
CREATE POLICY "Enable delete own vault items"
  ON secret_vault FOR DELETE
  USING (true);

-- ============================================
-- 5. REALTIME SUBSCRIPTIONS
-- ============================================
-- Enable realtime for vault tables
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.vault_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.secret_vault;

-- ============================================
-- 6. FUNCTIONS
-- ============================================

-- Function to check if vault is setup for a user
CREATE OR REPLACE FUNCTION is_vault_setup(p_user_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM vault_settings
    WHERE user_name = p_user_name AND is_setup = true
  );
END;
$$;

-- Function to get synced vault items count
CREATE OR REPLACE FUNCTION get_synced_vault_count(p_user_name TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM secret_vault
    WHERE user_name = p_user_name AND is_synced = true
  );
END;
$$;

-- ============================================
-- 7. TRIGGERS
-- ============================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_vault_settings_updated_at ON vault_settings;
CREATE TRIGGER update_vault_settings_updated_at
  BEFORE UPDATE ON vault_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_secret_vault_updated_at ON secret_vault;
CREATE TRIGGER update_secret_vault_updated_at
  BEFORE UPDATE ON secret_vault
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- To use this migration:
-- 1. Copy entire content
-- 2. Open Supabase SQL Editor
-- 3. Paste and execute
-- 4. Verify tables are created in Table Editor
