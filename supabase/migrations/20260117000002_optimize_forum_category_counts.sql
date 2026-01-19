-- ============================================================================
-- GoKart Part Picker - Optimize Forum Category Counts
-- Created: 2026-01-17
-- Description: Fix N+1 query issue in getForumCategories by using aggregation
-- Owner: Performance Optimization
-- ============================================================================

-- ============================================================================
-- FUNCTION: Get Forum Categories with Counts
-- ============================================================================

-- Function to get categories with topic/post counts in a single query
CREATE OR REPLACE FUNCTION get_forum_categories_with_counts()
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

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION get_forum_categories_with_counts() TO authenticated;
GRANT EXECUTE ON FUNCTION get_forum_categories_with_counts() TO anon;

COMMENT ON FUNCTION get_forum_categories_with_counts() IS 'Returns forum categories with topic and post counts in a single query, avoiding N+1 query problems';

-- ============================================================================
-- VIEW: Forum Categories with Counts (Alternative approach)
-- ============================================================================

-- Materialized view for even better performance (optional, use if counts don't need to be real-time)
-- Uncomment if you want to use materialized view instead:
/*
CREATE MATERIALIZED VIEW IF NOT EXISTS forum_categories_with_counts_mv AS
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
GROUP BY c.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_forum_categories_mv_id 
ON forum_categories_with_counts_mv(id);

-- Refresh materialized view (run periodically or after topic/post changes)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY forum_categories_with_counts_mv;

COMMENT ON MATERIALIZED VIEW forum_categories_with_counts_mv IS 'Materialized view for forum categories with counts, refreshed periodically';
*/

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
