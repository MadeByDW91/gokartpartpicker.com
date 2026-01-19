# Analytics & Monitoring Setup Guide

> **Phase 3: Analytics & Monitoring Implementation**

---

## 📊 Analytics Providers

### Option 1: Google Analytics 4 (Recommended)

**Setup:**
1. Create a GA4 property at [analytics.google.com](https://analytics.google.com)
2. Get your Measurement ID (format: `G-XXXXXXXXXX`)
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

**Features:**
- Page views
- Custom events
- Conversions
- User behavior tracking
- Free tier available

---

### Option 2: Plausible Analytics (Privacy-focused)

**Setup:**
1. Sign up at [plausible.io](https://plausible.io)
2. Add your domain
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_PLAUSIBLE_DOMAIN=gokartpartpicker.com
   ```

**Features:**
- Privacy-friendly (no cookies)
- GDPR compliant
- Simple dashboard
- Paid service (~$9/month)

---

## 🐛 Error Tracking: Sentry

**Setup:**
1. Create account at [sentry.io](https://sentry.io)
2. Create a Next.js project
3. Get your DSN
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   ```

**Install:**
```bash
npm install @sentry/nextjs
```

**Features:**
- Error tracking
- Performance monitoring
- Release tracking
- User context
- Free tier available (5,000 events/month)

---

## 📈 Tracked Events

### User Actions
- `page_view` - Page navigation
- `part_selected` - Part added to build
- `engine_selected` - Engine added to build
- `build_created` - Build saved
- `build_shared` - Build link shared
- `search` - Search performed

### Affiliate Tracking
- `affiliate_click` - Affiliate link clicked
  - Tracks: URL, source (engine/part/build), item ID

### Content Engagement
- `guide_viewed` - Installation guide viewed
- `video_played` - Video played

### Tools Usage
- `tool_used` - Calculator/tool used

### Conversions
- `conversion` - Key actions (build saved, shared, etc.)

---

## 🎯 Performance Monitoring

**Core Web Vitals Tracked:**
- **LCP** (Largest Contentful Paint) - Loading performance
- **FID** (First Input Delay) - Interactivity
- **CLS** (Cumulative Layout Shift) - Visual stability
- **Page Load Time** - Total load time

---

## 🔧 Implementation Status

✅ **Completed:**
- Analytics infrastructure (`/lib/analytics.ts`)
- Error tracking infrastructure (`/lib/error-tracking.ts`)
- Performance monitoring (`PerformanceMonitor.tsx`)
- Affiliate link tracking
- Page view tracking
- Event tracking utilities

✅ **Integrated:**
- AnalyticsProvider in root layout
- Error tracking in error boundaries
- Affiliate click tracking on links
- Part/Engine selection tracking

⏳ **To Configure:**
- Add environment variables (see above)
- Install Sentry (if using): `npm install @sentry/nextjs`
- Verify tracking in development console

---

## 🧪 Testing

**Development Mode:**
- All events log to console
- Check browser console for `[Analytics]` logs
- Verify events fire on user actions

**Production:**
- Events sent to configured providers
- Check GA4/Plausible dashboards
- Monitor Sentry for errors

---

## 📝 Next Steps

1. **Choose Analytics Provider:**
   - Google Analytics 4 (free, comprehensive)
   - Plausible (paid, privacy-focused)

2. **Set Up Error Tracking:**
   - Create Sentry account
   - Install package
   - Add DSN to env

3. **Verify Tracking:**
   - Test in development
   - Check console logs
   - Verify in production dashboards

---

*Analytics infrastructure is ready - just add your API keys!*
