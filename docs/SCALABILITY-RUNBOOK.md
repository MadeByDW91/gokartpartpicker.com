# Scalability Runbook

Operational guide for running GoKart Part Picker at scale. Use this when incidents occur or to understand system limits.

**Vercel:** We build and document as if we're on Vercel (Pro limits and behavior). Run on the free plan until traffic or product needs require an upgrade; no architecture changes when you switch.

---

## Quick Reference: Limits & TTLs

| Component | Limit / Value | Where |
|-----------|---------------|-------|
| **Supabase (Pro)** | Connections: Micro 60 direct / 200 pooler; Small 90/400; Medium 120/600 | Dashboard → Settings → Compute |
| **Vercel** | Free: lower concurrency; Pro: ~30K concurrent function executions | [Vercel limits](https://vercel.com/docs/limits) |
| **Auth rate limit** | 5 req/min per IP | `auth-secure.ts` → `secureSignIn` |
| **Resend verification** | 3 req/15 min per IP | `auth.ts` → `resendVerificationEmail` |
| **Admin search** | 60 req/min per IP | `admin/search.ts` → `adminGlobalSearch` |
| **Cache TTL** | Engines/parts/motors: 10 min; Templates: 5 min | `engines.ts`, `parts.ts`, `templates.ts`, `motors.ts` |
| **ISR** | Homepage: 10 min; Forums: 5 min; Detail pages: 1 hr | `page.tsx` exports |
| **Health (uptime)** | `GET /api/health` — 200, no DB | Use for UptimeRobot; do not poll `/api/health/database` every 5 min |

---

## Incident: Connection Exhaustion

### Symptoms

- 5xx errors from Vercel or Supabase
- Supabase: "too many connections" or "connection pool exhausted"
- Vercel: `503 FUNCTION_THROTTLED` or timeout

### How to Check

1. **Supabase:** Dashboard → Database → Connection pooling (or Reports if available)
2. **Supabase:** Run `SELECT count(*) FROM pg_stat_activity;` in SQL Editor (requires access)
3. **Vercel:** Dashboard → Analytics / Logs — look for 5xx spike, function timeouts

### Remediation

1. **Supabase connections:** Upgrade compute add-on for more pooler connections, or reduce concurrent load (e.g. queue writes, increase cache TTL).
2. **Vercel throttling:** Upgrade plan or reduce function execution time (optimize queries, add caching).
3. **Short-term:** Increase cache TTL to reduce DB load; disable non-critical features temporarily.
4. **Verify:** Our app uses Supabase REST API (pooled); direct `pg` connections in scripts must use pooler URL (port 6543) if available.

---

## Incident: Auth Failures Spike

### Symptoms

- Many users report "Invalid email or password" or "Too many requests"
- Spike in 4xx on `/auth/login` or `/auth/register`

### How to Check

1. **Rate limit vs. real failures:** "Too many requests" = rate limit; "Invalid credentials" = auth failure.
2. **Supabase Auth:** Dashboard → Auth → Logs — check error types and volume.
3. **Upstash:** If rate limiting enabled, check Redis usage and rate limit hits.

### Remediation

1. **Rate limit triggered:** Expected under abuse. Legitimate users: advise waiting 1–15 min. If widespread, consider temporarily relaxing limits (env flag or config).
2. **Supabase Auth outage:** Check [Supabase status](https://status.supabase.com/); communicate to users; no code change if upstream.
3. **Brute force:** Rate limits should mitigate. Monitor for repeated failures from same IP; consider blocklist if severe.
4. **Escalation:** If Supabase Auth is down, escalate to Supabase support; no on-call fix.

---

## Incident: High Latency

### Symptoms

- p95 latency > 3s for key pages
- Users report slow load times

### How to Check

1. **Vercel:** Analytics → Response times by route
2. **Baseline script:** `npx tsx scripts/measure-baseline.ts --url https://gokartpartpicker.com`
3. **Supabase:** Dashboard → Query performance / slow queries

### Remediation

1. **Cache cold:** After deploy, caches are empty. First requests will be slow; subsequent requests should improve. Consider cache warming script for critical paths (optional).
2. **DB slow queries:** Add indexes; optimize N+1; use `EXPLAIN ANALYZE` for heavy queries. See `supabase/migrations/20260117000001_performance_indexes.sql`.
3. **Cold starts:** Vercel serverless cold starts add ~200–500ms. Reduce by keeping functions warm (probe endpoint) or optimizing bundle size.
4. **Third-party APIs:** PA-API, YouTube — add timeouts, fallbacks, and caching to avoid blocking.

---

## Incident: Security / Abuse

### Symptoms

- Unusual traffic patterns (e.g. many requests from single IP)
- Spike in rate limit hits
- Suspicious auth attempts

### How to Check

1. **Vercel:** Logs — filter by status code, path, IP (if logged)
2. **Supabase:** Auth logs — failed login attempts, signup volume
3. **Upstash:** Rate limit hit rate

### Remediation

1. **Rate limit tuning:** If too strict, adjust in `frontend/src/lib/rate-limit.ts`; deploy. If too loose, tighten limits.
2. **Log review:** Never log PII or raw IPs in plain text. Use `secure-logging` and redact.
3. **Blocklist:** For severe abuse, consider IP blocklist at edge (Vercel Edge Config or similar) — not implemented by default.
4. **Escalation:** Document incidents; share (redacted) with team; update runbook if new pattern.

---

## Metrics & Alerting

### Vercel (Free Plan)

- **Analytics:** Enable in Project → Analytics. Web Vitals and basic response times.
- **Logs:** Runtime Logs (limited retention on free). No built-in anomaly alerts on Hobby plan.
- **When you upgrade:** Observability Plus (Pro/Enterprise) adds anomaly alerts for 5xx spikes.

### Supabase Pro (Primary Monitoring on Free Vercel)

Use Supabase Pro as your main source for **database and auth** health. No Vercel upgrade required.

| What to monitor | Where in Supabase |
|-----------------|--------------------|
| **Connections** | Dashboard → Database → Connection pooling (or Reports). Watch pooler usage vs. plan (e.g. 200/400). |
| **Slow queries** | Dashboard → Database → Query Performance. Enable `pg_stat_statements` in Extensions if needed. |
| **Auth** | Dashboard → Auth → Logs (failed logins, signups). Auth → MAU for usage. |
| **API usage** | Dashboard → API or Reports — request volume and errors. |

**Optional (Pro):** Supabase [Metrics API](https://supabase.com/docs/guides/telemetry/metrics) (Prometheus-compatible) for deeper DB metrics (CPU, IO, WAL, connections). Use the dashboard and SQL Editor for day-to-day checks; skip Grafana.

### Free supplements (no Vercel Pro)

- **UptimeRobot:** Uptime checks — email alerts when down. See **Uptime monitoring** below.
- **Sentry:** Frontend/backend error tracking and performance (free tier: 5K errors/month).

### Uptime monitoring (UptimeRobot)

Use a **lightweight** endpoint so monitors don’t hit the DB every 5 minutes.

| Monitor | URL | Interval | Notes |
|---------|-----|----------|-------|
| App up | `https://your-domain.com/api/health` | 5 min | No DB; returns `{ "status": "ok" }`. Prefer this for “is the app up?” |
| Homepage | `https://your-domain.com/` | 5 min | Optional; full page load |
| Key pages | `/engines`, `/parts` | 5 min | Optional if within free monitor limit (e.g. 50) |

**Setup:** [UptimeRobot](https://uptimerobot.com/) → Add Monitor → HTTP(s) → URL above. Alert contacts: email. Do **not** point monitors at `/api/health/database` on a short interval (it hits the DB).

### Optional: External APM

- **Sentry:** Error tracking, performance monitoring
- **Axiom, Datadog, etc.:** Log aggregation, custom dashboards

### Alert Thresholds (Recommended)

| Metric | Threshold | Action |
|--------|-----------|--------|
| 5xx error rate | > 1% over 5 min | Investigate; check Supabase/Vercel status |
| p95 latency | > 3s for key routes | Check DB, cache, cold starts |
| Supabase connections | > 80% of pool | Consider compute upgrade or optimization |
| Auth failures | Spike > 10x baseline | Check rate limits vs. Supabase outage |

---

## Load Testing

Before major releases or scaling:

1. Run `scripts/measure-baseline.ts` — record p95, avg, errors
2. Run `scripts/load-tests/all.js` with k6 — validate under load
3. Compare to baseline; ensure p95 < 3s, error rate < 1%

See `docs/SCALABILITY-LOAD-TEST.md`.

---

## Rollback

If a scalability change causes issues:

1. **Cache:** Remove `unstable_cache` wrappers from actions; redeploy
2. **Rate limits:** Remove rate limit checks from actions; redeploy (or add env flag to disable)
3. **ISR:** Revert `revalidate` to `force-dynamic` on affected pages
4. **React Query:** Revert `staleTime` to default (0)

---

## Production readiness checklist

Before treating the app as “ready for production traffic” (or after a major change), confirm:

- [ ] **Supabase Pro:** Env vars set in Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Connection pooling in use (default).
- [ ] **Rate limiting:** Upstash env vars set in Vercel (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) if you want auth/admin limits; otherwise app runs with limits disabled (fail-open).
- [ ] **Cache / ISR:** Server actions use `unstable_cache`; key pages use `revalidate` (see Quick Reference). No `force-dynamic` on high-traffic public pages unless required.
- [ ] **Runbook:** Team knows where `docs/SCALABILITY-RUNBOOK.md` is and how to check Supabase (Connection pooling, Query Performance, Auth logs).
- [ ] **Health:** `GET /api/health` returns 200 (lightweight). Optional: UptimeRobot (or similar) monitoring `/api/health` at 5 min.
- [ ] **Load test (optional):** Run `k6 run -e TARGET_URL=https://your-domain.com scripts/load-tests/all.js` and confirm thresholds (p95 < 3s, error rate < 1%).

---

## Contacts & Links

- **Supabase:** [Dashboard](https://supabase.com/dashboard), [Status](https://status.supabase.com/)
- **Vercel:** [Dashboard](https://vercel.com/dashboard), [Status](https://www.vercel-status.com/)
- **Upstash:** [Console](https://console.upstash.com/) (rate limiting)

---

*Last updated: 2025-02-01. Revise as limits or architecture change.*
