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
| P2-2 | Performance budget (bundle size, LCP) | Open | Document and enforce in CI if adopted. |
| P2-3 | RUM regression alerts | Open | LCP/INP/CLS thresholds; note consent/privacy. |
| P2-4 | WCAG 2.1 AA gap list and quick wins | Open | Focus order, focus visibility, screen reader labels. |
| P2-5 | Guides / Tools / Forums mobile audit | Open | Touch targets, safe areas, key flows. |
| P2-6 | PWA / offline | Out of scope | Unless explicitly requested. |

---

## Changelog

- **Phase 1:** Added backlog; P0-1, P0-2, P0-3, P1-4 done. P1/P2 items added for Phase 2+.
- **Phase 2:** P1-3, P1-5, P1-6 done. Added `docs/mobile-qa-checklist.md`, `docs/mobile-a11y-gaps.md`. Touch targets: PowerSourceSelector tabs, ShareButton icon, Engines filter bar (power source, Filters, view toggle, search clear).
- **Phase 3:** P1-1, P1-2, P2-1 done. Added `docs/mobile-performance-baseline.md` (targets, baseline table, data-fetching, RUM, LCP/CLS tactics). Added Lighthouse CI: `frontend/lighthouserc.js`, `.github/workflows/lighthouse.yml`, `@lhci/cli` devDep, `npm run lhci` script.
