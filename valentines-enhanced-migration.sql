-- =====================================================
-- Valentine's Special Enhanced Features Migration
-- Adds columns for interactive features
-- =====================================================

-- Add new columns to valentines_progress table
ALTER TABLE valentines_progress 
ADD COLUMN IF NOT EXISTS revealed_petals JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS collected_kisses JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS chocolate_design JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS completed_tasks JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS signature_data TEXT,
ADD COLUMN IF NOT EXISTS sealed_promise TEXT,
ADD COLUMN IF NOT EXISTS promise_unlock_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS proposal_choice TEXT,
ADD COLUMN IF NOT EXISTS hug_duration INTEGER DEFAULT 0;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_valentines_user_day ON valentines_progress(user_name, day_number);

-- Add comment to table
COMMENT ON TABLE valentines_progress IS 'Stores Valentine''s Week progress and interactive feature data for each user';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Valentine''s Enhanced Features migration completed successfully! 💕';
END $$;
