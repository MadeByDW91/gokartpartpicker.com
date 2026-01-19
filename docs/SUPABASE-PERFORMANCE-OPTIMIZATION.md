# Supabase Production Performance Optimization

> **Last Updated:** 2026-01-16  
> **Status:** Performance optimization guide for production traffic

This document outlines strategies and optimizations to handle high traffic and ensure best performance when deploying to production.

---

## 📊 Table of Contents

1. [Database Indexes](#database-indexes)
2. [Query Optimization](#query-optimization)
3. [Connection Pooling](#connection-pooling)
4. [RLS Performance](#rls-performance)
5. [Caching Strategies](#caching-strategies)
6. [Monitoring & Alerts](#monitoring--alerts)
7. [Database Configuration](#database-configuration)
8. [Scaling Strategies](#scaling-strategies)

---

## 🗂️ 1. Database Indexes

### Current Indexes (✅ Already in Place)

Your migrations already include good indexes on:
- `engines`: `idx_engines_brand`, `idx_engines_displacement`, `idx_engines_active`, `idx_engines_slug`
- `parts`: `idx_parts_category`, `idx_parts_active`
- `builds`: `idx_builds_public_created`, `idx_builds_likes`
- `content`: `idx_content_search` (GIN index for full-text search)

### ⚠️ Missing Critical Indexes

Create a new migration file to add performance-critical indexes:

```sql
-- supabase/migrations/20260117000001_performance_indexes.sql

-- ============================================================================
-- FORUM INDEXES (High traffic tables)
-- ============================================================================

-- Forum topics by category (most common query)
CREATE INDEX IF NOT EXISTS idx_forum_topics_category_active 
ON forum_topics(category_id, is_archived, created_at DESC)
WHERE is_archived = FALSE;

-- Forum topics pinned first, then by date
CREATE INDEX IF NOT EXISTS idx_forum_topics_pinned_created 
ON forum_topics(is_pinned DESC, created_at DESC)
WHERE is_archived = FALSE;

-- Forum topics by views/replies (popular sorting)
CREATE INDEX IF NOT EXISTS idx_forum_topics_views 
ON forum_topics(views_count DESC)
WHERE is_archived = FALSE;

CREATE INDEX IF NOT EXISTS idx_forum_topics_replies 
ON forum_topics(replies_count DESC)
WHERE is_archived = FALSE;

-- Forum topics slug lookup (unique constraint already covers this, but explicit is better)
CREATE INDEX IF NOT EXISTS idx_forum_topics_slug 
ON forum_topics(slug);

-- Forum posts by topic (most common query)
CREATE INDEX IF NOT EXISTS idx_forum_posts_topic_created 
ON forum_posts(topic_id, created_at ASC);

-- Forum posts by user (for admin/user profile pages)
CREATE INDEX IF NOT EXISTS idx_forum_posts_user 
ON forum_posts(user_id, created_at DESC);

-- Forum categories by slug (lookup)
CREATE INDEX IF NOT EXISTS idx_forum_categories_slug 
ON forum_categories(slug)
WHERE is_active = TRUE;

-- ============================================================================
-- BUILD INDEXES (User-generated content)
-- ============================================================================

-- User builds (most common query)
CREATE INDEX IF NOT EXISTS idx_builds_user_created 
ON builds(user_id, created_at DESC);

-- Builds by engine (popular filter)
CREATE INDEX IF NOT EXISTS idx_builds_engine 
ON builds(engine_id, is_public, created_at DESC)
WHERE engine_id IS NOT NULL;

-- Builds by template flag
CREATE INDEX IF NOT EXISTS idx_builds_templates 
ON builds(is_template, is_active, created_at DESC)
WHERE is_template = TRUE AND is_active = TRUE;

-- Build parts lookup
CREATE INDEX IF NOT EXISTS idx_build_parts_build 
ON build_parts(build_id, part_id);

-- Build parts by part (reverse lookup)
CREATE INDEX IF NOT EXISTS idx_build_parts_part 
ON build_parts(part_id);

-- ============================================================================
-- PART INDEXES (Filtering performance)
-- ============================================================================

-- Parts by category + active (most common filter)
CREATE INDEX IF NOT EXISTS idx_parts_category_active 
ON parts(category, is_active)
WHERE is_active = TRUE;

-- Parts by brand (filtering)
CREATE INDEX IF NOT EXISTS idx_parts_brand_active 
ON parts(brand, is_active)
WHERE brand IS NOT NULL AND is_active = TRUE;

-- Parts by price range (filtering)
CREATE INDEX IF NOT EXISTS idx_parts_price_active 
ON parts(price, is_active)
WHERE price IS NOT NULL AND is_active = TRUE;

-- ============================================================================
-- COMPATIBILITY INDEXES (Join performance)
-- ============================================================================

-- Compatibility rules by source category (most common lookup)
CREATE INDEX IF NOT EXISTS idx_compatibility_rules_source 
ON compatibility_rules(source_category, is_active)
WHERE is_active = TRUE;

-- Compatibility rules by target category
CREATE INDEX IF NOT EXISTS idx_compatibility_rules_target 
ON compatibility_rules(target_category, is_active)
WHERE is_active = TRUE;

-- Engine-part compatibility lookups
CREATE INDEX IF NOT EXISTS idx_engine_part_compatibility_engine 
ON engine_part_compatibility(engine_id);

CREATE INDEX IF NOT EXISTS idx_engine_part_compatibility_part 
ON engine_part_compatibility(part_id);

-- ============================================================================
-- PROFILE INDEXES (User lookups)
-- ============================================================================

-- Profile by username (lookup - unique constraint covers this but explicit helps)
CREATE INDEX IF NOT EXISTS idx_profiles_username 
ON profiles(username)
WHERE username IS NOT NULL;

-- Profile by role (admin queries)
CREATE INDEX IF NOT EXISTS idx_profiles_role 
ON profiles(role)
WHERE role IN ('admin', 'super_admin');

-- ============================================================================
-- CONTENT INDEXES (Guides/videos)
-- ============================================================================

-- Content by type and published status
CREATE INDEX IF NOT EXISTS idx_content_type_published 
ON content(content_type, is_published, created_at DESC)
WHERE is_published = TRUE;

-- Content by engine (guides filtering)
CREATE INDEX IF NOT EXISTS idx_content_engine 
ON content(engine_id, is_published)
WHERE engine_id IS NOT NULL AND is_published = TRUE;

-- Videos by engine
CREATE INDEX IF NOT EXISTS idx_videos_engine_active 
ON videos(engine_id, is_active)
WHERE is_active = TRUE;

-- ============================================================================
-- AUDIT LOG INDEXES (Admin queries)
-- ============================================================================

-- Audit log by user
CREATE INDEX IF NOT EXISTS idx_audit_log_user 
ON audit_log(user_id, created_at DESC);

-- Audit log by action type
CREATE INDEX IF NOT EXISTS idx_audit_log_action 
ON audit_log(action, created_at DESC);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON INDEX idx_forum_topics_category_active IS 'Optimizes forum category topic listings';
COMMENT ON INDEX idx_builds_user_created IS 'Optimizes user build queries';
COMMENT ON INDEX idx_parts_category_active IS 'Optimizes parts filtering by category';
```

### Index Best Practices

1. **Use Partial Indexes** (WHERE clauses) for filtered queries
   - Example: `WHERE is_active = TRUE` - only indexes active records
   - Reduces index size and improves write performance

2. **Composite Indexes** for multi-column queries
   - Order columns by selectivity (most selective first)
   - Example: `(category_id, is_archived, created_at)`

3. **Covering Indexes** for read-heavy queries
   - Include frequently selected columns in index
   - Example: `CREATE INDEX idx_topic_cover ON forum_topics(category_id) INCLUDE (title, created_at)`

4. **Monitor Index Usage**
   ```sql
   -- Find unused indexes
   SELECT schemaname, tablename, indexname, idx_scan 
   FROM pg_stat_user_indexes 
   WHERE idx_scan = 0 
   ORDER BY pg_relation_size(indexrelid) DESC;
   ```

---

## 🚀 2. Query Optimization

### N+1 Query Problem (⚠️ Critical Fix)

**Current Issue:** In `getForumCategories()`, there's an N+1 query:

```typescript
// ❌ BAD: N+1 queries
const categoriesWithCounts = await Promise.all(
  data.map(async (category) => {
    const { count } = await supabase.from('forum_topics').select(...);
    // Separate query per category
  })
);
```

**Fix:** Use SQL aggregation or batch queries:

```sql
-- ✅ GOOD: Single query with aggregation
SELECT 
  c.*,
  COUNT(DISTINCT t.id) as topic_count,
  COALESCE(SUM(t.replies_count), 0) as post_count
FROM forum_categories c
LEFT JOIN forum_topics t ON t.category_id = c.id AND t.is_archived = FALSE
WHERE c.is_active = TRUE
GROUP BY c.id
ORDER BY c.sort_order, c.name;
```

**Implementation:** Create a database view or function:

```sql
-- Create view for forum categories with counts
CREATE OR REPLACE VIEW forum_categories_with_counts AS
SELECT 
  c.*,
  COUNT(DISTINCT t.id) FILTER (WHERE t.is_archived = FALSE) as topic_count,
  COALESCE(SUM(t.replies_count) FILTER (WHERE t.is_archived = FALSE), 0) as post_count
FROM forum_categories c
LEFT JOIN forum_topics t ON t.category_id = c.id
WHERE c.is_active = TRUE
GROUP BY c.id;
```

### Query Best Practices

1. **Select Only Needed Columns**
   ```typescript
   // ❌ BAD: Selects all columns
   .select('*')
   
   // ✅ GOOD: Select only what you need
   .select('id, name, slug, created_at')
   ```

2. **Use Pagination** (always limit results)
   ```typescript
   // ✅ Always paginate
   .range(0, 49)  // Page 1: 0-49
   .limit(50)
   ```

3. **Avoid COUNT(*) on Large Tables**
   - Use estimated counts where possible
   - Cache counts in materialized views
   - Use `count: 'exact', head: true` only when necessary

4. **Optimize JOINs**
   - Use LEFT JOIN only when you need all rows
   - Use INNER JOIN for required relationships
   - Ensure join columns are indexed

5. **Use EXPLAIN ANALYZE**
   ```sql
   -- Analyze query performance
   EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
   SELECT * FROM forum_topics WHERE category_id = 'xxx';
   ```

---

## 🔌 3. Connection Pooling

### Enable PgBouncer (Recommended)

Supabase provides PgBouncer for connection pooling. **Use the pooler connection string** instead of direct:

**In Production:**
```bash
# Direct connection (❌ Not for production)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co

# Pooled connection (✅ Use this)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co:6543
```

**Connection String Format:**
```
postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true
```

### Connection Pool Settings

Supabase Pro Plan includes:
- **Transaction mode**: Recommended for most apps
- **Session mode**: For advanced features (LISTEN/NOTIFY, prepared statements)

**Configure in Supabase Dashboard:**
1. Go to **Settings → Database**
2. Find **Connection Pooling**
3. Use **Transaction mode** for Next.js server actions
4. Use connection string with `:6543` port

### Connection Limits

| Plan | Direct Connections | Pooled Connections |
|------|-------------------|-------------------|
| Free | 60 | 200 |
| Pro | 120 | 200 |
| Team | 240 | 400 |
| Enterprise | Custom | Custom |

**Best Practice:** Always use pooled connections in production.

---

## 🔒 4. RLS Performance

### RLS Overhead

Row Level Security adds overhead to every query. Optimize with:

1. **Use Indexes on RLS Filtered Columns**
   ```sql
   -- If RLS filters by user_id, index it
   CREATE INDEX idx_builds_user_id ON builds(user_id);
   ```

2. **Avoid Complex RLS Policies**
   ```sql
   -- ❌ BAD: Complex policy with subquery
   CREATE POLICY complex_policy ON builds
   AS USING (
     EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
     OR user_id = auth.uid()
   );
   
   -- ✅ GOOD: Simple policy
   CREATE POLICY simple_policy ON builds
   AS USING (user_id = auth.uid() OR is_public = TRUE);
   ```

3. **Use Security Definer Functions**
   ```sql
   -- Create function that bypasses RLS for specific use cases
   CREATE FUNCTION get_public_builds()
   RETURNS SETOF builds
   LANGUAGE sql
   SECURITY DEFINER
   STABLE
   AS $$
     SELECT * FROM builds WHERE is_public = TRUE;
   $$;
   ```

4. **Test RLS Performance**
   ```sql
   -- Check if RLS is the bottleneck
   EXPLAIN ANALYZE SELECT * FROM builds;
   ```

---

## 💾 5. Caching Strategies

### Next.js Caching

Use Next.js built-in caching for database queries:

```typescript
// ✅ Cache for 60 seconds
export async function getEngines() {
  const supabase = await createClient();
  
  // Next.js will cache this for revalidation
  const { data } = await supabase
    .from('engines')
    .select('*')
    .eq('is_active', true);
  
  return data;
}

// In page.tsx
export const revalidate = 60; // Revalidate every 60 seconds
```

### Server-Side Caching

Use `unstable_cache` for expensive queries:

```typescript
import { unstable_cache } from 'next/cache';

export const getCachedEngines = unstable_cache(
  async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from('engines')
      .select('*')
      .eq('is_active', true);
    return data;
  },
  ['engines-list'], // Cache key
  {
    revalidate: 3600, // 1 hour
    tags: ['engines'] // For on-demand revalidation
  }
);
```

### Cache Invalidation

```typescript
import { revalidateTag } from 'next/cache';

// After updating engines
export async function updateEngine(id: string) {
  // ... update logic ...
  revalidateTag('engines'); // Invalidate cache
}
```

### Vercel Edge Caching

Use HTTP headers for static/semi-static content:

```typescript
import { headers } from 'next/headers';

export async function GET() {
  const headersList = headers();
  headersList.set(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=300'
  );
  
  // ... fetch data ...
}
```

### Redis Caching (Advanced)

For high-traffic scenarios, use Redis:
- Cache expensive queries (aggregations, forum counts)
- Cache user sessions
- Cache API responses

---

## 📊 6. Monitoring & Alerts

### Supabase Dashboard Metrics

Monitor in Supabase Dashboard:
1. **Database → Reports**
   - Query performance
   - Slow queries
   - Connection pool usage

2. **Logs → Postgres Logs**
   - Error logs
   - Slow query logs

3. **Database → Database Health**
   - CPU usage
   - Memory usage
   - Disk usage

### Query Performance Monitoring

```sql
-- Find slow queries
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

**Enable pg_stat_statements:**
```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

### Set Up Alerts

1. **Supabase Dashboard → Settings → Alerts**
   - Database CPU > 80%
   - Database memory > 85%
   - Connection pool > 80%
   - Slow queries (> 1 second)

2. **Vercel Analytics**
   - API route response times
   - Error rates
   - Traffic spikes

### Performance Monitoring Tools

- **Supabase**: Built-in metrics dashboard
- **Vercel Analytics**: Frontend/API performance
- **Sentry** (optional): Error tracking with performance monitoring
- **Postgres.ai** (optional): Query analysis

---

## ⚙️ 7. Database Configuration

### PostgreSQL Settings (Supabase Managed)

Supabase manages these, but understand their defaults:

| Setting | Default | Notes |
|---------|---------|-------|
| `shared_buffers` | 25% of RAM | Buffer pool size |
| `effective_cache_size` | 50-75% of RAM | Query planner estimate |
| `work_mem` | 4MB | Per-operation memory |
| `maintenance_work_mem` | 64MB | Maintenance operations |
| `max_connections` | Plan-dependent | See connection limits |

### Database Maintenance

Run regularly (Supabase does some automatically):

```sql
-- Analyze tables (update statistics)
ANALYZE;

-- Vacuum (reclaim space)
VACUUM ANALYZE;

-- Reindex (rebuild indexes)
REINDEX DATABASE postgres;
```

**Automatic Maintenance:**
- Supabase runs `VACUUM` and `ANALYZE` automatically
- Monitor autovacuum in dashboard

### Check Database Health

```sql
-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index bloat
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

---

## 📈 8. Scaling Strategies

### Horizontal Scaling (Read Replicas)

Supabase Pro+ includes read replicas:

1. **Create Read Replica**
   - Supabase Dashboard → Database → Read Replicas
   - Use replica connection string for read-heavy queries

2. **Split Read/Write**
   ```typescript
   // Write to primary
   const primary = createClient(SUPABASE_PRIMARY_URL);
   
   // Read from replica
   const replica = createClient(SUPABASE_REPLICA_URL);
   ```

### Vertical Scaling

Upgrade Supabase plan if hitting limits:
- **Free → Pro**: More connections, storage, compute
- **Pro → Team**: More resources, read replicas
- **Team → Enterprise**: Custom resources

### Application-Level Optimization

1. **Batch Requests**
   ```typescript
   // ❌ BAD: Multiple requests
   const engine = await getEngine(id);
   const parts = await getParts();
   const builds = await getBuilds();
   
   // ✅ GOOD: Parallel requests
   const [engine, parts, builds] = await Promise.all([
     getEngine(id),
     getParts(),
     getBuilds()
   ]);
   ```

2. **Data Prefetching**
   ```typescript
   // Prefetch on navigation
   <Link href="/engines" prefetch={true}>
   ```

3. **Lazy Loading**
   ```typescript
   // Load heavy components on demand
   const HeavyComponent = lazy(() => import('./HeavyComponent'));
   ```

4. **Pagination Everywhere**
   - Never load all records
   - Use cursor-based pagination for large datasets
   - Implement infinite scroll for better UX

---

## ✅ Performance Checklist

Before going to production:

- [ ] **Indexes**: Create missing indexes (see migration above)
- [ ] **Queries**: Fix N+1 queries (especially `getForumCategories`)
- [ ] **Connection Pooling**: Use pooled connections (`:6543` port)
- [ ] **Caching**: Implement Next.js caching for read-heavy queries
- [ ] **Pagination**: Ensure all list queries are paginated
- [ ] **Monitoring**: Set up alerts for slow queries and high usage
- [ ] **RLS**: Verify RLS policies are performant (use indexes)
- [ ] **Load Testing**: Test with realistic traffic (use tools like k6)

---

## 🧪 Load Testing

Before production, test with realistic load:

```javascript
// k6 load test example
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Spike to 200
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },   // Ramp down
  ],
};

export default function () {
  const res = http.get('https://your-app.vercel.app/api/engines');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

---

## 📚 Additional Resources

- [Supabase Performance Guide](https://supabase.com/docs/guides/platform/performance)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Next.js Caching Documentation](https://nextjs.org/docs/app/building-your-application/caching)

---

**Ready for Production!** 🚀

After implementing these optimizations, your Supabase database will be ready to handle production traffic efficiently.
