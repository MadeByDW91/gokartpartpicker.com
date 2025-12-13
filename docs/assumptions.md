# Implementation Assumptions

This document captures assumptions made during implementation where the PDR was unclear or required interpretation.

## Data Model Assumptions

1. **Part Categories**: Using string enum values: `intake`, `exhaust`, `springs`, `cam`, `flywheel`, `rod`, `governor_delete`, `oil_sensor_delete`, `torque_converter`, `tool`

2. **Part Compatibility**: All parts are compatible with all Predator 212 variants (Hemi, Non-Hemi, Ghost) by default. This can be refined later with actual compatibility data.

3. **Vendor Priority**: Amazon has priority 0, all other vendors have priority >= 1. Lower number = higher priority.

4. **RPM Limit Delta**: Parts that increase safe RPM have positive `rpmLimitDelta`. Safety components (billet flywheel, billet rod) have `rpmLimitDelta: 0` as they don't increase RPM capability, they enable it safely.

5. **HP Gain**: Parts that don't directly add HP (like springs, flywheel) have `hpGainMin: 0, hpGainMax: 0`.

## UI/UX Assumptions

1. **Build State**: Using localStorage for MVP (session-based). No authentication required.

2. **Vendor Sorting**: Amazon always appears first if an offer exists, regardless of price. Then sorted by total price (price + shipping).

3. **Warnings Display**: 
   - Errors (red) for unsafe RPM without safety components
   - Warnings (yellow) for missing recommended parts (springs/cam)

4. **Part Selection**: When adding a part to build, user must select a vendor offer. If no offer selected, part can still be added but won't contribute to cost calculation.

5. **Guide Steps**: Steps with warnings display in red-bordered cards. Regular steps display in standard gray borders.

## Technical Assumptions

1. **Database**: PostgreSQL (as specified in PDR). Using Prisma for ORM.

2. **Styling**: Tailwind CSS with custom brand tokens. Oswald for headings, Inter for body text.

3. **State Management**: Zustand for build state with localStorage persistence. Simple approach for MVP.

4. **API Routes**: Next.js Route Handlers (App Router). All routes are server-side rendered where possible.

5. **Search**: Simple server-side search using Prisma's `contains` with case-insensitive mode. No full-text search for MVP.

6. **Image URLs**: Placeholder `null` values for now. Can be updated with actual image URLs later.

7. **Affiliate URLs**: Placeholder URLs in seed data. Actual affiliate links to be added later.

## Missing Features (Intentionally Excluded from MVP)

1. **User Authentication**: Not in MVP scope. Build state is session-based only.

2. **Build Persistence**: Builds are stored in localStorage only. No database persistence for builds in MVP.

3. **Export Functionality**: Placeholder button on summary page. Actual export (PDF, JSON, etc.) to be implemented later.

4. **Stripe Integration**: Models exist but checkout flow not implemented.

5. **Physical Fulfillment**: Not in scope for MVP.

6. **Engine Workbench SVG**: Interactive diagram not implemented. Basic build page only.

7. **Build Templates**: Not in MVP scope.

8. **Part Recommendations**: No AI or algorithm-based recommendations. Users select parts manually.

## Future Considerations

- Add user authentication for build persistence
- Implement actual affiliate link tracking
- Add image upload/management
- Implement export functionality (PDF, JSON)
- Add build sharing via URL
- Implement Stripe checkout
- Add engine workbench SVG with hotspots
- Add part compatibility warnings beyond RPM limits
- Add build templates/presets

