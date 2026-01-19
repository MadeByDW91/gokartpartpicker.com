'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';
import { initErrorTracking } from '@/lib/error-tracking';
import { PerformanceMonitor } from './PerformanceMonitor';

/**
 * Internal component that uses useSearchParams
 * Must be wrapped in Suspense
 */
function AnalyticsTracker({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views on route change
  useEffect(() => {
    // Only track if we have a valid pathname and document title
    if (pathname && typeof document !== 'undefined' && document.title) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      trackPageView(url, document.title);
    }
  }, [pathname, searchParams]);

  // Initialize Google Analytics if ID is provided
  useEffect(() => {
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    
    if (gaId && typeof window !== 'undefined' && !window.gtag) {
      // Load Google Analytics script
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}', {
          page_path: window.location.pathname,
        });
      `;
      document.head.appendChild(script2);
    }
  }, []);

  // Initialize Plausible Analytics if domain is provided
  useEffect(() => {
    const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
    
    if (plausibleDomain && typeof window !== 'undefined' && !window.plausible) {
      const script = document.createElement('script');
      script.defer = true;
      script.setAttribute('data-domain', plausibleDomain);
      script.src = 'https://plausible.io/js/script.js';
      document.head.appendChild(script);
    }
  }, []);

  // Initialize error tracking
  useEffect(() => {
    initErrorTracking();
  }, []);

  return (
    <>
      <PerformanceMonitor />
      {children}
    </>
  );
}

/**
 * Analytics Provider Component
 * Tracks page views and initializes analytics scripts
 * Wraps useSearchParams in Suspense to avoid build errors
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={children}>
      <AnalyticsTracker>{children}</AnalyticsTracker>
    </Suspense>
  );
}
