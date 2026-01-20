-- ============================================================================
-- Fix Function Search Path Security Issues
-- Created: 2026-01-20
-- Description: Add SET search_path to all functions to prevent search path attacks
-- This addresses Supabase Security Advisor warnings (24 warnings)
-- ============================================================================

-- ============================================================================
-- SECURITY: Set search_path for all functions
-- This prevents search path manipulation attacks
-- ============================================================================

-- Fix update_updated_at_column function
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix is_admin function
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
CREATE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
END;
$$;

-- Fix is_super_admin function
DROP FUNCTION IF EXISTS public.is_super_admin() CASCADE;
CREATE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  );
END;
$$;

-- Fix get_user_role function
-- Drop first to avoid return type conflict
DROP FUNCTION IF EXISTS public.get_user_role();
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;
CREATE FUNCTION public.get_user_role()
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_role user_role;
BEGIN
  SELECT role INTO current_role FROM profiles WHERE id = auth.uid();
  RETURN COALESCE(current_role, 'user');
END;
$$;

-- Fix log_audit_action function
DROP FUNCTION IF EXISTS public.log_audit_action(audit_action, TEXT, UUID, JSONB, JSONB) CASCADE;
CREATE FUNCTION public.log_audit_action(
  p_action audit_action,
  p_table_name TEXT,
  p_record_id UUID,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_log (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  ) VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_record_id,
    p_old_data,
    p_new_data
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Fix audit_catalog_changes function
DROP FUNCTION IF EXISTS public.audit_catalog_changes() CASCADE;
CREATE FUNCTION public.audit_catalog_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Only audit if user is authenticated
  IF auth.uid() IS NOT NULL THEN
    IF TG_OP = 'INSERT' THEN
      PERFORM log_audit_action('create'::audit_action, TG_TABLE_NAME, NEW.id, NULL, to_jsonb(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
      PERFORM log_audit_action('update'::audit_action, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    ELSIF TG_OP = 'DELETE' THEN
      PERFORM log_audit_action('delete'::audit_action, TG_TABLE_NAME, OLD.id, to_jsonb(OLD), NULL);
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Fix count_visible_as_user function (from RLS canary tests)
-- Drop first to avoid return type conflict (original returns BIGINT, not INTEGER)
DROP FUNCTION IF EXISTS public.count_visible_as_user(UUID, TEXT) CASCADE;
CREATE FUNCTION public.count_visible_as_user(user_id UUID, table_name TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  row_count BIGINT;
  query_text TEXT;
BEGIN
  PERFORM set_config('request.jwt.claim.role', 'authenticated', TRUE);
  PERFORM set_config('request.jwt.claim.sub', user_id::TEXT, TRUE);
  EXECUTE format('SELECT COUNT(*) FROM %I', table_name) INTO row_count;
  RETURN row_count;
EXCEPTION
  WHEN OTHERS THEN
    RETURN -1;
END;
$$;

-- Fix check_rate_limit function
DROP FUNCTION IF EXISTS public.check_rate_limit(UUID, INET, TEXT, INTEGER, INTEGER) CASCADE;
CREATE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_ip_address INET,
  p_action_type TEXT,
  p_max_attempts INTEGER,
  p_window_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Check user limit (if authenticated)
  IF p_user_id IS NOT NULL THEN
    SELECT COUNT(*) INTO attempt_count
    FROM rate_limit_log
    WHERE user_id = p_user_id
      AND action_type = p_action_type
      AND created_at > NOW() - (p_window_seconds || ' seconds')::INTERVAL;
    
    IF attempt_count >= p_max_attempts THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Check IP limit (always)
  SELECT COUNT(*) INTO attempt_count
  FROM rate_limit_log
  WHERE ip_address = p_ip_address
    AND action_type = p_action_type
    AND created_at > NOW() - (p_window_seconds || ' seconds')::INTERVAL;
  
  IF attempt_count >= p_max_attempts THEN
    RETURN FALSE;
  END IF;
  
  -- Log this attempt
  INSERT INTO rate_limit_log (user_id, ip_address, action_type)
  VALUES (p_user_id, p_ip_address, p_action_type);
  
  RETURN TRUE;
END;
$$;

-- Fix videos_auto_thumbnail function
DROP FUNCTION IF EXISTS public.videos_auto_thumbnail() CASCADE;
CREATE FUNCTION public.videos_auto_thumbnail()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  yt_id text;
BEGIN
  -- Only derive when thumbnail is empty
  IF NEW.thumbnail_url IS NOT NULL AND NEW.thumbnail_url != '' THEN
    RETURN NEW;
  END IF;
  IF NEW.video_url IS NULL OR NEW.video_url = '' THEN
    RETURN NEW;
  END IF;

  yt_id := (regexp_match(NEW.video_url, '(?:youtube\.com/(?:watch\?v=|embed/)|youtu\.be/)([a-zA-Z0-9_-]{11})'))[1];
  IF yt_id IS NULL OR yt_id ~ '^(PLACEHOLDER|EXAMPLE)' THEN
    RETURN NEW;
  END IF;

  NEW.thumbnail_url := 'https://i.ytimg.com/vi/' || yt_id || '/hqdefault.jpg';
  RETURN NEW;
END;
$$;

-- Fix get_price_change function
DROP FUNCTION IF EXISTS public.get_price_change(UUID, UUID, INTEGER) CASCADE;
CREATE FUNCTION public.get_price_change(
  p_engine_id UUID DEFAULT NULL,
  p_part_id UUID DEFAULT NULL,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  current_price DECIMAL,
  previous_price DECIMAL,
  change_amount DECIMAL,
  change_percentage DECIMAL,
  days_ago INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_engine_id IS NOT NULL THEN
    RETURN QUERY
    WITH current AS (
      SELECT price, checked_at
      FROM price_history
      WHERE engine_id = p_engine_id
      ORDER BY checked_at DESC
      LIMIT 1
    ),
    previous AS (
      SELECT price, checked_at, 
             EXTRACT(DAY FROM (SELECT checked_at FROM current) - checked_at)::INTEGER AS days_diff
      FROM price_history
      WHERE engine_id = p_engine_id
        AND checked_at < (SELECT checked_at FROM current)
      ORDER BY checked_at DESC
      LIMIT 1
    )
    SELECT
      c.price AS current_price,
      p.price AS previous_price,
      (c.price - p.price) AS change_amount,
      CASE WHEN p.price > 0 THEN ((c.price - p.price) / p.price * 100) ELSE 0 END AS change_percentage,
      p.days_diff AS days_ago
    FROM current c
    CROSS JOIN previous p
    WHERE p.days_diff <= p_days;
  ELSIF p_part_id IS NOT NULL THEN
    RETURN QUERY
    WITH current AS (
      SELECT price, checked_at
      FROM price_history
      WHERE part_id = p_part_id
      ORDER BY checked_at DESC
      LIMIT 1
    ),
    previous AS (
      SELECT price, checked_at, 
             EXTRACT(DAY FROM (SELECT checked_at FROM current) - checked_at)::INTEGER AS days_diff
      FROM price_history
      WHERE part_id = p_part_id
        AND checked_at < (SELECT checked_at FROM current)
      ORDER BY checked_at DESC
      LIMIT 1
    )
    SELECT
      c.price AS current_price,
      p.price AS previous_price,
      (c.price - p.price) AS change_amount,
      CASE WHEN p.price > 0 THEN ((c.price - p.price) / p.price * 100) ELSE 0 END AS change_percentage,
      p.days_diff AS days_ago
    FROM current c
    CROSS JOIN previous p
    WHERE p.days_diff <= p_days;
  END IF;
  
  RETURN;
END;
$$;

-- Fix update_user_last_active function
DROP FUNCTION IF EXISTS public.update_user_last_active() CASCADE;
CREATE FUNCTION public.update_user_last_active()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE profiles
  SET last_active_at = NOW()
  WHERE id = auth.uid();
  RETURN NEW;
END;
$$;

-- Fix is_user_banned function
DROP FUNCTION IF EXISTS public.is_user_banned(UUID) CASCADE;
CREATE FUNCTION public.is_user_banned(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_bans
    WHERE user_id = p_user_id
    AND is_active = TRUE
    AND (ban_type = 'permanent' OR expires_at > NOW())
  );
END;
$$;

-- Fix is_moderator function
DROP FUNCTION IF EXISTS public.is_moderator() CASCADE;
CREATE FUNCTION public.is_moderator()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin', 'moderator')
  );
END;
$$;

-- Fix update_topic_stats function
DROP FUNCTION IF EXISTS public.update_topic_stats() CASCADE;
CREATE FUNCTION public.update_topic_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE forum_topics
  SET 
    replies_count = (
      SELECT COUNT(*) - 1 -- Subtract 1 because first post is in content field
      FROM forum_posts
      WHERE topic_id = NEW.topic_id
    ),
    last_reply_at = NEW.created_at,
    last_reply_by = NEW.user_id,
    updated_at = NOW()
  WHERE id = NEW.topic_id;
  
  RETURN NEW;
END;
$$;

-- Fix update_topic_stats_on_delete function
DROP FUNCTION IF EXISTS public.update_topic_stats_on_delete() CASCADE;
CREATE FUNCTION public.update_topic_stats_on_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE forum_topics
  SET 
    replies_count = GREATEST(
      (SELECT COUNT(*) - 1 FROM forum_posts WHERE topic_id = OLD.topic_id),
      0
    ),
    updated_at = NOW()
  WHERE id = OLD.topic_id;
  
  RETURN OLD;
END;
$$;

-- Fix get_forum_categories_with_counts function
DROP FUNCTION IF EXISTS public.get_forum_categories_with_counts() CASCADE;
CREATE FUNCTION public.get_forum_categories_with_counts()
RETURNS TABLE (
  id UUID,
  slug TEXT,
  name TEXT,
  description TEXT,
  parent_id UUID,
  icon TEXT,
  color TEXT,
  sort_order INTEGER,
  is_active BOOLEAN,
  requires_auth BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  topic_count BIGINT,
  post_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT 
    c.id,
    c.slug,
    c.name,
    c.description,
    c.parent_id,
    c.icon,
    c.color,
    c.sort_order,
    c.is_active,
    c.requires_auth,
    c.created_at,
    c.updated_at,
    COUNT(DISTINCT t.id) FILTER (WHERE t.is_archived = FALSE) as topic_count,
    COALESCE(SUM(t.replies_count) FILTER (WHERE t.is_archived = FALSE), 0) as post_count
  FROM forum_categories c
  LEFT JOIN forum_topics t ON t.category_id = c.id
  WHERE c.is_active = TRUE
  GROUP BY c.id
  ORDER BY c.sort_order, c.name;
$$;

-- Fix run_rls_canary_tests function
-- Note: This is a large function. We'll recreate it with search_path set.
-- The full implementation is preserved from 20260116000003_rls_canary_tests.sql
DROP FUNCTION IF EXISTS public.run_rls_canary_tests() CASCADE;
CREATE FUNCTION public.run_rls_canary_tests()
RETURNS SETOF rls_test_result
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  test rls_test_result;
  test_user_id UUID;
  other_user_id UUID;
  admin_user_id UUID;
  test_build_id UUID;
  test_engine_id UUID;
  row_count BIGINT;
BEGIN
  -- =========================================================================
  -- SETUP: Create test fixtures
  -- =========================================================================
  test_user_id := '00000000-0000-0000-0000-000000000001'::UUID;
  other_user_id := '00000000-0000-0000-0000-000000000002'::UUID;
  admin_user_id := '00000000-0000-0000-0000-000000000003'::UUID;
  
  -- =========================================================================
  -- TEST SUITE: Anonymous Access
  -- =========================================================================
  
  -- TEST: Anon can read active engines
  test.test_name := 'anon_can_read_active_engines';
  test.tested_at := NOW();
  BEGIN
    PERFORM set_config('request.jwt.claim.role', 'anon', TRUE);
    PERFORM set_config('request.jwt.claim.sub', '', TRUE);
    PERFORM id FROM engines WHERE is_active = TRUE LIMIT 1;
    test.passed := TRUE;
    test.message := 'Anonymous users can read active engines';
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := FALSE;
      test.message := 'FAILED: Anonymous users cannot read engines - ' || SQLERRM;
  END;
  RETURN NEXT test;
  
  -- TEST: Anon cannot read inactive engines
  test.test_name := 'anon_cannot_read_inactive_engines';
  test.tested_at := NOW();
  BEGIN
    PERFORM set_config('request.jwt.claim.role', 'anon', TRUE);
    PERFORM set_config('request.jwt.claim.sub', '', TRUE);
    SELECT COUNT(*) INTO row_count FROM engines WHERE is_active = FALSE;
    IF row_count = 0 THEN
      test.passed := TRUE;
      test.message := 'Anonymous users cannot see inactive engines (count = 0)';
    ELSE
      test.passed := FALSE;
      test.message := 'FAILED: Anonymous users can see inactive engines (count = ' || row_count || ')';
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := TRUE;
      test.message := 'Anonymous users cannot see inactive engines (exception raised)';
  END;
  RETURN NEXT test;
  
  -- TEST: Anon can read active parts
  test.test_name := 'anon_can_read_active_parts';
  test.tested_at := NOW();
  BEGIN
    PERFORM set_config('request.jwt.claim.role', 'anon', TRUE);
    PERFORM set_config('request.jwt.claim.sub', '', TRUE);
    PERFORM id FROM parts WHERE is_active = TRUE LIMIT 1;
    test.passed := TRUE;
    test.message := 'Anonymous users can read active parts';
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := FALSE;
      test.message := 'FAILED: Anonymous users cannot read parts - ' || SQLERRM;
  END;
  RETURN NEXT test;
  
  -- TEST: Anon can read published content
  test.test_name := 'anon_can_read_published_content';
  test.tested_at := NOW();
  BEGIN
    PERFORM set_config('request.jwt.claim.role', 'anon', TRUE);
    PERFORM set_config('request.jwt.claim.sub', '', TRUE);
    PERFORM id FROM content WHERE is_published = TRUE LIMIT 1;
    test.passed := TRUE;
    test.message := 'Anonymous users can read published content';
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := FALSE;
      test.message := 'FAILED: Anonymous users cannot read content - ' || SQLERRM;
  END;
  RETURN NEXT test;
  
  -- TEST: Anon cannot read unpublished content
  test.test_name := 'anon_cannot_read_unpublished_content';
  test.tested_at := NOW();
  BEGIN
    PERFORM set_config('request.jwt.claim.role', 'anon', TRUE);
    PERFORM set_config('request.jwt.claim.sub', '', TRUE);
    SELECT COUNT(*) INTO row_count FROM content WHERE is_published = FALSE;
    IF row_count = 0 THEN
      test.passed := TRUE;
      test.message := 'Anonymous users cannot see unpublished content';
    ELSE
      test.passed := FALSE;
      test.message := 'FAILED: Anonymous users can see unpublished content (count = ' || row_count || ')';
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := TRUE;
      test.message := 'Anonymous users cannot see unpublished content';
  END;
  RETURN NEXT test;
  
  -- TEST: Anon cannot read audit logs
  test.test_name := 'anon_cannot_read_audit_log';
  test.tested_at := NOW();
  BEGIN
    PERFORM set_config('request.jwt.claim.role', 'anon', TRUE);
    PERFORM set_config('request.jwt.claim.sub', '', TRUE);
    SELECT COUNT(*) INTO row_count FROM audit_log;
    IF row_count = 0 THEN
      test.passed := TRUE;
      test.message := 'Anonymous users cannot read audit logs';
    ELSE
      test.passed := FALSE;
      test.message := 'SECURITY VIOLATION: Anonymous users can read audit logs!';
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := TRUE;
      test.message := 'Anonymous users cannot read audit logs (access denied)';
  END;
  RETURN NEXT test;
  
  -- TEST: Anon cannot read private builds
  test.test_name := 'anon_cannot_read_private_builds';
  test.tested_at := NOW();
  BEGIN
    PERFORM set_config('request.jwt.claim.role', 'anon', TRUE);
    PERFORM set_config('request.jwt.claim.sub', '', TRUE);
    SELECT COUNT(*) INTO row_count FROM builds WHERE is_public = FALSE;
    IF row_count = 0 THEN
      test.passed := TRUE;
      test.message := 'Anonymous users cannot see private builds';
    ELSE
      test.passed := FALSE;
      test.message := 'SECURITY VIOLATION: Anonymous users can see private builds!';
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := TRUE;
      test.message := 'Anonymous users cannot see private builds';
  END;
  RETURN NEXT test;
  
  -- TEST: Anon cannot insert engines
  test.test_name := 'anon_cannot_insert_engines';
  test.tested_at := NOW();
  BEGIN
    PERFORM set_config('request.jwt.claim.role', 'anon', TRUE);
    PERFORM set_config('request.jwt.claim.sub', '', TRUE);
    INSERT INTO engines (slug, name, brand, model, displacement_cc)
    VALUES ('test-engine', 'Test', 'Test', 'Test', 100);
    test.passed := FALSE;
    test.message := 'SECURITY VIOLATION: Anonymous users can insert engines!';
    DELETE FROM engines WHERE slug = 'test-engine';
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := TRUE;
      test.message := 'Anonymous users cannot insert engines (correctly denied)';
  END;
  RETURN NEXT test;
  
  -- TEST: Anon cannot insert parts
  test.test_name := 'anon_cannot_insert_parts';
  test.tested_at := NOW();
  BEGIN
    PERFORM set_config('request.jwt.claim.role', 'anon', TRUE);
    PERFORM set_config('request.jwt.claim.sub', '', TRUE);
    INSERT INTO parts (slug, name, category_id)
    VALUES ('test-part', 'Test', '00000000-0000-0000-0000-000000000001');
    test.passed := FALSE;
    test.message := 'SECURITY VIOLATION: Anonymous users can insert parts!';
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := TRUE;
      test.message := 'Anonymous users cannot insert parts (correctly denied)';
  END;
  RETURN NEXT test;
  
  -- TEST: Anon cannot update engines
  test.test_name := 'anon_cannot_update_engines';
  test.tested_at := NOW();
  BEGIN
    PERFORM set_config('request.jwt.claim.role', 'anon', TRUE);
    PERFORM set_config('request.jwt.claim.sub', '', TRUE);
    UPDATE engines SET name = 'HACKED' WHERE TRUE;
    IF FOUND THEN
      test.passed := FALSE;
      test.message := 'SECURITY VIOLATION: Anonymous users can update engines!';
    ELSE
      test.passed := TRUE;
      test.message := 'Anonymous users cannot update engines';
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := TRUE;
      test.message := 'Anonymous users cannot update engines (correctly denied)';
  END;
  RETURN NEXT test;
  
  -- TEST: Anon cannot delete engines
  test.test_name := 'anon_cannot_delete_engines';
  test.tested_at := NOW();
  BEGIN
    PERFORM set_config('request.jwt.claim.role', 'anon', TRUE);
    PERFORM set_config('request.jwt.claim.sub', '', TRUE);
    DELETE FROM engines WHERE TRUE;
    IF FOUND THEN
      test.passed := FALSE;
      test.message := 'SECURITY VIOLATION: Anonymous users can delete engines!';
    ELSE
      test.passed := TRUE;
      test.message := 'Anonymous users cannot delete engines';
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := TRUE;
      test.message := 'Anonymous users cannot delete engines (correctly denied)';
  END;
  RETURN NEXT test;
  
  -- TEST: Audit log cannot be updated
  test.test_name := 'audit_log_immutable_update';
  test.tested_at := NOW();
  BEGIN
    UPDATE audit_log SET action = 'HACKED' WHERE TRUE;
    IF FOUND THEN
      test.passed := FALSE;
      test.message := 'SECURITY VIOLATION: Audit log can be modified!';
    ELSE
      test.passed := TRUE;
      test.message := 'Audit log is immutable (no updates)';
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := TRUE;
      test.message := 'Audit log is immutable (update denied)';
  END;
  RETURN NEXT test;
  
  -- TEST: Audit log cannot be deleted
  test.test_name := 'audit_log_immutable_delete';
  test.tested_at := NOW();
  BEGIN
    DELETE FROM audit_log WHERE TRUE;
    IF FOUND THEN
      test.passed := FALSE;
      test.message := 'SECURITY VIOLATION: Audit log records can be deleted!';
    ELSE
      test.passed := TRUE;
      test.message := 'Audit log is immutable (no deletes)';
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := TRUE;
      test.message := 'Audit log is immutable (delete denied)';
  END;
  RETURN NEXT test;
  
  -- TEST: All tables have RLS enabled
  test.test_name := 'all_tables_have_rls_enabled';
  test.tested_at := NOW();
  BEGIN
    SELECT COUNT(*) INTO row_count
    FROM pg_tables t
    LEFT JOIN pg_class c ON c.relname = t.tablename AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = t.schemaname)
    WHERE t.schemaname = 'public'
    AND t.tablename NOT LIKE 'pg_%'
    AND t.tablename NOT LIKE '_prisma%'
    AND NOT c.relrowsecurity;
    IF row_count = 0 THEN
      test.passed := TRUE;
      test.message := 'All public tables have RLS enabled';
    ELSE
      test.passed := FALSE;
      test.message := 'WARNING: ' || row_count || ' tables do not have RLS enabled';
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := FALSE;
      test.message := 'Could not verify RLS status - ' || SQLERRM;
  END;
  RETURN NEXT test;
  
  RETURN;
END;
$$;

-- Fix check_rls_coverage function
DROP FUNCTION IF EXISTS public.check_rls_coverage() CASCADE;
CREATE FUNCTION public.check_rls_coverage()
RETURNS TABLE (
  table_name TEXT,
  rls_enabled BOOLEAN,
  policy_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tablename::TEXT,
    c.relrowsecurity,
    (SELECT COUNT(*) FROM pg_policies p WHERE p.tablename = t.tablename)
  FROM pg_tables t
  JOIN pg_class c ON c.relname = t.tablename 
  WHERE t.schemaname = 'public'
  ORDER BY t.tablename;
END;
$$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.is_super_admin() IS 'Check if current user is super admin. Fixed search_path for security.';
COMMENT ON FUNCTION public.get_user_role() IS 'Get current user role. Fixed search_path for security.';
COMMENT ON FUNCTION public.is_moderator() IS 'Check if current user is moderator. Fixed search_path for security.';
COMMENT ON FUNCTION public.is_admin() IS 'Check if current user is admin. Fixed search_path for security.';
COMMENT ON FUNCTION public.audit_catalog_changes() IS 'Audit trigger for catalog changes. Fixed search_path for security.';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Trigger function to update updated_at timestamp. Fixed search_path for security.';
COMMENT ON FUNCTION public.get_forum_categories_with_counts() IS 'Get forum categories with topic and post counts. Fixed search_path for security.';
COMMENT ON FUNCTION public.log_audit_action(audit_action, TEXT, UUID, JSONB, JSONB) IS 'Log audit action. Fixed search_path for security.';
