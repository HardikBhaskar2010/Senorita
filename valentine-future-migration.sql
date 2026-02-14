-- ============================================
-- Valentine's Future Memory Experience
-- Database Migration SQL
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: future_memories
-- Stores memory data with text, images, and 3D diorama config
-- ============================================
CREATE TABLE IF NOT EXISTS future_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  snippet TEXT, -- Short preview text
  image_url TEXT, -- URL to memory image (Supabase storage)
  diorama_config JSONB, -- 3D scene configuration
  order_index INTEGER NOT NULL UNIQUE,
  created_by TEXT DEFAULT 'Cookie',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for order
CREATE INDEX IF NOT EXISTS idx_future_memories_order ON future_memories(order_index);

-- ============================================
-- Table: memory_progress
-- Tracks which memories users have visited
-- ============================================
CREATE TABLE IF NOT EXISTS memory_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_name TEXT NOT NULL CHECK (user_name IN ('Cookie', 'Senorita')),
  memory_id UUID REFERENCES future_memories(id) ON DELETE CASCADE,
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_name, memory_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_memory_progress_user ON memory_progress(user_name);
CREATE INDEX IF NOT EXISTS idx_memory_progress_memory ON memory_progress(memory_id);

-- ============================================
-- Table: secret_message_unlocks
-- Tracks when users unlock the secret message
-- ============================================
CREATE TABLE IF NOT EXISTS secret_message_unlocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_name TEXT NOT NULL CHECK (user_name IN ('Cookie', 'Senorita')) UNIQUE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  message_content TEXT
);

-- ============================================
-- RLS (Row Level Security) Policies
-- Open access for couple
-- ============================================

-- Enable RLS
ALTER TABLE future_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE secret_message_unlocks ENABLE ROW LEVEL SECURITY;

-- Policies for future_memories
DROP POLICY IF EXISTS "Allow all operations on future_memories" ON future_memories;
CREATE POLICY "Allow all operations on future_memories"
  ON future_memories FOR ALL
  USING (true)
  WITH CHECK (true);

-- Policies for memory_progress
DROP POLICY IF EXISTS "Allow all operations on memory_progress" ON memory_progress;
CREATE POLICY "Allow all operations on memory_progress"
  ON memory_progress FOR ALL
  USING (true)
  WITH CHECK (true);

-- Policies for secret_message_unlocks
DROP POLICY IF EXISTS "Allow all operations on secret_message_unlocks" ON secret_message_unlocks;
CREATE POLICY "Allow all operations on secret_message_unlocks"
  ON secret_message_unlocks FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Enable Realtime
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.future_memories;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.memory_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.secret_message_unlocks;

-- ============================================
-- Functions
-- ============================================

-- Function to get visit progress for a user
CREATE OR REPLACE FUNCTION get_memory_visit_progress(p_user_name TEXT)
RETURNS TABLE (
  total_memories BIGINT,
  visited_memories BIGINT,
  progress_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM future_memories) as total_memories,
    (SELECT COUNT(*) FROM memory_progress WHERE user_name = p_user_name) as visited_memories,
    CASE 
      WHEN (SELECT COUNT(*) FROM future_memories) > 0 THEN
        ROUND(
          ((SELECT COUNT(*) FROM memory_progress WHERE user_name = p_user_name)::NUMERIC / 
          (SELECT COUNT(*) FROM future_memories)::NUMERIC) * 100,
          2
        )
      ELSE 0
    END as progress_percentage;
END;
$$ LANGUAGE plpgsql;

-- Function to check if secret message should be unlocked
CREATE OR REPLACE FUNCTION check_secret_unlock(p_user_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_total_memories BIGINT;
  v_visited_memories BIGINT;
BEGIN
  SELECT COUNT(*) INTO v_total_memories FROM future_memories;
  SELECT COUNT(*) INTO v_visited_memories FROM memory_progress WHERE user_name = p_user_name;
  
  RETURN v_visited_memories >= v_total_memories AND v_total_memories > 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Sample Data (10 Memories)
-- These are placeholder memories - replace with actual content
-- ============================================

INSERT INTO future_memories (title, description, snippet, image_url, diorama_config, order_index)
VALUES 
  (
    'First Meet',
    'Coffee on the rainy sidewalk. Your smile lit up the grey afternoon. I knew something special was beginning.',
    'Coffee on the rainy sidewalk',
    '/memories/first-meet.jpg',
    '{"scene": "cafe", "lighting": "warm", "objects": ["coffee_cup", "umbrella", "rain_particles"]}',
    1
  ),
  (
    'First Trip Together',
    'Train window kisses and endless conversations. Watching the world blur by while everything inside felt crystal clear.',
    'Train window kisses',
    '/memories/first-trip.jpg',
    '{"scene": "train", "lighting": "sunset", "objects": ["train_window", "landscape_scroll", "ticket_stub"]}',
    2
  ),
  (
    'Late Night Code Session',
    'You fixed my bug at 2am. That''s when I realized you see beauty in the things I create.',
    'You fixed my bug',
    '/memories/code-night.jpg',
    '{"scene": "desk", "lighting": "blue_monitor", "objects": ["laptop", "coffee_mug", "code_screen"]}',
    3
  ),
  (
    'Stargazing Night',
    'Lying on the grass, counting stars and making wishes. You said you''d already found yours. I had too.',
    'Counting stars together',
    '/memories/stargazing.jpg',
    '{"scene": "night_field", "lighting": "starlight", "objects": ["grass_field", "telescope", "constellation_map"]}',
    4
  ),
  (
    'Dance in the Kitchen',
    'No music, just our heartbeats. You twirled me around the kitchen while dinner burned. Best meal never eaten.',
    'Kitchen dance, no music',
    '/memories/kitchen-dance.jpg',
    '{"scene": "kitchen", "lighting": "warm_evening", "objects": ["stove", "dancing_figures", "smoke_wisps"]}',
    5
  ),
  (
    'Rainy Movie Marathon',
    'Thunder outside, blankets inside. We talked through every movie, creating our own story instead.',
    'Blankets and thunder',
    '/memories/movie-night.jpg',
    '{"scene": "living_room", "lighting": "tv_glow", "objects": ["couch", "blankets", "popcorn", "rain_window"]}',
    6
  ),
  (
    'Sunrise Surprise',
    'You woke me up at 5am to see the sunrise. I was annoyed for 30 seconds, then mesmerized for 30 minutes.',
    'Sunrise at 5am',
    '/memories/sunrise.jpg',
    '{"scene": "hilltop", "lighting": "golden_hour", "objects": ["horizon", "sunrise_gradient", "holding_hands"]}',
    7
  ),
  (
    'The Bookmark Moment',
    'You left a note in my book: "You are my favorite chapter." I still have that bookmark.',
    'Favorite chapter note',
    '/memories/bookmark.jpg',
    '{"scene": "reading_nook", "lighting": "afternoon_sun", "objects": ["open_book", "bookmark", "reading_lamp"]}',
    8
  ),
  (
    'Building Future Plans',
    'Late night talks about our someday home. You described the garden, I described the library. Both with room for us.',
    'Someday home dreams',
    '/memories/future-plans.jpg',
    '{"scene": "night_balcony", "lighting": "city_lights", "objects": ["balcony_railing", "notebook", "coffee_cups", "city_skyline"]}',
    9
  ),
  (
    'This Moment Right Now',
    'You, reading this. Me, having created it months ago, knowing you''d smile. This is us - across time, always connected.',
    'Across time, connected',
    '/memories/right-now.jpg',
    '{"scene": "infinity_space", "lighting": "ethereal", "objects": ["timeline", "heart_constellation", "message_in_bottle"]}',
    10
  );

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE future_memories IS 'Stores future-themed memory entries with 3D diorama configurations';
COMMENT ON TABLE memory_progress IS 'Tracks which memories each user has visited';
COMMENT ON TABLE secret_message_unlocks IS 'Records when users unlock the final secret message';

COMMENT ON COLUMN future_memories.diorama_config IS 'JSONB configuration for Three.js 3D scene rendering';
COMMENT ON COLUMN future_memories.order_index IS 'Determines the position of memory node along motion path';

-- ============================================
-- Success Message
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Valentine Future Memory tables created successfully!';
  RAISE NOTICE '📊 10 sample memories inserted';
  RAISE NOTICE '🔒 RLS policies enabled';
  RAISE NOTICE '⚡ Realtime subscriptions enabled';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next Steps:';
  RAISE NOTICE '1. Create storage bucket "future-memories" for images';
  RAISE NOTICE '2. Upload memory images to storage';
  RAISE NOTICE '3. Update image_url paths in future_memories table';
  RAISE NOTICE '4. Test queries with: SELECT * FROM get_memory_visit_progress(''Senorita'');';
END $$;
