-- ============================================
-- VALENTINE'S SPECIAL 2025 - CLEAN MIGRATION
-- ============================================

-- Create table
CREATE TABLE IF NOT EXISTS public.valentines_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL CHECK (user_name IN ('Cookie', 'Senorita')),
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 8),
  day_name TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  custom_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_name, day_number)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_valentines_user_day
ON public.valentines_progress(user_name, day_number);

-- Enable Row Level Security
ALTER TABLE public.valentines_progress ENABLE ROW LEVEL SECURITY;

-- Read policy
DROP POLICY IF EXISTS "Anyone can read valentines progress"
ON public.valentines_progress;

CREATE POLICY "Anyone can read valentines progress"
ON public.valentines_progress
FOR SELECT
USING (true);

-- Insert policy
DROP POLICY IF EXISTS "Anyone can insert valentines progress"
ON public.valentines_progress;

CREATE POLICY "Anyone can insert valentines progress"
ON public.valentines_progress
FOR INSERT
WITH CHECK (true);

-- Update policy
DROP POLICY IF EXISTS "Anyone can update valentines progress"
ON public.valentines_progress;

CREATE POLICY "Anyone can update valentines progress"
ON public.valentines_progress
FOR UPDATE
USING (true);

-- ============================================
-- Realtime Setup (Safe)
-- ============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'valentines_progress'
  ) THEN
    ALTER PUBLICATION supabase_realtime
    DROP TABLE public.valentines_progress;
  END IF;

  ALTER PUBLICATION supabase_realtime
  ADD TABLE public.valentines_progress;
END $$;

-- ============================================
-- Optional seed data (safe)
-- ============================================

INSERT INTO public.valentines_progress
(user_name, day_number, day_name, custom_message)
VALUES
('Senorita', 1, 'Rose Day', 'You are as beautiful as the first rose of spring 🌹')
ON CONFLICT (user_name, day_number) DO NOTHING;

-- ============================================
-- Success message
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Valentine''s Special 2025 migration completed successfully! 💕';
END $$;
