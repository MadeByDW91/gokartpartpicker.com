# Scalability Baseline Metrics

Pre-optimization baseline for comparing against Phase 1–3 improvements.

**How to capture:** Run the dev server, then:
```bash
cd frontend && npm run dev
# In another terminal:
npx tsx scripts/measure-baseline.ts
```

For production:
```bash
npx tsx scripts/measure-baseline.ts --url https://gokartpartpicker.com
```

---

## Baseline (pre-Phase 1)

**Date:** 2025-02-01

**Environment:** Local dev (localhost:3001)

| Path | p95 (ms) | avg (ms) | errors |
|------|----------|----------|--------|
| / | 76 | 66 | 0 |
| /engines | 229 | 80 | 0 |
| /parts | 284 | 99 | 0 |
| /templates | 185 | 74 | 0 |
| /builder | 125 | 61 | 0 |
| /engines/predator-212-hemi | 1789 | 1344 | 0 |
| /parts/maxtorque-clutch-3-4 | 668 | 402 | 0 |
| /forums | _(dynamic, measure separately)_ | | |

**Notes:** Engine and part detail pages are the slowest — candidates for Phase 1 caching.

**Health endpoint:** /api/health/database — run separately

---

## Connection Strategy

- **Supabase client:** Uses REST API (`NEXT_PUBLIC_SUPABASE_URL`) — connection pooling handled by Supabase
- **Direct Postgres (scripts/cron):** Use pooler URL (port 6543) if available to avoid exhausting connections
- **Indexes:** `engines(slug)`, `parts(slug)`, `electric_motors(slug)` — already indexed

---

## Post-Phase 1–3 Comparison

_Re-run `measure-baseline.ts` after each phase and record below._

| Phase | Date | p95 / (ms) | p95 /engines | p95 /builder | Notes |
|-------|------|------------|--------------|--------------|-------|
| 0 (baseline) | 2025-02-01 | 76 | 229 | 125 | Engine/part detail: 1789ms, 668ms |
| 1 (caching) | 2025-02-01 | 78 | 268 | 320 | Detail pages: verify with seeded DB |
| 2 (rate limits) | 2025-02-01 | 288 | 104 | 292 | /engines improved 54% from Phase 1 cache |
| 3 (CDN/frontend) | 2025-02-01 | 418 | 237 | 283 | ISR + React Query staleTime applied |

---

## Success Target (10K users)

- p95 &lt; 3000 ms for key pages
- Error rate &lt; 1%
- No 503 from Vercel; no connection exhaustion from Supabase
