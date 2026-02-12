-- Cosmic Kiss Symphony Migration
-- Tables for constellation creation and musical symphony composition

-- Constellations table (main constellation info)
CREATE TABLE IF NOT EXISTS constellations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_name TEXT NOT NULL, -- 'Cookie' or 'Senorita'
  created_by TEXT NOT NULL, -- Who started it
  is_complete BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Constellation stars (individual star placements)
CREATE TABLE IF NOT EXISTS constellation_stars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  constellation_id UUID REFERENCES constellations(id) ON DELETE CASCADE,
  x DECIMAL(5,2) NOT NULL, -- Percentage (0-100)
  y DECIMAL(5,2) NOT NULL, -- Percentage (0-100)
  note TEXT NOT NULL, -- Musical note (C4, D4, E4, etc.)
  instrument TEXT NOT NULL, -- 'violin', 'piano', 'harp'
  added_by TEXT NOT NULL, -- 'Cookie' or 'Senorita'
  order_index INTEGER NOT NULL, -- Order of placement
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Shooting star wishes
CREATE TABLE IF NOT EXISTS shooting_star_wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user TEXT NOT NULL, -- 'Cookie' or 'Senorita'
  to_user TEXT NOT NULL, -- 'Cookie' or 'Senorita'
  wish_text TEXT NOT NULL,
  seen BOOLEAN DEFAULT false,
  seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_constellations_user ON constellations(user_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_constellation_stars_constellation ON constellation_stars(constellation_id, order_index);
CREATE INDEX IF NOT EXISTS idx_shooting_stars_to_user ON shooting_star_wishes(to_user, seen, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE constellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE constellation_stars ENABLE ROW LEVEL SECURITY;
ALTER TABLE shooting_star_wishes ENABLE ROW LEVEL SECURITY;

-- RLS Policies (open access for the couple)
-- Constellations
DROP POLICY IF EXISTS "Allow all for constellations" ON constellations;
CREATE POLICY "Allow all for constellations" ON constellations FOR ALL USING (true) WITH CHECK (true);

-- Constellation Stars
DROP POLICY IF EXISTS "Allow all for constellation_stars" ON constellation_stars;
CREATE POLICY "Allow all for constellation_stars" ON constellation_stars FOR ALL USING (true) WITH CHECK (true);

-- Shooting Star Wishes
DROP POLICY IF EXISTS "Allow all for shooting_star_wishes" ON shooting_star_wishes;
CREATE POLICY "Allow all for shooting_star_wishes" ON shooting_star_wishes FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.constellations;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.constellation_stars;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.shooting_star_wishes;

-- Comments
COMMENT ON TABLE constellations IS 'Kiss constellations created by Cookie and Senorita';
COMMENT ON TABLE constellation_stars IS 'Individual stars in constellations with musical notes';
COMMENT ON TABLE shooting_star_wishes IS 'Wishes sent via shooting stars';
