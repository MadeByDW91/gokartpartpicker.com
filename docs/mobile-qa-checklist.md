# Mobile QA Checklist

Use this checklist when testing mobile UI on real devices or emulators. Run before release and after major layout/filter/nav changes.

**Owner:** A7 Mobile & Performance  
**Reference:** `docs/mobile-plan.md` (breakpoints), `docs/mobile-dod.md` (Definition of Done).

---

## Devices & viewports

- [ ] **iOS Safari** — iPhone (e.g. 390×844 or 375×667). Test portrait; optionally landscape.
- [ ] **Android Chrome** — Android phone (e.g. 360×640 or 412×915). Test portrait.
- [ ] **Small tablet** — iPad Mini or 768px-width viewport. Test nav (tablet nav vs hamburger) and filter panels.
- [ ] **Narrow phone** — 360px width (e.g. Chrome DevTools). No horizontal scroll; touch targets ≥44px.

---

## Key flows (mobile)

- [ ] **Home:** Hero and CTAs visible; category links tappable; no overflow.
- [ ] **Header:** Logo and hamburger tappable; open menu → all nav links and Search tappable; close; user menu (if logged in) tappable.
- [ ] **Builder:** Power source tabs tappable; hero actions (Clear, Share, Save/Login) tappable; select engine/motor/part → modal opens; table/cards scroll; no horizontal scroll.
- [ ] **Parts:** Search and Filters/Categories tappable; open filter sheet → apply/clear tappable; grid/list toggle tappable; cards/rows tappable; pagination or infinite scroll works.
- [ ] **Engines:** Power source (All/Gas/EV) and Filters tappable; filter panel (brand, sort) usable; grid/list toggle tappable; cards/table tappable.
- [ ] **Auth:** Login/Register — logo and form fields usable; submit tappable; no zoom on input focus (16px inputs).

---

## Touch & layout

- [ ] All primary buttons and icon buttons have **≥44×44px** hit area (no tiny targets).
- [ ] Sticky header and sticky page hero (Builder) don’t overlap notch/home indicator (safe area).
- [ ] Bottom sheets (filters, share) have bottom safe area and don’t get cut off.
- [ ] No **horizontal scroll** at 360px width (and 768px).
- [ ] Forms: inputs/selects readable and tappable; no unwanted zoom on focus (16px where required).

---

## Performance & stability

- [ ] Key pages load without long blank screen (LCP reasonable).
- [ ] No large layout shifts (CLS) when content loads (images sized, placeholders where needed).
- [ ] Taps/scrolls feel responsive (no long freezes).
- [ ] Pull-to-refresh (Parts/Engines) works where implemented.

---

## Quick regression checks

- [ ] Header: Search, Menu, User — all open/close correctly.
- [ ] Builder: Save/Login and Share open modals; Clear clears build.
- [ ] Parts: Filter sheet opens; category selection updates list.
- [ ] Engines: Filters panel toggles; brand/sort change results.

---

## Notes

- Prefer **one real device** (iOS or Android) per release cycle if time is limited.
- Document any device-specific bugs (e.g. “Safari 17: X”) in the PR or backlog.
- For automated checks, see `docs/mobile-plan.md` (Lighthouse, Core Web Vitals).
