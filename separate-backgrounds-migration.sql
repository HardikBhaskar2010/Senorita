-- Migration: Separate Chat and Dashboard Backgrounds
-- Run this in Supabase SQL Editor

-- Add new settings for separate backgrounds
INSERT INTO chat_settings (setting_key, setting_value, updated_by, updated_at)
VALUES 
  ('chat_background_url', '', 'System', NOW()),
  ('dashboard_background_cookie', '', 'Cookie', NOW()),
  ('dashboard_background_senorita', '', 'Senorita', NOW())
ON CONFLICT (setting_key) DO NOTHING;

-- Migrate existing shared background to chat background
UPDATE chat_settings 
SET setting_value = (
  SELECT setting_value 
  FROM chat_settings 
  WHERE setting_key = 'shared_background_url'
)
WHERE setting_key = 'chat_background_url';

-- Keep shared_background_url for backward compatibility (optional)
-- You can remove this later if not needed

-- Add helpful comment
COMMENT ON TABLE chat_settings IS 'Stores user preferences including separate backgrounds for chat and dashboards';
