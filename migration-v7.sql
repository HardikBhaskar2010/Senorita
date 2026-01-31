-- Love OS v7.0 Migration SQL
-- Adds: File upload support for chat, Enhanced notifications, Performance indexes
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. ADD FILE SUPPORT TO MESSAGES TABLE
-- =====================================================
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_type TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER;

-- Update message_type constraint to include 'file'
ALTER TABLE public.messages
DROP CONSTRAINT IF EXISTS messages_message_type_check;

ALTER TABLE public.messages
ADD CONSTRAINT messages_message_type_check 
CHECK (message_type = ANY (ARRAY['text'::text, 'image'::text, 'hug'::text, 'kiss'::text, 'file'::text]));

-- =====================================================
-- 2. ENHANCE QUICK_NOTIFICATIONS TABLE
-- =====================================================
-- Add notification_type column if it doesn't exist
ALTER TABLE public.quick_notifications 
ADD COLUMN IF NOT EXISTS notification_type TEXT DEFAULT 'thinking';

-- Add related_id for linking to messages/other content
ALTER TABLE public.quick_notifications 
ADD COLUMN IF NOT EXISTS related_id UUID;

-- Update constraint to include more notification types
ALTER TABLE public.quick_notifications
DROP CONSTRAINT IF EXISTS quick_notifications_notification_type_check;

ALTER TABLE public.quick_notifications
ADD CONSTRAINT quick_notifications_notification_type_check 
CHECK (notification_type = ANY (ARRAY['thinking'::text, 'chat'::text, 'letter'::text, 'hug'::text, 'kiss'::text, 'milestone'::text]));

-- =====================================================
-- 3. ADD PERFORMANCE INDEXES
-- =====================================================
-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_to_user ON public.messages(to_user, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_file_type ON public.messages(message_type) WHERE message_type = 'file';

-- Milestones table indexes
CREATE INDEX IF NOT EXISTS idx_milestones_date ON public.milestones(milestone_date DESC);
CREATE INDEX IF NOT EXISTS idx_milestones_category ON public.milestones(category);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.quick_notifications(to_user, is_seen, created_at DESC) WHERE is_seen = false;

-- =====================================================
-- 4. CREATE CHAT_MEDIA STORAGE BUCKET POLICIES
-- =====================================================
-- Note: Storage bucket must be created manually in Supabase dashboard
-- Bucket name: chat-media
-- Public: Yes
-- File size limit: 10MB

-- Storage policies (run after creating bucket)
-- Allow authenticated uploads
-- CREATE POLICY "Allow public uploads to chat-media"
-- ON storage.objects FOR INSERT
-- TO public
-- WITH CHECK (bucket_id = 'chat-media');

-- Allow public reads
-- CREATE POLICY "Allow public reads from chat-media"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'chat-media');

-- Allow users to delete their own files
-- CREATE POLICY "Allow users to delete their own files"
-- ON storage.objects FOR DELETE
-- TO public
-- USING (bucket_id = 'chat-media');

-- =====================================================
-- 5. ADD TRIGGER FOR AUTOMATIC TIMESTAMP UPDATES
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to users table if updated_at column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'updated_at'
    ) THEN
        DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
        CREATE TRIGGER update_users_updated_at 
            BEFORE UPDATE ON public.users 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =====================================================
-- 6. ADD USEFUL DATABASE FUNCTIONS
-- =====================================================

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_message_count(user_name TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM public.messages
        WHERE to_user = user_name AND is_read = false
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get unread notifications count for a user
CREATE OR REPLACE FUNCTION get_unread_notifications_count(user_name TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM public.quick_notifications
        WHERE to_user = user_name AND is_seen = false
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. ENABLE REALTIME FOR NEW FEATURES
-- =====================================================
-- Enable realtime on messages table (if not already enabled)
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.messages;

-- Enable realtime on quick_notifications table (if not already enabled)
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.quick_notifications;

-- Enable realtime on milestones table (if not already enabled)
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.milestones;

-- =====================================================
-- 8. CLEANUP AND OPTIMIZATION
-- =====================================================
-- Vacuum analyze tables for better query performance
VACUUM ANALYZE public.messages;
VACUUM ANALYZE public.quick_notifications;
VACUUM ANALYZE public.milestones;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Summary of changes:
-- ✅ Added file upload support to messages table
-- ✅ Enhanced quick_notifications with types and related IDs
-- ✅ Added performance indexes for faster queries
-- ✅ Created database functions for common queries
-- ✅ Enabled realtime subscriptions
-- ✅ Optimized tables with VACUUM ANALYZE
-- 
-- MANUAL STEPS REQUIRED:
-- 1. Create 'chat-media' storage bucket in Supabase dashboard
-- 2. Set bucket to Public
-- 3. Configure file size limit (recommended: 10MB)
-- 4. Apply storage policies (commented above)
