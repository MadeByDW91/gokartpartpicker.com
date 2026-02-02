# Scalability Load Testing

Load tests for validating the app handles ~10K concurrent users. Uses [k6](https://k6.io/).

---

## Prerequisites

**Install k6** (choose one):

- **macOS:** `brew install k6`
- **Docker:** No install — use `docker run grafana/k6`
- **Linux:** [k6 install docs](https://k6.io/docs/get-started/installation/)

---

## Run locally

Start the dev server first:

```bash
cd frontend && npm run dev
```

Then in another terminal:

```bash
# Homepage — 100 VUs, 30s
k6 run -e TARGET_URL=http://localhost:3001 scripts/load-tests/homepage.js

# Engines & parts — 200 VUs, 30s
k6 run -e TARGET_URL=http://localhost:3001 scripts/load-tests/engines-parts.js

# Builder — 50 VUs, 30s
k6 run -e TARGET_URL=http://localhost:3001 scripts/load-tests/builder.js

# Auth page — 20 VUs, 30s
k6 run -e TARGET_URL=http://localhost:3001 scripts/load-tests/auth.js

# Combined — 100 VUs, 60s (mixed traffic)
k6 run -e TARGET_URL=http://localhost:3001 scripts/load-tests/all.js
```

---

## Run with Docker (no k6 install)

```bash
# Homepage
docker run --rm -v $(pwd):/scripts grafana/k6 run \
  -e TARGET_URL=http://host.docker.internal:3001 \
  /scripts/scripts/load-tests/homepage.js

# Combined
docker run --rm -v $(pwd):/scripts grafana/k6 run \
  -e TARGET_URL=http://host.docker.internal:3001 \
  /scripts/scripts/load-tests/all.js
```

> On Linux, use `http://172.17.0.1:3001` instead of `host.docker.internal` if needed.

---

## Run against production

```bash
k6 run -e TARGET_URL=https://gokartpartpicker.com scripts/load-tests/all.js
```

**Warning:** Only run production load tests with low VUs initially. Monitor Supabase and Vercel dashboards for connection usage and errors.

---

## Pass/fail criteria (10K target)

| Metric | Target |
|--------|--------|
| p95 latency | < 3s for key pages |
| Error rate | < 1% |
| 503 responses | 0 (no Vercel throttling) |
| Supabase connections | Within plan limits |

---

## Test scenarios

| Script | VUs | Duration | Pages |
|--------|-----|----------|-------|
| homepage.js | 100 | 30s | / |
| engines-parts.js | 200 | 30s | /engines, /parts, /templates |
| builder.js | 50 | 30s | /builder |
| auth.js | 20 | 30s | /auth/login |
| all.js | 100 | 60s | /, /engines, /parts, /templates, /builder, /forums |

---

## Interpreting results

k6 outputs:

- **http_req_duration** — p95, p99, avg response times
- **http_req_failed** — error rate (should be < 0.01)
- **iterations** — total completed requests
- **vus** — virtual users

Example passing output:

```
✓ http_req_duration..............: avg=200ms  p(95)=800ms
✓ http_req_failed................: 0.00%
```

---

## Rate limiting note

The auth rate limiter (5 req/min per IP) may block load test traffic if many requests hit `/auth/login` from the same IP. The `auth.js` script only loads the page (no form submit), so it should not trigger login rate limits. If you run tests that submit credentials, use a separate test account and expect rate limits.

---

## Baseline vs. post-Phase 3

Run `scripts/measure-baseline.ts` before and after load tests for per-page latency. Load tests measure throughput and error rate under concurrency; the baseline script measures single-request latency.
