-- Migration for Promise Tree of Life Feature
-- Run this in Supabase SQL Editor

-- Add promises_data column to valentines_progress table
ALTER TABLE valentines_progress 
ADD COLUMN IF NOT EXISTS promises_data JSONB;

-- Add comment
COMMENT ON COLUMN valentines_progress.promises_data IS 'Stores multiple promises as JSON array for Promise Tree feature';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_valentines_progress_promises 
ON valentines_progress USING GIN (promises_data);

-- Example of promises_data structure:
-- [
--   {
--     "id": "uuid",
--     "text": "I promise to...",
--     "category": "forever",
--     "signature": "base64_data",
--     "createdAt": "2025-02-11T00:00:00.000Z",
--     "position": [1.2, 0.8, -0.5],
--     "color": "#ff1493"
--   }
-- ]
