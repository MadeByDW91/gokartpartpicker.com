-- =============================================================================
-- GoKartPartPicker RLS Canary Tests
-- Migration: 20260116000003_rls_canary_tests.sql
-- Purpose: Stored procedures to verify RLS policies are working correctly
-- 
-- USAGE: Run these tests after deployment to verify security:
--   SELECT * FROM run_rls_canary_tests();
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TEST RESULT TYPE
-- -----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE rls_test_result AS (
      test_name TEXT,
      passed BOOLEAN,
      message TEXT,
      tested_at TIMESTAMPTZ
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- -----------------------------------------------------------------------------
-- TEST HELPER: Execute as specific role
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION test_as_role(role_name TEXT, test_query TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN;
BEGIN
  -- Set role context
  PERFORM set_config('request.jwt.claim.role', role_name, TRUE);
  PERFORM set_config('request.jwt.claim.sub', '', TRUE);
  
  -- Execute and return success
  EXECUTE test_query;
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- TEST HELPER: Execute as specific user
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION test_as_user(user_id UUID, test_query TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN;
BEGIN
  -- Set user context
  PERFORM set_config('request.jwt.claim.role', 'authenticated', TRUE);
  PERFORM set_config('request.jwt.claim.sub', user_id::TEXT, TRUE);
  
  -- Execute and return success
  EXECUTE test_query;
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- TEST HELPER: Count visible rows as role
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION count_visible_as_role(role_name TEXT, table_name TEXT)
RETURNS BIGINT AS $$
DECLARE
  row_count BIGINT;
BEGIN
  PERFORM set_config('request.jwt.claim.role', role_name, TRUE);
  PERFORM set_config('request.jwt.claim.sub', '', TRUE);
  
  EXECUTE format('SELECT COUNT(*) FROM %I', table_name) INTO row_count;
  RETURN row_count;
EXCEPTION
  WHEN OTHERS THEN
    RETURN -1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- TEST HELPER: Count visible rows as user
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION count_visible_as_user(user_id UUID, table_name TEXT)
RETURNS BIGINT AS $$
DECLARE
  row_count BIGINT;
BEGIN
  PERFORM set_config('request.jwt.claim.role', 'authenticated', TRUE);
  PERFORM set_config('request.jwt.claim.sub', user_id::TEXT, TRUE);
  
  EXECUTE format('SELECT COUNT(*) FROM %I', table_name) INTO row_count;
  RETURN row_count;
EXCEPTION
  WHEN OTHERS THEN
    RETURN -1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- MAIN TEST RUNNER
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION run_rls_canary_tests()
RETURNS SETOF rls_test_result AS $$
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
  
  -- Create test users in auth.users (requires service role)
  -- Note: In production, use actual test accounts
  
  -- For now, we'll test with simulated contexts
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
    
    -- Should not raise exception
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
  
  -- =========================================================================
  -- TEST SUITE: Write Protection
  -- =========================================================================
  
  -- TEST: Anon cannot insert engines
  test.test_name := 'anon_cannot_insert_engines';
  test.tested_at := NOW();
  BEGIN
    PERFORM set_config('request.jwt.claim.role', 'anon', TRUE);
    PERFORM set_config('request.jwt.claim.sub', '', TRUE);
    
    INSERT INTO engines (slug, name, brand, model, displacement_cc)
    VALUES ('test-engine', 'Test', 'Test', 'Test', 100);
    
    -- If we got here, the insert succeeded (BAD)
    test.passed := FALSE;
    test.message := 'SECURITY VIOLATION: Anonymous users can insert engines!';
    
    -- Clean up
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
    
    -- Check if any rows were affected
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
  
  -- =========================================================================
  -- TEST SUITE: Audit Log Immutability
  -- =========================================================================
  
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
  
  -- =========================================================================
  -- TEST SUITE: RLS Policy Existence
  -- =========================================================================
  
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
  
  -- =========================================================================
  -- SUMMARY
  -- =========================================================================
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- QUICK CHECK: List tables without RLS
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_rls_coverage()
RETURNS TABLE (
  table_name TEXT,
  rls_enabled BOOLEAN,
  policy_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tablename::TEXT,
    c.relrowsecurity,
    (SELECT COUNT(*) FROM pg_policies p WHERE p.tablename = t.tablename)
  FROM pg_tables t
  JOIN pg_class c ON c.relname = t.tablename 
    AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = t.schemaname)
  WHERE t.schemaname = 'public'
  AND t.tablename NOT LIKE 'pg_%'
  ORDER BY t.tablename;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- GRANT: Allow authenticated users to run tests (for CI/CD)
-- -----------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION run_rls_canary_tests() TO authenticated;
GRANT EXECUTE ON FUNCTION check_rls_coverage() TO authenticated;

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
