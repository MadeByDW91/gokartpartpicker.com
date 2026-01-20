-- ============================================================================
-- GoKart Part Picker - Database Health Check Queries
-- Created: 2026-01-17
-- Description: Useful queries for monitoring database health and performance
-- Owner: Database Administration
-- ============================================================================

-- ============================================================================
-- 1. TABLE SIZES
-- ============================================================================
-- Check which tables are taking up the most space
-- Run this periodically to monitor growth

CREATE OR REPLACE FUNCTION get_table_sizes()
RETURNS TABLE (
  schemaname TEXT,
  tablename TEXT,
  size TEXT,
  size_bytes BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    schemaname::TEXT,
    tablename::TEXT,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
$$;

COMMENT ON FUNCTION get_table_sizes() IS 'Returns table sizes sorted by total size (including indexes)';

-- ============================================================================
-- 2. INDEX USAGE
-- ============================================================================
-- Find unused or rarely used indexes (candidates for removal)
-- Find indexes that are taking up space but not being used

CREATE OR REPLACE FUNCTION get_index_usage()
RETURNS TABLE (
  schemaname TEXT,
  tablename TEXT,
  indexname TEXT,
  times_used BIGINT,
  index_size TEXT,
  index_size_bytes BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    schemaname::TEXT,
    tablename::TEXT,
    indexname::TEXT,
    idx_scan AS times_used,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
    pg_relation_size(indexrelid) AS index_size_bytes
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public'
  ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC;
$$;

COMMENT ON FUNCTION get_index_usage() IS 'Returns index usage statistics, sorted by least used first';

-- ============================================================================
-- 3. CONNECTION POOL STATUS
-- ============================================================================
-- Check current connection pool usage
-- Monitor to ensure you're not hitting connection limits

CREATE OR REPLACE FUNCTION get_connection_status()
RETURNS TABLE (
  active_connections BIGINT,
  max_connections INTEGER,
  percent_used NUMERIC,
  idle_connections BIGINT,
  active_queries BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    COUNT(*)::BIGINT AS active_connections,
    (SELECT setting::INTEGER FROM pg_settings WHERE name = 'max_connections') AS max_connections,
    ROUND(100.0 * COUNT(*)::NUMERIC / (SELECT setting::INTEGER FROM pg_settings WHERE name = 'max_connections'), 2) AS percent_used,
    COUNT(*) FILTER (WHERE state = 'idle')::BIGINT AS idle_connections,
    COUNT(*) FILTER (WHERE state = 'active')::BIGINT AS active_queries
  FROM pg_stat_activity
  WHERE datname = current_database();
$$;

COMMENT ON FUNCTION get_connection_status() IS 'Returns current connection pool usage statistics';

-- ============================================================================
-- 4. SLOW QUERIES (Requires pg_stat_statements extension)
-- ============================================================================
-- Find queries that are taking the longest time
-- Helps identify performance bottlenecks

CREATE OR REPLACE FUNCTION get_slow_queries(limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
  query_preview TEXT,
  calls BIGINT,
  mean_exec_time NUMERIC,
  max_exec_time NUMERIC,
  total_exec_time NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    LEFT(query, 100) AS query_preview,
    calls,
    ROUND(mean_exec_time::NUMERIC, 2) AS mean_exec_time,
    ROUND(max_exec_time::NUMERIC, 2) AS max_exec_time,
    ROUND(total_exec_time::NUMERIC, 2) AS total_exec_time
  FROM pg_stat_statements
  WHERE mean_exec_time > 100  -- Queries taking > 100ms on average
  ORDER BY mean_exec_time DESC
  LIMIT limit_count;
$$;

COMMENT ON FUNCTION get_slow_queries(INTEGER) IS 'Returns slow queries (requires pg_stat_statements extension)';

-- ============================================================================
-- 5. TABLE STATISTICS
-- ============================================================================
-- Get row counts and last vacuum/analyze times for all tables

CREATE OR REPLACE FUNCTION get_table_statistics()
RETURNS TABLE (
  schemaname TEXT,
  tablename TEXT,
  row_count BIGINT,
  last_vacuum TIMESTAMPTZ,
  last_analyze TIMESTAMPTZ,
  table_size TEXT,
  index_size TEXT
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    s.schemaname::TEXT,
    s.tablename::TEXT,
    s.n_live_tup AS row_count,
    s.last_vacuum,
    s.last_analyze,
    pg_size_pretty(pg_relation_size(s.schemaname||'.'||s.tablename)) AS table_size,
    pg_size_pretty(pg_indexes_size(s.schemaname||'.'||s.tablename)) AS index_size
  FROM pg_stat_user_tables s
  WHERE s.schemaname = 'public'
  ORDER BY s.n_live_tup DESC;
$$;

COMMENT ON FUNCTION get_table_statistics() IS 'Returns table statistics including row counts and maintenance info';

-- ============================================================================
-- 6. INDEX BLOAT
-- ============================================================================
-- Find indexes that are taking up more space than they should
-- Helps identify when to REINDEX

CREATE OR REPLACE FUNCTION get_index_bloat()
RETURNS TABLE (
  schemaname TEXT,
  tablename TEXT,
  indexname TEXT,
  index_size TEXT,
  index_size_bytes BIGINT,
  times_used BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    schemaname::TEXT,
    tablename::TEXT,
    indexname::TEXT,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
    pg_relation_size(indexrelid) AS index_size_bytes,
    idx_scan AS times_used
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public'
    AND pg_relation_size(indexrelid) > 1048576  -- Only indexes > 1MB
  ORDER BY pg_relation_size(indexrelid) DESC;
$$;

COMMENT ON FUNCTION get_index_bloat() IS 'Returns large indexes sorted by size';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION get_table_sizes() TO authenticated;
GRANT EXECUTE ON FUNCTION get_index_usage() TO authenticated;
GRANT EXECUTE ON FUNCTION get_connection_status() TO authenticated;
GRANT EXECUTE ON FUNCTION get_slow_queries(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_index_bloat() TO authenticated;

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

-- Get table sizes:
-- SELECT * FROM get_table_sizes();

-- Get index usage:
-- SELECT * FROM get_index_usage() WHERE times_used = 0 LIMIT 10;

-- Get connection status:
-- SELECT * FROM get_connection_status();

-- Get slow queries (requires pg_stat_statements):
-- SELECT * FROM get_slow_queries(10);

-- Get table statistics:
-- SELECT * FROM get_table_statistics();

-- Get index bloat:
-- SELECT * FROM get_index_bloat() WHERE times_used < 10;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
