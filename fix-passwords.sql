-- Fix Password Hashes for Love OS
-- Run this in your Supabase SQL Editor to update passwords to 1234 and abcd

-- Update Cookie's password to '1234'
UPDATE public.users 
SET password_hash = '$2b$12$/Q.WANxiyeUVI6O0LLPLfeNXIe33E/MSQCTh.Z8O4jx8QcT6WgMzm',
    updated_at = now()
WHERE username = 'Cookie';

-- Update Senorita's password to 'abcd'  
UPDATE public.users 
SET password_hash = '$2b$12$O.F96rubUnSVLIRUKOGpLul1iftHPLHm5Q/hCpRINL9lMci.mznk6',
    updated_at = now()
WHERE username = 'Senorita';

-- Verify the updates
SELECT username, 
       CASE 
         WHEN username = 'Cookie' THEN 'Password should be: 1234'
         WHEN username = 'Senorita' THEN 'Password should be: abcd'
       END as password_info,
       updated_at
FROM public.users
WHERE username IN ('Cookie', 'Senorita');
