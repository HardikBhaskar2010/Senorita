-- Love OS Migration SQL
-- This adds new features: Users with passwords, Real-time Chat, Special Features
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. USERS TABLE (with password authentication)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  username text NOT NULL UNIQUE CHECK (username = ANY (ARRAY['Cookie'::text, 'Senorita'::text])),
  password_hash text NOT NULL,
  display_name text NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['boyfriend'::text, 'girlfriend'::text])),
  partner_id uuid,
  anniversary_date date,
  relationship_start date,
  profile_color text DEFAULT '#ec4899',
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Insert initial users with hashed passwords
-- Cookie password: 1234 (hashed with bcrypt)
-- Senorita password: abcd (hashed with bcrypt)
INSERT INTO public.users (id, username, password_hash, display_name, role, anniversary_date, relationship_start, profile_color)
VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    'Cookie',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5LS2LWeZKqWxe', -- password: 1234
    'Cookie',
    'boyfriend',
    '2024-05-14',
    '2024-02-14',
    '#3b82f6'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Senorita',
    '$2b$12$EixZbYPjVpMnEqLqXmHqB.oGdqvx7kQ9P2cqDVQVLc0FTQV6AH7Vi', -- password: abcd
    'Senorita',
    'girlfriend',
    '2024-05-14',
    '2024-02-14',
    '#ec4899'
  )
ON CONFLICT (username) DO NOTHING;

-- Update users to link partners
UPDATE public.users SET partner_id = '22222222-2222-2222-2222-222222222222' WHERE username = 'Cookie';
UPDATE public.users SET partner_id = '11111111-1111-1111-1111-111111111111' WHERE username = 'Senorita';

-- =====================================================
-- 2. MESSAGES/CHAT TABLE (Real-time chat)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  from_user text NOT NULL CHECK (from_user = ANY (ARRAY['Cookie'::text, 'Senorita'::text])),
  to_user text NOT NULL CHECK (to_user = ANY (ARRAY['Cookie'::text, 'Senorita'::text])),
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type = ANY (ARRAY['text'::text, 'image'::text, 'hug'::text, 'kiss'::text])),
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_users ON public.messages(from_user, to_user);

-- =====================================================
-- 3. MESSAGE REACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  message_id uuid NOT NULL,
  user_name text NOT NULL CHECK (user_name = ANY (ARRAY['Cookie'::text, 'Senorita'::text])),
  reaction_emoji text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT message_reactions_pkey PRIMARY KEY (id),
  CONSTRAINT message_reactions_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_reaction_per_message UNIQUE (message_id, user_name)
);

-- =====================================================
-- 4. TYPING INDICATORS TABLE (for real-time typing status)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.typing_status (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_name text NOT NULL CHECK (user_name = ANY (ARRAY['Cookie'::text, 'Senorita'::text])),
  is_typing boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT typing_status_pkey PRIMARY KEY (id),
  CONSTRAINT unique_typing_user UNIQUE (user_name)
);

-- Insert initial typing status
INSERT INTO public.typing_status (user_name, is_typing)
VALUES ('Cookie', false), ('Senorita', false)
ON CONFLICT (user_name) DO NOTHING;

-- =====================================================
-- 5. SPECIAL DATES TABLE (for countdown timers)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.special_dates (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  date date NOT NULL,
  category text DEFAULT 'special' CHECK (category = ANY (ARRAY['anniversary'::text, 'birthday'::text, 'date'::text, 'special'::text, 'holiday'::text])),
  description text,
  icon text DEFAULT '🎉',
  created_by text CHECK (created_by = ANY (ARRAY['Cookie'::text, 'Senorita'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT special_dates_pkey PRIMARY KEY (id)
);

-- Insert some default special dates
INSERT INTO public.special_dates (title, date, category, icon, created_by)
VALUES 
  ('Our Anniversary', '2024-05-14', 'anniversary', '💕', 'Cookie'),
  ('Valentine''s Day', '2025-02-14', 'special', '❤️', 'Senorita')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. CALENDAR EVENTS TABLE (shared calendar)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  event_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone,
  location text,
  category text DEFAULT 'date' CHECK (category = ANY (ARRAY['date'::text, 'reminder'::text, 'appointment'::text, 'special'::text])),
  created_by text CHECK (created_by = ANY (ARRAY['Cookie'::text, 'Senorita'::text])),
  color text DEFAULT '#ec4899',
  is_all_day boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT calendar_events_pkey PRIMARY KEY (id)
);

-- =====================================================
-- 7. MILESTONES TABLE (for memory timeline)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.milestones (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NOT NULL,
  milestone_date date NOT NULL,
  category text DEFAULT 'memory' CHECK (category = ANY (ARRAY['first'::text, 'memory'::text, 'achievement'::text, 'trip'::text, 'special'::text])),
  image_url text,
  icon text DEFAULT '⭐',
  created_by text CHECK (created_by = ANY (ARRAY['Cookie'::text, 'Senorita'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT milestones_pkey PRIMARY KEY (id)
);

-- Insert some initial milestones
INSERT INTO public.milestones (title, description, milestone_date, category, icon, created_by)
VALUES 
  ('First Date', 'The day we first met and knew it was special', '2024-02-14', 'first', '💑', 'Cookie'),
  ('Made it Official', 'We became an official couple!', '2024-02-14', 'special', '💕', 'Senorita')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 8. QUICK NOTIFICATIONS TABLE (thinking of you)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.quick_notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  from_user text NOT NULL CHECK (from_user = ANY (ARRAY['Cookie'::text, 'Senorita'::text])),
  to_user text NOT NULL CHECK (to_user = ANY (ARRAY['Cookie'::text, 'Senorita'::text])),
  notification_type text NOT NULL CHECK (notification_type = ANY (ARRAY['thinking'::text, 'hug'::text, 'kiss'::text, 'love'::text, 'miss'::text])),
  message text,
  is_seen boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT quick_notifications_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_quick_notifications_to_user ON public.quick_notifications(to_user, is_seen);

-- =====================================================
-- 9. LOVE LANGUAGE RESULTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.love_language_results (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_name text NOT NULL CHECK (user_name = ANY (ARRAY['Cookie'::text, 'Senorita'::text])),
  words_of_affirmation integer DEFAULT 0,
  quality_time integer DEFAULT 0,
  receiving_gifts integer DEFAULT 0,
  acts_of_service integer DEFAULT 0,
  physical_touch integer DEFAULT 0,
  primary_language text,
  secondary_language text,
  taken_at timestamp with time zone DEFAULT now(),
  CONSTRAINT love_language_results_pkey PRIMARY KEY (id),
  CONSTRAINT unique_user_love_language UNIQUE (user_name)
);

-- =====================================================
-- 10. DAILY AFFIRMATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.daily_affirmations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  affirmation_text text NOT NULL,
  category text DEFAULT 'love' CHECK (category = ANY (ARRAY['love'::text, 'appreciation'::text, 'encouragement'::text, 'romantic'::text, 'cute'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT daily_affirmations_pkey PRIMARY KEY (id)
);

-- Insert some beautiful affirmations
INSERT INTO public.daily_affirmations (affirmation_text, category)
VALUES 
  ('You make every day brighter just by being in it', 'love'),
  ('Your smile is my favorite notification', 'cute'),
  ('I fall in love with you more every single day', 'romantic'),
  ('Thank you for being my person', 'appreciation'),
  ('You are absolutely incredible and I''m so lucky', 'encouragement'),
  ('Every moment with you is a treasure', 'love'),
  ('You''re the reason I believe in love', 'romantic'),
  ('Your happiness means everything to me', 'love'),
  ('I admire your strength and kindness every day', 'appreciation'),
  ('Being with you feels like home', 'romantic'),
  ('You inspire me to be better every day', 'encouragement'),
  ('Your love is the best gift I''ve ever received', 'appreciation'),
  ('I love you more than words can express', 'love'),
  ('You are my favorite everything', 'cute'),
  ('Life is beautiful because you''re in it', 'romantic')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 11. CHAT THEMES TABLE (for chat customization)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.chat_themes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_name text NOT NULL CHECK (user_name = ANY (ARRAY['Cookie'::text, 'Senorita'::text])),
  bubble_style text DEFAULT 'rounded' CHECK (bubble_style = ANY (ARRAY['rounded'::text, 'sharp'::text, 'pill'::text])),
  bubble_color text DEFAULT '#3b82f6',
  partner_bubble_color text DEFAULT '#ec4899',
  background_style text DEFAULT 'floating-hearts' CHECK (background_style = ANY (ARRAY['solid'::text, 'gradient'::text, 'floating-hearts'::text, 'stars'::text])),
  text_size text DEFAULT 'medium' CHECK (text_size = ANY (ARRAY['small'::text, 'medium'::text, 'large'::text])),
  show_timestamps boolean DEFAULT true,
  show_read_receipts boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_themes_pkey PRIMARY KEY (id),
  CONSTRAINT unique_user_chat_theme UNIQUE (user_name)
);

-- Insert default chat themes
INSERT INTO public.chat_themes (user_name, bubble_color, partner_bubble_color)
VALUES 
  ('Cookie', '#3b82f6', '#ec4899'),
  ('Senorita', '#ec4899', '#3b82f6')
ON CONFLICT (user_name) DO NOTHING;

-- =====================================================
-- ENABLE REALTIME FOR ALL NEW TABLES
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_status;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quick_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.calendar_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.milestones;
ALTER PUBLICATION supabase_realtime ADD TABLE public.special_dates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Open access for couple
-- =====================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.love_language_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_affirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_themes ENABLE ROW LEVEL SECURITY;

-- Create policies for open access (since it's just the couple)
CREATE POLICY "Allow all access to users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all access to messages" ON public.messages FOR ALL USING (true);
CREATE POLICY "Allow all access to message_reactions" ON public.message_reactions FOR ALL USING (true);
CREATE POLICY "Allow all access to typing_status" ON public.typing_status FOR ALL USING (true);
CREATE POLICY "Allow all access to special_dates" ON public.special_dates FOR ALL USING (true);
CREATE POLICY "Allow all access to calendar_events" ON public.calendar_events FOR ALL USING (true);
CREATE POLICY "Allow all access to milestones" ON public.milestones FOR ALL USING (true);
CREATE POLICY "Allow all access to quick_notifications" ON public.quick_notifications FOR ALL USING (true);
CREATE POLICY "Allow all access to love_language_results" ON public.love_language_results FOR ALL USING (true);
CREATE POLICY "Allow all access to daily_affirmations" ON public.daily_affirmations FOR ALL USING (true);
CREATE POLICY "Allow all access to chat_themes" ON public.chat_themes FOR ALL USING (true);

-- =====================================================
-- STORAGE BUCKET FOR CHAT MEDIA
-- =====================================================
-- Create storage bucket for chat images/media (if not exists)
-- Run this in Supabase Dashboard -> Storage
-- Bucket name: chat-media
-- Public: true

-- =====================================================
-- HELPFUL FUNCTIONS
-- =====================================================

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_read(p_to_user text, p_from_user text)
RETURNS void AS $$
BEGIN
  UPDATE public.messages
  SET is_read = true, read_at = now()
  WHERE to_user = p_to_user AND from_user = p_from_user AND is_read = false;
END;
$$ LANGUAGE plpgsql;

-- Function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_count(p_user text)
RETURNS integer AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.messages WHERE to_user = p_user AND is_read = false)::integer;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
-- Next steps:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Create 'chat-media' storage bucket in Supabase Dashboard
-- 3. Update your frontend .env with Supabase credentials
-- 4. Deploy the updated Love OS application
-- =====================================================
