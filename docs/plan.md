# Project Atlas — Production Plan

> **Codename:** Project Atlas  
> **Target:** GoKartPartPicker.com  
> **Status:** ACTIVE DEVELOPMENT

---

## Executive Summary

Project Atlas is a production-grade PartPicker-style web platform for go-kart enthusiasts. The MVP focuses on Harbor Freight Predator engine compatibility, with a parts catalog, builder experience, and foundational content system.

### Core Deliverables (MVP)
- [ ] Engine catalog (Predator 212, 224, 301, 420)
- [ ] Parts catalog with categories
- [ ] Compatibility matrix (deterministic rules engine)
- [ ] Build configurator (save/share builds)
- [ ] User accounts (auth, saved builds, preferences)
- [ ] Admin dashboard (CRUD, data management)
- [ ] Content system (guides, specs, safety notices)
- [ ] Responsive dark-mode UI

---

## Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | Next.js 16 (App Router) | Server components, streaming, modern React |
| Language | TypeScript (strict) | Type safety, DX, refactoring confidence |
| Database | Supabase (PostgreSQL) | RLS, auth, realtime, edge functions |
| ORM | Supabase JS Client | Direct integration, type-safe |
| Styling | Tailwind CSS + CSS Variables | Utility-first, themeable, fast iteration |
| Auth | Supabase Auth | Built-in RLS integration, OAuth ready |
| Hosting | Vercel | Edge-optimized, preview deploys, analytics |
| State | Zustand (client) | Lightweight, no boilerplate |
| Validation | Zod | Runtime + compile-time schema validation |
| Testing | Vitest + Playwright | Fast unit tests, E2E coverage |

---

## Phase Breakdown

### PHASE 1: Foundation
**Theme:** Infrastructure, Schema, Auth, Design System

| Task | Focus | Deliverables | Owner Agent |
|------|-------|--------------|-------------|
| 1 | Project scaffold | Repo structure, deps, env setup | Architect |
| 2 | Database schema v1 | Core tables, enums, relationships | Database |
| 3 | RLS policies | Auth rules, tenant isolation | Database |
| 4 | Auth system | Sign up, login, session, middleware | Auth |
| 5 | Design system | Tokens, primitives, dark theme | UI |
| 6 | Layout shell | App chrome, nav, footer | UI |
| 7 | Integration test | Auth flow E2E, schema validation | QA |

**Gate:** User can register, login, see authenticated shell.

---

### PHASE 2: Data Layer
**Theme:** Engine Catalog, Parts Catalog, Admin CRUD

| Task | Focus | Deliverables | Owner Agent |
|------|-------|--------------|-------------|
| 8 | Engine schema | Engines table, specs, variants | Database |
| 9 | Parts schema | Parts table, categories, attributes | Database |
| 10 | Seed data | Predator engines, sample parts | Database |
| 11 | Admin scaffold | Protected routes, layout | Admin |
| 12 | Engine admin CRUD | List, create, edit, delete | Admin |
| 13 | Parts admin CRUD | List, create, edit, delete, bulk | Admin |
| 14 | Data validation | Zod schemas, API guards | Backend |

**Gate:** Admin can fully manage engines and parts. Data persists correctly.

---

### PHASE 3: Compatibility & Builder
**Theme:** Rules Engine, Build Configurator, Public Catalog

| Task | Focus | Deliverables | Owner Agent |
|------|-------|--------------|-------------|
| 15 | Compatibility schema | Rules table, constraint types | Database |
| 16 | Rules engine core | Deterministic evaluator | Compatibility |
| 17 | Conflict detection | Safety flags, warnings, blockers | Compatibility |
| 18 | Public engine pages | Engine detail, specs, parts list | UI |
| 19 | Public parts pages | Part detail, compatibility display | UI |
| 20 | Build configurator | Engine select → parts → validate | UI |
| 21 | Save/share builds | User builds table, permalinks | Backend |

**Gate:** User can create a build, see compatibility status, save to account.

---

### PHASE 4: Polish & Launch
**Theme:** Content, SEO, Performance, Security Audit, Deploy

| Task | Focus | Deliverables | Owner Agent |
|------|-------|--------------|-------------|
| 22 | Content schema | Guides, specs, safety notices | Database |
| 23 | Guide pages | Static content rendering | Content |
| 24 | Search & filtering | Parts search, faceted filters | UI |
| 25 | SEO optimization | Meta, OG, sitemap, structured data | UI |
| 26 | Performance audit | Core Web Vitals, image opt, caching | DevOps |
| 27 | Security audit | OWASP checklist, RLS review | Security |
| 28 | Error handling | Boundaries, fallbacks, logging | Backend |
| 29 | Staging deploy | Full E2E on staging environment | DevOps |
| 30 | Production deploy | Go-live, monitoring, rollback plan | DevOps |

**Gate:** Production-ready, secure, performant, documented.

---

## Release Gates

Each phase ends with a mandatory gate review:

### Gate 1 (Phase 1)
- [ ] Auth flow functional (register → login → session)
- [ ] RLS policies pass security tests
- [ ] Design tokens documented
- [ ] CI/CD pipeline green

### Gate 2 (Phase 2)
- [ ] Engine CRUD operational
- [ ] Parts CRUD operational
- [ ] Seed data loaded
- [ ] Admin routes protected

### Gate 3 (Phase 3)
- [ ] Compatibility engine returns correct results
- [ ] Build configurator saves builds
- [ ] Public pages render correctly
- [ ] No critical bugs in backlog

### Gate 4 (Phase 4)
- [ ] Security audit passed
- [ ] Performance budget met (<3s LCP)
- [ ] SEO checklist complete
- [ ] Monitoring configured
- [ ] Documentation complete

---

## Risk Log

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R1 | Scope creep | High | High | Strict MVP scope, defer to v1.1 |
| R2 | Compatibility logic complexity | Medium | High | Start simple, 3 rule types max |
| R3 | Data accuracy (part specs) | Medium | Medium | Manual review, cite sources |
| R4 | Auth edge cases | Low | High | Use Supabase defaults, test thoroughly |
| R5 | Performance on large catalogs | Low | Medium | Pagination, virtual lists, caching |
| R6 | Mobile UX gaps | Medium | Medium | Mobile-first development |

---

## Out of Scope (v1.0)

The following are explicitly **NOT** included in the MVP:

- [ ] E-commerce / checkout
- [ ] Affiliate link management
- [ ] User reviews / ratings
- [ ] Community features (forums, comments)
- [ ] Video hosting (embed only)
- [ ] Multi-language support
- [ ] Native mobile app
- [ ] AI-powered recommendations
- [ ] Real-time collaboration
- [ ] Inventory tracking
- [ ] Price comparison
- [ ] Notifications system
- [ ] Social login (OAuth) — defer to v1.1
- [ ] Advanced analytics dashboard
- [ ] API for third parties

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Auth security | 0 critical vulns | OWASP audit |
| Page load (LCP) | <3s | Lighthouse |
| Build configurator completion | >60% | Analytics |
| Data accuracy | >95% | Manual spot-check |
| Test coverage | >70% | Vitest/Playwright |

---

## Daily Standup Template

Each agent reports:
1. **Yesterday:** What was completed
2. **Today:** What will be done
3. **Blockers:** What's blocking progress
4. **Handoffs:** What another agent needs

---

*Document Version: 2.0*  
*Last Updated: 2026-01-16*
