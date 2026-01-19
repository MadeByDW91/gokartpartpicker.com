-- ============================================================================
-- Make User Admin
-- Run this in Supabase SQL Editor to give admin access to a user
-- ============================================================================

-- First, check current state of the user
SELECT 
  id,
  username,
  email,
  role,
  created_at
FROM profiles
WHERE LOWER(username) = LOWER('admin_d')
   OR email LIKE '%admin%'
ORDER BY created_at DESC;

-- Update user "admin_d" to have admin role (case-insensitive)
UPDATE profiles
SET role = 'admin'
WHERE LOWER(username) = LOWER('admin_d');

-- Verify the update worked
SELECT 
  id,
  username,
  email,
  role,
  created_at
FROM profiles
WHERE LOWER(username) = LOWER('admin_d');

-- If the above didn't work, try by email instead:
-- UPDATE profiles
-- SET role = 'admin'
-- WHERE email = 'your-email@example.com';

-- If you want to make them super_admin instead:
-- UPDATE profiles
-- SET role = 'super_admin'
-- WHERE LOWER(username) = LOWER('admin_d');
