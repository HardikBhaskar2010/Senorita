-- Database Health Check & Optimization Script
-- Run this in your Supabase SQL Editor to verify everything is working correctly

-- =====================================================
-- 1. CHECK FOR DUPLICATE USERS (Should return 0)
-- =====================================================
SELECT username, COUNT(*) as count
FROM public.users
GROUP BY username
HAVING COUNT(*) > 1;
-- Expected: No rows (no duplicates)

-- =====================================================
-- 2. VERIFY UNIQUE CONSTRAINT EXISTS
-- =====================================================
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE' 
  AND tc.table_name = 'users';
-- Expected: Should show unique constraint on username

-- =====================================================
-- 3. VIEW CURRENT USERS (Should show 2 users)
-- =====================================================
SELECT 
    username,
    display_name,
    role,
    created_at,
    updated_at,
    CASE 
        WHEN password_hash IS NOT NULL THEN 'Has Password'
        ELSE 'No Password'
    END as password_status
FROM public.users
ORDER BY username;
-- Expected: Cookie and Senorita with passwords

-- =====================================================
-- 4. TEST CASE-INSENSITIVE USERNAME SEARCH
-- =====================================================
-- This tests if different case variations will find the user
SELECT username, display_name 
FROM public.users 
WHERE username ILIKE 'cookie';
-- Expected: Should find "Cookie"

SELECT username, display_name 
FROM public.users 
WHERE username ILIKE 'SENORITA';
-- Expected: Should find "Senorita"

-- =====================================================
-- 5. CHECK ROW LEVEL SECURITY POLICIES
-- =====================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'users';
-- Expected: Should show "Allow all access to users" policy

-- =====================================================
-- 6. VERIFY TABLE INDEXES
-- =====================================================
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'users'
ORDER BY indexname;
-- Shows all indexes on users table

-- =====================================================
-- 7. ADD CASE-INSENSITIVE INDEX (OPTIONAL - For Performance)
-- =====================================================
-- This creates an index for faster case-insensitive searches
-- Only run if you want to optimize performance
CREATE INDEX IF NOT EXISTS idx_users_username_lower 
ON public.users(LOWER(username));

-- =====================================================
-- 8. TEST LOGIN QUERY (What the app now uses)
-- =====================================================
-- Test with exact case
SELECT id, username, display_name, role
FROM public.users
WHERE username ILIKE 'Cookie'
LIMIT 1;

-- Test with wrong case (should still work)
SELECT id, username, display_name, role
FROM public.users
WHERE username ILIKE 'cookie'
LIMIT 1;

-- =====================================================
-- RESULTS SUMMARY
-- =====================================================
-- After running all queries above:
-- ✅ Query 1 should return 0 rows (no duplicates)
-- ✅ Query 2 should show unique constraint exists
-- ✅ Query 3 should show 2 users: Cookie and Senorita
-- ✅ Query 4 should find both users regardless of case
-- ✅ Query 5 should show RLS policy allowing all access
-- ✅ Query 8 should work with any case variation
