# Mobile Performance Baseline

**Owner:** A7 Mobile & Performance  
**Reference:** `docs/mobile-plan.md` (targets), `docs/mobile-backlog.md` (P1-1, P1-2, P2-1).

---

## Lighthouse Targets

| Metric | Target | Key URLs |
|--------|--------|----------|
| **Performance (mobile)** | ≥ 90 | `/`, `/builder`, `/parts`, `/engines` |
| **Accessibility** | ≥ 90 | Same |
| **Best Practices** | ≥ 90 | Same |
| **SEO** | ≥ 90 | Same |

Core Web Vitals: **LCP** &lt; 2.5s, **CLS** &lt; 0.1, **INP** &lt; 200ms (see `docs/mobile-plan.md`).

---

## Performance budget

Targets to avoid regressions. Enforce in CI when adopted.

| Budget item | Target | How to check |
|-------------|--------|--------------|
| **First Load JS shared by all** | ≤ 200 kB | Run `npm run build`; see table in output. Or run `node scripts/check-bundle-size.js` after saving build output to a file (see below). |
| **LCP** | &lt; 2.5s | Lighthouse CI (performance score) and RUM (see RUM section). |
| **CLS** | &lt; 0.1 | Lighthouse CI and RUM. |
| **INP** | &lt; 200ms | RUM (FID/INP where supported). |

### Enforcing bundle size in CI

1. **Capture build output:** In your build step, run `npm run build 2>&1 \| tee build.log` (or equivalent) so the Next.js size table is written to `build.log`.
2. **Run the checker:** Add a step that runs `node scripts/check-bundle-size.js build.log` (from `frontend/`). The script parses the "First Load JS shared by all" line and exits with code 1 if the value exceeds the budget (default 200 kB).
3. **Adjust the budget:** Edit `frontend/scripts/check-bundle-size.js` and change `MAX_FIRST_LOAD_KB` if you adopt a different target.

If you prefer not to enforce in CI, run `npm run build` locally before release and confirm the printed "First Load JS shared by all" is under your target.

---

## How to Run Lighthouse

### Manual (Chrome DevTools or PageSpeed Insights)

1. **Chrome DevTools:** DevTools → Lighthouse tab → Mode: Navigation, Device: Mobile, Categories: all → Analyze.
2. **PageSpeed Insights:** https://pagespeed.web.dev/ → enter URL (e.g. production or preview).
3. **Key URLs to test:** `/`, `/builder`, `/parts`, `/engines`. Run at least on `/` and one catalog page before release.

### Lighthouse CI (automated)

- **Config:** `frontend/lighthouserc.js` (or repo root).
- **Run locally:** From `frontend/`: `npm run build && npm run start` (in another terminal), then `npx lhci autorun` (or use the `lhci` npm script if added).
- **CI:** See `.github/workflows/lighthouse.yml` (if added). Runs on PR or push to main; asserts scores or uploads to temporary storage. Requires a running server (e.g. `next start` after build).

---

## Baseline (fill after first run)

| URL | Performance | Accessibility | Best Practices | SEO | LCP | CLS | Date |
|-----|-------------|---------------|-----------------|-----|-----|-----|------|
| `/` | 97 | 92 | 100 | 92 | 1.27s | 0 | 2026-02-04 |
| `/builder` | 97 | 92 | 100 | 92 | 1.29s | 0.02 | 2026-02-04 |
| `/parts` | 91 | 89 | 100 | 92 | 1.02s | 0.18 | 2026-02-04 |
| `/engines` | 95 | 93 | 96 | 92 | 1.26s | 0.09 | 2026-02-04 |

**Note:** This baseline was collected with Lighthouse CI using the **desktop** preset (current `@lhci/cli` does not support `preset: 'mobile'`; CI uses desktop). For mobile-specific numbers, run Lighthouse manually (Chrome DevTools → Lighthouse → Device: Mobile) on these URLs and update the table. Re-run after major changes; avoid regressions below targets.

**Follow-up:** `/parts` has Accessibility 89 (below 90) and CLS 0.18 (above 0.1); consider addressing for baseline compliance.

---

## LCP / CLS Tactics (implemented or recommended)

- **Home hero:** Hero images use `next/image` with `priority` and `sizes` (100vw desktop; `(max-width: 768px) 100vw` mobile). Section has `min-h-[80vh]` so space is reserved → less CLS.
- **Above-the-fold images:** Use `next/image` with explicit `width`/`height` or a container with aspect-ratio so layout doesn’t shift. Use `priority` only for the LCP image (e.g. hero).
- **Fonts:** Next.js font loading (Bebas Neue, DM Sans) is used; no extra font blocking.
- **Below-the-fold:** Lazy-load images (default for `next/image` without `priority`). Use `sizes` for responsive images.

---

## Data-Fetching (Key Pages)

| Page | Strategy | Notes |
|------|----------|--------|
| **Home** | ISR `revalidate = 600` | Static/semi-static; hero and content cached. |
| **Builder** | Client (React Query) | Engines, motors, parts, compatibility; avoid overfetching; pagination/infinite scroll where used. |
| **Parts** | Client (React Query) | Filters, pagination, infinite scroll; pull-to-refresh. |
| **Engines** | Client (React Query) | Filters, pagination; pull-to-refresh. |
| **Detail pages** | Server or client | Engine/motor/part by slug; consider static params or ISR where appropriate. |

Supabase: RLS on public reads kept minimal; caching/revalidation via Next.js and React Query.

---

## RUM (Real User Monitoring)

- **What we capture:** LCP, FID, CLS (and INP where supported), plus a “Page Load” timing. Implemented in `PerformanceMonitor` inside `AnalyticsProvider`.
- **Where it goes:** Events sent via `gtag` (Google Analytics) when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set. Vercel Analytics can also provide Web Vitals; check project settings.
- **Consent / privacy:** If GA or other analytics collect personal data, ensure cookie banner or consent and privacy policy alignment. Do Not Track: document handling if/when implemented. See `docs/mobile-plan.md` (Open Questions).

---

## RUM regression alerts

Use RUM data to catch regressions in production. Thresholds below match our Core Web Vitals targets.

### Recommended thresholds (alert when exceeded)

| Metric | Threshold | Notes |
|--------|-----------|--------|
| **LCP** | &gt; 2.5s | Largest Contentful Paint; poor LCP hurts perceived load. |
| **CLS** | &gt; 0.1 | Cumulative Layout Shift; layout instability. |
| **INP** (or FID) | &gt; 200ms | Interaction to Next Paint / First Input Delay; sluggish interactions. |

### How to set alerts

1. **Google Analytics 4**
   - Use GA4 custom reports or Explorations filtered by event name (LCP, CLS, FID) and `event_category = 'Web Vitals'`.
   - Create a custom exploration or segment for “LCP &gt; 2500” (value in ms) and monitor p75/p95.
   - Optionally use GA4 custom alerts (Admin → Custom Alerts) to notify when a metric crosses a threshold (e.g. average LCP &gt; 2500 for a given day).

2. **Vercel Analytics**
   - If Vercel Analytics is enabled, use the Web Vitals dashboard (Vercel project → Analytics) to track LCP, CLS, INP.
   - Set up alerts in Vercel (if offered) or export data and alert via a separate tool.

3. **Custom**
   - If you send RUM to a custom endpoint, aggregate by metric and time window and alert (e.g. Slack, PagerDuty) when p75 LCP &gt; 2500 or p75 CLS &gt; 0.1.

### Consent and privacy

- **Cookie / consent:** If GA or other RUM uses cookies or identifiers that can be linked to users, implement a cookie banner or consent flow and document it in your privacy policy. Ensure RUM respects user choice (e.g. do not send events when consent is denied, if required).
- **Do Not Track:** Document whether and how you honor DNT for analytics/RUM. If you honor it, suppress or anonymize RUM when DNT is enabled.
- **Privacy policy:** State that you collect performance data (e.g. page load times, Web Vitals) for improving the site, and link to your analytics provider’s policy if applicable.

---

## Regression Prevention

- **Before release:** Run Lighthouse on key URLs (manual or CI); confirm scores ≥ targets and no large regression.
- **CI:** Lighthouse CI runs on push/PR to main; performance is warn (≥90), others error. Bundle size check runs after build (see Performance budget).
- **RUM:** Use GA (or Vercel) to watch LCP/CLS/INP in production; set alerts per “RUM regression alerts” above (e.g. LCP &gt; 2.5s, CLS &gt; 0.1).

---

## Related Docs

- **Plan:** `docs/mobile-plan.md`  
- **Backlog:** `docs/mobile-backlog.md`  
- **DoD:** `docs/mobile-dod.md`
