-- Love OS Chat Improvements Migration
-- Adds: Reply functionality, Background image support
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. Add Reply Support to Messages Table
-- =====================================================
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS reply_to_message_id uuid,
ADD COLUMN IF NOT EXISTS reply_to_content text,
ADD COLUMN IF NOT EXISTS reply_to_user text;

-- Add foreign key for reply references
ALTER TABLE public.messages 
ADD CONSTRAINT fk_reply_to_message 
FOREIGN KEY (reply_to_message_id) 
REFERENCES public.messages(id) 
ON DELETE SET NULL;

-- =====================================================
-- 2. Add Background Image Support to Users Table
-- =====================================================
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS background_image_url text,
ADD COLUMN IF NOT EXISTS background_updated_at timestamp with time zone;

-- =====================================================
-- 3. Create Chat Settings Table (for shared settings)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.chat_settings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  setting_key text NOT NULL UNIQUE,
  setting_value text,
  updated_by text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_settings_pkey PRIMARY KEY (id)
);

-- Insert default shared background
INSERT INTO public.chat_settings (setting_key, setting_value, updated_by)
VALUES ('shared_background_url', '', 'system')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- 4. Enable RLS and Create Policies
-- =====================================================
ALTER TABLE public.chat_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read settings
CREATE POLICY "Allow all to read chat settings" ON public.chat_settings
  FOR SELECT USING (true);

-- Allow everyone to update settings
CREATE POLICY "Allow all to update chat settings" ON public.chat_settings
  FOR UPDATE USING (true);

-- =====================================================
-- 5. Enable Realtime for Chat Settings
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.chat_settings;

-- =====================================================
-- 6. Create Indexes for Better Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON public.messages(reply_to_message_id);
CREATE INDEX IF NOT EXISTS idx_chat_settings_key ON public.chat_settings(setting_key);

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '✅ Chat improvements migration completed successfully!';
  RAISE NOTICE '✅ Reply functionality added to messages';
  RAISE NOTICE '✅ Background image support added';
  RAISE NOTICE '✅ Chat settings table created';
END $$;