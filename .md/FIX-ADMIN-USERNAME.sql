-- Fix Admin Username: Change admin_D to admin_d
-- Run this in Supabase SQL Editor

-- First, check current state
SELECT 
  id,
  username,
  email,
  role,
  created_at
FROM profiles
WHERE LOWER(username) LIKE 'admin%'
ORDER BY created_at DESC;

-- Update username from admin_D to admin_d and ensure admin role
UPDATE profiles
SET 
  username = 'admin_d',
  role = 'admin'
WHERE LOWER(username) = LOWER('admin_D');

-- Verify the update
SELECT 
  id,
  username,
  email,
  role,
  created_at
FROM profiles
WHERE username = 'admin_d';
