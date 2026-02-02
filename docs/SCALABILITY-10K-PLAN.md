# Scalability 10K Plan — Phased Implementation

This document outlines the phased plan to scale GoKart Part Picker to **~10,000 concurrent active users** while maintaining security, performance, and cost predictability.

**Security-first:** Every phase preserves or strengthens auth, RLS, input validation, and least-privilege. No shortcuts for performance.

---

## Prerequisites (Before Phase 0)

- [ ] **Supabase Pro** (or higher) — connection limits and support
- [ ] **Vercel** — Deploy on **free (Hobby)** for now. **Build as if on Vercel** (same architecture, same limits in runbook, same monitoring approach). Upgrade to Pro when traffic or limits require it (e.g. concurrency, Observability).
- [ ] **Baseline metrics** — capture current p50/p95 latency, error rates, and cost (see Phase 0)

---

## Phase Overview

| Phase | Focus | Est. effort | Dependencies |
|-------|-------|-------------|--------------|
| **0** | Baseline + Quick Wins | 1–2 days | None |
| **1** | Database + Caching | 3–5 days | Phase 0 |
| **2** | Rate Limiting + Protection | 2–3 days | Phase 0 |
| **3** | CDN + Frontend Tuning | 2–3 days | Phase 1 |
| **4** | Load Testing + Validation | 1–2 days | Phases 1–3 |
| **5** | Monitoring + Runbooks | 1–2 days | Phase 0, 4 |
| **6** | Production Readiness | ~1 day | Phases 1–5 |

---

## Phase 0: Baseline + Quick Wins

**Goal:** Establish observability and deploy low-risk improvements. No major architectural changes.

### Changes

1. **Capture baseline metrics**
   - Document current response times for: homepage, `/engines`, `/parts`, `/builder`, `/engines/[slug]`, `/parts/[slug]`
   - Record current Supabase connection usage (Dashboard or `pg_stat_activity`)
   - Record current Vercel function invocations and cold-start frequency
   - Create `scripts/measure-baseline.ts` or use Vercel Analytics / Supabase logs

2. **Verify indexes** ✓
   - `engines(slug)`, `parts(slug)`, `electric_motors(slug)` — already indexed in initial schema
   - No new migration needed for slug lookups

3. **Verify connection pooling**
   - Confirm Supabase project uses default Supavisor pooling
   - If using direct Postgres (e.g. scripts, cron): use pooler URL (port 6543) in env
   - Document in runbook: `NEXT_PUBLIC_SUPABASE_URL` vs pooler URL usage

4. **Add structured timing logs** (optional, dev/staging first)
   - Add timing to key server actions: `getEngines`, `getParts`, `getTemplates`, `getEngineBySlug`, `getPartBySlug`
   - Use `secure-logging` — never log PII or sensitive data

### Success Criteria

- Baseline metrics documented in `docs/SCALABILITY-BASELINE.md`
- No new indexes if current ones already cover slug lookups
- Connection strategy documented

### Rollback

- Revert migration if new indexes cause issues
- Remove timing logs if they add latency

### Security Notes

- Indexes do not affect RLS; policies remain unchanged
- Timing logs must redact PII and user identifiers

---

## Phase 1: Database + Caching

**Goal:** Reduce DB load for read-heavy paths and ensure efficient queries. No user-specific data in shared caches.

### Changes

1. **Server-side caching with `unstable_cache`**
   - Wrap public read actions in `unstable_cache`:
     - `getEngines` — `frontend/src/actions/engines.ts`
     - `getParts` (public, category-filtered) — `frontend/src/actions/parts.ts`
     - `getTemplates` (public templates only) — `frontend/src/actions/templates.ts`
   - Cache keys: e.g. `engines-list`, `parts-${category}`, `templates-${goal}-${engineId}`
   - TTL: 5–15 minutes for engines/parts; 2–5 minutes for templates
   - **Do NOT cache:** `getEngineBySlug`, `getPartBySlug` if they include user-specific data; user builds; admin actions

2. **Review N+1 and heavy queries**
   - Audit `getTemplates` (fetches engines per template — potential N+1)
   - Audit `getEngineBySlug` / `getPartBySlug` for unnecessary joins
   - Batch or optimize where identified

3. **Extend ISR where safe**
   - Forums list page: consider `revalidate = 300` (5 min) instead of `force-dynamic` if acceptable
   - Forums topic/post pages: keep `force-dynamic` if freshness is critical
   - Document tradeoff: stale forum list vs. lower DB load

### Success Criteria

- Cache hit ratio measurable (via logs or Vercel)
- p95 latency for engines/parts list and detail pages improved vs. baseline (especially /engines/[slug], /parts/[slug])
- No RLS bypass; no user data in cache keys

### Phase 1 Implementation (2025-02-01) ✓

- **engines.ts:** `getEngines`, `getEngineBySlug`, `getEngineBrands` — 10 min cache
- **parts.ts:** `getParts`, `getPartBySlug`, `getPartCategories` — 10 min cache
- **templates.ts:** `getTemplates` — 5 min cache; N+1 fixed with single query `select('*, engine:engines(*)')`
- **motors.ts:** `getMotors`, `getMotorBySlug`, `getMotorBrands` — 10 min cache
- **Note:** Admin updates propagate within TTL. Add `revalidateTag` in a follow-up for immediate invalidation.

### Rollback

- Remove `unstable_cache` wrapper from actions; redeploy
- Revert ISR changes if users report stale content

### Security Notes

- Cache only **public** data (engines, parts, public templates)
- Cache keys must not include user IDs or other user-scoped values
- Existing Zod validation and auth checks remain before any cached-or-fresh fetch

---

## Phase 2: Rate Limiting + Protection

**Goal:** Protect auth endpoints and expensive actions from abuse. Reduce blast radius of runaway clients.

### Changes

1. **Add rate limiting**
   - Option A: **Upstash Redis + `@upstash/ratelimit`** (recommended for serverless)
   - Option B: Vercel rate limiting (if available on plan)
   - Add package: `@upstash/ratelimit` and `@upstash/redis`

2. **Protected endpoints**
   - **Auth (strict):** Login, signup, password reset — e.g. 5 req/min per IP
   - **Auth (relaxed):** Resend verification — e.g. 3 req/15 min per IP
   - **Expensive actions:** Search (`admin/search`, `admin/amazon-*`), builder compatibility checks — e.g. 60 req/min per user/session
   - **Public read-heavy:** `getEngines`, `getParts` — e.g. 120 req/min per IP (lenient, mainly for abuse)

3. **Implementation pattern**
   - Create `frontend/src/lib/rate-limit.ts` with helpers
   - Wrap server actions: `auth.ts`, `auth-login.ts`, `admin/search.ts`, etc.
   - Return `ActionResult` error when rate limited; never expose internal limits

### Success Criteria

- Auth endpoints rate limited
- No legitimate user blocked under normal use
- Abuse patterns (e.g. brute force) mitigated

### Rollback

- Remove rate-limit checks from actions; env flag to disable if needed

### Security Notes

- Rate limits complement existing auth; do not replace it
- Use IP + optional user ID; never log raw IPs in plain text in app logs
- Align with existing docs: `docs/ATTACK-PROTECTION-*.md`, `docs/MFA-*.md`

### Phase 2 Implementation (2025-02-01) ✓

- **Packages:** `@upstash/ratelimit`, `@upstash/redis`
- **Helper:** `frontend/src/lib/rate-limit.ts` — graceful fallback when Upstash not configured
- **Auth strict (5 req/min):** `secureSignIn` in auth-secure.ts
- **Auth relaxed (3 req/15 min):** `resendVerificationEmail` in auth.ts
- **Expensive (60 req/min):** `adminGlobalSearch` in admin/search.ts
- **Env vars:** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — optional; if unset, rate limiting is skipped

---

## Phase 3: CDN + Frontend Tuning

**Goal:** Reduce server load and improve perceived performance. Lazy load heavy UI; optimize static assets.

### Changes

1. **Expand ISR / static generation**
   - Homepage: ensure static or long revalidate if content is stable
   - `/engines`, `/parts`, `/templates` list pages: `revalidate = 300` or `600` if not already
   - Engine/motor/part detail pages: already `revalidate = 3600` — keep

2. **Frontend bundle optimization**
   - Audit `recharts` usage — ensure lazy loaded (already in `lazy/index.tsx` for BuilderInsights)
   - Ensure `GuideViewer`, `VideoSection`, `PartSelectionModal` stay lazy
   - Add `loading="lazy"` to below-fold images where missing

3. **React Query stale times**
   - Review `useEngines`, `useParts`, `useTemplates`, `useBuilds` in `frontend/src/hooks/`
   - Set `staleTime` to 5–10 min for engines/parts/templates (reduce refetches)
   - Keep `staleTime` low for user-specific data (builds, profile)

4. **Pagination / capped queries**
   - Ensure `getEngines`, `getParts`, `getTemplates` use `limit` (e.g. max 100)
   - Admin CSV export / bulk: keep pagination or streaming to avoid huge payloads

### Success Criteria

- Largest Contentful Paint (LCP) improved on key pages
- Fewer unnecessary client refetches
- No unbounded queries returning 1000+ rows

### Rollback

- Revert `staleTime`; reduce `revalidate`; remove lazy loading if it breaks UX

### Security Notes

- Pagination limits prevent DoS via large result sets
- No sensitive data in client-side cache keys

### Phase 3 Implementation (2025-02-01) ✓

- **ISR:** Homepage `revalidate = 600` (10 min); Forums list `revalidate = 300` (5 min) — changed from `force-dynamic`
- **React Query staleTime:** useEngines, useParts, useTemplates, useMotors — 5 min for public data
- **React Query staleTime:** usePublicBuilds 5 min; useBuild 2 min
- **Lazy loading:** Already in place — BuilderInsights, GuideViewer, VideoSection, PartSelectionModal (lazy/index.tsx)
- **Pagination:** getEngines, getParts, getTemplates use `limit` (default 50, max 100)

---

## Phase 4: Load Testing + Validation

**Goal:** Validate that the system handles target load. Establish pass/fail criteria.

### Changes

1. **Load test setup**
   - Tool: k6 or Artillery (add to devDependencies or run via Docker)
   - Create `scripts/load-tests/` with scenarios:
     - `homepage.js` — GET `/`, 100 VUs, 30s
     - `engines-parts.js` — GET `/engines`, `/parts`, `/engines/[slug]`, 200 VUs
     - `builder.js` — Simulate builder flow (select engine, parts, save) — 50 VUs
     - `auth.js` — Login attempts (use test accounts) — 20 VUs

2. **Pass/fail criteria**
   - p95 latency &lt; 3s for key pages
   - Error rate &lt; 1%
   - No 503 from Vercel; no connection exhaustion from Supabase

3. **Run in staging**
   - Use staging Supabase + Vercel preview if available
   - Document: `docs/SCALABILITY-LOAD-TEST.md`

### Success Criteria

- Load tests run and pass
- Baseline (Phase 0) vs. post-Phase 3 comparison documented

### Phase 4 Implementation (2025-02-01) ✓

- **Scripts:** `scripts/load-tests/homepage.js`, `engines-parts.js`, `builder.js`, `auth.js`, `all.js`
- **Tool:** k6 (install via `brew install k6` or use Docker)
- **Doc:** `docs/SCALABILITY-LOAD-TEST.md`

### Rollback

- N/A (testing only)

### Security Notes

- Use test accounts; never hit production auth with real credentials
- Load test IPs should not trigger rate limits in a way that blocks real users

---

## Phase 5: Monitoring + Runbooks

**Goal:** Enable the team to operate at scale, detect issues, and respond to incidents.

### Changes

1. **Metrics and alerts**
   - Vercel: Enable Analytics; set up alerts for 5xx spike, function timeout
   - Supabase: Monitor connection count, slow queries (Dashboard)
   - Optional: External APM (e.g. Sentry, Axiom) for errors and traces

2. **Create `docs/SCALABILITY-RUNBOOK.md`**
   - Connection exhaustion: symptoms, how to check, remediation
   - Auth failures spike: rate limit vs. Supabase outage, escalation
   - High latency: cache warming, DB slow queries, cold starts
   - Security incidents: abuse patterns, rate limit tuning, log review

3. **Document assumptions and limits**
   - Supabase Pro connection limits (by compute add-on)
   - Vercel Pro concurrency
   - Rate limit values and where they live
   - Cache TTLs and what is cached

### Success Criteria

- Runbook exists and is actionable
- At least one alert channel configured
- Team can run load tests and interpret results

### Rollback

- N/A (operational only)

### Security Notes

- Redact PII and secrets from logs and dashboards
- Document how to handle suspected abuse without exposing user data

### Phase 5 Implementation (2025-02-01) ✓

- **Runbook:** `docs/SCALABILITY-RUNBOOK.md`
  - Connection exhaustion: symptoms, check, remediation
  - Auth failures spike: rate limit vs. Supabase outage
  - High latency: cache, DB slow queries, cold starts
  - Security/abuse: rate limit tuning, log review
- **Limits & TTLs:** Quick reference table in runbook (Supabase, Vercel, rate limits, cache)
- **Metrics & alerts:** Vercel Analytics, Observability Plus anomaly alerts; Supabase Dashboard; optional APM
- **Alert thresholds:** 5xx > 1%, p95 > 3s, connections > 80%

---

## Phase 6: Production Readiness

**Goal:** Make the app ready for production traffic and external uptime checks without requiring Vercel Pro. Build as if on Vercel; run on free until upgrade.

### Changes

1. **Lightweight health endpoint**
   - Add `GET /api/health` that returns `200` and `{ "status": "ok" }` with **no DB or external calls**. For UptimeRobot and “is the app up?” checks. Do not expose env or internals.
   - Keep existing `GET /api/health/database` for deeper checks (optional; avoid hitting it every 5 min from monitors).

2. **Uptime monitoring (free)**
   - Document UptimeRobot (or similar) setup: monitor `/` and `/api/health` at 5-min interval. Optionally add `/engines`, `/parts` if within free monitor limit.
   - Runbook: add “Uptime monitoring” and “Production readiness checklist” (env vars, rate limits, cache, runbook, health URLs).

3. **Production readiness checklist**
   - One-page checklist: Supabase Pro env; Vercel env (Supabase, Upstash if used); rate limits enabled; cache/ISR in place; runbook known; health URLs documented.

### Success Criteria

- `GET /api/health` returns 200 with no DB call; safe for public uptime checks.
- Runbook includes UptimeRobot setup and production checklist.
- Team can confirm “ready for production traffic” using the checklist.

### Rollback

- Remove `/api/health` route if not desired; no other code dependency.

### Security Notes

- `/api/health` must not leak env, stack traces, or internal paths. Response: `{ "status": "ok" }` only (optional: `timestamp` in ms).

### Phase 6 Implementation (2025-02-01) ✓

- **Lightweight health:** `GET /api/health` returns `200` and `{ "status": "ok", "timestamp": ms }` with no DB or external calls. Safe for UptimeRobot.
- **Runbook:** Uptime monitoring (UptimeRobot) table with preferred URL `/api/health`; production readiness checklist (env, rate limits, cache, runbook, health, optional load test).
- **Quick Reference:** Health row added (use `/api/health` for uptime; avoid polling `/api/health/database`).

---

## Dependencies

```
Phase 0 (Baseline)
    ├── Phase 1 (DB + Caching) — needs baseline to measure improvement
    ├── Phase 2 (Rate Limiting) — independent, can run parallel to 1
    └── Phase 5 (Monitoring) — start early; refine in Phase 5

Phase 1 + Phase 2
    └── Phase 4 (Load Testing) — test after 1 & 2 are deployed

Phase 1
    └── Phase 3 (CDN + Frontend) — cache reduces DB load; frontend tuning builds on it
```

---

## Assumptions

- **Load model:** ~10K concurrent users; mix of browse (70%), builder (20%), auth/admin (10%)
- **Peak request rate:** ~500–1000 req/s for homepage + engines/parts; ~100–200 req/s for builder actions
- **Cost:** Supabase Pro + Vercel free for now; upgrade Vercel when required. Build as if on Vercel (same architecture and limits). Monitoring: Supabase Pro + free tools (UptimeRobot, Sentry) until Vercel Pro.
- **Staleness:** 5–15 min cache for engines/parts acceptable; forums may need fresher data

---

## Out of Scope

- Moving off Supabase or Vercel
- Introducing a separate API layer (REST/GraphQL) — server actions remain primary
- Changing product behavior (e.g. hiding features) for scale
- Weakening RLS or auth for performance

---

## Status (2025-02-01)

Phases 0–6 implemented. See:

- `docs/SCALABILITY-BASELINE.md` — baseline metrics
- `docs/SCALABILITY-LOAD-TEST.md` — load test instructions
- `docs/SCALABILITY-RUNBOOK.md` — incident response and limits

**Next:** Use **Supabase Pro** for DB + Auth monitoring. Add UptimeRobot monitoring `https://your-domain.com/api/health` (5 min). Optionally Sentry for errors. Run load tests against staging/production. When you upgrade Vercel, add Observability Plus for serverless anomaly alerts.

---

*Last updated: 2025-02-01. Revise as implementation progresses.*
