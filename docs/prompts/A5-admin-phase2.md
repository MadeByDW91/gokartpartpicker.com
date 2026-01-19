# A5: Admin Phase 2 - Business Intelligence

**Agent:** A5 (Admin)  
**Status:** 🟡 In Progress  
**Phase:** 2 of 3

---

```markdown
You are Agent A5: Admin.

Build analytics and reporting tools to understand business performance.
These help optimize revenue and identify opportunities.

TASK: Admin Phase 2 - Business Intelligence

## Features to Build (In Order)

### 1. Analytics Dashboard
**Why:** Understand what's working and what's not

**Files to Create:**
- `src/app/admin/analytics/page.tsx` — Analytics dashboard
- `src/components/admin/AnalyticsChart.tsx` — Chart component
- `src/actions/admin/analytics.ts` — Analytics server actions

**Metrics to Display:**
- **Traffic Analytics:**
  - Page views per engine (top 10)
  - Page views per part (top 10)
  - Most searched categories
  - Popular search queries
  - User flow (home → engine → builder)

- **Revenue Analytics:**
  - Affiliate click-through rates
  - Estimated revenue per part/engine
  - Top revenue generators
  - Revenue trends (last 7/30 days)
  - Revenue by category

- **User Analytics:**
  - Active users (daily/weekly/monthly)
  - Build creation rate
  - Build completion rate
  - Most popular builds
  - User retention

- **Catalog Analytics:**
  - Parts with zero views
  - Missing data summary
  - Outdated information alerts
  - Duplicate detection

**UI:**
- Cards with key metrics
- Charts (line, bar, pie) using a charting library
- Date range selector (last 7/30/90 days)
- Export data to CSV

### 2. User Management
**Why:** Customer support and user insights

**Files to Create:**
- `src/app/admin/users/page.tsx` — User list
- `src/app/admin/users/[id]/page.tsx` — User detail
- `src/components/admin/UserActions.tsx` — User action buttons
- `src/actions/admin/users.ts` — User management server actions

**Features:**
- **User List:**
  - Table with: email, username, signup date, last active, builds count
  - Search by email/username
  - Filter by role, signup date
  - Sort by various columns
  - Pagination

- **User Detail Page:**
  - User profile info
  - User's builds list
  - Activity log
  - Actions: reset password, ban/suspend, delete account

- **Role Management:**
  - Assign admin role
  - View role assignments
  - Role audit log

### 3. Build Moderation
**Why:** Quality control and community management

**Files to Create:**
- `src/app/admin/builds/page.tsx` — Build moderation queue
- `src/components/admin/BuildReview.tsx` — Build review component
- `src/actions/admin/builds.ts` — Build moderation server actions

**Features:**
- **Build Review Queue:**
  - List of flagged builds
  - List of public builds pending review
  - Build details view
  - Actions: approve, reject, edit, delete

- **Build Analytics:**
  - Most popular builds (by views/likes)
  - Build completion rates
  - Abandoned builds
  - Average parts per build

- **Build Actions:**
  - Feature build (show on homepage)
  - Hide build
  - Delete build
  - Edit build details

### 4. Enhanced Dashboard
**Why:** Better overview of business health

**Files to Update:**
- `src/app/admin/page.tsx` — Enhance existing dashboard

**Add:**
- Revenue chart (last 30 days)
- Top performing parts/engines
- Recent activity feed
- Quick stats cards
- Alerts (missing data, broken links, etc.)

## Implementation Notes

### Analytics:
- Track page views (add to database or use analytics service)
- Track affiliate clicks (add click tracking)
- Use charting library: Recharts, Chart.js, or similar
- Cache analytics data (refresh every hour)

### User Management:
- Use existing `profiles` table
- Add `role` field if not exists
- Add `banned_at` field for user bans
- Audit log for admin actions

### Build Moderation:
- Add `flagged_at` and `flagged_reason` to builds table
- Add `reviewed_at` and `reviewed_by` fields
- Add `featured` boolean field

## Success Criteria

- [ ] Analytics dashboard shows accurate metrics
- [ ] Charts render correctly
- [ ] User list/search works
- [ ] User detail page shows all info
- [ ] Build moderation queue works
- [ ] Build review actions work
- [ ] Enhanced dashboard provides useful insights
- [ ] All data is secure (admin-only access)

## DO NOT

- Do NOT expose sensitive user data
- Do NOT allow non-admins to access these pages
- Do NOT break existing functionality
```
