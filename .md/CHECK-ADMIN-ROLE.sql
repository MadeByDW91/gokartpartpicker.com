-- Check Admin Role for admin_d
-- Run this to verify the role is set correctly

SELECT 
  id,
  username,
  email,
  role,
  created_at,
  updated_at
FROM profiles
WHERE username = 'admin_d'
   OR LOWER(username) = 'admin_d'
   OR email LIKE '%admin%'
ORDER BY created_at DESC;

-- Also check what the is_admin() function returns for this user
-- (You'll need to be logged in as this user in Supabase to test this)
-- SELECT is_admin(), get_user_role();
