# Fix Seed Data Issues

## Problem
Seed migrations run but no data appears in the database.

## Root Cause
The seed migrations use `ON CONFLICT (slug) DO NOTHING`, which silently fails if:
1. Records already exist (expected behavior)
2. Inserts fail due to RLS policies or constraints (unexpected - errors are hidden)

## Solution: Run Diagnostic First

### Step 1: Run Diagnostic Queries
Open Supabase SQL Editor and run `DIAGNOSE-SEED-ISSUES.sql` to check:
- If tables have any data (including inactive)
- If part_categories exist
- If RLS policies are blocking inserts
- If there are constraint violations

### Step 2: Test Simple Insert
Run `TEST-SEED-INSERT.sql` to verify:
- Basic inserts work
- RLS policies allow inserts
- Foreign key relationships work

### Step 3: Check for Errors
When running seed migrations, look for:
- **"Success. No rows returned"** = Insert succeeded (or conflict, so nothing inserted)
- **Error messages** = Something is wrong (RLS, constraints, missing data)

## Common Issues

### Issue 1: RLS Policies Blocking Inserts
**Symptom:** Inserts fail silently, no error shown
**Fix:** Run seeds with service role key, or temporarily disable RLS:
```sql
-- Check current role
SELECT current_user, session_user;

-- If not service_role, you need to use service role key in connection
```

### Issue 2: Missing part_categories
**Symptom:** Parts seed fails because category lookups return NULL
**Fix:** Ensure initial schema migration ran first:
```sql
SELECT COUNT(*) FROM part_categories;
-- Should return > 0
```

### Issue 3: Records Already Exist but is_active = false
**Symptom:** Records exist but don't show up in queries
**Fix:** Check and update:
```sql
-- Check inactive records
SELECT COUNT(*) FROM engines WHERE is_active = false;
SELECT COUNT(*) FROM parts WHERE is_active = false;

-- If you want to reactivate them:
UPDATE engines SET is_active = true WHERE slug = 'predator-212-hemi';
```

### Issue 4: Foreign Key Constraints
**Symptom:** Parts fail to insert because category_id is NULL
**Fix:** Ensure part_categories exist:
```sql
-- Verify categories exist
SELECT slug, name FROM part_categories WHERE is_active = true;

-- If missing, run the part_categories seed from initial_schema.sql
```

## Recommended Fix: Use Service Role

The seed migrations should be run with the **service role key** (not anon key) to bypass RLS:

1. In Supabase Dashboard → Settings → API
2. Copy the **service_role** key (not anon key)
3. Use it in your connection string or SQL Editor

Or run seeds directly in SQL Editor (which uses your admin role).

## Alternative: Force Insert with UPDATE

If records exist but `is_active = false`, change the seed files to:
```sql
ON CONFLICT (slug) DO UPDATE SET is_active = true
```

This will reactivate existing records.
