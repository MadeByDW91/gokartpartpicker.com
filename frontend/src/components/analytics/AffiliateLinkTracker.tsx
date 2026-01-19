'use client';

import { useEffect } from 'react';
import { trackAffiliateClick } from '@/lib/analytics';

/**
 * Component to automatically track affiliate link clicks
 * Add this to pages with affiliate links
 */
export function AffiliateLinkTracker() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href*="amazon"], a[href*="ebay"], a[href*="harborfreight"]');
      
      if (!link) return;
      
      const href = (link as HTMLAnchorElement).href;
      const rel = (link as HTMLAnchorElement).getAttribute('rel');
      
      // Only track affiliate links (marked with rel="sponsored")
      if (rel?.includes('sponsored')) {
        // Extract source from data attributes or parent context
        const source = (link as HTMLElement).dataset.source as 'engine' | 'part' | 'build' || 'part';
        const itemId = (link as HTMLElement).dataset.itemId || '';
        
        trackAffiliateClick(href, source, itemId);
      }
    };

    document.addEventListener('click', handleClick, true);
    
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  return null;
}
