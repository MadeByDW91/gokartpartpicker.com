# Database Deployment Status

> **Owner**: DB Architect + Coordinator Agent (A1)  
> **Last Updated**: 2026-01-16  
> **Status**: ⏳ Awaiting Supabase Credentials

---

## Current Status

### Migration Files: ✅ Complete

| Migration | Description | Status |
|-----------|-------------|--------|
| `20260116000001_initial_schema.sql` | Core tables, indexes, triggers | ✅ Ready |
| `20260116000002_rls_policies.sql` | RLS policies, audit triggers | ✅ Ready |
| `20260116000003_rls_canary_tests.sql` | Security test functions | ✅ Ready |
| `20260116000004_seed_engines.sql` | 10 seeded engines | ✅ Ready |
| `20260116000005_hardening_constraints.sql` | CHECK constraints, indexes | ✅ Ready |

### Supabase Configuration: ⏳ Pending

**Required Environment Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=<not configured>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<not configured>
SUPABASE_SERVICE_ROLE_KEY=<not configured>
```

**Current State:**
- ❌ Supabase CLI not installed
- ❌ No `.env.local` file found
- ✅ Mock client in place for development without Supabase

---

## Deployment Options

### Option 1: Supabase Cloud (Recommended for Production)

1. **Create Supabase Project**
   - Go to [supabase.com/dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Note your project URL and keys

2. **Configure Environment**
   ```bash
   cd frontend
   
   # Create .env.local file
   cat > .env.local << EOF
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   EOF
   ```

3. **Run Migrations**
   - Go to Supabase Dashboard → SQL Editor
   - Run each migration file in order:
     1. `20260116000001_initial_schema.sql`
     2. `20260116000002_rls_policies.sql`
     3. `20260116000003_rls_canary_tests.sql`
     4. `20260116000004_seed_engines.sql`
     5. `20260116000005_hardening_constraints.sql`

4. **Verify Deployment**
   ```sql
   -- Check tables exist
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   
   -- Check engines seeded
   SELECT slug, name, brand FROM engines;
   
   -- Run canary tests
   SELECT * FROM run_rls_canary_tests();
   ```

5. **Create First Admin**
   ```sql
   -- After signing up, promote to super_admin
   UPDATE profiles 
   SET role = 'super_admin' 
   WHERE email = 'your-admin-email@example.com';
   ```

---

### Option 2: Supabase Local Development

1. **Install Supabase CLI**
   ```bash
   # macOS
   brew install supabase/tap/supabase
   
   # or via npm
   npm install -g supabase
   ```

2. **Start Local Supabase**
   ```bash
   cd /path/to/gokartpartpicker.com
   supabase init  # if not already done
   supabase start
   ```

3. **Note the Output**
   ```
   API URL: http://127.0.0.1:54321
   anon key: eyJhbG...
   service_role key: eyJhbG...
   ```

4. **Configure Environment**
   ```bash
   cd frontend
   cat > .env.local << EOF
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-from-output>
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key-from-output>
   EOF
   ```

5. **Apply Migrations**
   ```bash
   cd /path/to/gokartpartpicker.com
   supabase db push
   ```

---

## Verification Checklist

After deployment, verify:

### 1. Tables Created
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected Tables (10):**
- `audit_log`
- `build_likes`
- `builds`
- `compatibility_rules`
- `content`
- `engine_part_compatibility`
- `engines`
- `part_categories`
- `parts`
- `profiles`

### 2. Engines Seeded
```sql
SELECT slug, name, brand, horsepower 
FROM engines 
ORDER BY displacement_cc;
```

**Expected: 10 engines**

### 3. RLS Enabled
```sql
SELECT * FROM check_rls_coverage();
```

**Expected: All tables show `rls_enabled = true`**

### 4. Canary Tests Pass
```sql
SELECT * FROM run_rls_canary_tests();
```

**Expected: All tests `passed = true`**

### 5. Part Categories Seeded
```sql
SELECT COUNT(*) FROM part_categories;
```

**Expected: 26 categories**

---

## Troubleshooting

### "relation does not exist"
Migrations haven't run. Run them in order starting with `20260116000001`.

### "permission denied"
RLS is blocking access. Check:
- User is authenticated
- User has correct role for operation
- Policy exists for the operation

### Canary tests fail
Check the specific test message. Common issues:
- Tables don't have RLS enabled
- Policies not created
- Missing helper functions

### Connection refused
- Check Supabase URL is correct
- For local: ensure `supabase start` is running
- For cloud: check project is active

---

## Next Steps After Deployment

1. **Verify in browser**: Start Next.js dev server and check console for Supabase connection
2. **Test auth**: Sign up a test user and verify profile creation
3. **Test catalog**: Verify engines display on frontend
4. **Promote admin**: Use SQL to set first super_admin

---

## Contact

Database deployment issues → Invoke DB Architect agent (A1)

