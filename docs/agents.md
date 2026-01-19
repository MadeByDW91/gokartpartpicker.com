# Project Atlas — Agent Map & Responsibilities

> **Purpose:** Define all agents, their responsibilities, ownership boundaries, and execution order for multi-agent development in Cursor.

---

## Agent Philosophy

Each agent is a specialized executor with:
- **Clear ownership** — No overlapping responsibilities
- **Defined interfaces** — Explicit inputs/outputs
- **Handoff protocols** — How work transfers between agents
- **Quality gates** — What "done" means for each agent

Agents do NOT make architectural decisions. They execute within the boundaries defined by the Architect.

---

## Agent Registry

| Agent ID | Name | Primary Focus | Execution Phase |
|----------|------|---------------|-----------------|
| A0 | Architect | System design, coordination | Phase 0 (Planning) |
| A1 | Database | Schema, migrations, RLS | Phase 1 (Foundation) |
| A2 | Auth | Authentication, authorization | Phase 1 (Foundation) |
| A3 | UI | Components, pages, styling | Phase 2+ (Ongoing) |
| A4 | Backend | APIs, server actions, validation | Phase 2+ (Ongoing) |
| A5 | Admin | Admin dashboard, CRUD interfaces | Phase 2 (Data Layer) |
| A6 | Compatibility | Rules engine, conflict detection | Phase 3 (Builder) |
| A7 | Content | Guides, docs, static content | Phase 4 (Polish) |
| A8 | QA | Testing, validation, audits | All Phases |
| A9 | DevOps | CI/CD, deployment, monitoring | Phase 1 & 4 |

---

## Agent Detailed Specifications

### A0: Architect Agent

**Role:** Lead system design, define standards, coordinate agents, resolve conflicts.

**Responsibilities:**
- Define technology stack
- Design system architecture
- Create folder structure
- Establish coding conventions
- Write interface contracts
- Resolve cross-agent conflicts
- Approve schema changes
- Gate reviews

**Ownership:**
- `/docs/*` — All documentation
- `/docs/architecture/*` — Architecture decisions
- `/.cursor/*` — Cursor agent rules
- `/README.md` — Project readme
- `/CONVENTIONS.md` — Coding standards

**Inputs:** Project requirements, stakeholder feedback
**Outputs:** Plans, specs, decisions, agent instructions

**Does NOT:**
- Write implementation code
- Make UI decisions
- Define business logic details

---

### A1: Database Agent

**Role:** Design and implement all database structures, migrations, and security policies.

**Responsibilities:**
- Design database schema
- Write Drizzle schema files
- Create and run migrations
- Define RLS policies
- Create database functions
- Seed development data
- Generate TypeScript types
- Optimize queries

**Ownership:**
- `/src/db/*` — All database code
- `/src/db/schema/*` — Schema definitions
- `/src/db/migrations/*` — Migration files
- `/src/db/seed/*` — Seed data
- `/supabase/*` — Supabase config

**Inputs:** Data requirements from Architect
**Outputs:** Schema files, types, seed scripts

**Handoff To:**
- A2 (Auth) — User schema ready
- A4 (Backend) — Types exported
- A5 (Admin) — CRUD interfaces defined

**Does NOT:**
- Write API routes
- Design UI components
- Handle business logic

---

### A2: Auth Agent

**Role:** Implement all authentication and authorization flows.

**Responsibilities:**
- Configure Supabase Auth
- Build login/register flows
- Implement session management
- Create auth middleware
- Define protected routes
- Handle password reset
- Manage user profiles
- Implement role-based access

**Ownership:**
- `/src/lib/auth/*` — Auth utilities
- `/src/app/(auth)/*` — Auth pages
- `/src/middleware.ts` — Route protection
- `/src/hooks/useAuth.ts` — Auth hook

**Inputs:** User schema from A1, route structure from A0
**Outputs:** Auth context, session utilities, protected wrappers

**Handoff To:**
- A3 (UI) — Auth components ready
- A5 (Admin) — Admin role defined

**Does NOT:**
- Design auth UI styling
- Define database schema
- Handle non-auth API logic

---

### A3: UI Agent

**Role:** Build all user-facing components, pages, and visual styling.

**Responsibilities:**
- Implement design system
- Build primitive components
- Create page layouts
- Implement responsive design
- Handle client-side state
- Build forms and validation UI
- Ensure accessibility (a11y)
- Optimize images and assets

**Ownership:**
- `/src/components/*` — All components
- `/src/app/(public)/*` — Public pages
- `/src/app/(builder)/*` — Builder pages
- `/src/styles/*` — Global styles
- `/src/hooks/*` — UI hooks (except useAuth)
- `/public/*` — Static assets

**Inputs:** Design tokens from A0, data types from A1, APIs from A4
**Outputs:** React components, pages, hooks

**Handoff To:**
- A8 (QA) — Components ready for testing

**Does NOT:**
- Write database queries
- Implement server logic
- Define API contracts

---

### A4: Backend Agent

**Role:** Implement all server-side logic, APIs, and data validation.

**Responsibilities:**
- Write server actions
- Create API routes (if needed)
- Implement Zod validation schemas
- Handle errors consistently
- Write data access functions
- Implement caching strategies
- Handle file uploads
- Rate limiting

**Ownership:**
- `/src/actions/*` — Server actions
- `/src/lib/api/*` — API utilities
- `/src/lib/validation/*` — Zod schemas
- `/src/app/api/*` — API routes

**Inputs:** Schema from A1, requirements from A0
**Outputs:** Server actions, validation schemas, typed responses

**Handoff To:**
- A3 (UI) — APIs ready for consumption
- A5 (Admin) — Admin actions ready

**Does NOT:**
- Design database schema
- Build UI components
- Handle auth (defer to A2)

---

### A5: Admin Agent

**Role:** Build the admin dashboard and all administrative interfaces.

**Responsibilities:**
- Create admin layout
- Build CRUD interfaces
- Implement data tables
- Create forms for data entry
- Handle bulk operations
- Build moderation tools
- Implement admin search
- Create audit logs

**Ownership:**
- `/src/app/admin/*` — Admin routes
- `/src/components/admin/*` — Admin components

**Inputs:** Schema from A1, actions from A4, auth from A2
**Outputs:** Admin dashboard, CRUD pages

**Handoff To:**
- A8 (QA) — Admin flows ready for testing

**Does NOT:**
- Define database schema
- Write RLS policies
- Build public-facing UI

---

### A6: Compatibility Agent

**Role:** Implement the deterministic compatibility rules engine.

**Responsibilities:**
- Design rule schema
- Implement rule evaluator
- Create conflict detection
- Build safety warnings
- Implement part filtering
- Create compatibility display
- Write rule documentation
- Seed initial rules

**Ownership:**
- `/src/lib/compatibility/*` — Rules engine
- `/src/db/schema/compatibility.ts` — Rule schema
- `/docs/compatibility-rules.md` — Rule docs

**Inputs:** Parts schema from A1, requirements from A0
**Outputs:** Evaluator functions, rule types, compatibility results

**Handoff To:**
- A3 (UI) — Compatibility display ready
- A5 (Admin) — Rule management ready

**Does NOT:**
- Use AI/ML for decisions
- Build UI components
- Handle unrelated backend logic

**Critical Constraint:** All compatibility logic MUST be deterministic and explainable. No probabilistic or AI-based decisions.

---

### A7: Content Agent

**Role:** Create and manage all static content, guides, and documentation.

**Responsibilities:**
- Write guide content (MDX)
- Create spec sheets
- Write safety notices
- Manage content structure
- Implement content rendering
- Optimize content for SEO
- Create image assets
- Manage video embeds

**Ownership:**
- `/content/*` — MDX content files
- `/src/app/(content)/*` — Content pages
- `/src/components/content/*` — Content components

**Inputs:** Content requirements from A0, styling from A3
**Outputs:** Guide pages, spec pages, content components

**Handoff To:**
- A3 (UI) — Content components integrated
- A8 (QA) — Content accuracy review

**Does NOT:**
- Write code logic
- Design UI systems
- Handle dynamic data

---

### A8: QA Agent

**Role:** Ensure quality through testing, validation, and audits.

**Responsibilities:**
- Write unit tests (Vitest)
- Write E2E tests (Playwright)
- Perform security audits
- Validate accessibility
- Test RLS policies
- Performance testing
- Cross-browser testing
- Mobile testing

**Ownership:**
- `/tests/*` — All test files
- `/playwright.config.ts` — E2E config
- `/docs/qa-reports/*` — Test reports

**Inputs:** All completed features from other agents
**Outputs:** Test suites, audit reports, bug reports

**Handoff To:**
- All agents — Bug reports for fixes

**Does NOT:**
- Fix bugs (reports only)
- Write feature code
- Make architectural decisions

---

### A9: DevOps Agent

**Role:** Handle deployment, CI/CD, and production infrastructure.

**Responsibilities:**
- Configure Vercel project
- Set up CI/CD (GitHub Actions)
- Manage environment variables
- Configure monitoring
- Set up error tracking
- Optimize build pipeline
- Manage staging/production
- Create rollback procedures

**Ownership:**
- `/.github/*` — GitHub workflows
- `/vercel.json` — Vercel config
- `/docs/deployment.md` — Deploy docs

**Inputs:** Working application from all agents
**Outputs:** Deployed application, CI pipelines, monitoring

**Does NOT:**
- Write application code
- Design features
- Handle data modeling

---

## Execution Order

```
Phase 0: Planning (Complete)
└── A0: Architect — System design, this document

Phase 1: Foundation (Days 1–7)
├── A1: Database — Schema, RLS (Days 2–3)
├── A2: Auth — Auth system (Day 4)
├── A3: UI — Design system, shell (Days 5–6)
└── A9: DevOps — CI/CD setup (Day 1)

Phase 2: Data Layer (Days 8–14)
├── A1: Database — Engine/Parts schema (Days 8–10)
├── A4: Backend — Validation, actions (Day 14)
└── A5: Admin — CRUD interfaces (Days 11–13)

Phase 3: Builder (Days 15–21)
├── A6: Compatibility — Rules engine (Days 15–17)
├── A3: UI — Public pages, builder (Days 18–20)
└── A4: Backend — Build save/share (Day 21)

Phase 4: Polish (Days 22–30)
├── A7: Content — Guides, SEO (Days 22–25)
├── A8: QA — Testing, audits (Days 26–27)
└── A9: DevOps — Deploy, monitoring (Days 28–30)
```

---

## Handoff Protocol

When an agent completes a deliverable:

1. **Document** — Update relevant docs
2. **Commit** — Conventional commit message
3. **Tag** — Create handoff tag if milestone
4. **Notify** — Update this doc's status
5. **Validate** — Ensure no lint/type errors

### Handoff Message Format

```markdown
## Handoff: [Agent ID] → [Agent ID]

**Deliverable:** [What was completed]
**Location:** [File paths]
**Dependencies:** [What receiving agent needs]
**Notes:** [Any important context]
```

---

## Conflict Resolution

If agents have conflicting requirements:

1. **Stop** — Do not implement conflicting code
2. **Document** — Write conflict in `/docs/conflicts.md`
3. **Escalate** — A0 (Architect) resolves
4. **Proceed** — Only after resolution

---

## Agent Status Tracker

| Agent | Current Status | Last Update | Blocker |
|-------|---------------|-------------|---------|
| A0 | ✅ Complete | Day 0 | None |
| A1 | ⏳ Pending | — | Awaiting Day 2 |
| A2 | ⏳ Pending | — | Awaiting A1 |
| A3 | ⏳ Pending | — | Awaiting Day 5 |
| A4 | ⏳ Pending | — | Awaiting A1 |
| A5 | ⏳ Pending | — | Awaiting A1, A4 |
| A6 | ✅ Design Complete | 2026-01-16 | Awaiting A1 schema review |
| A7 | ⏳ Pending | — | Awaiting Day 22 |
| A8 | ⏳ Pending | — | Awaiting features |
| A9 | ⏳ Pending | — | Awaiting Day 1 |

---

*Document Version: 1.0*  
*Last Updated: Day 0*  
*Owner: A0 (Architect)*
