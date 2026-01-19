# Forums Admin Tools - Feature Proposal

> **Status:** 📋 Proposal - Awaiting Approval  
> **Target Section:** `/admin/forums`  
> **Integration:** Add to admin navigation sidebar

---

## 🎯 Overview

Admin tools for managing the community forums: moderation, content management, user management, and analytics.

---

## 📋 Feature Categories

### **PRIORITY 1: Core Moderation Tools** ⚡ (Essential)
*Most important for daily forum management*

#### 1.1 Topic & Post Moderation
- **Pin/Unpin Topics** - Quick action buttons in topic list
- **Lock/Unlock Topics** - Close discussions when needed
- **Delete Topics/Posts** - Soft delete with restore option
- **Edit Any Post** - Admins can edit any content
- **Move Topics** - Move topics between categories
- **Merge Topics** - Combine duplicate discussions
- **Bulk Actions** - Select multiple topics/posts for batch operations
  - Bulk pin/unpin
  - Bulk lock/unlock
  - Bulk delete
  - Bulk move to category
  - Bulk archive

#### 1.2 Content Management Dashboard
- **All Topics View** - Paginated list of all forum topics
  - Sort by: newest, most replies, most views, author, category
  - Filter by: category, status (pinned/locked/archived), date range, user
  - Search by title/content
  - Quick status indicators (pinned, locked, archived badges)
- **All Posts View** - List all posts across topics
  - Filter by: topic, author, date, flagged content
  - Search post content
- **Flagged Content Queue** - Posts/topics reported by users
  - Reason for flag (spam, inappropriate, etc.)
  - Quick review actions (approve, remove, warn user)
  - Status tracking (pending, reviewed, resolved)

#### 1.3 User Management (Forum-Specific)
- **User Activity View** - Forum-specific user stats
  - Topics created, posts made
  - Most active users
  - Recent activity timeline
- **User Actions**
  - Ban/unban from forums (separate from site-wide bans)
  - Warn user with message
  - View user's all forum posts/topics
  - Delete all user's content
- **Moderator Assignment** - Assign forum moderators
  - Per-category moderators
  - Temporary moderators
  - Moderator permissions management

---

### **PRIORITY 2: Category Management** 📂 (High Priority)
*Essential for organizing content*

#### 2.1 Category CRUD
- **Create Categories** - Form with: name, slug, description, icon, color, sort order
- **Edit Categories** - Update category details
- **Delete Categories** - With option to move topics first
- **Reorganize Categories** - Drag-and-drop sort order
- **Category Settings**
  - Public/private (requires auth)
  - Active/inactive
  - Parent categories (nested structure)

#### 2.2 Category Analytics
- **Category Stats** - Topics, posts, active users per category
- **Category Health** - Activity trends, growth metrics

---

### **PRIORITY 3: Spam & Content Filtering** 🛡️ (High Priority)
*Protect community quality*

#### 3.1 Spam Management
- **Spam Detection Dashboard** - Automated spam flagging
  - List of detected spam posts/topics
  - Confidence scores
  - Quick actions (approve, delete, ban user)
- **Spam Patterns** - Learn from spam content
  - Common spam keywords
  - Spam user patterns (IP, behavior)
- **Whitelist/Blacklist**
  - Whitelist trusted users
  - Blacklist domains/URLs
  - Block specific keywords

#### 3.2 Content Filters
- **Profanity Filter** - Manage blocked words
  - Add/remove words
  - Case sensitivity options
  - Partial word matching
- **Link Filtering** - Control external links
  - Auto-approve trusted domains
  - Require approval for new domains
  - Block specific domains

---

### **PRIORITY 4: Analytics & Reporting** 📊 (Medium Priority)
*Understand community engagement*

#### 4.1 Forum Analytics Dashboard
- **Engagement Metrics**
  - Daily/weekly/monthly active users
  - Topics created per day/week/month
  - Posts per day/week/month
  - Replies per topic average
- **Popular Content**
  - Most viewed topics
  - Most replied topics
  - Most liked posts
  - Trending discussions
- **Category Performance**
  - Most active categories
  - Category growth over time
  - User engagement by category
- **User Activity**
  - Top contributors
  - New member growth
  - User retention rates
  - Most helpful users (solutions marked)

#### 4.2 Reports
- **Daily Activity Report** - Summary email/export
- **Weekly Summary** - Key metrics and trends
- **Export Data** - CSV export of topics, posts, users
- **Custom Date Ranges** - Filter analytics by period

---

### **PRIORITY 5: Audit & Compliance** 📝 (Medium Priority)
*Track all admin actions*

#### 5.1 Audit Log Viewer
- **Forum-Specific Audit Log** - Filter audit_log by forum actions
  - All moderation actions
  - Content edits/deletes
  - User bans/warnings
  - Category changes
- **Action History** - View detailed history of specific topics/posts
  - Who edited and when
  - Deletion history
  - Status changes (pinned, locked, etc.)

#### 5.2 Compliance Tools
- **Data Export** - Export user's forum data (GDPR)
- **Content Archive** - Export archived topics/posts
- **Moderation Log** - Printable log of all actions

---

### **PRIORITY 6: Advanced Features** 🚀 (Nice to Have)
*Enhancement features for future*

#### 6.1 Automation
- **Auto-Moderation Rules**
  - Auto-lock topics after X days of inactivity
  - Auto-archive old topics
  - Auto-pin topics with X+ replies
- **Notification Settings**
  - Email alerts for flagged content
  - Daily/weekly moderation summaries
  - Alert thresholds (e.g., alert if X flags in 1 hour)

#### 6.2 Content Enhancement
- **Featured Topics** - Showcase important discussions
- **Topic Templates** - Pre-filled topic templates for common questions
- **Solution Marking** - Mark best answers/solutions (admin override)
- **Topic Tagging** - Add tags/categories to topics for better organization

#### 6.3 Integration Features
- **Email Notifications** - Manage forum email settings
- **Search Management** - Control what's searchable
- **SEO Settings** - Category meta descriptions, topic SEO

---

## 🗂️ Proposed Admin Section Structure

```
/admin/forums/
  ├── /dashboard          # Overview with key metrics
  ├── /topics             # All topics list with filters/actions
  ├── /posts              # All posts list
  ├── /categories         # Category management
  ├── /flagged            # Flagged content queue
  ├── /users              # Forum user management
  ├── /spam               # Spam detection & management
  ├── /analytics          # Forum analytics & reports
  └── /audit              # Forum audit logs
```

---

## 🎨 UI/UX Considerations

### Dashboard Cards
- **Quick Stats**: Total topics, posts, users, active today
- **Pending Actions**: Flagged content count, spam queue size
- **Recent Activity**: Latest topics, most active users
- **Alert Banners**: Rate limit violations, spam spikes

### Data Tables
- **Sortable Columns**: Click headers to sort
- **Row Selection**: Checkboxes for bulk actions
- **Quick Actions**: Dropdown menu per row (edit, delete, pin, etc.)
- **Pagination**: 25/50/100 items per page
- **Filters**: Sidebar or top bar with filter chips

### Bulk Actions
- **Select All**: Checkbox in table header
- **Action Bar**: Appears when items selected
  - Shows count: "5 topics selected"
  - Action buttons: Pin, Lock, Delete, Move, etc.
- **Confirmation Modals**: For destructive actions

---

## 🔧 Technical Implementation Notes

### Server Actions Needed
- `getForumTopics()` - Already exists (enhance with admin filters)
- `getForumPosts()` - Already exists (enhance with admin filters)
- `pinTopic()`, `lockTopic()` - Already exist
- `deleteTopic()`, `deletePost()` - New admin-only actions
- `moveTopic()`, `mergeTopics()` - New actions
- `getFlaggedContent()` - New action
- `markAsSpam()`, `approveContent()` - New actions
- `getForumAnalytics()` - New action
- `getForumAuditLogs()` - New action (filter existing audit_log)
- Category CRUD actions - New actions

### Database Queries
- Most queries already supported by existing schema
- May need indexes for admin filtering (e.g., `forum_topics.created_at`, `forum_topics.user_id`)
- Audit log already exists in `forum_audit_log` table

### Permissions
- Use existing `is_admin()` and `is_moderator()` functions
- Add `is_forum_moderator()` if needed for per-category mods

---

## 📊 Priority Ranking Summary

1. **🔥 Must Have (Phase 1)**
   - Topic/Post moderation (pin, lock, delete, edit)
   - Content management dashboard (all topics/posts views)
   - Category management (CRUD)
   - Flagged content queue

2. **⭐ Should Have (Phase 2)**
   - Spam detection & management
   - Bulk actions
   - Forum analytics dashboard
   - User management (forum-specific)

3. **💡 Nice to Have (Phase 3)**
   - Advanced automation
   - Audit log viewer
   - Advanced reporting

---

## ❓ Questions for Approval

1. **Priority Order**: Does this priority ranking make sense?
2. **Scope**: Which features are most important to you?
3. **Phase 1 Features**: Should we build all Priority 1 features first, or prioritize specific ones?
4. **Moderator Roles**: Do you want per-category moderators, or just site-wide admins/moderators?
5. **Bulk Actions**: How important are bulk operations vs. single-item actions?
6. **Analytics**: How detailed should the analytics be? Real-time or summary stats?

---

**Ready to build once approved! 🚀**
