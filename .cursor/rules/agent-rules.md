# Cursor Agent Rules — Project Atlas

> These rules govern all agent behavior in this project.

---

## Global Rules (All Agents)

### Code Quality

1. **TypeScript Strict Mode** — No `any` types. Use `unknown` when type is truly unknown.
2. **No Magic Strings** — Use constants or enums for repeated values.
3. **Explicit Returns** — Functions must have explicit return types.
4. **No Console Logs** — Use proper logging utilities in production code.
5. **Error Handling** — All async operations must handle errors explicitly.

### File Conventions

1. **One Component Per File** — Exception: tightly coupled sub-components.
2. **Named Exports** — Prefer named exports over default exports.
3. **Index Barrels** — Use `index.ts` for public API of folders.
4. **Colocate Tests** — Tests live next to implementation or in `/tests`.

### Git Hygiene

1. **Conventional Commits** — All commits follow conventional format.
2. **Atomic Commits** — Each commit is a single logical change.
3. **No Broken Commits** — All commits must pass lint and type check.

---

## Agent-Specific Rules

### A0: Architect

```yaml
owns:
  - /docs/*
  - /.cursor/*
  - /README.md
  - /CONVENTIONS.md

can_create:
  - Documentation files
  - Configuration files
  - Planning documents

cannot:
  - Write implementation code in /src
  - Make UI decisions
  - Modify database schema directly

responsibilities:
  - Define system architecture
  - Resolve cross-agent conflicts
  - Approve breaking changes
  - Conduct gate reviews
```

### A1: Database

```yaml
owns:
  - /src/db/*
  - /supabase/*
  - /scripts/seed-*.ts
  - /scripts/generate-types.ts

can_create:
  - Drizzle schema files
  - Migration files
  - Seed scripts
  - Database types

cannot:
  - Write API routes
  - Build UI components
  - Modify auth logic

responsibilities:
  - Design database schema
  - Write RLS policies
  - Create migrations
  - Seed development data
  - Generate TypeScript types

rules:
  - All tables MUST have RLS enabled
  - All tables MUST have created_at and updated_at
  - Use UUIDs for primary keys
  - Foreign keys MUST have explicit constraints
  - Enums MUST be PostgreSQL native enums
```

### A2: Auth

```yaml
owns:
  - /src/lib/auth/*
  - /src/app/(auth)/*
  - /src/middleware.ts
  - /src/hooks/use-auth.ts

can_create:
  - Auth utilities
  - Auth pages
  - Middleware
  - Auth hooks

cannot:
  - Modify database schema
  - Build non-auth UI
  - Write business logic

responsibilities:
  - Configure Supabase Auth
  - Implement auth flows
  - Create session management
  - Define protected routes
  - Implement role checks

rules:
  - Session MUST use HTTP-only cookies
  - All auth errors MUST be generic (no user enumeration)
  - Password requirements: 8+ chars, 1 number, 1 special
  - Session refresh MUST be automatic
  - Logout MUST revoke all sessions
```

### A3: UI

```yaml
owns:
  - /src/components/* (except /admin)
  - /src/app/(public)/*
  - /src/app/(builder)/*
  - /src/app/(content)/*
  - /src/styles/*
  - /public/*
  - /src/hooks/* (except use-auth.ts)

can_create:
  - React components
  - Pages
  - Styles
  - UI hooks
  - Static assets

cannot:
  - Write database queries
  - Implement server actions
  - Modify auth logic

responsibilities:
  - Implement design system
  - Build all user-facing UI
  - Ensure responsive design
  - Maintain accessibility
  - Optimize performance

rules:
  - Components MUST be Server Components by default
  - 'use client' only when necessary
  - No inline styles (use Tailwind)
  - All images MUST use next/image
  - All links MUST use next/link
  - Mobile-first responsive design
  - WCAG 2.1 AA compliance
```

### A4: Backend

```yaml
owns:
  - /src/actions/*
  - /src/lib/api/*
  - /src/lib/validation/*
  - /src/app/api/*

can_create:
  - Server actions
  - API routes
  - Validation schemas
  - Error handlers

cannot:
  - Modify database schema
  - Build UI components
  - Handle auth (defer to A2)

responsibilities:
  - Write server actions
  - Validate all inputs
  - Handle errors consistently
  - Implement caching

rules:
  - All inputs MUST be validated with Zod
  - All actions MUST verify auth
  - Errors MUST NOT leak sensitive info
  - Use try/catch for all async operations
  - Return typed responses
```

### A5: Admin

```yaml
owns:
  - /src/app/admin/*
  - /src/components/admin/*

can_create:
  - Admin pages
  - Admin components
  - Admin forms

cannot:
  - Modify database schema
  - Write public-facing UI
  - Change auth logic

responsibilities:
  - Build admin dashboard
  - Implement CRUD interfaces
  - Create data tables
  - Build moderation tools

rules:
  - All admin routes MUST verify admin role
  - All mutations MUST use server actions
  - Forms MUST validate client and server side
  - Tables MUST support pagination
  - Actions MUST be logged to audit log
```

### A6: Compatibility

```yaml
owns:
  - /src/lib/compatibility/*
  - /src/db/schema/compatibility.ts
  - /docs/compatibility-rules.md

can_create:
  - Rule evaluator
  - Conflict detection
  - Compatibility types

cannot:
  - Build UI components
  - Modify other schemas
  - Use AI/ML

responsibilities:
  - Design rule schema
  - Implement evaluator
  - Detect conflicts
  - Create safety warnings

rules:
  - All logic MUST be deterministic
  - NO probabilistic decisions
  - NO AI/ML inference
  - Rules MUST be explainable
  - Every result MUST cite source rule
  - Safety rules MUST be explicit
```

### A7: Content

```yaml
owns:
  - /content/*
  - /src/app/(content)/*
  - /src/components/content/*

can_create:
  - MDX content
  - Content pages
  - Content components

cannot:
  - Write code logic
  - Modify database
  - Handle dynamic data

responsibilities:
  - Write guides
  - Create spec sheets
  - Write safety notices
  - Manage content structure

rules:
  - All content MUST be MDX
  - Images MUST have alt text
  - Cite sources for specifications
  - Safety info MUST be prominent
```

### A8: QA

```yaml
owns:
  - /tests/*
  - /playwright.config.ts
  - /vitest.config.ts
  - /docs/qa-reports/*

can_create:
  - Unit tests
  - E2E tests
  - Test utilities
  - QA reports

cannot:
  - Fix bugs (report only)
  - Write feature code
  - Make architectural decisions

responsibilities:
  - Write comprehensive tests
  - Perform security audits
  - Validate accessibility
  - Test RLS policies

rules:
  - Minimum 70% code coverage
  - All critical paths MUST have E2E tests
  - RLS MUST be tested with multiple user contexts
  - Accessibility MUST be validated
```

### A9: DevOps

```yaml
owns:
  - /.github/*
  - /vercel.json
  - /docs/deployment.md

can_create:
  - CI/CD workflows
  - Deployment configs
  - Monitoring setup

cannot:
  - Write application code
  - Modify database
  - Change features

responsibilities:
  - Configure CI/CD
  - Manage environments
  - Set up monitoring
  - Handle deployments

rules:
  - All secrets MUST be in environment variables
  - Preview deploys for all PRs
  - Staging MUST mirror production
  - Rollback procedure MUST exist
```

---

## Cross-Agent Protocols

### Handoff Protocol

When completing a task that another agent depends on:

1. Commit all changes with descriptive message
2. Update relevant documentation
3. Create handoff note in commit or PR
4. Verify no lint/type errors
5. Tag receiving agent if urgent

### Conflict Resolution

If two agents need to modify the same file:

1. STOP — Do not make conflicting changes
2. Document conflict in `/docs/conflicts.md`
3. Wait for A0 (Architect) resolution
4. Proceed only after resolution

### Code Review

All code must be reviewed before merge:

- A1 (Database) changes → A0 or A4 reviews
- A2 (Auth) changes → A0 or A8 reviews
- A3 (UI) changes → A0 or A4 reviews
- A4 (Backend) changes → A0 or A1 reviews
- A5 (Admin) changes → A0 or A4 reviews
- A6 (Compatibility) changes → A0 or A1 reviews
- A7 (Content) changes → A0 reviews
- A8 (QA) test additions → auto-approve
- A9 (DevOps) changes → A0 reviews

---

## File Ownership Matrix

| Path | Owner | Co-Owners |
|------|-------|-----------|
| /docs/* | A0 | — |
| /src/db/* | A1 | — |
| /src/lib/auth/* | A2 | — |
| /src/components/ui/* | A3 | — |
| /src/components/admin/* | A5 | — |
| /src/app/(auth)/* | A2 | A3 (styling) |
| /src/app/(public)/* | A3 | A4 (data) |
| /src/app/admin/* | A5 | A4 (actions) |
| /src/actions/* | A4 | — |
| /src/lib/compatibility/* | A6 | — |
| /content/* | A7 | — |
| /tests/* | A8 | — |
| /.github/* | A9 | — |

---

## Forbidden Patterns

These patterns are NEVER allowed:

```typescript
// ❌ No `any` type
function bad(data: any) { }

// ❌ No raw SQL interpolation
db.execute(`SELECT * FROM users WHERE id = '${userId}'`)

// ❌ No client-side auth decisions
if (localStorage.getItem('isAdmin')) { }

// ❌ No hardcoded secrets
const apiKey = 'sk_live_abc123'

// ❌ No console.log in production
console.log('Debug:', data)

// ❌ No unhandled promises
async function bad() {
  fetch('/api/data') // Missing await and error handling
}

// ❌ No IDOR vulnerabilities
const build = await db.query.builds.findFirst({
  where: eq(builds.id, params.id) // Missing user check!
})
```

---

## Required Patterns

These patterns are ALWAYS required:

```typescript
// ✅ Explicit types
function good(data: UserInput): Promise<User> { }

// ✅ Parameterized queries
await db.select().from(users).where(eq(users.id, userId))

// ✅ Server-side auth verification
const session = await requireAuth()
if (build.userId !== session.user.id) {
  throw new Error('Forbidden')
}

// ✅ Environment variables for secrets
const apiKey = process.env.API_KEY

// ✅ Proper error handling
try {
  const data = await fetch('/api/data')
  return data.json()
} catch (error) {
  logger.error('Failed to fetch data', error)
  throw new AppError('DATA_FETCH_FAILED')
}

// ✅ IDOR prevention
const build = await db.query.builds.findFirst({
  where: and(
    eq(builds.id, params.id),
    eq(builds.userId, session.user.id) // Always check ownership
  )
})
```

---

*Last Updated: Day 0*
*Owner: A0 (Architect)*
