-- ============================================================================
-- Fix RLS Policies with Always True Conditions
-- Created: 2026-01-20
-- Description: Fix overly permissive RLS policies that use WITH CHECK (true)
-- This addresses Supabase Security Advisor warnings for:
--   - forum_audit_log: "System can insert audit logs for INSERT"
--   - rate_limit_log: "System can insert rate limit logs for INSERT"
-- ============================================================================

-- ============================================================================
-- SECURITY: Restrict INSERT policies for audit/log tables
-- These tables should only be written to via SECURITY DEFINER functions,
-- not directly by users. Since SECURITY DEFINER functions bypass RLS,
-- we can safely remove or restrict these INSERT policies.
-- ============================================================================

-- ============================================================================
-- FORUM AUDIT LOG
-- ============================================================================

-- Remove the overly permissive INSERT policy
-- The log_audit_action() function is SECURITY DEFINER and bypasses RLS,
-- so it can still insert records. Direct user inserts should be blocked.
DROP POLICY IF EXISTS "System can insert audit logs" ON forum_audit_log;
DROP POLICY IF EXISTS "System can insert audit logs for INSERT" ON forum_audit_log;

-- No INSERT policy needed - SECURITY DEFINER functions bypass RLS
-- By removing the policy, we prevent direct user inserts while allowing
-- function-based inserts (which bypass RLS via SECURITY DEFINER)

-- ============================================================================
-- RATE LIMIT LOG
-- ============================================================================

-- Remove the overly permissive INSERT policy
-- The check_rate_limit() function is SECURITY DEFINER and bypasses RLS,
-- so it can still insert records. Direct user inserts are not allowed.
DROP POLICY IF EXISTS "System can insert rate limit logs" ON rate_limit_log;

-- No INSERT policy needed - SECURITY DEFINER functions bypass RLS
-- By removing the policy, we prevent direct user inserts while allowing
-- function-based inserts (which bypass RLS via SECURITY DEFINER)

-- ============================================================================
-- COMMENTS
-- ============================================================================

-- No policy comments needed since we removed the INSERT policies
-- The tables are now only writable via SECURITY DEFINER functions

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- IMPORTANT: Both log_audit_action() and check_rate_limit() are SECURITY DEFINER
-- functions, which means they bypass RLS entirely when executing. This means:
-- 
-- 1. These functions can insert into these tables regardless of RLS policies
-- 2. By removing the INSERT policies, we prevent direct user inserts
-- 3. Only SECURITY DEFINER functions can insert (they bypass RLS)
-- 
-- This is the most secure approach for audit/log tables:
-- - No direct user inserts allowed
-- - Only controlled function-based inserts via SECURITY DEFINER functions
-- - No overly permissive policies that could be exploited
-- 
-- If you need to allow direct inserts from application code (not recommended for audit logs),
-- you would need to either:
-- - Use a service_role connection (bypasses RLS)
-- - Create a more restrictive policy with proper checks (not WITH CHECK (true))
-- - Use a SECURITY DEFINER function wrapper
-- 
-- ============================================================================
