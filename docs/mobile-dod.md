# Mobile Definition of Done

Use this checklist for any PR that affects mobile UI, layout, or performance. All items should be satisfied before merge (or explicitly waived with a short note in the PR).

---

## Touch & layout

- [ ] **Touch targets:** Every interactive element (buttons, links, icon buttons, form controls) has a minimum **44×44px** hit area on viewports &lt; 768px, or is documented as an exception.
- [ ] **Safe areas:** Header, sticky footers, slide-out panels, and bottom sheets use `.safe-area-top` or `.safe-area-bottom` where they extend to the viewport edge on notched devices.
- [ ] **No horizontal scroll:** Layout does not cause horizontal overflow on 360px width (and up). Use `overflow-x-hidden` / `max-w-full` where appropriate.

---

## Responsive behavior

- [ ] **Breakpoints:** Layout and visibility follow the breakpoints in `docs/mobile-plan.md` (mobile &lt; 768px, tablet 768–1023px, desktop ≥ 1024px). No unintended clipping or overlap at 360px, 768px, 1024px.
- [ ] **Forms:** Inputs, selects, and toggles are usable on mobile (readable, tappable, no zoom-on-focus issues; inputs use ≥16px font on small viewports per `globals.css`).

---

## Performance & quality

- [ ] **Lighthouse:** For the changed route(s), mobile Lighthouse scores do not regress. Target: Performance, Accessibility, Best Practices, SEO ≥ 90 (see `docs/mobile-plan.md`). If baseline is below 90, document and avoid further regression.
- [ ] **Images:** New or changed images use `next/image` with appropriate `sizes` (and `priority` only when needed for LCP). No unsized images that could cause CLS.
- [ ] **Real device check:** Changes were tested on at least one real device (e.g. iOS Safari or Android Chrome) or documented why not (e.g. infrastructure-only change).

---

## Brand & accessibility

- [ ] **Brand:** New or changed branded UI uses the canonical logo (`/brand/brand-iconmark-v1.svg` or `brand-logo-light-v1.svg`) and palette (olive/cream/orange) per `globals.css` and `docs/prompts/MOBILE-UI-PERFORMANCE-AGENT-PROMPT.md`.
- [ ] **Reduced motion:** No new animations that ignore `prefers-reduced-motion` (global reduce-motion rule is in `globals.css`).
- [ ] **Focus/labels:** New interactive elements have visible focus and appropriate `aria-label` or visible text where needed for screen readers.

---

## Exceptions

If an item cannot be met (e.g. third-party widget, legacy page), note it in the PR and add a follow-up to `docs/mobile-backlog.md` if needed.
