# Forums Security & Data Protection Plan

> **Status:** 📋 Planning Phase - Awaiting Approval  
> **Priority:** 🔴 CRITICAL - Security is non-negotiable  
> **Last Updated:** 2026-01-16

---

## 🎯 Security Philosophy

### Core Principles

1. **Defense in Depth** - Multiple layers of security, never rely on a single control
2. **Least Privilege** - Users get minimum required access
3. **Secure by Default** - All content is moderated until proven safe
4. **Fail Closed** - On error, deny access rather than grant it
5. **Audit Everything** - Log all security-relevant actions
6. **Zero Trust** - Never trust user input, always validate
7. **Privacy First** - Protect user data at all costs

---

## 🔐 Authentication & Authorization

### Authentication Requirements

#### Public Access
- ✅ **Read-only access** to public forums (no login required)
- ✅ **View topics and posts** in public categories
- ❌ **Cannot create content** without authentication
- ❌ **Cannot like, subscribe, or interact** without authentication

#### Authenticated Users
- ✅ **Create topics** in allowed categories
- ✅ **Reply to topics** (if not locked)
- ✅ **Edit own posts** (within time limit)
- ✅ **Delete own posts** (within time limit)
- ✅ **Like posts** (Phase 2)
- ✅ **Subscribe to topics** (Phase 2)
- ❌ **Cannot moderate** other users' content
- ❌ **Cannot edit/delete** others' posts

#### Admin/Moderator Access
- ✅ **Full moderation** capabilities
- ✅ **Pin/lock/archive** topics
- ✅ **Edit/delete** any content
- ✅ **Ban users** (temporary/permanent)
- ✅ **View moderation queue**
- ✅ **Access audit logs**

### Role-Based Access Control (RBAC)

```sql
-- New role: moderator (between user and admin)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'moderator';

-- Moderator permissions:
-- - Can moderate forums (pin, lock, delete posts)
-- - Cannot modify catalog (engines, parts)
-- - Cannot manage users
-- - Cannot access admin panel (except forum moderation)
```

### Session Security

- ✅ **JWT tokens** via Supabase Auth (already implemented)
- ✅ **Token expiration** - 1 hour, auto-refresh
- ✅ **HTTPS only** - All forum endpoints require HTTPS
- ✅ **Secure cookies** - HttpOnly, Secure, SameSite=Strict
- ✅ **CSRF protection** - Next.js built-in CSRF tokens

---

## 🛡️ Input Validation & Sanitization

### Server-Side Validation (CRITICAL)

#### Topic Creation Validation

```typescript
const createTopicSchema = z.object({
  category_id: z.string().uuid(),
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .regex(/^[a-zA-Z0-9\s\-_.,!?()]+$/, 'Title contains invalid characters'),
  content: z.string()
    .min(10, 'Content must be at least 10 characters')
    .max(10000, 'Content must be less than 10,000 characters'),
});

// Additional checks:
// - Rate limiting: Max 5 topics per hour
// - Spam detection: Check for duplicate content
// - Profanity filter: Block offensive language
// - Link validation: Check for malicious URLs
```

#### Post/Reply Validation

```typescript
const createPostSchema = z.object({
  topic_id: z.string().uuid(),
  content: z.string()
    .min(1, 'Post cannot be empty')
    .max(5000, 'Post must be less than 5,000 characters'),
  parent_post_id: z.string().uuid().optional(), // For nested replies
});

// Additional checks:
// - Rate limiting: Max 10 posts per 5 minutes
// - Duplicate detection: Prevent spam posting
// - Content filtering: Remove malicious code
```

### Content Sanitization

#### HTML/Markdown Sanitization

**Strategy:**
1. **Whitelist approach** - Only allow safe HTML tags
2. **Strip dangerous content** - Remove scripts, iframes, event handlers
3. **Sanitize URLs** - Validate and sanitize all links
4. **Escape special characters** - Prevent XSS attacks

**Allowed HTML Tags (Markdown):**
- `p`, `br`, `strong`, `em`, `code`, `pre`
- `ul`, `ol`, `li`
- `a` (with href validation)
- `blockquote`
- `h1-h6`

**Blocked:**
- `<script>`, `<iframe>`, `<object>`, `<embed>`
- Event handlers (`onclick`, `onerror`, etc.)
- `javascript:` URLs
- Data URIs in images (optional, for security)

**Implementation:**
```typescript
import DOMPurify from 'isomorphic-dompurify';

function sanitizeContent(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre', 'ul', 'ol', 'li', 'a', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOW_DATA_ATTR: false,
  });
}
```

### URL Validation

```typescript
function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow http/https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    // Block javascript: and data: URLs
    if (parsed.protocol === 'javascript:' || parsed.protocol === 'data:') {
      return false;
    }
    // Optional: Block known malicious domains
    return true;
  } catch {
    return false;
  }
}
```

### SQL Injection Prevention

✅ **Already Protected** - Using Supabase client with parameterized queries
- All queries use Supabase's query builder
- No raw SQL string interpolation
- RLS policies provide additional layer

---

## 🚫 Rate Limiting & Spam Prevention

### Rate Limiting Strategy

#### Per-User Rate Limits

```typescript
// Rate limit configuration
const RATE_LIMITS = {
  createTopic: {
    max: 5,
    window: 3600, // 1 hour
  },
  createPost: {
    max: 10,
    window: 300, // 5 minutes
  },
  likePost: {
    max: 50,
    window: 3600, // 1 hour
  },
  search: {
    max: 30,
    window: 60, // 1 minute
  },
};
```

#### Implementation Options

**Option 1: Database-Based (Recommended)**
```sql
-- Create rate_limit_log table
CREATE TABLE rate_limit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_rate_limit_user_action ON rate_limit_log(user_id, action_type, created_at);

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_action_type TEXT,
  p_max_attempts INTEGER,
  p_window_seconds INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO attempt_count
  FROM rate_limit_log
  WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND created_at > NOW() - (p_window_seconds || ' seconds')::INTERVAL;
  
  IF attempt_count >= p_max_attempts THEN
    RETURN FALSE;
  END IF;
  
  -- Log this attempt
  INSERT INTO rate_limit_log (user_id, action_type)
  VALUES (p_user_id, p_action_type);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Option 2: Redis-Based (For High Traffic)**
- Use Redis for distributed rate limiting
- Better performance at scale
- Requires Redis infrastructure

### Spam Detection

#### Content-Based Spam Detection

```typescript
// Spam detection rules
const SPAM_INDICATORS = {
  // Too many links
  maxLinks: 3,
  // Repetitive content
  maxRepeatedChars: 5,
  // Suspicious patterns
  patterns: [
    /(buy|cheap|discount|click here)/gi,
    /(http|www\.)/gi, // Multiple URLs
  ],
};

function detectSpam(content: string): { isSpam: boolean; reason?: string } {
  // Check for too many links
  const linkCount = (content.match(/https?:\/\//g) || []).length;
  if (linkCount > SPAM_INDICATORS.maxLinks) {
    return { isSpam: true, reason: 'Too many links' };
  }
  
  // Check for repetitive characters
  if (/(.)\1{5,}/.test(content)) {
    return { isSpam: true, reason: 'Repetitive content' };
  }
  
  // Check for suspicious patterns
  for (const pattern of SPAM_INDICATORS.patterns) {
    const matches = content.match(pattern);
    if (matches && matches.length > 2) {
      return { isSpam: true, reason: 'Suspicious content pattern' };
    }
  }
  
  return { isSpam: false };
}
```

#### Duplicate Content Detection

```sql
-- Function to detect duplicate posts
CREATE OR REPLACE FUNCTION detect_duplicate_post(
  p_user_id UUID,
  p_content TEXT,
  p_time_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  similar_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO similar_count
  FROM forum_posts
  WHERE user_id = p_user_id
    AND content = p_content
    AND created_at > NOW() - (p_time_window_minutes || ' minutes')::INTERVAL;
  
  RETURN similar_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Profanity Filter

**Option 1: Client-Side + Server-Side**
- Use library like `bad-words` or `profanity-filter`
- Filter on both client (UX) and server (security)

**Option 2: Third-Party Service**
- Use service like CleanSpeak, WebPurify
- More accurate, but costs money

**Recommendation:** Start with Option 1, upgrade if needed

---

## 🔒 Row Level Security (RLS) Policies

### Forum Categories

```sql
-- Public read access
CREATE POLICY "Public can view active categories"
ON forum_categories FOR SELECT
USING (is_active = TRUE AND (requires_auth = FALSE OR auth.uid() IS NOT NULL));

-- Admin write access
CREATE POLICY "Admins can manage categories"
ON forum_categories FOR ALL
USING (is_admin())
WITH CHECK (is_admin());
```

### Forum Topics

```sql
-- Public read (if category allows)
CREATE POLICY "Public can view topics in public categories"
ON forum_topics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM forum_categories
    WHERE forum_categories.id = forum_topics.category_id
    AND forum_categories.is_active = TRUE
    AND (forum_categories.requires_auth = FALSE OR auth.uid() IS NOT NULL)
  )
);

-- Authenticated users can create topics
CREATE POLICY "Authenticated users can create topics"
ON forum_topics FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM forum_categories
    WHERE forum_categories.id = category_id
    AND forum_categories.is_active = TRUE
  )
);

-- Users can edit own topics (within time limit)
CREATE POLICY "Users can edit own topics"
ON forum_topics FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  AND created_at > NOW() - INTERVAL '1 hour' -- 1 hour edit window
  AND is_locked = FALSE
)
WITH CHECK (
  auth.uid() = user_id
  AND is_locked = FALSE
);

-- Users can delete own topics (within time limit)
CREATE POLICY "Users can delete own topics"
ON forum_topics FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  AND created_at > NOW() - INTERVAL '1 hour'
  AND replies_count = 0 -- Only if no replies
);

-- Admins can moderate all topics
CREATE POLICY "Admins can moderate topics"
ON forum_topics FOR ALL
USING (is_admin() OR is_moderator())
WITH CHECK (is_admin() OR is_moderator());
```

### Forum Posts

```sql
-- Public read (if topic allows)
CREATE POLICY "Public can view posts in public topics"
ON forum_posts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM forum_topics
    WHERE forum_topics.id = forum_posts.topic_id
    AND forum_topics.is_archived = FALSE
  )
);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts"
ON forum_posts FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM forum_topics
    WHERE forum_topics.id = topic_id
    AND forum_topics.is_locked = FALSE
    AND forum_topics.is_archived = FALSE
  )
);

-- Users can edit own posts (within time limit)
CREATE POLICY "Users can edit own posts"
ON forum_posts FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  AND created_at > NOW() - INTERVAL '15 minutes' -- 15 minute edit window
)
WITH CHECK (auth.uid() = user_id);

-- Users can delete own posts (within time limit, if no replies)
CREATE POLICY "Users can delete own posts"
ON forum_posts FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  AND created_at > NOW() - INTERVAL '15 minutes'
  AND NOT EXISTS (
    SELECT 1 FROM forum_posts
    WHERE parent_post_id = forum_posts.id
  )
);

-- Admins can moderate all posts
CREATE POLICY "Admins can moderate posts"
ON forum_posts FOR ALL
USING (is_admin() OR is_moderator())
WITH CHECK (is_admin() OR is_moderator());
```

### Helper Function for Moderator Role

```sql
-- Check if user is moderator
CREATE OR REPLACE FUNCTION is_moderator()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🛡️ XSS (Cross-Site Scripting) Prevention

### Multi-Layer XSS Protection

#### Layer 1: Input Sanitization (Server-Side)
```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize all user input before storing
function sanitizeUserInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre', 'ul', 'ol', 'li', 'a', 'blockquote'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover'],
  });
}
```

#### Layer 2: Content Security Policy (CSP)
```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' https://*.supabase.co;
      frame-ancestors 'none';
    `.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
];
```

#### Layer 3: Output Encoding (Client-Side)
```typescript
// When rendering user content, always escape
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// For React, use dangerouslySetInnerHTML only with sanitized content
<div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
```

---

## 🚨 CSRF (Cross-Site Request Forgery) Protection

### Next.js Built-in Protection

✅ **Already Protected** - Next.js includes CSRF protection by default
- Server Actions use CSRF tokens
- SameSite cookies prevent CSRF
- Origin validation

### Additional Measures

```typescript
// Verify origin on sensitive actions
function verifyOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const allowedOrigins = [process.env.NEXT_PUBLIC_SITE_URL];
  
  if (origin && !allowedOrigins.includes(origin)) {
    return false;
  }
  
  return true;
}
```

---

## 📝 Content Moderation

### Moderation Queue System

```sql
-- Create moderation queue table
CREATE TABLE forum_moderation_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL CHECK (content_type IN ('topic', 'post')),
  content_id UUID NOT NULL,
  reason TEXT,
  reported_by UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_mod_queue_status ON forum_moderation_queue(status, created_at);
```

### Auto-Moderation Rules

```typescript
interface ModerationRule {
  type: 'keyword' | 'pattern' | 'link_count' | 'repetition';
  action: 'flag' | 'auto-hide' | 'require-approval';
  config: Record<string, unknown>;
}

const AUTO_MODERATION_RULES: ModerationRule[] = [
  {
    type: 'keyword',
    action: 'flag',
    config: {
      keywords: ['spam', 'scam', 'phishing'], // Add actual spam keywords
      caseSensitive: false,
    },
  },
  {
    type: 'link_count',
    action: 'require-approval',
    config: {
      maxLinks: 3,
    },
  },
  {
    type: 'repetition',
    action: 'flag',
    config: {
      maxRepeatedChars: 5,
    },
  },
];
```

### User Reporting System

```sql
-- Create reports table
CREATE TABLE forum_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL CHECK (content_type IN ('topic', 'post')),
  content_id UUID NOT NULL,
  reported_by UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(content_type, content_id, reported_by) -- Prevent duplicate reports
);
```

---

## 🔍 Audit Logging

### Comprehensive Audit Trail

```sql
-- Extend audit_log for forum actions
-- Already exists, just add forum-specific actions

-- Forum-specific audit actions
CREATE TYPE forum_audit_action AS ENUM (
  'topic_created',
  'topic_edited',
  'topic_deleted',
  'topic_pinned',
  'topic_locked',
  'topic_archived',
  'post_created',
  'post_edited',
  'post_deleted',
  'post_liked',
  'user_banned',
  'user_warned',
  'content_flagged',
  'content_approved',
  'content_rejected'
);

-- Add forum audit log table
CREATE TABLE forum_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action forum_audit_action NOT NULL,
  content_type TEXT,
  content_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_forum_audit_user ON forum_audit_log(user_id);
CREATE INDEX idx_forum_audit_action ON forum_audit_log(action);
CREATE INDEX idx_forum_audit_created ON forum_audit_log(created_at DESC);
```

### What to Log

- ✅ All topic/post creation, edits, deletions
- ✅ All moderation actions (pin, lock, delete)
- ✅ User bans and warnings
- ✅ Content flags and reports
- ✅ Failed authentication attempts
- ✅ Rate limit violations
- ✅ Spam detection triggers

---

## 🔐 Privacy & Data Protection

### User Data Protection

#### PII (Personally Identifiable Information) Handling

```typescript
// What we collect:
// - Username (public)
// - Email (private, not shown in forums)
// - IP address (logged for security, not public)
// - User agent (logged for security, not public)

// What we DON'T collect:
// - Real names (unless user provides in bio)
// - Addresses
// - Phone numbers
// - Payment information (not relevant for forums)
```

#### GDPR Compliance

- ✅ **Right to Access** - Users can view all their forum data
- ✅ **Right to Deletion** - Users can delete their posts/topics
- ✅ **Data Export** - Users can export their forum activity
- ✅ **Consent** - Clear privacy policy for forum participation

#### Data Retention Policy

```sql
-- Auto-archive old topics (optional)
CREATE OR REPLACE FUNCTION archive_old_topics()
RETURNS void AS $$
BEGIN
  UPDATE forum_topics
  SET is_archived = TRUE
  WHERE last_reply_at < NOW() - INTERVAL '2 years'
    AND is_archived = FALSE
    AND is_pinned = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Schedule to run monthly
```

### Email Privacy

- ✅ **Email addresses** never shown in forums
- ✅ **Email notifications** opt-in only
- ✅ **Unsubscribe** link in all emails
- ✅ **Email validation** - Verify email before posting

---

## 🚫 User Banning & Suspension

### Ban System

```sql
-- Create user bans table
CREATE TABLE user_bans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  banned_by UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL,
  ban_type TEXT NOT NULL CHECK (ban_type IN ('temporary', 'permanent')),
  expires_at TIMESTAMPTZ, -- NULL for permanent bans
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_user_bans_user ON user_bans(user_id, is_active);
CREATE INDEX idx_user_bans_expires ON user_bans(expires_at) WHERE ban_type = 'temporary';

-- Function to check if user is banned
CREATE OR REPLACE FUNCTION is_user_banned(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_bans
    WHERE user_id = p_user_id
    AND is_active = TRUE
    AND (ban_type = 'permanent' OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Ban Enforcement

```sql
-- Update RLS policies to check bans
-- Example for topic creation:
CREATE POLICY "Non-banned users can create topics"
ON forum_topics FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND NOT is_user_banned(auth.uid())
);
```

---

## 🔄 Real-Time Security Considerations

### WebSocket/Socket.io Security (If Added in Phase 2)

- ✅ **Authentication required** - Verify JWT on connection
- ✅ **Rate limiting** - Limit messages per second
- ✅ **Input validation** - Validate all real-time messages
- ✅ **Origin validation** - Only allow connections from same origin
- ✅ **Message size limits** - Prevent DoS attacks

---

## 📊 Security Monitoring

### Security Metrics to Track

1. **Failed Authentication Attempts**
   - Track IP addresses
   - Implement temporary IP bans after X failures

2. **Rate Limit Violations**
   - Log all violations
   - Alert on patterns

3. **Spam Detection**
   - Track spam patterns
   - Auto-ban repeat offenders

4. **Content Flags**
   - Monitor flag frequency
   - Identify problematic users

5. **Moderation Actions**
   - Track admin actions
   - Audit moderation decisions

### Alerting System

```typescript
// Security alerts (for admin dashboard)
interface SecurityAlert {
  type: 'spam_detected' | 'rate_limit_exceeded' | 'suspicious_activity' | 'multiple_reports';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  user_id?: string;
  details: Record<string, unknown>;
  created_at: string;
}
```

---

## 🧪 Security Testing Plan

### Testing Checklist

- [ ] **Input Validation**
  - [ ] Test XSS payloads
  - [ ] Test SQL injection attempts
  - [ ] Test CSRF attacks
  - [ ] Test rate limiting

- [ ] **Authorization**
  - [ ] Test unauthorized access attempts
  - [ ] Test privilege escalation
  - [ ] Test RLS policies

- [ ] **Content Moderation**
  - [ ] Test spam detection
  - [ ] Test profanity filter
  - [ ] Test duplicate detection

- [ ] **Rate Limiting**
  - [ ] Test rate limit enforcement
  - [ ] Test rate limit bypass attempts

- [ ] **Data Privacy**
  - [ ] Verify PII is not exposed
  - [ ] Test GDPR compliance features

---

## 📋 Security Implementation Checklist

### Phase 1: Core Security (MVP)

- [ ] Database schema with RLS policies
- [ ] Input validation schemas (Zod)
- [ ] Content sanitization (DOMPurify)
- [ ] Rate limiting (database-based)
- [ ] Basic spam detection
- [ ] Profanity filter
- [ ] Audit logging
- [ ] User ban system
- [ ] Moderation queue
- [ ] Report system

### Phase 2: Enhanced Security

- [ ] Advanced spam detection
- [ ] Machine learning spam detection (optional)
- [ ] IP-based rate limiting
- [ ] Advanced moderation tools
- [ ] Automated moderation rules
- [ ] Security monitoring dashboard
- [ ] Alert system

### Phase 3: Advanced Security

- [ ] Two-factor authentication (optional)
- [ ] CAPTCHA for suspicious activity
- [ ] Advanced threat detection
- [ ] Security analytics
- [ ] Penetration testing

---

## 🚨 Incident Response Plan

### Security Incident Procedures

1. **Detection**
   - Monitor audit logs
   - Review moderation queue
   - User reports

2. **Response**
   - Immediate: Ban user, remove content
   - Short-term: Investigate, gather evidence
   - Long-term: Update security measures

3. **Documentation**
   - Log all incidents
   - Document response actions
   - Review and improve

---

## 📚 Security Best Practices

### Code Security

- ✅ **Never trust client input** - Always validate server-side
- ✅ **Use parameterized queries** - Already using Supabase
- ✅ **Keep dependencies updated** - Regular security audits
- ✅ **Code reviews** - Review all security-sensitive code
- ✅ **Security headers** - Implement CSP, HSTS, etc.

### Infrastructure Security

- ✅ **HTTPS only** - Enforce SSL/TLS
- ✅ **Database encryption** - Supabase handles this
- ✅ **Backup encryption** - Encrypt backups
- ✅ **Access controls** - Limit database access
- ✅ **Monitoring** - Monitor for suspicious activity

---

## ✅ Security Approval Checklist

Before implementation, confirm:

- [ ] Database schema approved
- [ ] RLS policies approved
- [ ] Input validation approach approved
- [ ] Content sanitization strategy approved
- [ ] Rate limiting approach approved
- [ ] Spam detection rules approved
- [ ] Moderation workflow approved
- [ ] Privacy policy updated
- [ ] Terms of service updated
- [ ] Incident response plan approved

---

## 🔗 Integration with Existing Security

### Leverage Existing Systems

- ✅ **Supabase Auth** - Already secure
- ✅ **RLS Policies** - Extend existing pattern
- ✅ **Audit Logging** - Use existing audit_log table
- ✅ **Admin Roles** - Extend to include moderator
- ✅ **Input Validation** - Use existing Zod schemas

---

## 📊 Estimated Security Implementation Time

- **Database Security (RLS, Functions)**: 4-6 hours
- **Input Validation & Sanitization**: 3-4 hours
- **Rate Limiting**: 2-3 hours
- **Spam Detection**: 3-4 hours
- **Moderation System**: 4-6 hours
- **Audit Logging**: 2-3 hours
- **Testing & Hardening**: 4-6 hours

**Total Security Implementation**: ~22-32 hours

---

## 🎯 Security Priorities

### Critical (Must Have)
1. ✅ RLS policies
2. ✅ Input validation
3. ✅ Content sanitization
4. ✅ Rate limiting
5. ✅ Basic spam detection

### Important (Should Have)
1. ✅ Moderation queue
2. ✅ User reporting
3. ✅ Audit logging
4. ✅ Ban system

### Nice to Have (Phase 2)
1. Advanced spam detection
2. Security monitoring dashboard
3. Automated moderation
4. CAPTCHA integration

---

## 🔍 Additional Security Enhancements

### 1. Error Message Security

**Prevent Information Disclosure:**
```typescript
// ❌ BAD - Reveals internal structure
throw new Error(`User ${userId} not found in database`);

// ✅ GOOD - Generic error message
throw new Error('User not found');

// Log details server-side only
logger.error('User lookup failed', { userId, ip: request.ip });
```

**Implementation:**
- Use generic error messages for users
- Log detailed errors server-side only
- Never expose stack traces in production
- Never expose database structure in errors

### 2. Environment Variable Security

**Secure Configuration:**
```typescript
// ✅ GOOD - Validate env vars at startup
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY', // Never expose to client
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

// ✅ GOOD - Separate public/private vars
// Public (safe to expose):
// - NEXT_PUBLIC_SUPABASE_URL
// - NEXT_PUBLIC_SUPABASE_ANON_KEY

// Private (server-only):
// - SUPABASE_SERVICE_ROLE_KEY
// - API_SECRET_KEYS
// - DATABASE_PASSWORDS
```

### 3. Dependency Security

**Regular Audits:**
```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Check for outdated packages
npm outdated

# Use automated tools:
# - Dependabot (GitHub)
# - Snyk (https://snyk.io)
# - npm audit (built-in)
```

**Best Practices:**
- ✅ Pin dependency versions (package-lock.json)
- ✅ Review security advisories monthly
- ✅ Update dependencies regularly
- ✅ Remove unused dependencies
- ✅ Use `npm audit` before deployment

### 4. Logging Security

**Secure Logging Practices:**
```typescript
// ❌ BAD - Logs sensitive data
logger.info('User login', { password: userPassword });

// ✅ GOOD - Never log sensitive data
logger.info('User login', { userId: user.id, email: user.email });

// ✅ GOOD - Sanitize logs
function sanitizeForLogging(data: unknown): unknown {
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret'];
  // Remove sensitive fields before logging
  return sanitizeObject(data, sensitiveFields);
}
```

**What NOT to Log:**
- Passwords
- API keys
- Tokens
- Credit card numbers
- Full user objects (only IDs)

### 5. CORS Configuration

**Secure CORS Setup:**
```typescript
// next.config.ts or middleware
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Only allow specific origins (not '*')
// Only allow necessary methods
// Only allow necessary headers
```

### 6. Database Connection Security

**Supabase Security (Already Handled):**
- ✅ Connection encryption (TLS)
- ✅ Parameterized queries (automatic)
- ✅ RLS policies (additional layer)
- ✅ Connection pooling (Supabase handles)

**Additional Considerations:**
- ✅ Use connection strings from environment variables
- ✅ Never commit credentials to git
- ✅ Rotate credentials regularly
- ✅ Use read-only connections where possible

### 7. Session Security Enhancements

**Additional Session Protections:**
```typescript
// Session security (Supabase handles most of this)
const SESSION_SECURITY = {
  // Require re-authentication for sensitive actions
  requireReauthFor: [
    'delete_account',
    'change_email',
    'change_password',
    'moderate_content',
  ],
  
  // Session timeout
  idleTimeout: 3600, // 1 hour
  absoluteTimeout: 86400, // 24 hours
  
  // IP binding (optional, can cause issues with mobile)
  bindToIp: false, // Set to true for extra security
};
```

### 8. Content Security Policy (CSP) Reporting

**CSP Violation Reporting:**
```typescript
// Report CSP violations
const cspReportUri = '/api/csp-report';

// Add to CSP header:
// "report-uri /api/csp-report; report-to csp-endpoint"

// Handler to log violations
export async function POST(request: Request) {
  const violation = await request.json();
  logger.warn('CSP violation', violation);
  return new Response('OK');
}
```

### 9. Security Headers Verification

**Verify Headers Are Set:**
```typescript
// Test security headers
// Use tools like:
// - https://securityheaders.com
// - https://observatory.mozilla.org
// - Browser DevTools → Network → Headers

// Expected headers:
// - Content-Security-Policy
// - Strict-Transport-Security
// - X-Content-Type-Options
// - X-Frame-Options
// - X-XSS-Protection
// - Referrer-Policy
// - Permissions-Policy
```

### 10. Incident Response Plan

**Security Incident Procedures:**

1. **Detection**
   - Monitor audit logs
   - Review security events
   - User reports

2. **Response**
   - Immediate: Contain threat (ban IP, revoke sessions)
   - Short-term: Investigate, gather evidence
   - Long-term: Patch vulnerability, update security

3. **Communication**
   - Notify affected users (if required)
   - Document incident
   - Post-mortem review

4. **Prevention**
   - Update security measures
   - Review and improve
   - Document lessons learned

---

## 📋 Security Checklist Summary

### Pre-Implementation
- [ ] Review security plan
- [ ] Review security review guide
- [ ] Identify any gaps
- [ ] Get approval on security measures

### During Implementation
- [ ] Implement all RLS policies
- [ ] Implement input validation
- [ ] Implement content sanitization
- [ ] Implement rate limiting
- [ ] Implement spam detection
- [ ] Implement audit logging
- [ ] Configure security headers
- [ ] Test security measures

### Pre-Launch
- [ ] Security audit (friends' review)
- [ ] Fix all critical findings
- [ ] Run `npm audit`
- [ ] Test all security measures
- [ ] Review error messages
- [ ] Verify security headers
- [ ] Test RLS policies
- [ ] Review audit logs

### Post-Launch
- [ ] Monitor security events
- [ ] Review audit logs regularly
- [ ] Update dependencies monthly
- [ ] Review security advisories
- [ ] Conduct quarterly security reviews

---

## 🔗 Related Documents

- **[FORUMS-IMPLEMENTATION-PLAN.md](./FORUMS-IMPLEMENTATION-PLAN.md)** - Feature implementation
- **[FORUMS-SECURITY-REVIEW-GUIDE.md](./FORUMS-SECURITY-REVIEW-GUIDE.md)** - Security review preparation
- **[security.md](./security.md)** - Overall project security strategy

---

**Ready for review and approval!** 🔒
