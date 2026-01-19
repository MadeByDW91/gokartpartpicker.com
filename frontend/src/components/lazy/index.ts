/**
 * Lazy-loaded component exports
 * Use dynamic imports for heavy components to improve initial load time
 */

import dynamic from 'next/dynamic';

// Admin components - only load when needed
export const AffiliateAnalytics = dynamic(
  () => import('@/components/admin/AffiliateAnalytics').then(mod => ({ default: mod.AffiliateAnalytics })),
  { 
    loading: () => <div className="animate-pulse bg-olive-800 h-64 rounded-lg" />,
    ssr: false 
  }
);

export const AffiliateOptimization = dynamic(
  () => import('@/components/admin/AffiliateOptimization').then(mod => ({ default: mod.AffiliateOptimization })),
  { 
    loading: () => <div className="animate-pulse bg-olive-800 h-64 rounded-lg" />,
    ssr: false 
  }
);

export const AmazonProductImporter = dynamic(
  () => import('@/components/admin/AmazonProductImporter').then(mod => ({ default: mod.AmazonProductImporter })),
  { 
    loading: () => <div className="animate-pulse bg-olive-800 h-96 rounded-lg" />,
    ssr: false 
  }
);

// Video components - heavy with YouTube embeds
export const VideoSection = dynamic(
  () => import('@/components/videos/VideoSection').then(mod => ({ default: mod.VideoSection })),
  { 
    loading: () => <div className="animate-pulse bg-olive-800 h-64 rounded-lg" />,
    ssr: false 
  }
);

// Guide components
export const GuideViewer = dynamic(
  () => import('@/components/guides/GuideViewer').then(mod => ({ default: mod.GuideViewer })),
  { 
    loading: () => <div className="animate-pulse bg-olive-800 h-96 rounded-lg" />,
    ssr: true // Guides should be SSR for SEO
  }
);

// Builder components
export const BuilderTable = dynamic(
  () => import('@/components/builder/BuilderTable').then(mod => ({ default: mod.BuilderTable })),
  { 
    loading: () => <div className="animate-pulse bg-olive-800 h-96 rounded-lg" />,
    ssr: false 
  }
);

export const PartSelectionModal = dynamic(
  () => import('@/components/builder/PartSelectionModal').then(mod => ({ default: mod.PartSelectionModal })),
  { 
    loading: () => null, // Modal doesn't need loading state
    ssr: false 
  }
);
