# Mobile Backlog

**Owner:** A7 Mobile & Performance  
Prioritized items for mobile UI/UX and performance. Update as work is done or priorities change.

---

## P0 — Critical (must fix for mobile)

| ID | Item | Status | Notes |
|----|------|--------|--------|
| P0-1 | Header mobile icon buttons ≥44px touch target | Done (Phase 1) | Search, menu, user avatar on &lt; lg. |
| P0-2 | Document breakpoints and touch/safe-area rules | Done (Phase 1) | See `docs/mobile-plan.md`. |
| P0-3 | Definition of Done for mobile PRs | Done (Phase 1) | See `docs/mobile-dod.md`. |

---

## P1 — High (should do soon)

| ID | Item | Status | Notes |
|----|------|--------|--------|
| P1-1 | Lighthouse targets and baseline | Done (Phase 3) | `docs/mobile-performance-baseline.md`; targets and baseline table. |
| P1-2 | LCP/CLS fixes on key pages | Done (Phase 3) | Home hero already has priority + sizes; tactics documented in baseline doc. |
| P1-3 | Mobile QA checklist | Done (Phase 2) | `docs/mobile-qa-checklist.md`. |
| P1-4 | Auth pages use canonical logo | Done (Phase 1) | Login/register use `/brand/brand-iconmark-v1.svg`. |
| P1-5 | Audit Builder mobile (sticky CTAs, touch targets) | Done (Phase 2) | PowerSourceSelector + ShareButton 44px; builder actions already 44px. |
| P1-6 | Audit Parts/Engines filters on small viewports | Done (Phase 2) | Engines: power source, Filters, view toggle + search clear 44px; Parts already 44px. |

---

## P2 — Medium / Later

| ID | Item | Status | Notes |
|----|------|--------|--------|
| P2-1 | Lighthouse CI (or equivalent) in pipeline | Done (Phase 3) | `.github/workflows/lighthouse.yml`, `frontend/lighthouserc.js`; Performance warn, others error. |
| P2-2 | Performance budget (bundle size, LCP) | Done (Phase 5) | `docs/mobile-performance-baseline.md` (Performance budget); `frontend/scripts/check-bundle-size.js`; Lighthouse workflow runs bundle check after build (First Load JS ≤ 200 kB). |
| P2-3 | RUM regression alerts | Done (Phase 5) | `docs/mobile-performance-baseline.md` (RUM regression alerts): thresholds (LCP &gt; 2.5s, CLS &gt; 0.1, INP &gt; 200ms), how to set alerts (GA4, Vercel, custom), consent/privacy notes. |
| P2-4 | WCAG 2.1 AA gap list and quick wins | Done (Phase 4) | Focus trap + return focus in PartSelectionModal, SearchModal; skip link; see `docs/mobile-a11y-gaps.md`. |
| P2-5 | Guides / Tools / Forums mobile audit | Done (Phase 4) | Touch targets ≥44px on Tools (search clear, category pills, calculator tabs, badge X, Clear all, category tiles, Manuals/Torque expand), Guides (search input, badge clear, Clear all), Forums (Preview topics, Browse topics). |
| P2-6 | PWA / offline | Out of scope | Unless explicitly requested. |

---

## Changelog

- **Phase 1:** Added backlog; P0-1, P0-2, P0-3, P1-4 done. P1/P2 items added for Phase 2+.
- **Phase 2:** P1-3, P1-5, P1-6 done. Added `docs/mobile-qa-checklist.md`, `docs/mobile-a11y-gaps.md`. Touch targets: PowerSourceSelector tabs, ShareButton icon, Engines filter bar (power source, Filters, view toggle, search clear).
- **Phase 3:** P1-1, P1-2, P2-1 done. Added `docs/mobile-performance-baseline.md` (targets, baseline table, data-fetching, RUM, LCP/CLS tactics). Added Lighthouse CI: `frontend/lighthouserc.js`, `.github/workflows/lighthouse.yml`, `@lhci/cli` devDep, `npm run lhci` script.
- **Phase 4:** P2-4, P2-5 done. Focus trap + return focus in PartSelectionModal and SearchModal (`use-focus-trap.ts`); skip-to-main-content link and `#main-content`; Guides/Tools/Forums touch targets (min-h-[44px], touch-manipulation, aria-labels on badge clear buttons).
- **Phase 5:** P2-2, P2-3 done. Performance budget: First Load JS ≤ 200 kB documented; `frontend/scripts/check-bundle-size.js`; Lighthouse workflow runs bundle check. RUM regression alerts: thresholds, GA4/Vercel/custom alert setup, consent/privacy notes in `docs/mobile-performance-baseline.md`.