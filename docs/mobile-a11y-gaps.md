# Mobile Accessibility — Known Gaps & Quick Wins

**Owner:** A7 Mobile & Performance  
**Target:** WCAG 2.1 AA where practical. This doc lists current gaps and low-effort improvements.

---

## Already in place

- **Reduced motion:** `prefers-reduced-motion: reduce` in `globals.css` shortens animations/transitions.
- **Input zoom:** Inputs/textarea/select use `font-size: 16px` on small viewports to avoid iOS zoom.
- **Touch targets:** Many controls use `min-h-[44px]` / `min-w-[44px]` and `touch-manipulation`; globals.css enforces min-height 44px for buttons/links on viewports &lt; 768px (with `.no-touch-target` opt-out).
- **Safe areas:** Header and bottom sheets use `.safe-area-top` / `.safe-area-bottom`.
- **Focus visible:** Many interactive elements use `focus-visible:ring-2 focus-visible:ring-orange-500` (or similar).
- **Screen reader:** Power source and filters use `aria-label`, `aria-expanded`, `aria-checked`, and `sr-only` labels where implemented.

---

## Known gaps

| Area | Gap | Priority | Notes |
|------|-----|----------|--------|
| **Focus order** | Modal/drawer open: focus trap and return focus on close not consistently implemented everywhere. | P2 | PartSelectionModal, filter sheets, ShareButton sheet. |
| **Focus visibility** | Some icon-only buttons rely on default focus ring; contrast may be weak. | P2 | Ensure `focus-visible:ring` is visible on olive background. |
| **Screen reader** | Some icon-only buttons have `aria-label`; a few may still be missing or generic. | P2 | Audit “Clear”, “Share”, view toggles, Filters. |
| **Live regions** | Loading/saving and dynamic results (e.g. “Saved”, “X results”) may not be announced. | P2 | Consider `aria-live="polite"` for status messages. |
| **Badge remove** | Small “X” on filter badges (e.g. Parts) has a small hit area; could be larger or use “Remove X filter” as label. | P2 | Increase touch area or add explicit label. |
| **Color contrast** | Muted text (e.g. cream-400 on olive) — not fully audited for AA. | P2 | Run contrast checker on key screens. |

---

## Quick wins (done or recommended)

- [x] **Touch targets ≥44px** on header mobile buttons (Phase 1), builder actions, parts/engines filter bars (Phase 2).
- [x] **Canonical logo** on auth pages (Phase 1).
- [x] **Power source / filters** — `aria-label` and `role="radio"` where applicable (PowerSourceSelector, Engines).
- [x] **Focus trap in modals** — PartSelectionModal and SearchModal use `useFocusTrap`; Tab cycles within modal, Esc closes; focus moves to first focusable on open and restores on close.
- [x] **Skip link** — “Skip to main content” link in root layout; visible on focus (`.skip-link` in globals.css); main has `id="main-content"`.

---

## Changelog

- **Phase 2:** Added doc; documented current state and gaps; quick wins partially done (touch targets, aria on filters).
- **Phase 4:** Focus trap in PartSelectionModal and SearchModal (`use-focus-trap.ts`); Escape closes PartSelectionModal; skip link + `#main-content` in root layout; Guides/Tools/Forums touch targets (clear search, category pills, calculator tabs, badge X, Clear all, expandable panels, ForumCategoryCard Preview/Browse).
