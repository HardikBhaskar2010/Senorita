-- ============================================
-- CHOCOLATE BOX FEATURE - DATABASE MIGRATION
-- Adds chocolate_opened column for Virtual Chocolate Box
-- ============================================

-- Add chocolate_opened column to store opened chocolates (array of IDs)
ALTER TABLE public.valentines_progress 
ADD COLUMN IF NOT EXISTS chocolate_opened INTEGER[];

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_valentines_chocolate
ON public.valentines_progress(user_name, day_number);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Chocolate Box migration completed! 🍫';
  RAISE NOTICE 'chocolate_opened column added for tracking opened chocolates';
END $$;
