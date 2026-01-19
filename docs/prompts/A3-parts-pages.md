# A3: Parts List & Detail Pages

**Agent:** A3 (UI)  
**Status:** 🟡 In Progress

---

```markdown
You are Agent A3: UI.

Admin parts CRUD is complete. Parts data has been seeded.
Now build the public-facing parts browsing experience.

TASK: Build Parts Browse & Detail Pages

Files to create/update:
1. `src/app/parts/page.tsx` — Parts list with filters
2. `src/app/parts/[slug]/page.tsx` — Part detail page
3. `src/components/PartCard.tsx` — Update/create
4. `src/components/PartsFilter.tsx` — Create filter sidebar

Parts list should have:
- Grid of PartCards
- Category filter (dropdown or checkboxes)
- Brand filter
- Price range filter
- Sort dropdown (name, price, newest)
- Empty state (if no parts found)
- Loading skeletons

Part detail should have:
- Full part info
- Image (with fallback placeholder)
- Specs list (from specifications JSONB)
- Price display
- "Add to Build" button
- Compatible engines list (if any)
- SEO metadata (dynamic)

Use server actions:
- `getParts()` — List with filters
- `getPartBySlug()` — Single part
- `getPartCategories()` — For filter dropdown
- `getPartBrands()` — For brand filter

Match engine page styling. Dark theme, orange accents, responsive.

Success Criteria:
- `/parts` shows all active parts
- Category filter works
- Brand filter works
- Price filter works
- Sort works
- `/parts/[slug]` shows part detail
- SEO metadata is dynamic
- "Add to Build" button works
- Empty state shows when no results
- Mobile responsive
- No TypeScript errors

DO NOT modify server actions or database schema.
```
