# Project Atlas — Security & Multi-User Strategy

> **Purpose:** Define the security architecture, authentication model, authorization rules, and data isolation strategy for the platform.

---

## Security Philosophy

### Core Principles

1. **Defense in Depth** — Multiple layers of security, never rely on a single control
2. **Least Privilege** — Users and services get minimum required access
3. **Secure by Default** — All new resources are locked down until explicitly opened
4. **Fail Closed** — On error, deny access rather than grant it
5. **Audit Everything** — Log security-relevant actions
6. **No IDOR** — Every data access validates ownership/permission

### Non-Negotiables

- ✅ RLS on every table with user data
- ✅ Server-side validation for all mutations
- ✅ No client-side trust (re-validate everything)
- ✅ Parameterized queries (Drizzle handles this)
- ✅ HTTPS everywhere
- ✅ Secure session handling
- ❌ No raw SQL string interpolation
- ❌ No exposing internal IDs without validation
- ❌ No trusting JWT claims without server verification

---

## Authentication Model

### Provider: Supabase Auth

Using Supabase Auth for:
- Email/password authentication
- Session management
- Password reset flow
- Future: OAuth providers (v1.1)

### Auth Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Browser   │───▶│  Supabase   │───▶│  Database   │
│             │◀───│    Auth     │◀───│   (RLS)     │
└─────────────┘    └─────────────┘    └─────────────┘
      │                   │
      │    JWT Token      │
      │◀──────────────────│
      │                   │
      ▼                   ▼
┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │
│   State     │    │   Actions   │
└─────────────┘    └─────────────┘
```

### Session Strategy

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Token storage | HTTP-only cookie | XSS protection |
| Token lifetime | 1 hour (access) | Balance security/UX |
| Refresh token | 7 days | Reasonable session length |
| Session refresh | Automatic | Seamless UX |
| Logout | Revoke + clear cookie | Complete invalidation |

### Auth Implementation

```typescript
// src/lib/auth/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function getSession() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          cookieStore.set(name, value, options)
        },
        remove(name, options) {
          cookieStore.set(name, '', options)
        },
      },
    }
  )
  
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session) {
    return null
  }
  
  return session
}

export async function requireAuth() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  return session
}

export async function requireAdmin() {
  const session = await requireAuth()
  
  // Fetch user profile to check role
  const supabase = createServerClient(...)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()
    
  if (profile?.role !== 'admin') {
    redirect('/')
  }
  
  return session
}
```

---

## Authorization Model

### Role Hierarchy

```
┌────────────────────────────────────────────┐
│                  super_admin               │
│    (Full system access, RLS bypass)        │
├────────────────────────────────────────────┤
│                    admin                   │
│    (Manage content, users, data)           │
├────────────────────────────────────────────┤
│                    user                    │
│    (Create builds, save preferences)       │
├────────────────────────────────────────────┤
│                  anonymous                 │
│    (Read public data only)                 │
└────────────────────────────────────────────┘
```

### Role Definitions

| Role | Can Read | Can Write | Can Delete | Can Admin |
|------|----------|-----------|------------|-----------|
| anonymous | Public content | — | — | — |
| user | Public + own data | Own builds, preferences | Own data | — |
| admin | All data | All content, users | Content | User management |
| super_admin | Everything | Everything | Everything | System config |

### Permission Matrix

| Resource | anonymous | user | admin | super_admin |
|----------|-----------|------|-------|-------------|
| engines | read | read | read, write, delete | * |
| parts | read | read | read, write, delete | * |
| categories | read | read | read, write, delete | * |
| builds | — | own only | all | * |
| profiles | — | own only | read all | * |
| compatibility_rules | read | read | read, write, delete | * |
| content | read | read | read, write, delete | * |
| audit_logs | — | — | read | * |
| system_config | — | — | — | * |

---

## Row Level Security (RLS)

### RLS Philosophy

Every table MUST have RLS enabled. The default policy is DENY ALL.

Policies follow this pattern:
1. Define what the policy allows (SELECT, INSERT, UPDATE, DELETE)
2. Define who it applies to (role or condition)
3. Define the condition (USING clause for reads, WITH CHECK for writes)

### Policy Templates

#### Public Read Data

```sql
-- Any authenticated or anonymous user can read
CREATE POLICY "Public read access"
ON engines
FOR SELECT
TO public
USING (true);
```

#### User-Owned Data

```sql
-- Users can only see their own builds
CREATE POLICY "Users can view own builds"
ON builds
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create builds for themselves
CREATE POLICY "Users can create own builds"
ON builds
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own builds
CREATE POLICY "Users can update own builds"
ON builds
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own builds
CREATE POLICY "Users can delete own builds"
ON builds
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

#### Admin Access

```sql
-- Admins can manage all engines
CREATE POLICY "Admins can manage engines"
ON engines
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);
```

### Complete RLS Schema

```sql
-- ============================================
-- PROFILES TABLE
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role IN ('admin', 'super_admin')
  )
);

-- ============================================
-- ENGINES TABLE
-- ============================================

ALTER TABLE engines ENABLE ROW LEVEL SECURITY;

-- Anyone can read engines
CREATE POLICY "Public engine read"
ON engines FOR SELECT
TO public
USING (true);

-- Admins can manage engines
CREATE POLICY "Admin engine management"
ON engines FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- ============================================
-- PARTS TABLE
-- ============================================

ALTER TABLE parts ENABLE ROW LEVEL SECURITY;

-- Anyone can read parts
CREATE POLICY "Public part read"
ON parts FOR SELECT
TO public
USING (true);

-- Admins can manage parts
CREATE POLICY "Admin part management"
ON parts FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- ============================================
-- BUILDS TABLE
-- ============================================

ALTER TABLE builds ENABLE ROW LEVEL SECURITY;

-- Users see only their builds
CREATE POLICY "User build read"
ON builds FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users create for themselves
CREATE POLICY "User build create"
ON builds FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users update their builds
CREATE POLICY "User build update"
ON builds FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users delete their builds
CREATE POLICY "User build delete"
ON builds FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Public builds can be read by anyone (for sharing)
CREATE POLICY "Public build read"
ON builds FOR SELECT
TO public
USING (is_public = true);

-- Admins can view all builds
CREATE POLICY "Admin build read"
ON builds FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- ============================================
-- COMPATIBILITY_RULES TABLE
-- ============================================

ALTER TABLE compatibility_rules ENABLE ROW LEVEL SECURITY;

-- Anyone can read rules
CREATE POLICY "Public rule read"
ON compatibility_rules FOR SELECT
TO public
USING (true);

-- Admins can manage rules
CREATE POLICY "Admin rule management"
ON compatibility_rules FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);
```

---

## Tenant Model

### Single-Tenant Design (MVP)

For v1.0, Project Atlas is a **single-tenant** application:
- One database instance
- One set of engines/parts
- Users share the same catalog
- Users have isolated builds

### Data Isolation

| Data Type | Isolation Level | Implementation |
|-----------|-----------------|----------------|
| User profiles | Per-user | RLS (user_id = auth.uid()) |
| Builds | Per-user | RLS (user_id = auth.uid()) |
| Engines | Shared (public) | RLS (public read) |
| Parts | Shared (public) | RLS (public read) |
| Rules | Shared (public) | RLS (public read) |
| Content | Shared (public) | RLS (public read) |

### Future Multi-Tenant (v2.0+)

If needed, the schema supports future multi-tenancy:

```sql
-- Add tenant_id to relevant tables
ALTER TABLE builds ADD COLUMN tenant_id UUID REFERENCES tenants(id);

-- Update RLS policies
CREATE POLICY "Tenant isolation"
ON builds FOR ALL
USING (
  tenant_id = (
    SELECT tenant_id FROM profiles
    WHERE id = auth.uid()
  )
);
```

---

## Admin Access Rules

### Admin Role Assignment

Admins are assigned manually via:
1. Direct database update (super_admin only)
2. Admin panel user management (admin+)

```sql
-- Assign admin role (run as super_admin)
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@example.com';
```

### Admin Route Protection

```typescript
// src/app/admin/layout.tsx
import { requireAdmin } from '@/lib/auth/server'

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  // This will redirect non-admins
  await requireAdmin()
  
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main>{children}</main>
    </div>
  )
}
```

### Admin Action Validation

```typescript
// src/actions/admin/engines.ts
'use server'

import { requireAdmin } from '@/lib/auth/server'
import { engineSchema } from '@/lib/validation/engines'
import { db } from '@/db'
import { engines } from '@/db/schema'

export async function createEngine(formData: FormData) {
  // Verify admin access
  await requireAdmin()
  
  // Validate input
  const data = engineSchema.parse(Object.fromEntries(formData))
  
  // Create with audit
  const [engine] = await db.insert(engines).values({
    ...data,
    created_by: session.user.id,
    created_at: new Date(),
  }).returning()
  
  // Log action
  await logAdminAction('engine.create', engine.id, session.user.id)
  
  return engine
}
```

---

## Security Controls

### Input Validation

All user input is validated with Zod:

```typescript
// src/lib/validation/engines.ts
import { z } from 'zod'

export const engineSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/).max(100),
  brand: z.string().min(1).max(50),
  model: z.string().min(1).max(50),
  displacement_cc: z.number().int().positive().max(1000),
  horsepower: z.number().positive().max(50),
  shaft_diameter_mm: z.number().positive(),
  shaft_length_mm: z.number().positive(),
  description: z.string().max(5000).optional(),
})

export type EngineInput = z.infer<typeof engineSchema>
```

### SQL Injection Prevention

Drizzle ORM uses parameterized queries:

```typescript
// SAFE - parameterized
const result = await db
  .select()
  .from(engines)
  .where(eq(engines.slug, userInput))

// NEVER DO THIS
const result = await db.execute(
  `SELECT * FROM engines WHERE slug = '${userInput}'` // UNSAFE!
)
```

### XSS Prevention

1. React escapes output by default
2. No `dangerouslySetInnerHTML` without sanitization
3. Content Security Policy headers
4. HTTP-only cookies for sessions

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co",
    ].join('; ')
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
]
```

### CSRF Protection

Server actions include automatic CSRF protection via Next.js.

### Rate Limiting

```typescript
// src/middleware.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return new Response('Too Many Requests', { status: 429 })
  }
  
  // Continue...
}
```

---

## Audit Logging

### What to Log

| Event | Data Captured |
|-------|---------------|
| User login | user_id, timestamp, ip, user_agent |
| User logout | user_id, timestamp |
| Failed login | email, timestamp, ip, reason |
| Password change | user_id, timestamp |
| Admin action | user_id, action, target, timestamp, changes |
| Data export | user_id, timestamp, data_type |
| Permission change | actor_id, target_id, old_role, new_role |

### Audit Log Schema

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  
  -- RLS: Only admins can read
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin audit read"
ON audit_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- No one can modify audit logs (append-only)
CREATE POLICY "No audit modification"
ON audit_logs FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "No audit deletion"
ON audit_logs FOR DELETE
TO authenticated
USING (false);
```

---

## Security Checklist

### Pre-Launch

- [ ] RLS enabled on all tables
- [ ] RLS policies tested with each role
- [ ] No raw SQL with string interpolation
- [ ] All mutations validate server-side
- [ ] Admin routes require admin role
- [ ] Passwords meet complexity requirements
- [ ] Session cookies are HTTP-only
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Audit logging functional
- [ ] No secrets in client bundle
- [ ] Environment variables secured
- [ ] Error messages don't leak info
- [ ] Dependencies audited (npm audit)

### Ongoing

- [ ] Monthly dependency updates
- [ ] Quarterly security review
- [ ] Monitor for Supabase security advisories
- [ ] Review audit logs for anomalies
- [ ] Test RLS after schema changes

---

## Incident Response

### If Breach Suspected

1. **Contain** — Revoke affected sessions
2. **Assess** — Check audit logs for scope
3. **Notify** — Inform affected users if required
4. **Remediate** — Patch vulnerability
5. **Review** — Post-incident analysis

### Emergency Contacts

| Role | Action |
|------|--------|
| Lead Developer | Assess and patch |
| Supabase Support | Platform issues |
| Legal | Breach notification |

---

*Document Version: 1.0*  
*Last Updated: Day 0*  
*Owner: A0 (Architect), A2 (Auth)*
