# Development Phases

> **Status:** Active Development  
> **Goal:** Production-ready MVP

---

## 📋 Phase Overview

| Phase | Focus | Status | Priority |
|-------|-------|--------|----------|
| **Phase 1** | Core Data & Admin | 🟡 In Progress | HIGH |
| **Phase 2** | Public Pages | ⏳ Pending | HIGH |
| **Phase 3** | Builder & Compatibility | ⏳ Pending | HIGH |
| **Phase 4** | Polish & Deploy | ⏳ Pending | MEDIUM |

---

## 🎯 PHASE 1: Core Data & Admin

**Goal:** Complete backend infrastructure and enable data entry

### Tasks

#### 1.1 Server Actions (A4)
- [x] Engine actions complete
- [x] Parts actions complete (verify category_id vs category)
- [x] Builds actions complete
- [x] Compatibility actions complete
- [x] Admin actions complete
- [ ] Fix any query issues (category_id column name)

#### 1.2 Admin Parts CRUD (A5)
- [ ] `/admin/parts` - List all parts
- [ ] `/admin/parts/new` - Create part form
- [ ] `/admin/parts/[id]` - Edit part form
- [ ] PartForm component
- [ ] Category dropdown integration
- [ ] Image URL input
- [ ] Validation & error handling

#### 1.3 Seed Sample Parts (A5/A7)
- [ ] Add 5-10 sample parts via admin
- [ ] Cover multiple categories (clutch, chain, brake, etc.)
- [ ] Test CRUD operations

**Gate Criteria:**
- Admin can create/edit/delete parts
- Parts display correctly in admin list
- No TypeScript errors

---

## 🌐 PHASE 2: Public Pages

**Goal:** Users can browse engines and parts

### Tasks

#### 2.1 Engine Detail Pages (A3)
- [ ] Fix `/engines/[slug]` route (use slug, not id)
- [ ] Display full engine specs
- [ ] EngineSpecs component
- [ ] "Start Build" button linking to builder
- [ ] SEO metadata (dynamic)
- [ ] 404 handling

#### 2.2 Parts List Page (A3)
- [ ] `/parts` - Grid of PartCards
- [ ] Category filter sidebar
- [ ] Brand filter
- [ ] Price range filter
- [ ] Sort dropdown
- [ ] Empty state
- [ ] Loading skeletons

#### 2.3 Parts Detail Page (A3)
- [ ] `/parts/[slug]` - Full part info
- [ ] Image display (with fallback)
- [ ] Specs list
- [ ] Compatible engines list
- [ ] "Add to Build" button
- [ ] SEO metadata

**Gate Criteria:**
- All pages load without errors
- Filters work correctly
- SEO metadata is dynamic
- Mobile responsive

---

## 🔧 PHASE 3: Builder & Compatibility

**Goal:** Users can configure builds and see compatibility

### Tasks

#### 3.1 Builder UI (A3)
- [ ] Engine selection step
- [ ] Category-based parts selection
- [ ] Build summary sidebar
- [ ] Add/remove parts
- [ ] URL state management
- [ ] Mobile responsive layout

#### 3.2 Compatibility Integration (A6)
- [ ] Check compatibility on part selection
- [ ] Display warnings/errors
- [ ] CompatibilityBadge component
- [ ] Real-time feedback

#### 3.3 Save/Share Builds (A4)
- [ ] Save build (auth required)
- [ ] Share build (public link)
- [ ] Load existing build from URL
- [ ] User's saved builds list

**Gate Criteria:**
- Builder flow works end-to-end
- Compatibility warnings display
- Builds save correctly
- Share links work

---

## ✨ PHASE 4: Polish & Deploy

**Goal:** Production-ready, optimized, deployed

### Tasks

#### 4.1 SEO & Metadata (A3)
- [ ] Dynamic meta tags on all pages
- [ ] Open Graph images
- [ ] Sitemap generation
- [ ] robots.txt

#### 4.2 Error Handling (A4)
- [ ] Error boundaries
- [ ] 404 pages
- [ ] 500 error page
- [ ] User-friendly error messages

#### 4.3 Performance (A9)
- [ ] Image optimization
- [ ] Code splitting
- [ ] Lighthouse audit
- [ ] Core Web Vitals

#### 4.4 Deployment (A9)
- [ ] Vercel setup
- [ ] Environment variables
- [ ] Domain configuration
- [ ] Monitoring setup

**Gate Criteria:**
- Lighthouse score >90
- All pages have SEO metadata
- Error handling works
- Production deployed

---

## 🚀 Current Priority: Phase 1

**Next Steps:**
1. Fix parts query (category_id column)
2. Build admin parts CRUD
3. Seed sample parts

---

*Last Updated: 2026-01-16*
