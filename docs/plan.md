# Implementation Plan - GoKart Part Picker MVP

## Phase 1: Core Data Layer + Read APIs + UI (Current)

### Step 1: Project Setup ✅
- [x] Initialize Next.js with TypeScript
- [x] Configure Tailwind CSS with brand tokens
- [x] Set up Prisma with PostgreSQL
- [x] Create brand styling configuration

### Step 2: Database Schema ✅
- [x] Create Prisma schema with all models:
  - Engine, Part, Vendor, VendorOffer
  - Guide, GuideStep, GuideEngine, GuidePart
  - TodoTemplate, TodoTemplateStep, TodoTemplatePart
  - PartCompatibility (join table)
  - StoreProduct, Build, BuildPart, BuildTodoItem (for future)
- [x] Set up proper relationships and indexes

### Step 3: Seed Data ✅
- [x] Create seed script with:
  - 5 engines (Predator 212 variants, 420, 670)
  - 13+ parts across all categories
  - 2 vendors (Amazon, GoPowerSports)
  - Multiple vendor offers per part
  - 5 guides with steps
  - 2 todo templates

### Step 4: Utility Functions ✅
- [x] `lib/calculations.ts`: HP range, safe RPM, total cost, warnings
- [x] `lib/vendorSort.ts`: Amazon-first sorting logic
- [x] `lib/buildStore.ts`: Zustand store with localStorage persistence

### Step 5: API Routes ✅
- [x] `GET /api/engines` - List all engines
- [x] `GET /api/engines/[slug]` - Engine detail
- [x] `GET /api/parts` - List parts (with filters)
- [x] `GET /api/parts/[slug]` - Part detail with sorted offers
- [x] `GET /api/guides` - List all guides
- [x] `GET /api/guides/[slug]` - Guide detail with steps
- [x] `GET /api/search?q=` - Unified search

### Step 6: UI Pages ✅
- [x] Homepage (`/`) - Hero + links
- [x] Engines list (`/engines`) - Grid of engine cards
- [x] Engine detail (`/engines/[slug]`) - Details + "Start build" button
- [x] Parts catalog (`/parts`) - Filterable list
- [x] Part detail (`/parts/[slug]`) - Details + vendor table + "Add to build"
- [x] Guides list (`/guides`) - Grid of guide cards
- [x] Guide detail (`/guides/[slug]`) - Steps with warnings
- [x] Build workbench (`/build`) - Selected engine + parts + calculations + warnings
- [x] Build summary (`/build/summary`) - Table + totals + export placeholder
- [x] Search (`/search`) - Unified search results

### Step 7: Build State Management ✅
- [x] Zustand store with localStorage persistence
- [x] Add/remove engine
- [x] Add/remove parts with selected offers
- [x] Update part offers
- [x] Clear build

## Phase 2: Future Enhancements (Not in MVP)

1. **Engine Workbench SVG Hotspots**
   - Interactive engine diagram
   - Click parts to add to build
   - Visual part placement

2. **Stripe Integration**
   - Checkout flow
   - Payment processing
   - Order management

3. **Build Persistence**
   - Save builds to database
   - User accounts (optional)
   - Share builds via URL

4. **Advanced Features**
   - Build templates
   - Part compatibility warnings
   - Performance calculator
   - Build comparison tool

## Testing Checklist

- [x] `pnpm prisma migrate dev` works
- [x] `pnpm db:seed` seeds without errors
- [x] All pages render without runtime errors
- [x] Part detail page shows vendor table sorted correctly (Amazon first)
- [x] Build page updates HP/RPM/cost live when parts are added/removed
- [x] Warnings appear for unsafe combos
- [x] Guides render step cards with warning styles
- [x] Search returns results for engines, parts, guides
- [x] Guide detail page has "Add required parts/tools to build" functionality

