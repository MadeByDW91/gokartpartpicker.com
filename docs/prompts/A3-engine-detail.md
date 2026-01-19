# A3: Engine Detail Pages

**Agent:** A3 (UI)  
**Status:** ✅ Complete

---

```markdown
You are Agent A3: UI.

The engines list page works at `/engines`. 
There's a route at `/engines/[slug]/page.tsx` that needs completion.
Server action `getEngineBySlug()` exists and works.

TASK: Complete Engine Detail Pages

File: `src/app/engines/[slug]/page.tsx`

Update this page to:
1. Fetch engine by slug using `getEngineBySlug()` from `@/actions/engines`
2. Display full engine specs (name, brand, displacement, HP, torque, shaft, weight, price)
3. Add "Start Build" button linking to `/builder?engine={slug}`
4. SEO metadata — dynamic title/description
5. 404 handling — use `notFound()` if engine not found

Create component: `src/components/EngineSpecs.tsx` to display specs in a grid.

Use dark theme, orange accents, mobile responsive.

Success Criteria:
- `/engines/predator-212-hemi` loads correctly
- All specs display
- 404 works for invalid slugs
- SEO metadata is dynamic
- "Start Build" button works
- Mobile responsive
- No TypeScript errors

DO NOT modify server actions, database schema, or add dependencies.
```
