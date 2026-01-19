/**
 * Analytics utilities
 * Handles page views, events, and conversions
 */

// Analytics event types
export type AnalyticsEvent = 
  | { type: 'page_view'; path: string; title?: string }
  | { type: 'build_created'; buildId: string; engineId?: string; partCount: number }
  | { type: 'build_saved'; buildId: string }
  | { type: 'build_shared'; buildId: string }
  | { type: 'affiliate_click'; url: string; source: 'engine' | 'part' | 'build'; itemId: string }
  | { type: 'part_selected'; partId: string; category: string }
  | { type: 'engine_selected'; engineId: string }
  | { type: 'search'; query: string; results: number }
  | { type: 'guide_viewed'; guideId: string; guideSlug: string }
  | { type: 'video_played'; videoId: string; videoUrl: string }
  | { type: 'tool_used'; toolName: string }
  | { type: 'conversion'; action: string; value?: number };

/**
 * Track a page view
 */
// Track last page view to prevent duplicate tracking
let lastPageView: string | null = null;

export function trackPageView(path: string, title?: string) {
  if (typeof window === 'undefined') return;
  
  // Prevent duplicate tracking of the same page
  const pageKey = `${path}-${title || ''}`;
  if (lastPageView === pageKey) {
    return;
  }
  lastPageView = pageKey;
  
  const event: AnalyticsEvent = { type: 'page_view', path, title };
  
  // Google Analytics 4
  if (window.gtag) {
    try {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
        page_path: path,
        page_title: title,
      });
    } catch (err) {
      // Silently fail - analytics should never break the app
      console.warn('GA tracking error:', err);
    }
  }
  
  // Plausible Analytics
  if (window.plausible) {
    try {
      window.plausible('pageview', { props: { path, title } });
    } catch (err) {
      // Silently fail - analytics should never break the app
      console.warn('Plausible tracking error:', err);
    }
  }
  
  // Custom analytics endpoint (if needed)
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch(() => {
      // Silently fail - analytics should never break the app
    });
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Page view:', path);
  }
}

/**
 * Track a custom event
 */
export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === 'undefined') return;
  
  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', event.type, {
      ...event,
      event_category: getEventCategory(event),
    });
  }
  
  // Plausible Analytics
  if (window.plausible) {
    window.plausible(event.type, { props: event });
  }
  
  // Custom analytics endpoint
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch(() => {
      // Silently fail
    });
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Event:', event);
  }
}

/**
 * Track affiliate link clicks
 */
export function trackAffiliateClick(
  url: string,
  source: 'engine' | 'part' | 'build',
  itemId: string
) {
  trackEvent({
    type: 'affiliate_click',
    url,
    source,
    itemId,
  });
}

/**
 * Track build creation
 */
export function trackBuildCreated(
  buildId: string,
  engineId?: string,
  partCount: number = 0
) {
  trackEvent({
    type: 'build_created',
    buildId,
    engineId,
    partCount,
  });
}

/**
 * Track conversions (build saved, shared, etc.)
 */
export function trackConversion(action: string, value?: number) {
  trackEvent({
    type: 'conversion',
    action,
    value,
  });
  
  // Google Analytics conversion
  if (window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: process.env.NEXT_PUBLIC_GA_CONVERSION_ID,
      value,
      currency: 'USD',
    });
  }
}

/**
 * Get event category for GA4
 */
function getEventCategory(event: AnalyticsEvent): string {
  switch (event.type) {
    case 'build_created':
    case 'build_saved':
    case 'build_shared':
      return 'Build';
    case 'affiliate_click':
      return 'Affiliate';
    case 'part_selected':
    case 'engine_selected':
      return 'Selection';
    case 'search':
      return 'Search';
    case 'guide_viewed':
    case 'video_played':
      return 'Content';
    case 'tool_used':
      return 'Tools';
    case 'conversion':
      return 'Conversion';
    default:
      return 'General';
  }
}

// TypeScript declarations for global analytics objects
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    plausible?: (
      eventName: string,
      options?: { props?: Record<string, unknown> }
    ) => void;
  }
}
