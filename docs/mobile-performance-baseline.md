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
| `/` | — | — | — | — | — | — | TBD |
| `/builder` | — | — | — | — | — | — | TBD |
| `/parts` | — | — | — | — | — | — | TBD |
| `/engines` | — | — | — | — | — | — | TBD |

Fill with first Lighthouse (mobile) run per URL. Re-run after major changes; avoid regressions below targets.

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

## Regression Prevention

- **Before release:** Run Lighthouse on key URLs (manual or CI); confirm scores ≥ targets and no large regression.
- **CI:** If Lighthouse CI is enabled, it fails or warns when scores drop below thresholds (see `lighthouserc.js` and workflow).
- **RUM:** Use GA (or Vercel) to watch LCP/CLS/INP in production; set alerts if available (e.g. LCP &gt; 2.5s).

---

## Related Docs

- **Plan:** `docs/mobile-plan.md`  
- **Backlog:** `docs/mobile-backlog.md`  
- **DoD:** `docs/mobile-dod.md`
