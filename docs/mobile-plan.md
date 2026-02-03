# Mobile & Performance Plan

**Owner:** A7 Mobile & Performance  
**Stack:** Next.js (App Router), Supabase, Vercel. Public browsing without login required.

---

## Breakpoints Strategy

| Breakpoint | Min width | Tailwind prefix | Usage |
|------------|-----------|-----------------|--------|
| **Phone (small)** | 360px | (default) | Single column, compact nav, full-width CTAs. Test on 360px viewport. |
| **Phone (large)** | 640px | `sm:` | Slightly more padding, optional 2-column where appropriate. |
| **Tablet** | 768px | `md:` | Tablet nav (e.g. 4 links + More), side-by-side where needed. |
| **Desktop (small)** | 1024px | `lg:` | Full nav, sidebar layouts. Primary “desktop” breakpoint. |
| **Desktop (large)** | 1280px | `xl:` | Max content width (e.g. `max-w-7xl`), more spacing. |
| **Wide** | 1536px | `2xl:` | Optional; used sparingly for very wide layouts. |

- **Mobile:** &lt; 768px (use `md:` as the boundary).  
- **Tablet:** 768px–1023px (`md:` to just below `lg:`).  
- **Desktop:** ≥ 1024px (`lg:` and up).

Tailwind v4 uses default theme breakpoints; no custom config in this repo. Design for 360px as minimum width for phones.

---

## Touch & Safe Areas

- **Touch targets:** Interactive elements (buttons, links, icon buttons, form controls) must have a minimum **44×44px** hit area on mobile (≤768px). Use `min-h-[44px]` / `min-w-[44px]` or padding to achieve this.
- **Safe areas:** Use `.safe-area-top` and `.safe-area-bottom` (see `globals.css`) for header, sticky footers, and slide-out panels so content respects notch and home indicator on iOS.
- **Keyboard:** Inputs use `font-size: 16px` on small viewports to avoid iOS zoom on focus.

---

## Performance Targets

| Metric | Target | Notes |
|--------|--------|--------|
| **Lighthouse Performance (mobile)** | ≥ 90 | Key routes: `/`, `/builder`, `/parts`, `/engines`. |
| **Lighthouse Accessibility** | ≥ 90 | Focus order, labels, contrast. |
| **Lighthouse Best Practices** | ≥ 90 | HTTPS, no deprecated APIs, etc. |
| **Lighthouse SEO** | ≥ 90 | Meta, structured data, canonical. |
| **LCP** | &lt; 2.5s | Largest Contentful Paint. |
| **CLS** | &lt; 0.1 | Cumulative Layout Shift. |
| **INP** | &lt; 200ms | Interaction to Next Paint (replaces FID). |

Targets are goals; document baseline and regressions in CI or runbooks.

---

## How Metrics Are Measured

- **Lighthouse:** Manual runs (Chrome DevTools or PageSpeed Insights) and/or **Lighthouse CI** on critical URLs. CI runs on push/PR to `main` (see `.github/workflows/lighthouse.yml` and `frontend/lighthouserc.js`). Details and baseline table: `docs/mobile-performance-baseline.md`.
- **Core Web Vitals:** `PerformanceMonitor` in `AnalyticsProvider` reports LCP, FID, CLS (and INP where supported) via `gtag`. Vercel Analytics or existing analytics used for RUM.
- **Bundle size:** Next.js build output; consider a performance budget (e.g. main bundle &lt; X KB) and enforce in CI if adopted.

---

## Data-Fetching (Key Pages)

- **Home:** ISR `revalidate = 600`; static/semi-static content.  
- **Builder / Parts / Engines:** Server components where possible; client hooks (React Query) for filters and mutations. Avoid overfetching; use limits and pagination.  
- **Supabase:** RLS on public reads kept minimal; caching/revalidation per Next.js patterns.

---

## Open Questions / Assumptions

- RUM and privacy: If analytics or RUM capture personal data, document consent (cookie banner, Do Not Track) or note in privacy policy; flag as open if not yet decided.
- Lighthouse CI: URLs and thresholds are in `frontend/lighthouserc.js`; Performance is **warn** (≥90), others **error** (see `docs/mobile-performance-baseline.md`).

---

## Related Docs

- **Backlog:** `docs/mobile-backlog.md`  
- **Definition of Done:** `docs/mobile-dod.md`  
- **Performance baseline:** `docs/mobile-performance-baseline.md`  
- **Mobile QA checklist:** `docs/mobile-qa-checklist.md`  
- **Accessibility gaps:** `docs/mobile-a11y-gaps.md`  
- **Agent prompt:** `docs/prompts/MOBILE-UI-PERFORMANCE-AGENT-PROMPT.md`
