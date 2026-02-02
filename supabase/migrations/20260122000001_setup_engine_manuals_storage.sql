-- ============================================================================
-- Setup Supabase Storage for Engine Manuals
-- Created: 2026-01-22
-- Description: Create storage bucket for engine manual PDFs
-- ============================================================================
-- 
-- NOTE: Storage policies must be set up via Supabase Dashboard
-- This migration only creates the bucket. See instructions below.
-- ============================================================================

-- Create storage bucket for engine manuals
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'engine-manuals',
  'engine-manuals',
  true, -- Public bucket so users can access PDFs
  10485760, -- 10MB file size limit (adjust if needed)
  ARRAY['application/pdf'] -- Only allow PDF files
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf'];

-- ============================================================================
-- STORAGE POLICIES SETUP (Manual Step Required)
-- ============================================================================
-- Storage policies cannot be created via SQL migration due to permissions.
-- You must set them up via Supabase Dashboard:
--
-- 1. Go to: Supabase Dashboard → Storage → engine-manuals bucket
-- 2. Click on "Policies" tab
-- 3. Add these policies:
--
--    Policy 1: "Public Read Access"
--    - Policy name: "Engine manuals are publicly readable"
--    - Allowed operation: SELECT
--    - Target roles: public
--    - USING expression: bucket_id = 'engine-manuals'
--
--    Policy 2: "Authenticated Upload"
--    - Policy name: "Authenticated users can upload"
--    - Allowed operation: INSERT
--    - Target roles: authenticated
--    - WITH CHECK expression: bucket_id = 'engine-manuals'
--
--    Policy 3: "Authenticated Update"
--    - Policy name: "Authenticated users can update"
--    - Allowed operation: UPDATE
--    - Target roles: authenticated
--    - USING expression: bucket_id = 'engine-manuals'
--
--    Policy 4: "Authenticated Delete"
--    - Policy name: "Authenticated users can delete"
--    - Allowed operation: DELETE
--    - Target roles: authenticated
--    - USING expression: bucket_id = 'engine-manuals'
--
-- OR use the Supabase Dashboard Storage UI to set bucket to "Public"
-- which automatically allows public read access.
-- ============================================================================
