# Project Atlas — Execution Order

> **Purpose:** Define the exact sequence of agent execution, dependencies, and handoff points for multi-agent development.

---

## Execution Philosophy

Agents execute in a **dependency-driven order**. No agent begins work until its dependencies are satisfied. This document is the single source of truth for "who runs when."

### Key Principles

1. **Serial Foundation** — Core infrastructure must be sequential
2. **Parallel Features** — Independent features can run concurrently
3. **Explicit Handoffs** — Every transition is documented
4. **Gate Validation** — No phase starts until prior gate passes

---

## Dependency Graph

```
                    ┌──────────────────┐
                    │   A0: Architect  │
                    │  (This Phase)    │
                    └────────┬─────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
    ┌──────────┐      ┌──────────┐       ┌──────────┐
    │   A9:    │      │   A1:    │       │   A3:    │
    │  DevOps  │      │ Database │       │    UI    │
    │ (CI/CD)  │      │ (Schema) │       │ (Design) │
    └────┬─────┘      └────┬─────┘       └────┬─────┘
         │                 │                  │
         │            ┌────┴────┐             │
         │            │         │             │
         │            ▼         ▼             │
         │      ┌──────────┐ ┌──────────┐     │
         │      │   A2:    │ │   A4:    │     │
         │      │   Auth   │ │ Backend  │     │
         │      └────┬─────┘ └────┬─────┘     │
         │           │            │           │
         │           └─────┬──────┘           │
         │                 │                  │
         │                 ▼                  │
         │           ┌──────────┐             │
         │           │   A5:    │             │
         │           │  Admin   │◀────────────┘
         │           └────┬─────┘
         │                │
         │           ┌────┴────┐
         │           │         │
         │           ▼         ▼
         │     ┌──────────┐ ┌──────────┐
         │     │   A6:    │ │   A3:    │
         │     │ Compat.  │ │   UI     │
         │     │ Engine   │ │(Builder) │
         │     └────┬─────┘ └────┬─────┘
         │          │            │
         │          └─────┬──────┘
         │                │
         │                ▼
         │          ┌──────────┐
         │          │   A7:    │
         │          │ Content  │
         │          └────┬─────┘
         │               │
         │          ┌────┴────┐
         │          │         │
         │          ▼         ▼
         │    ┌──────────┐ ┌──────────┐
         │    │   A8:    │ │   A9:    │
         │    │   QA     │ │ DevOps   │
         │    │ (Tests)  │ │(Deploy)  │
         │    └──────────┘ └──────────┘
         │                       ▲
         └───────────────────────┘
```

---

## Execution Timeline

### Phase 0: Planning (Day 0) ✅ COMPLETE

| Order | Agent | Task | Status |
|-------|-------|------|--------|
| 0.1 | A0: Architect | Create plan.md | ✅ |
| 0.2 | A0: Architect | Create agents.md | ✅ |
| 0.3 | A0: Architect | Create repo-structure.md | ✅ |
| 0.4 | A0: Architect | Create security.md | ✅ |
| 0.5 | A0: Architect | Create execution-order.md | ✅ |

**Gate:** All planning documents exist and are approved.

---

### Phase 1: Foundation (Days 1–7)

| Order | Day | Agent | Task | Depends On | Handoff To |
|-------|-----|-------|------|------------|------------|
| 1.1 | 1 | A0: Architect | Scaffold project | — | All agents |
| 1.2 | 1 | A9: DevOps | CI/CD pipeline | 1.1 | — |
| 1.3 | 2 | A1: Database | Core schema v1 | 1.1 | A2, A4 |
| 1.4 | 3 | A1: Database | RLS policies | 1.3 | A2 |
| 1.5 | 4 | A2: Auth | Auth system | 1.3, 1.4 | A3, A5 |
| 1.6 | 5 | A3: UI | Design system | 1.1 | All UI work |
| 1.7 | 6 | A3: UI | Layout shell | 1.5, 1.6 | A5, Builder |
| 1.8 | 7 | A8: QA | Integration tests | 1.5, 1.7 | Gate 1 |

**Parallel Opportunities:**
- 1.2 (DevOps) and 1.3 (Schema) can run in parallel
- 1.6 (Design) can start independently after 1.1

**Gate 1 Requirements:**
- [ ] User can register
- [ ] User can login
- [ ] User can logout
- [ ] Session persists across page loads
- [ ] Protected routes redirect unauthenticated users
- [ ] RLS policies pass security tests
- [ ] CI/CD pipeline green

---

### Phase 2: Data Layer (Days 8–14)

| Order | Day | Agent | Task | Depends On | Handoff To |
|-------|-----|-------|------|------------|------------|
| 2.1 | 8 | A1: Database | Engine schema | Gate 1 | A4, A5 |
| 2.2 | 9 | A1: Database | Parts schema | 2.1 | A4, A5 |
| 2.3 | 10 | A1: Database | Seed data | 2.2 | A5 |
| 2.4 | 11 | A5: Admin | Admin scaffold | 1.5, 1.7 | — |
| 2.5 | 12 | A5: Admin | Engine CRUD | 2.1, 2.4 | A8 |
| 2.6 | 13 | A5: Admin | Parts CRUD | 2.2, 2.4 | A8 |
| 2.7 | 14 | A4: Backend | Validation schemas | 2.1, 2.2 | A5 |

**Parallel Opportunities:**
- 2.4 (Admin scaffold) can start on Day 11 while 2.3 (Seed) completes
- 2.5 and 2.6 can potentially overlap if different devs

**Gate 2 Requirements:**
- [ ] Engine table populated with Predator engines
- [ ] Parts table populated with sample data
- [ ] Admin can list engines
- [ ] Admin can create/edit/delete engines
- [ ] Admin can list parts
- [ ] Admin can create/edit/delete parts
- [ ] Data persists correctly
- [ ] RLS verified for admin operations

---

### Phase 3: Builder (Days 15–21)

| Order | Day | Agent | Task | Depends On | Handoff To |
|-------|-----|-------|------|------------|------------|
| 3.1 | 15 | A1: Database | Compatibility schema | Gate 2 | A6 |
| 3.2 | 16 | A6: Compatibility | Rules engine core | 3.1 | A3 |
| 3.3 | 17 | A6: Compatibility | Conflict detection | 3.2 | A3 |
| 3.4 | 18 | A3: UI | Engine pages | Gate 2 | — |
| 3.5 | 19 | A3: UI | Parts pages | Gate 2 | — |
| 3.6 | 20 | A3: UI | Build configurator | 3.2, 3.3 | A4 |
| 3.7 | 21 | A4: Backend | Save/share builds | 3.6 | A8 |

**Parallel Opportunities:**
- 3.4 and 3.5 (public pages) can run in parallel
- 3.2/3.3 (rules engine) and 3.4/3.5 (pages) can run in parallel

**Gate 3 Requirements:**
- [ ] Public engine pages display correctly
- [ ] Public parts pages display correctly
- [ ] Compatibility rules evaluate correctly
- [ ] Conflicts are detected and displayed
- [ ] Build configurator functional
- [ ] Builds save to user account
- [ ] Builds can be shared via permalink

---

### Phase 4: Polish (Days 22–30)

| Order | Day | Agent | Task | Depends On | Handoff To |
|-------|-----|-------|------|------------|------------|
| 4.1 | 22 | A1: Database | Content schema | Gate 3 | A7 |
| 4.2 | 23 | A7: Content | Guide pages | 4.1 | — |
| 4.3 | 24 | A3: UI | Search & filtering | Gate 3 | — |
| 4.4 | 25 | A3: UI | SEO optimization | 4.2, 4.3 | A9 |
| 4.5 | 26 | A9: DevOps | Performance audit | 4.4 | — |
| 4.6 | 27 | A8: QA | Security audit | Gate 3 | All agents |
| 4.7 | 28 | A4: Backend | Error handling | 4.6 | — |
| 4.8 | 29 | A9: DevOps | Staging deploy | 4.7 | A8 |
| 4.9 | 30 | A9: DevOps | Production deploy | 4.8 | — |

**Parallel Opportunities:**
- 4.2 (Content), 4.3 (Search), and 4.4 (SEO) can overlap
- 4.5 (Perf) and 4.6 (Security) can run in parallel

**Gate 4 Requirements:**
- [ ] Security audit passed (0 critical/high vulnerabilities)
- [ ] Performance budget met (LCP < 3s)
- [ ] All pages render correctly
- [ ] SEO meta tags present
- [ ] Staging environment verified
- [ ] Rollback procedure documented
- [ ] Monitoring configured

---

## Detailed Execution Steps

### Step 1.1: Project Scaffold (Day 1, A0)

**Agent:** A0: Architect  
**Duration:** 2-3 hours  
**Blockers:** None

**Actions:**
1. Initialize Next.js 14 project with App Router
2. Configure TypeScript (strict mode)
3. Install core dependencies
4. Set up Supabase project
5. Configure environment variables
6. Create folder structure per repo-structure.md
7. Initialize Git repository
8. Create initial README

**Output:**
- Working Next.js project
- Supabase project created
- Environment configured
- Git initialized

**Handoff:** All agents can now work in repo

---

### Step 1.2: CI/CD Pipeline (Day 1, A9)

**Agent:** A9: DevOps  
**Duration:** 1-2 hours  
**Blockers:** Step 1.1

**Actions:**
1. Create GitHub Actions workflow for CI
2. Configure lint/type checking
3. Configure test runner
4. Set up Vercel project
5. Configure preview deploys

**Output:**
- `.github/workflows/ci.yml`
- Vercel project linked
- Preview deploys enabled

**Handoff:** Automated checks available

---

### Step 1.3: Core Schema (Day 2, A1)

**Agent:** A1: Database  
**Duration:** 4-6 hours  
**Blockers:** Step 1.1

**Actions:**
1. Design profiles table (extends auth.users)
2. Design engines table
3. Design parts table
4. Design categories table
5. Design builds table
6. Design compatibility_rules table
7. Create Drizzle schema files
8. Generate initial migration
9. Generate TypeScript types

**Output:**
- `/src/db/schema/*.ts` files
- `/src/db/migrations/0001_*.sql`
- `/src/types/database.ts`

**Handoff:** A2 (Auth) can use profiles, A4 (Backend) has types

---

### Step 1.4: RLS Policies (Day 3, A1)

**Agent:** A1: Database  
**Duration:** 3-4 hours  
**Blockers:** Step 1.3

**Actions:**
1. Enable RLS on all tables
2. Write policies per security.md
3. Test policies with different user contexts
4. Create database roles
5. Document policy decisions

**Output:**
- RLS enabled on all tables
- Policies in migration files
- Policy test results documented

**Handoff:** A2 (Auth) can rely on RLS

---

### Step 1.5: Auth System (Day 4, A2)

**Agent:** A2: Auth  
**Duration:** 4-6 hours  
**Blockers:** Steps 1.3, 1.4

**Actions:**
1. Configure Supabase Auth
2. Create Supabase client utilities
3. Create auth middleware
4. Build register page/flow
5. Build login page/flow
6. Build logout functionality
7. Create session hook
8. Create protected route wrapper
9. Handle password reset

**Output:**
- `/src/lib/auth/*`
- `/src/app/(auth)/*`
- `/src/middleware.ts`
- `/src/hooks/use-auth.ts`

**Handoff:** A3 (UI) can use auth components, A5 (Admin) can use role checks

---

### Step 1.6: Design System (Day 5, A3)

**Agent:** A3: UI  
**Duration:** 4-6 hours  
**Blockers:** Step 1.1

**Actions:**
1. Define color tokens (dark theme, orange accent)
2. Define typography scale
3. Define spacing scale
4. Configure Tailwind CSS
5. Build Button component
6. Build Input component
7. Build Card component
8. Build Badge component
9. Document design system

**Output:**
- `/tailwind.config.ts`
- `/src/components/ui/*`
- Design tokens documented

**Handoff:** All UI agents use these primitives

---

### Step 1.7: Layout Shell (Day 6, A3)

**Agent:** A3: UI  
**Duration:** 3-4 hours  
**Blockers:** Steps 1.5, 1.6

**Actions:**
1. Create root layout
2. Build Header component
3. Build Footer component
4. Build mobile navigation
5. Add loading states
6. Add error boundaries

**Output:**
- `/src/app/layout.tsx`
- `/src/components/layout/*`

**Handoff:** A5 (Admin) can build admin layout, Builder has shell

---

### Step 1.8: Integration Tests (Day 7, A8)

**Agent:** A8: QA  
**Duration:** 2-3 hours  
**Blockers:** Steps 1.5, 1.7

**Actions:**
1. Write auth E2E tests (register, login, logout)
2. Test RLS policies with different users
3. Verify protected routes redirect
4. Run full test suite
5. Document test results

**Output:**
- `/tests/e2e/auth.spec.ts`
- Test report
- Gate 1 checklist completed

**Handoff:** Gate 1 review

---

## Handoff Templates

### Agent Start Template

When an agent begins work:

```markdown
## Agent Start: [Agent ID]

**Task:** [Brief description]
**Day:** [Day number]
**Dependencies Verified:**
- [ ] [Dependency 1] - Complete
- [ ] [Dependency 2] - Complete

**Expected Duration:** [Hours]
**Expected Output:** [Files/features]
```

### Agent Complete Template

When an agent completes work:

```markdown
## Handoff: [Agent ID] → [Next Agent(s)]

**Completed:** [What was done]
**Files Changed:**
- `path/to/file1.ts` - [Description]
- `path/to/file2.ts` - [Description]

**For Next Agent:**
- [What they need to know]
- [Where to find things]

**Verified:**
- [ ] No lint errors
- [ ] No type errors
- [ ] Tests pass
- [ ] Committed to Git
```

---

## Emergency Procedures

### If Agent Is Blocked

1. Document blocker in `/docs/blockers.md`
2. Tag blocking agent
3. Continue with parallel work if possible
4. Escalate to A0 (Architect) if >4 hours blocked

### If Critical Bug Found

1. Stop current work
2. Create issue with `critical` label
3. Owning agent addresses immediately
4. Resume after fix verified

### If Scope Change Requested

1. Document in `/docs/change-requests.md`
2. A0 (Architect) reviews impact
3. Update plan if approved
4. Communicate to all agents

---

## Execution Tracking

| Step | Status | Started | Completed | Notes |
|------|--------|---------|-----------|-------|
| 0.1-0.5 | ✅ | Day 0 | Day 0 | Planning complete |
| 1.1 | ⏳ | — | — | Ready to start |
| 1.2 | ⏳ | — | — | After 1.1 |
| 1.3 | ⏳ | — | — | After 1.1 |
| ... | ... | ... | ... | ... |

*This table is updated by each agent upon completion.*

---

*Document Version: 1.0*  
*Last Updated: Day 0*  
*Owner: A0 (Architect)*
