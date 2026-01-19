# Prompt Library

> **All prompts in one place — A0 manages which one to use**

---

## 🎯 Quick Reference

| # | Agent | What It Does | When to Use |
|---|-------|--------------|-------------|
| 1 | A3 | Engine detail pages | After engines list works |
| 2 | A3 | Parts list & detail pages | After parts data exists |
| 3 | A3 | Builder UI | After parts pages done |
| 4 | A6 | Compatibility engine | Can run anytime |
| 5 | A5/A7 | Seed parts data | Can run anytime |
| 6 | A1/A5 | Update engine prices (Harbor Freight) | Can run anytime |

---

## 📋 PROMPT 1: A3 — Engine Detail Pages

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

---

## 📋 PROMPT 2: A3 — Parts List & Detail Pages

```markdown
You are Agent A3: UI.

Admin parts CRUD is complete. Parts can be added via admin.
Now build the public-facing parts browsing experience.

TASK: Build Parts Browse & Detail Pages

Files to create/update:
1. `src/app/parts/page.tsx` — Parts list with filters
2. `src/app/parts/[slug]/page.tsx` — Part detail page
3. `src/components/PartCard.tsx` — Update/create
4. `src/components/PartsFilter.tsx` — Create filter sidebar

Parts list should have:
- Grid of PartCards
- Category filter
- Brand filter
- Price range filter
- Sort dropdown
- Empty state

Part detail should have:
- Full part info
- Image (with fallback)
- Specs list
- "Add to Build" button
- SEO metadata

Use server actions: `getParts()`, `getPartBySlug()`, `getPartCategories()`, `getPartBrands()`

Match engine page styling. Dark theme, orange accents, responsive.

Success Criteria:
- `/parts` shows all active parts
- Filters work
- `/parts/[slug]` shows detail
- SEO metadata is dynamic
- Mobile responsive

DO NOT modify server actions or database schema.
```

---

## 📋 PROMPT 3: A3 — Builder UI

```markdown
You are Agent A3: UI.

Engine and parts pages are complete. Now build the core builder
interface where users configure their go-kart build.

TASK: Build the Build Configurator

File: `src/app/builder/page.tsx`

Builder flow:
1. Select Engine (show engine cards)
2. Add Parts by category (category tabs, parts grid)
3. Review & Save (summary, save/share)

Use Zustand store: `src/store/build-store.ts`

Components to create:
- `src/components/builder/EngineSelector.tsx`
- `src/components/builder/CategoryPartsList.tsx`
- `src/components/builder/BuildSummary.tsx`
- `src/components/builder/CompatibilityBadge.tsx`

URL state support:
- `/builder` — Fresh start
- `/builder?engine=predator-212` — Pre-select engine
- `/builder?build=abc123` — Load existing build

Success Criteria:
- Engine selection works
- Parts organized by category
- Add/remove parts works
- Build summary updates live
- Compatibility warnings display (if A6 is done)
- Save build works (auth required)
- Share generates public link
- Mobile responsive

DO NOT modify server actions or database schema.
```

---

## 📋 PROMPT 4: A6 — Compatibility Engine

```markdown
You are Agent A6: Compatibility & Rules Intelligence Agent.

The compatibility engine DESIGN is complete. See:
- `docs/compatibility-engine-design.md` — Full specification
- `docs/compatibility-handoff-notes.md` — Integration guides

The builder UI is built. Now IMPLEMENT the compatibility checking
logic that evaluates if parts work together.

TASK: Implement Compatibility Engine

Files to create:
1. `src/lib/compatibility/engine.ts` — Core evaluator
2. `src/lib/compatibility/rules/` — Rule implementations (physical, mechanical, safety, etc.)
3. `src/lib/compatibility/types.ts` — TypeScript types
4. `src/lib/compatibility/risk.ts` — Risk tier calculator
5. `src/lib/compatibility/dimensions.ts` — Dimension matching
6. `src/actions/compatibility.ts` — Server action (update)
7. `src/hooks/use-compatibility.ts` — React hook (update)
8. `src/components/compatibility/` — UI components

Verdict types: HARD_BLOCK, REQUIRED, SOFT_BLOCK, WARNING, NOTICE, COMPATIBLE, RECOMMENDED

Rule categories: P-Rules (Physical), M-Rules (Mechanical), S-Rules (Safety), D-Rules (Dependency), X-Rules (Exclusion), A-Rules (Advisory)

Every verdict must include: summary, message, rules[], suggestions[]

Success Criteria:
- All rule categories implemented
- Verdict precedence works
- Short-circuit on HARD_BLOCK
- Risk tier calculation accurate
- Performance <200ms
- Caching implemented
- UI components display all verdict types

DO NOT use AI/ML, modify database schema, or hardcode rules.
```

---

## 📋 PROMPT 5: A5/A7 — Seed Parts Data

```markdown
You are Agent A5: Admin (or A7: Ingestion).

A3 is building parts pages and needs sample data to test with.
The parts table is currently empty. We need 10-15 realistic parts.

TASK: Create Sample Parts Data

Option A: SQL Seed File
Create: `supabase/migrations/20260116000006_seed_parts.sql`

Include 10-15 parts covering:
- Clutch (2-3 parts: MaxTorque, Hilliard)
- Torque Converter (1-2 parts: Comet 30/40)
- Chain (2-3 parts: #35, #40, #420)
- Sprocket (2-3 parts: various tooth counts)
- Brake (1-2 parts: disc, drum)

Each part needs:
- slug (URL-friendly)
- name (full product name)
- category (enum value)
- category_id (UUID from part_categories - lookup first)
- brand (manufacturer)
- specifications (JSONB with category-specific specs)
- price (realistic USD)
- is_active (true)

Example:
- MaxTorque Clutch 3/4" — $49.99
- Comet 30 Series TC — $199.99
- #35 Chain 10ft — $24.99

First, get category IDs:
SELECT id, slug FROM part_categories WHERE slug IN ('clutch', 'torque_converter', 'chain', 'sprocket', 'brake');

Then insert parts using those UUIDs.

Success Criteria:
- 10-15 parts created
- All major categories represented
- Realistic prices and specs
- Parts visible in admin
- Parts queryable via getParts()

DO NOT modify database schema or use placeholder images.
```

---

## 📋 PROMPT 6: A1/A5 — Update Engine Prices from Harbor Freight

```markdown
You are Agent A1: Database (or A5: Admin).

Engines currently don't have prices set. We need to add Harbor Freight
prices for all Predator engines. These are NOT affiliate links - just
direct prices from harborfreight.com.

TASK: Update Engine Prices from Harbor Freight

Option A: SQL Migration (Recommended)
Create: `supabase/migrations/20260116000007_update_engine_prices.sql`

Update all Predator engines with current Harbor Freight prices:
1. Predator 79cc
2. Predator 212 Non-Hemi
3. Predator 212 Hemi
4. Predator Ghost 212
5. Predator 224
6. Predator 301
7. Predator 420
8. Predator 670

Go to harborfreight.com and get current prices for each.

SQL Template:
```sql
UPDATE engines 
SET price = 149.99  -- Replace with actual Harbor Freight price
WHERE slug = 'predator-212-hemi';
```

Optional: Set affiliate_url to direct Harbor Freight product page (NOT affiliate link):
```sql
UPDATE engines 
SET affiliate_url = 'https://www.harborfreight.com/212cc-predator-hemi-engine-69730.html'
WHERE slug = 'predator-212-hemi';
```

Success Criteria:
- All Predator engines have prices
- Prices match Harbor Freight website
- Prices display correctly in UI

DO NOT use affiliate links for engines. See docs/PRICING-POLICY.md.
```

---

## 📋 PROMPT 7: A3 — SEO & Metadata

```markdown
You are Agent A3: UI.

TASK: Add SEO Metadata to All Pages

Add dynamic metadata to:
- Engine detail pages
- Parts detail pages
- Builder page
- Homepage

Use Next.js `generateMetadata()` for dynamic pages.
Add Open Graph tags, Twitter cards, structured data.

Success Criteria:
- All pages have unique titles
- All pages have descriptions
- OG tags present
- Structured data (JSON-LD) where appropriate
```

---

*All prompts ready — A0 will tell you which one to use next*
