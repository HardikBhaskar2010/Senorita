-- ============================================
-- VALENTINE'S SPECIAL - INTERACTIVE FIX
-- Adds answer column and fixes date validation
-- ============================================

-- Add answer column to store Senorita's responses
ALTER TABLE public.valentines_progress 
ADD COLUMN IF NOT EXISTS answer TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_valentines_answer
ON public.valentines_progress(user_name, day_number, answer);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Valentine''s Interactive Fix migration completed! 💕';
  RAISE NOTICE 'Answer column added for storing Senorita''s responses';
END $$;
