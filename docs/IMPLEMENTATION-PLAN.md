# Implementation Plan

> **Complete plan to implement all pending TODOs and value-add features**

---

## 📊 Overview

**Total Tasks:** 12  
**Priority:** High → Medium → Low

---

## 🎯 Phase 1: Critical Admin Features

### 1.1 Admin Compatibility Rules Management ⭐ HIGH PRIORITY

**Status:** Missing page and admin actions  
**Why:** Core feature - compatibility is the foundation of the site

**Tasks:**
1. **Create Admin Server Actions** (`frontend/src/actions/admin/compatibility.ts`)
   - `getAdminCompatibilityRules()` → List all rules (admin view)
   - `createCompatibilityRule(data)` → Create new rule
   - `updateCompatibilityRule(id, data)` → Update existing rule
   - `deleteCompatibilityRule(id)` → Delete rule (soft delete)
   - `toggleRuleActive(id, isActive)` → Enable/disable rule

2. **Create Admin Page** (`frontend/src/app/admin/compatibility/page.tsx`)
   - List all compatibility rules
   - Filter by rule type, category, severity
   - Create new rule form
   - Edit existing rules
   - Delete/deactivate rules
   - Search and sort

3. **Create Rule Form Component** (`frontend/src/components/admin/CompatibilityRuleForm.tsx`)
   - Rule type selector (shaft_match, chain_pitch, etc.)
   - Source/target category selectors
   - Condition builder (JSON editor)
   - Warning message editor
   - Severity selector (error/warning/info)

4. **Integration**
   - Add route to admin navigation
   - Add "Compatibility Rules" to admin dashboard

**Dependencies:** None  
**Agent:** A5 (Admin)

**Success Criteria:**
- [ ] Admin can view all compatibility rules
- [ ] Admin can create new rules via form
- [ ] Admin can edit existing rules
- [ ] Admin can delete/deactivate rules
- [ ] Rules are properly validated before saving
- [ ] Changes reflect in builder compatibility checks

---

### 1.2 Verify Existing Admin Pages

**Status:** Pages exist but need verification  
**Why:** Ensure quality before production

#### 1.2.1 Verify Affiliate Links Page
**Task:** Test `frontend/src/app/admin/affiliate/page.tsx`
- [ ] AffiliateLinkGenerator component loads
- [ ] Can generate Amazon affiliate links
- [ ] Can generate eBay affiliate links (if configured)
- [ ] Links are properly formatted
- [ ] Bulk apply to selected parts/engines works
- [ ] Error handling works

**Agent:** A4/A5 (Testing)

#### 1.2.2 Verify API Keys Management
**Task:** Test `frontend/src/app/admin/api/page.tsx`
- [ ] Can view all API keys
- [ ] Can generate new API keys
- [ ] Can revoke API keys
- [ ] Integration status displays correctly
- [ ] Environment variables properly configured

**Agent:** A4/A5 (Testing)

#### 1.2.3 Verify Price Monitor
**Task:** Test `frontend/src/app/admin/pricing/monitor/page.tsx`
- [ ] Shows engines/parts with missing prices
- [ ] Can update prices individually
- [ ] Bulk price update works
- [ ] Price history tracking (if implemented)

**Agent:** A4/A5 (Testing)

#### 1.2.4 Verify Templates Admin
**Task:** Test `frontend/src/app/admin/templates/page.tsx`
- [ ] Can list all templates
- [ ] Can create new template
- [ ] Can edit template
- [ ] Can delete template
- [ ] Template CRUD works end-to-end

**Agent:** A4/A5 (Testing)

#### 1.2.5 Check Content Page Status
**Task:** Determine if `/admin/content` page is needed
- [ ] Check admin features plan for content management requirements
- [ ] If needed, create basic content management page
- [ ] If not needed, remove from navigation

**Estimated Time:** 30 minutes  
**Agent:** A0/A5 (Planning)

---

## 🚀 Phase 2: Value-Add Features

### 2.1 Performance Calculator ⭐ HIGH PRIORITY

**Status:** Prompt ready (`docs/prompts/A7-performance-calculator.md`)  
**Why:** Foundation for other features (comparisons, recommendations)

**Tasks:**
1. **Create Performance Calculator Library** (`frontend/src/lib/performance/calculator.ts`)
   - `calculateBuildHP(engine, parts)` → number
   - `calculateBuildTorque(engine, parts)` → number
   - `estimateTopSpeed(hp, weight, gearRatio)` → number
   - `calculatePowerToWeight(hp, weight)` → number

2. **Create React Hook** (`frontend/src/hooks/use-build-performance.ts`)
   - React hook that calculates performance when build changes
   - Returns: `{ hp, torque, topSpeed, powerToWeight }`
   - Updates live as parts are added/removed

3. **Create Performance Card Component** (`frontend/src/components/builder/PerformanceCard.tsx`)
   - Display: Estimated HP, Torque, Top Speed, Power-to-Weight
   - Visual indicators (badges, progress bars)
   - Update live in builder

4. **Integrate into Builder**
   - Add `PerformanceCard` to `BuildSummary.tsx`
   - Use `use-build-performance` hook in builder page
   - Display performance in build detail pages

5. **Update Part Specifications** (Admin task)
   - Add `hp_contribution` to part specifications (JSONB)
   - Add `torque_contribution` to part specifications
   - Seed sample values for existing parts

**Dependencies:** None  
**Agent:** A7 (Backend/Logic) + A3 (UI integration)

**Success Criteria:**
- [ ] HP calculation shows in builder summary
- [ ] Torque calculation shows in builder summary
- [ ] Top speed estimate displays
- [ ] Power-to-weight ratio shows
- [ ] Performance updates live as parts are added/removed
- [ ] Calculations are accurate (±5% of real-world estimates)

---

### 2.2 Cost Calculator & Budget Tracker ⭐ HIGH PRIORITY

**Status:** Prompt ready (`docs/prompts/A3-cost-calculator.md`)  
**Why:** High user value, straightforward to implement

**Tasks:**
1. **Create Cost Hook** (`frontend/src/hooks/use-build-cost.ts`)
   - Calculate total cost from engine + parts
   - Calculate breakdown by category
   - Budget comparison logic

2. **Create Cost Components**
   - `CostCard.tsx` - Total cost, budget input, progress bar
   - `CostBreakdown.tsx` - Category breakdown with percentages

3. **Integrate into Builder**
   - Add `CostCard` to `BuildSummary.tsx`
   - Real-time cost updates
   - Budget warnings (green/yellow/red)

4. **Alternative Suggestions** (Optional)
   - Find most expensive parts when over budget
   - Suggest cheaper alternatives from same category

**Dependencies:** None  
**Estimated Time:** 1-2 days  
**Agent:** A3 (UI)

**Success Criteria:**
- [ ] Total cost displays in builder summary
- [ ] Cost updates live as parts are added/removed
- [ ] Budget input/display works
- [ ] Budget warnings show when approaching/exceeding
- [ ] Cost breakdown by category displays

---

### 2.3 Build Recommendations Engine

**Status:** Prompt ready (`docs/prompts/A7-build-recommendations.md`)  
**Why:** Helps users make decisions, improves engagement

**Tasks:**
1. **Create Recommendations Server Actions** (`frontend/src/actions/recommendations.ts`)
   - `getRecommendations(engineId, category, goal)` → Part[]
   - `getPopularCombinations(engineId)` → PartCombination[]
   - `getUpgradePath(engineId, currentParts, goal)` → UpgradeStep[]

2. **Track Popular Combinations** (Update `builds.ts`)
   - Aggregate statistics from saved builds
   - Track most common part combinations per engine

3. **Create Recommendations Hook** (`frontend/src/hooks/use-recommendations.ts`)
   - Fetch recommendations based on engine/category/goal
   - Returns: `{ recommendations, popularCombinations, upgradePath }`

4. **Create Recommendations Panel** (`frontend/src/components/builder/RecommendationsPanel.tsx`)
   - Display "Suggested Parts" for selected category
   - "Popular Combinations" section
   - "Upgrade Path" guidance
   - Goal selector (speed/torque/reliability/budget)

5. **Integrate into Builder**
   - Add `RecommendationsPanel` to builder page
   - Show recommendations in part selection flow
   - One-click "Add to Build" from recommendations

**Dependencies:** Performance Calculator (for upgrade path HP gains)  
**Agent:** A7 (Backend/Logic) + A3 (UI)

**Success Criteria:**
- [ ] Recommendations display in builder for selected category
- [ ] Goal selector works (speed/torque/reliability/budget)
- [ ] Popular combinations show based on saved builds
- [ ] Upgrade path guidance displays
- [ ] One-click "Add to Build" from recommendations

---

## 🎨 Phase 3: User-Facing Features

### 3.1 Build Comparison Tool

**Status:** Prompt ready (`docs/prompts/A3-build-comparison.md`)  
**Why:** Helps users compare different build options

**Tasks:**
1. **Create Comparison Page** (`frontend/src/app/builds/compare/page.tsx`)
   - Query params: `?builds=id1,id2,id3`
   - Build selector (search/pick builds)
   - Comparison table/cards

2. **Create Comparison Components**
   - `BuildComparison.tsx` - Main comparison component
   - `ComparisonRow.tsx` - Individual metric row
   - `BuildSelector.tsx` - Multi-select build picker

3. **Update Builds Server Action** (`frontend/src/actions/builds.ts`)
   - `getBuildsForComparison(buildIds)` → Build[]

4. **Comparison Metrics**
   - Cost, HP, Torque, Parts count, Compatibility status
   - Visual highlighting (green/red/gray)
   - "Best value" badge

5. **Integration**
   - Link from build detail pages ("Compare Builds" button)
   - Shareable URL format: `/builds/compare?builds=id1,id2`

**Dependencies:** Performance Calculator (for HP/torque comparisons)  
**Agent:** A3 (UI)

**Success Criteria:**
- [ ] Compare 2-3 builds side-by-side
- [ ] All key metrics display (cost, HP, torque, parts)
- [ ] Visual highlighting works (green/red/gray)
- [ ] Build selector works (search/pick builds)
- [ ] Comparison URL is shareable

---

### 3.2 Shopping List Generator

**Status:** Prompt ready (`docs/prompts/A3-shopping-list.md`)  
**Why:** Export functionality - helps users purchase parts

**Tasks:**
1. **Create Shopping List Page** (`frontend/src/app/builds/[id]/shopping-list/page.tsx`)
   - Shopping list view
   - Print-friendly layout
   - Export buttons

2. **Create Shopping List Components**
   - `ShoppingList.tsx` - Main list component
   - `ShoppingListItem.tsx` - Individual item with checkbox
   - Category grouping

3. **Create Export Utilities** (`frontend/src/lib/export/shopping-list.ts`)
   - `generateShoppingListPDF(build)` → PDF (optional - can use print CSS)
   - `generateShoppingListHTML(build)` → HTML
   - `generateShoppingListCSV(build)` → CSV (optional)

4. **Update Builds Server Action**
   - `getBuildForShoppingList(buildId)` → Build with full part data

5. **Integration**
   - Link from build detail pages ("Generate Shopping List")
   - Link from builder ("Export Shopping List")
   - Print CSS (`@media print`)

**Dependencies:** None  
**Estimated Time:** 1-2 days  
**Agent:** A3 (UI)

**Success Criteria:**
- [ ] Shopping list displays build parts organized by category
- [ ] Checkboxes work (can mark items as purchased)
- [ ] Total cost displays at bottom
- [ ] Print-friendly layout (CSS @media print)
- [ ] Shareable link works
- [ ] URLs link to affiliate/purchase pages

---

### 3.3 Build Templates - User Gallery

**Status:** Prompt ready (`docs/prompts/A3-A5-build-templates.md`)  
**Why:** Quick-start builds for common use cases

**Tasks:**
1. **Create Templates Server Actions** (`frontend/src/actions/templates.ts`)
   - `getTemplates(goal?: string)` → Template[] (public)
   - `getTemplate(id)` → Template (public)
   - User-facing actions (read-only)

2. **Create Templates Gallery Page** (`frontend/src/app/templates/page.tsx`)
   - Template gallery
   - Filter by goal/category
   - Template cards with preview

3. **Create Template Components**
   - `TemplateCard.tsx` - Template preview card
   - `TemplatePreview.tsx` - Detailed preview modal

4. **Update Builder Page**
   - Add "Start from Template" button
   - Load template into builder state
   - Allow customization before saving

5. **Integration**
   - Link from homepage ("Browse Templates")
   - Link from builder ("Start from Template")

**Note:** Admin template CRUD already exists (see admin/templates pages)

**Dependencies:** Templates database table (already exists)  
**Agent:** A3 (UI)

**Success Criteria:**
- [ ] Template gallery displays all public templates
- [ ] Filter by goal works
- [ ] Template preview shows parts/cost
- [ ] "Apply to Builder" loads template into builder
- [ ] Can customize template before saving

---

## 📋 Implementation Order (Recommended)

### Phase 1: Critical Admin
1. Admin Compatibility Rules Management
2. Verify existing admin pages
3. Fix any issues found

### Phase 2: Foundation Features
1. Performance Calculator
2. Cost Calculator & Budget Tracker

### Phase 3: Intelligence & Comparison
1. Build Recommendations Engine
2. Build Comparison Tool

### Phase 4: Export & Templates
1. Shopping List Generator
2. Build Templates - User Gallery
3. Testing & polish

---

## 🎯 Success Metrics

### Phase 1 (Admin)
- All admin pages functional
- Compatibility rules manageable via UI
- No broken admin features

### Phase 2 (Value-Add)
- Performance calculations accurate
- Cost tracking working
- Recommendations relevant and useful

### Phase 3 (User Features)
- Comparison tool functional
- Shopping lists printable
- Templates gallery accessible

---

## 📝 Notes

- **Prompts Available:** All value-add features have ready-to-use prompts in `docs/prompts/`
- **Parallel Work:** Phase 2 and Phase 3 can have some parallel work (A7 + A3)
- **Testing:** Test each feature before moving to next
- **Documentation:** Update `NEXT-PROMPT.md` as tasks complete

---

## 🔄 After Completion

Once all tasks are complete:
1. Update `SIMPLE-STATUS.md` with completion status
2. Update `NEXT-PROMPT.md` to point to production deployment
3. Run full test suite
4. Prepare for production deployment

---

*Last Updated: 2025-01-16*  
*Status: Ready to Start*  
*Next Action: Begin Phase 1 - Admin Compatibility Rules Management*
