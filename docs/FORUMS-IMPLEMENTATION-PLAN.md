# Forums Implementation Plan

> **Status:** 📋 Planning Phase - Awaiting Approval  
> **Priority:** Medium  
> **Estimated Complexity:** Medium-High  
> **Estimated Time:** 2-3 weeks

---

## 🎯 Overview

Add a community forums feature to GoKartPartPicker, allowing users to discuss builds, ask questions, share experiences, and help each other. This will increase user engagement, build community, and provide valuable SEO content.

---

## 📊 Feature Analysis (Based on PCPartPicker-style Forums)

### Core Features Needed

1. **Forum Categories** - Organized discussion areas
2. **Topics/Threads** - Individual discussion threads
3. **Posts/Replies** - User messages within threads
4. **User Profiles Integration** - Link to existing profile system
5. **Search & Filtering** - Find discussions easily
6. **Moderation Tools** - Admin controls for content
7. **Statistics** - Topic/post counts, activity metrics
8. **Recent Activity** - Latest posts and topics

### Advanced Features (Phase 2)

- User reputation/karma system
- Post likes/reactions
- Thread pinning and locking
- Email notifications for replies
- Rich text editor with markdown
- Image attachments
- Thread subscriptions
- User mentions (@username)
- Private messaging

---

## 🗄️ Database Schema Design

### 1. `forum_categories` Table

```sql
CREATE TABLE forum_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES forum_categories(id) ON DELETE SET NULL,
  icon TEXT, -- Icon name or emoji
  color TEXT, -- Color for UI
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  requires_auth BOOLEAN DEFAULT FALSE, -- Require login to view
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Example categories:
-- Systems:
--   - Part List Opinions Wanted
--   - Create A Part List For Me
--   - Troubleshooting
--   - Build Showcase
-- Hardware:
--   - Engines
--   - Parts (by category)
--   - Performance Mods
--   - Maintenance
-- General:
--   - General Discussion
--   - Deals & Sales
--   - Site Feedback
--   - For Sale/Trade
```

### 2. `forum_topics` Table

```sql
CREATE TABLE forum_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL, -- First post content
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  last_reply_at TIMESTAMPTZ,
  last_reply_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(category_id, slug)
);

CREATE INDEX idx_topics_category ON forum_topics(category_id);
CREATE INDEX idx_topics_user ON forum_topics(user_id);
CREATE INDEX idx_topics_pinned ON forum_topics(is_pinned DESC, created_at DESC);
CREATE INDEX idx_topics_active ON forum_topics(is_archived, last_reply_at DESC);
```

### 3. `forum_posts` Table

```sql
CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  likes_count INTEGER DEFAULT 0,
  is_solution BOOLEAN DEFAULT FALSE, -- Mark as solution/answer
  parent_post_id UUID REFERENCES forum_posts(id) ON DELETE SET NULL, -- For nested replies
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_posts_topic ON forum_posts(topic_id, created_at);
CREATE INDEX idx_posts_user ON forum_posts(user_id);
CREATE INDEX idx_posts_solution ON forum_posts(topic_id, is_solution) WHERE is_solution = TRUE;
```

### 4. `forum_post_likes` Table (Phase 2)

```sql
CREATE TABLE forum_post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(post_id, user_id)
);
```

### 5. `forum_topic_subscriptions` Table (Phase 2)

```sql
CREATE TABLE forum_topic_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(topic_id, user_id)
);
```

---

## 🎨 UI/UX Design

### Page Structure

#### 1. **Forums Index Page** (`/forums`)
- Category list with statistics (like the example)
- Grouped by parent categories
- Shows: Forum name, Topics count, Posts count, Most Recent Topic
- Search bar at top
- Quick links to popular categories

#### 2. **Category Page** (`/forums/[category-slug]`)
- List of topics in category
- Sort options: Latest, Most Replies, Most Views, Pinned First
- Filter: All, Unanswered, My Topics
- "New Topic" button
- Pagination

#### 3. **Topic Page** (`/forums/[category-slug]/[topic-slug]`)
- Topic title and metadata
- Original post (OP) highlighted
- Replies in chronological order
- Reply form at bottom
- Sidebar: Topic info, related topics, category info
- Mark as solution button (for OP)

#### 4. **Create Topic Page** (`/forums/[category-slug]/new`)
- Category selector
- Title input
- Rich text editor (markdown)
- Preview option
- Tags (optional)

---

## 🔧 Technical Implementation

### Frontend Components Needed

1. **ForumCategoryList** - Display categories with stats
2. **ForumTopicList** - List topics with metadata
3. **ForumTopicCard** - Individual topic card
4. **ForumPost** - Individual post/reply component
5. **ForumEditor** - Rich text editor for posts
6. **ForumSearch** - Search functionality
7. **ForumFilters** - Filter and sort controls
8. **ForumPagination** - Pagination component
9. **ForumModerationTools** - Admin/mod tools

### Server Actions Needed

1. **Forum Categories**
   - `getForumCategories()` - Get all categories
   - `getForumCategory(slug)` - Get single category with stats

2. **Topics**
   - `getForumTopics(filters)` - Get topics with filters
   - `getForumTopic(slug)` - Get topic with posts
   - `createForumTopic(input)` - Create new topic
   - `updateForumTopic(id, input)` - Update topic (admin/OP)
   - `deleteForumTopic(id)` - Delete topic (admin)
   - `pinForumTopic(id)` - Pin topic (admin)
   - `lockForumTopic(id)` - Lock topic (admin)

3. **Posts**
   - `getForumPosts(topicId)` - Get posts for topic
   - `createForumPost(input)` - Create reply
   - `updateForumPost(id, content)` - Edit post
   - `deleteForumPost(id)` - Delete post (admin/author)
   - `likeForumPost(postId)` - Like post (Phase 2)
   - `markAsSolution(postId)` - Mark as solution (OP)

4. **Search**
   - `searchForums(query, filters)` - Search topics and posts

### Database Functions Needed

1. **Update topic stats** - Trigger to update `replies_count`, `last_reply_at`
2. **Update category stats** - Function to calculate topic/post counts
3. **Full-text search** - PostgreSQL full-text search for content

---

## 🔐 Security & Permissions

> **⚠️ CRITICAL:** See [FORUMS-SECURITY-PLAN.md](./FORUMS-SECURITY-PLAN.md) for comprehensive security implementation details.

### Security Overview

The forums feature implements **multi-layer security** to protect user data:

1. **Authentication & Authorization**
   - Public read-only access for public categories
   - Authentication required for posting
   - Role-based access control (user, moderator, admin)

2. **Input Validation & Sanitization**
   - Server-side validation with Zod schemas
   - HTML/Markdown sanitization with DOMPurify
   - URL validation and sanitization
   - SQL injection prevention (Supabase parameterized queries)

3. **XSS Prevention**
   - Content sanitization
   - Content Security Policy headers
   - Output encoding

4. **Rate Limiting & Spam Prevention**
   - Per-user rate limits (topics, posts, likes)
   - Content-based spam detection
   - Duplicate content detection
   - Profanity filtering

5. **Row Level Security (RLS)**
   - Comprehensive RLS policies on all tables
   - User can only edit/delete own content (within time limits)
   - Admin/moderator override capabilities

6. **Content Moderation**
   - Moderation queue system
   - User reporting
   - Auto-moderation rules
   - Ban system (temporary/permanent)

7. **Audit Logging**
   - All forum actions logged
   - Security events tracked
   - Admin action audit trail

8. **Privacy & Data Protection**
   - Email addresses never exposed
   - PII protection
   - GDPR compliance features
   - Data retention policies

### Quick Security Checklist

- [ ] RLS policies implemented
- [ ] Input validation schemas created
- [ ] Content sanitization configured
- [ ] Rate limiting enabled
- [ ] Spam detection active
- [ ] Moderation tools functional
- [ ] Audit logging working
- [ ] Privacy policy updated

**For detailed security implementation, see [FORUMS-SECURITY-PLAN.md](./FORUMS-SECURITY-PLAN.md)**

---

## 📈 SEO & Performance

### SEO Considerations

- Clean URLs: `/forums/[category]/[topic-slug]`
- Meta tags for each topic
- Structured data (Article schema)
- Sitemap generation for topics
- Canonical URLs

### Performance Optimizations

- Pagination (20-50 posts per page)
- Lazy loading for images
- Caching category stats
- Database indexes on frequently queried fields
- Full-text search indexes

---

## 🔄 Integration with Existing Features

### Link to Existing Systems

1. **User Profiles**
   - Show forum activity on profile
   - Link to user's topics/posts
   - Forum reputation/karma

2. **Builds**
   - "Discuss this build" button on build pages
   - Link builds in forum posts
   - Share builds in forum

3. **Parts/Engines**
   - "Ask about this part" button
   - Link parts in forum posts
   - Category-specific forums

4. **Guides**
   - "Questions about this guide" forum
   - Link guides in discussions

---

## 📋 Implementation Phases

### Phase 1: Core Functionality (MVP)
**Estimated Time: 1-2 weeks**

- [ ] Database schema migration
- [ ] Basic category structure (3-5 categories)
- [ ] Create/view topics
- [ ] Create/view posts
- [ ] Basic search
- [ ] Admin moderation (pin, lock, delete)
- [ ] RLS policies

**Deliverables:**
- Users can create topics and reply
- Basic forum navigation
- Admin can moderate

### Phase 2: Enhanced Features
**Estimated Time: 1 week**

- [ ] Post likes/reactions
- [ ] Mark as solution
- [ ] Thread subscriptions
- [ ] Email notifications
- [ ] Rich text editor (markdown)
- [ ] Image uploads
- [ ] User mentions
- [ ] Advanced search

**Deliverables:**
- Full-featured forum experience
- User engagement features

### Phase 3: Advanced Features
**Estimated Time: 1 week**

- [ ] User reputation system
- [ ] Private messaging
- [ ] Thread tags
- [ ] Polls in topics
- [ ] Moderation queue
- [ ] Analytics dashboard

**Deliverables:**
- Community features
- Advanced moderation tools

---

## 🎯 Recommended Categories (Based on Go-Kart Focus)

### Systems
- **Build Planning** - "Help me plan my build"
- **Build Showcase** - Share completed builds
- **Troubleshooting** - "My build isn't working"
- **Budget Builds** - Under $X builds

### Hardware
- **Engines** - Engine discussions
- **Parts by Category** - Clutch, chain, etc.
- **Performance Mods** - Upgrades and modifications
- **Maintenance** - Care and repair

### General
- **General Discussion** - Off-topic chat
- **Deals & Sales** - Share good deals
- **For Sale/Trade** - Marketplace
- **Site Feedback** - Feature requests

---

## 💰 Business Value

### For Users
- Get help with builds
- Share experiences
- Learn from others
- Build community

### For Business
- **SEO Benefits** - User-generated content
- **User Retention** - Community keeps users coming back
- **Data Collection** - Understand user needs
- **Affiliate Opportunities** - Link to parts in discussions
- **Content Marketing** - Valuable discussions = content

---

## ⚠️ Considerations & Challenges

### Technical Challenges
1. **Performance** - Large forums can be slow
   - Solution: Pagination, caching, database optimization

2. **Spam Prevention** - Need moderation tools
   - Solution: Rate limiting, content filtering, admin tools

3. **Search** - Full-text search across posts
   - Solution: PostgreSQL full-text search or Algolia

4. **Real-time Updates** - New posts appear live
   - Solution: Polling or WebSockets (Phase 2)

### Content Moderation
- Need admin tools for moderation
- User reporting system
- Auto-moderation (profanity filter)
- Manual review queue

### Legal Considerations
- Terms of service updates
- Content moderation policies
- User privacy (public posts)
- DMCA compliance (if users post copyrighted content)

---

## 📊 Success Metrics

### Engagement Metrics
- Daily active forum users
- Topics created per day
- Posts per day
- Average replies per topic
- User retention (forum users vs non-forum users)

### Content Metrics
- Total topics/posts
- Most active categories
- Most helpful users
- Search queries

### Business Metrics
- SEO traffic from forum content
- Affiliate clicks from forum links
- User signups from forum discussions

---

## 🚀 Quick Start (If Approved)

### Step 1: Database Setup
1. Create migration file with schema
2. Seed initial categories
3. Set up RLS policies

### Step 2: Basic UI
1. Forums index page
2. Category listing
3. Topic listing
4. Topic detail page

### Step 3: Core Functionality
1. Create topic
2. Create post/reply
3. Basic search
4. Admin moderation

### Step 4: Polish
1. Styling and UI improvements
2. Error handling
3. Loading states
4. Mobile responsiveness

---

## ❓ Questions for Approval

1. **Category Structure** - Do you want the exact structure from the example, or go-kart specific categories?

2. **Moderation** - Who can moderate? Just admins, or also trusted users?

3. **Rich Text** - Markdown only, or full WYSIWYG editor?

4. **Image Uploads** - Allow image uploads in posts? (storage costs)

5. **User Reputation** - Do you want a karma/reputation system?

6. **Email Notifications** - Should users get emails for replies? (requires email service)

7. **Private Messaging** - Include PM system or just public forums?

8. **Phase Priority** - Which phase features are most important?

---

## 📝 Estimated Effort

- **Database Schema**: 2-3 hours
- **Server Actions**: 4-6 hours
- **UI Components**: 8-12 hours
- **Integration**: 2-3 hours
- **Testing & Polish**: 4-6 hours

**Total Phase 1 (MVP)**: ~20-30 hours

---

## ✅ Approval Checklist

- [ ] Review database schema
- [ ] Approve category structure
- [ ] Confirm feature priorities
- [ ] Approve UI/UX approach
- [ ] Confirm moderation approach
- [ ] Approve implementation timeline

---

**Ready to proceed once approved!** 🚀
