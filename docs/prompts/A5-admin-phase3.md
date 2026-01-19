# A5: Admin Phase 3 - Advanced Automation

**Agent:** A5 (Admin)  
**Status:** 🟡 In Progress  
**Phase:** 3 of 3

---

```markdown
You are Agent A5: Admin.

Build automation and advanced tools for scaling operations.
These reduce manual work and enable growth.

TASK: Admin Phase 3 - Advanced Automation

## Features to Build (In Order)

### 1. Price Monitoring
**Why:** Keep prices up-to-date automatically

**Files to Create:**
- `src/app/admin/pricing/monitor/page.tsx` — Price monitoring dashboard
- `src/components/admin/PriceMonitor.tsx` — Price monitor component
- `src/actions/admin/pricing.ts` — Price monitoring server actions
- `src/lib/pricing-scraper.ts` — Price scraping utilities (optional)

**Features:**
- **Price Tracking:**
  - Track price history per item
  - Show price changes over time
  - Alert on significant price changes
  - Manual price update trigger

- **Price Sources:**
  - Harbor Freight (for engines)
  - Amazon (for parts)
  - eBay (for parts)
  - Manual entry fallback

- **Automation:**
  - Scheduled price checks (cron job or Vercel cron)
  - Auto-update prices (with approval workflow)
  - Out-of-stock detection
  - Price change notifications

**UI:**
- Dashboard showing items with price changes
- Price history chart per item
- Bulk approve/reject price updates
- Settings for automation rules

### 2. Content Automation
**Why:** Reduce manual content creation

**Files to Create:**
- `src/app/admin/content/automation/page.tsx` — Content automation
- `src/components/admin/ContentGenerator.tsx` — Content generator
- `src/actions/admin/content.ts` — Content automation server actions

**Features:**
- **Auto-Generate Descriptions:**
  - Generate descriptions from specs
  - Template-based generation
  - AI-assisted (optional - use OpenAI API if available)

- **Image Sourcing:**
  - Search for images by product name
  - Validate image URLs
  - Bulk image update

- **Spec Extraction:**
  - Extract specs from product pages
  - Auto-fill dimension fields
  - Validate extracted data

- **Duplicate Detection:**
  - Find similar products
  - Merge suggestions
  - Duplicate removal workflow

### 3. Advanced Catalog Features
**Why:** Support complex product relationships

**Files to Create:**
- `src/app/admin/catalog/variants/page.tsx` — Product variants
- `src/components/admin/VariantManager.tsx` — Variant manager
- `src/actions/admin/variants.ts` — Variant server actions

**Features:**
- **Product Variants:**
  - Manage color/size variants
  - Variant pricing
  - Variant images
  - Bulk variant creation

- **Product Relationships:**
  - "Frequently bought together" suggestions
  - "Upgrade path" recommendations
  - "Alternative to" links
  - Compatibility suggestions

### 4. Marketing Tools
**Why:** Growth and engagement

**Files to Create:**
- `src/app/admin/marketing/page.tsx` — Marketing dashboard
- `src/app/admin/marketing/email/page.tsx` — Email campaigns
- `src/components/admin/EmailBuilder.tsx` — Email builder
- `src/actions/admin/marketing.ts` — Marketing server actions

**Features:**
- **Email Campaigns:**
  - User segmentation
  - Build completion reminders
  - New part notifications
  - Newsletter management
  - Email templates

- **Promotions:**
  - Discount codes (if applicable)
  - Featured builds
  - Seasonal campaigns
  - A/B testing setup

- **SEO Tools:**
  - Keyword tracking
  - Meta tag optimization
  - Sitemap management
  - Backlink monitoring

### 5. API & Integrations
**Why:** Enable third-party integrations

**Files to Create:**
- `src/app/admin/api/page.tsx` — API management
- `src/components/admin/ApiKeyManager.tsx` — API key manager
- `src/actions/admin/api.ts` — API management server actions

**Features:**
- **API Key Management:**
  - Generate API keys
  - Revoke keys
  - Usage analytics
  - Rate limiting settings

- **Integrations:**
  - Amazon Product Advertising API
  - eBay API
  - Google Analytics
  - Payment processors (if applicable)

## Implementation Notes

### Price Monitoring:
- Use web scraping (Puppeteer, Playwright) or APIs
- Store price history in database
- Use Vercel Cron for scheduled jobs
- Rate limit to avoid being blocked

### Content Automation:
- Use AI APIs (OpenAI) for descriptions if available
- Image search APIs (Google Images, Unsplash)
- Template system for content generation

### Marketing:
- Use email service (SendGrid, Resend, etc.)
- Store email templates in database
- Track email open/click rates

## Success Criteria

- [ ] Price monitoring tracks prices accurately
- [ ] Price automation works (with approval)
- [ ] Content generation produces usable content
- [ ] Variant management works
- [ ] Email campaigns can be sent
- [ ] API keys can be managed
- [ ] All automation has manual override
- [ ] Error handling for failed automation

## DO NOT

- Do NOT break existing functionality
- Do NOT expose API keys in client code
- Do NOT run automation without approval workflows
- Do NOT scrape sites without respecting robots.txt
```
