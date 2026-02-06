-- ============================================
-- VALENTINE'S SPECIAL 2025 - DATABASE MIGRATION
-- ============================================
-- Run this in Supabase SQL Editor

-- Create valentines_progress table
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

-- Create index for fast queries
CREATE INDEX IF NOT EXISTS idx_valentines_user_day ON valentines_progress(user_name, day_number);

-- Enable Row Level Security
ALTER TABLE public.valentines_progress ENABLE ROW LEVEL SECURITY;

-- Create policy for reading (both users can read)
CREATE POLICY "Anyone can read valentines progress"
  ON public.valentines_progress
  FOR SELECT
  USING (true);

-- Create policy for inserting (both users can insert)
CREATE POLICY "Anyone can insert valentines progress"
  ON public.valentines_progress
  FOR INSERT
  WITH CHECK (true);

-- Create policy for updating (both users can update)
CREATE POLICY "Anyone can update valentines progress"
  ON public.valentines_progress
  FOR UPDATE
  USING (true);

-- Enable realtime (drop and re-add to avoid errors)
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.valentines_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.valentines_progress;

-- Insert sample data (optional - for testing)
-- You can delete this after testing
INSERT INTO public.valentines_progress (user_name, day_number, day_name, custom_message)
VALUES 
  ('Senorita', 1, 'Rose Day', 'You are as beautiful as the first rose of spring 🌹')
ON CONFLICT (user_name, day_number) DO NOTHING;

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE 'Valentine''s Special 2025 migration completed successfully! 💕'; 
END $$;
