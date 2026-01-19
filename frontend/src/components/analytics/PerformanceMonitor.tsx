'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Performance monitoring component
 * Tracks Core Web Vitals and custom performance metrics
 */
export function PerformanceMonitor() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('PerformanceObserver' in window)) return;

    // Track Core Web Vitals
    const trackWebVital = (metric: {
      name: string;
      value: number;
      id: string;
      delta: number;
    }) => {
      // Send to analytics
      if (window.gtag) {
        window.gtag('event', metric.name, {
          value: Math.round(metric.value),
          event_category: 'Web Vitals',
          event_label: metric.id,
          non_interaction: true,
        });
      }

      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Performance]', metric.name, metric.value);
      }
    };

    // Track Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          renderTime?: number;
          loadTime?: number;
        };
        
        trackWebVital({
          name: 'LCP',
          value: lastEntry.renderTime || lastEntry.loadTime || 0,
          id: lastEntry.name,
          delta: 0,
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Browser doesn't support LCP
    }

    // Track First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEventTiming;
          trackWebVital({
            name: 'FID',
            value: fidEntry.processingStart - fidEntry.startTime,
            id: fidEntry.name,
            delta: 0,
          });
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // Browser doesn't support FID
    }

    // Track Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const layoutShift = entry as LayoutShift;
          if (!layoutShift.hadRecentInput) {
            clsValue += layoutShift.value;
          }
        });
        
        trackWebVital({
          name: 'CLS',
          value: clsValue,
          id: 'cumulative',
          delta: 0,
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // Browser doesn't support CLS
    }

    // Track page load time
    if (document.readyState === 'complete') {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      trackWebVital({
        name: 'Page Load',
        value: loadTime,
        id: pathname,
        delta: 0,
      });
    } else {
      window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        trackWebVital({
          name: 'Page Load',
          value: loadTime,
          id: pathname,
          delta: 0,
        });
      });
    }
  }, [pathname]);

  return null;
}

// TypeScript declarations for Performance API
interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
  startTime: number;
}

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}
