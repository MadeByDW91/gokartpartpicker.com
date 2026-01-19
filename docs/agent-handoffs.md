# Agent Handoff Notes

> **Document Owner**: DB Architect + Coordinator Agent (A1)  
> **Last Updated**: 2026-01-16  
> **Status**: ✅ Database schema complete and ready for integration  
> **Audit Status**: ✅ Passed — See `docs/repo-audit-report.md`

This document provides handoff notes for all agents working on GoKart Part Picker.

---

## 🔍 Audit Summary (2026-01-16)

A comprehensive audit was performed to resolve conflicts from parallel agent execution.

### Key Findings Resolved
1. **Part Categories Drift** — Frontend types updated to include all 26 DB categories
2. **Query Contract Sync** — `db-query-contract.md` aligned with actual schema
3. **Migration Guide** — Added missing migration #5 to documentation
4. **RLS Security** — All 10 tables have proper RLS, IDOR protection verified

### Remaining TODOs
- Add IDOR canary test for builds table (A8/QA)
- Implement risk tiers per compatibility-engine-design.md (A6, future)

See `docs/repo-audit-report.md` for full details.

---

## 🎯 Database Status: READY FOR INTEGRATION

The database schema has been designed and migrations created. Ready for:
- ✅ Frontend development (A3)
- ✅ Backend API development (A4)
- ✅ Authentication integration (A2)
- ✅ Admin dashboard (A5)
- ✅ Compatibility engine (A6)

### Deployment Status

| Item | Status |
|------|--------|
| Migration files | ✅ Complete (5 files) |
| Supabase credentials | ⏳ Not configured |
| Supabase CLI | ❌ Not installed |
| Database deployed | ⏳ Pending credentials |

> **See `docs/db-deployment-status.md` for deployment instructions**

### Migration Files

```
supabase/migrations/
├── 20260116000001_initial_schema.sql      # Core tables, indexes, triggers
├── 20260116000002_rls_policies.sql        # RLS policies and security
├── 20260116000003_rls_canary_tests.sql    # Security test functions
├── 20260116000004_seed_engines.sql        # Initial engine data (10 engines)
└── 20260116000005_hardening_constraints.sql # CHECK constraints, indexes
```

---

## Handoff: A1 (Database) → A2 (Auth)

### Deliverable: User Authentication Schema

**Location**: `supabase/migrations/20260116000001_initial_schema.sql`

**What's Ready**:
- `profiles` table extending `auth.users`
- Auto-creation trigger on signup
- Role-based access (`user`, `admin`, `super_admin`)
- RLS policies for profile access

**Dependencies for A2**:
- Configure Supabase Auth providers
- Set up session management
- Create login/register UI components
- Implement protected route middleware

**Schema**:
```sql
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE,
  email TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user', -- 'user' | 'admin' | 'super_admin'
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

**Auto-creation Trigger**:
When a user signs up via Supabase Auth, a profile is automatically created with:
- `id` = auth.users.id
- `username` = first part of email (before @)
- `role` = 'user' (default)

**Notes**:
- First super_admin must be promoted manually via SQL
- Role changes require super_admin privileges

---

## Handoff: A1 (Database) → A3 (UI/Frontend)

### Deliverable: Data Access Patterns

**Location**: 
- `docs/db-query-contract.md` (existing)
- `docs/db-spec.md` (updated)
- `frontend/src/types/database.ts` (existing, update needed)

**Key Integration Points**:

#### Fetching Engines (Public, No Auth)
```typescript
const { data: engines } = await supabase
  .from('engines')
  .select('*')
  .eq('is_active', true)
  .order('displacement_cc');
```

#### Fetching Parts by Category
```typescript
const { data: clutches } = await supabase
  .from('parts')
  .select('*')
  .eq('category', 'clutch')
  .eq('is_active', true);
```

#### User Builds (Requires Auth)
```typescript
const { data: builds } = await supabase
  .from('builds')
  .select(`
    *,
    engines (name, brand, horsepower)
  `)
  .eq('user_id', user.id)
  .order('updated_at', { ascending: false });
```

#### Compatibility Rules
```typescript
const { data: rules } = await supabase
  .from('compatibility_rules')
  .select('*')
  .eq('is_active', true);
```

**TypeScript Types** (update `frontend/src/types/database.ts`):
```typescript
// Add these to existing types
export type ShaftType = 'straight' | 'tapered' | 'threaded';

export interface Engine {
  id: string;
  slug: string;
  name: string;
  brand: string;
  model: string | null;
  variant: string | null;
  displacement_cc: number;
  horsepower: number;
  torque: number | null;
  shaft_diameter: number;
  shaft_length: number | null;
  shaft_type: ShaftType;
  shaft_keyway: number | null;
  mount_type: string | null;
  price: number | null;
  image_url: string | null;
  affiliate_url: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
}

export interface CompatibilityRule {
  id: string;
  rule_type: string;
  source_category: string;
  target_category: string;
  condition: Record<string, unknown>;
  warning_message: string;
  severity: 'error' | 'warning' | 'info';
  is_active: boolean;
}
```

**Notes**:
- All measurements are in INCHES (shaft_diameter, shaft_length, etc.)
- `specifications` on parts is flexible JSONB per category
- Engine images may be null - use placeholder

---

## Handoff: A1 (Database) → A4 (Backend)

### Deliverable: Server Action Patterns

**Location**: `docs/db-spec.md`

**Validation Schemas** (for Zod):
```typescript
const createBuildSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  engine_id: z.string().uuid().optional(),
  parts: z.record(z.string().uuid()).optional(),
  is_public: z.boolean().default(false)
});

const updateBuildSchema = createBuildSchema.partial();
```

**RLS Behavior**:
- Catalog tables: Public read, admin write
- User tables: Owner-only access (enforced by RLS)
- Build.parts is JSONB: `{"clutch": "uuid", "chain": "uuid"}`

**Admin Operations**:
- Must check `is_admin()` or `is_super_admin()` before catalog mutations
- All catalog changes are auto-audited via triggers

---

## Handoff: A1 (Database) → A5 (Admin)

### Deliverable: Admin Dashboard Schema

**Location**: `docs/db-spec.md`

**Required Admin Features**:

1. **Engine Management**
   - Table: `engines`
   - CRUD operations (admin)
   - Delete requires super_admin
   - Auto-generates audit log

2. **Parts Management**
   - Table: `parts`
   - Category filtering
   - Specifications JSON editor
   - Bulk operations

3. **Compatibility Rules**
   - Table: `compatibility_rules`
   - Rule builder UI
   - Condition JSON editor
   - Test rule functionality

4. **Direct Compatibility Mapping**
   - Table: `engine_part_compatibility`
   - Matrix view: engines × parts
   - Batch assign compatibility

5. **Content Management**
   - Table: `content`
   - Guide/spec/safety content
   - Markdown or rich text body
   - Publish workflow

6. **User Management** (super_admin only)
   - Table: `profiles`
   - View all users
   - Promote to admin

7. **Audit Log Viewer**
   - Table: `audit_log`
   - Filter by table, user, date
   - Show diffs (old_data vs new_data)

**Role Permissions**:
| Feature | Admin | Super Admin |
|---------|-------|-------------|
| View catalog | ✅ | ✅ |
| Edit catalog | ✅ | ✅ |
| Delete catalog | ❌ | ✅ |
| View users | ✅ | ✅ |
| Edit user roles | ❌ | ✅ |
| View audit logs | ✅ | ✅ |

---

## Handoff: A1 (Database) → A6 (Compatibility)

### Deliverable: Compatibility Engine Schema

**Location**: `supabase/migrations/20260116000001_initial_schema.sql`

**Tables**:

1. **compatibility_rules** - Deterministic rule definitions
   ```sql
   rule_type TEXT,           -- 'shaft_match', 'chain_pitch', etc.
   source_category TEXT,     -- 'engine' or part category
   target_category TEXT,     -- part category
   condition JSONB,          -- rule logic
   warning_message TEXT,     -- user-facing message
   severity TEXT             -- 'error' | 'warning' | 'info'
   ```

2. **engine_part_compatibility** - Direct mappings
   ```sql
   engine_id UUID,
   part_id UUID,
   compatibility_level TEXT,  -- 'direct_fit', 'requires_modification', 'adapter_required'
   notes TEXT
   ```

**Rule Condition Examples**:
```json
// Shaft Match Rule
{
  "rule_type": "shaft_match",
  "source_category": "engine",
  "target_category": "clutch",
  "condition": {
    "compare": "equal",
    "source_field": "shaft_diameter",
    "target_field": "specifications.bore_size"
  },
  "warning_message": "Clutch bore size must match engine shaft diameter",
  "severity": "error"
}

// Chain Pitch Rule
{
  "rule_type": "chain_pitch",
  "source_category": "sprocket",
  "target_category": "chain",
  "condition": {
    "compare": "equal",
    "source_field": "specifications.pitch",
    "target_field": "specifications.pitch"
  },
  "warning_message": "Chain pitch must match sprocket pitch",
  "severity": "error"
}
```

**Integration Notes**:
- Rules are deterministic - no AI/ML
- Frontend fetches rules and applies client-side
- Server validates on build save
- All rules must be explainable to users

---

## Handoff: A1 (Database) → A7 (Content)

### Deliverable: Content Schema

**Location**: `supabase/migrations/20260116000001_initial_schema.sql`

**Table: `content`**
```sql
slug TEXT UNIQUE,       -- URL path
title TEXT,             -- Page title
content_type TEXT,      -- 'guide', 'spec', 'safety', 'faq', 'page'
body TEXT,              -- Main content (Markdown/MDX)
excerpt TEXT,           -- Short summary
metadata JSONB,         -- SEO, tags, etc.
is_published BOOLEAN,   -- Visibility
published_at TIMESTAMPTZ
```

**Content Types**:
- `guide` - How-to guides
- `spec` - Engine/part spec sheets
- `safety` - Safety notices
- `faq` - FAQ entries
- `page` - Generic static pages

---

## For: A8 (QA) - Testing Notes

### RLS Canary Tests

Run security tests after deployment:
```sql
SELECT * FROM run_rls_canary_tests();
```

Check RLS coverage:
```sql
SELECT * FROM check_rls_coverage();
```

### Test Scenarios

1. **Anonymous Access**
   - ✅ Can read active engines
   - ✅ Can read active parts
   - ❌ Cannot read inactive items
   - ❌ Cannot read private builds
   - ❌ Cannot write to any table

2. **Authenticated User**
   - ✅ Can read active catalog
   - ✅ Can CRUD own builds
   - ❌ Cannot read other users' private builds
   - ❌ Cannot modify catalog

3. **Admin**
   - ✅ Can CRUD catalog items
   - ✅ Can read all builds
   - ✅ Can read audit logs
   - ❌ Cannot delete catalog items

4. **Super Admin**
   - ✅ Full access to everything
   - ✅ Can delete catalog items
   - ✅ Can manage user roles

---

## Setup Instructions

### 1. Run Migrations

```bash
cd supabase
supabase db push
```

### 2. Create First Super Admin

After signing up your first user:
```sql
UPDATE profiles 
SET role = 'super_admin' 
WHERE email = 'your-admin-email@example.com';
```

### 3. Verify Engines Seeded

```sql
SELECT slug, name, brand, horsepower 
FROM engines 
ORDER BY displacement_cc;
```

Expected: 10 engines (Predator 79 through Briggs 206)

---

## Known Limitations

1. **No image storage** - URLs only, integrate Supabase Storage later
2. **No full-text search** - Only basic indexes, add pg_trgm if needed
3. **No caching** - Consider Redis for high-traffic scenarios

---

## Contact

Database questions → Invoke DB Architect agent or check `docs/db-spec.md`

