/**
 * Lazy-loaded component exports
 * Use dynamic imports for heavy components to improve initial load time
 */

'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Loading placeholder component
const LoadingPlaceholder = ({ height = 'h-64' }: { height?: string }) => (
  <div className={`animate-pulse bg-olive-800 ${height} rounded-lg`} />
);

// Admin components - only load when needed
export const AffiliateAnalytics = dynamic(
  () => import('@/components/admin/AffiliateAnalytics').then(mod => ({ default: mod.AffiliateAnalytics })),
  { 
    loading: () => <LoadingPlaceholder />,
    ssr: false 
  }
);

export const AffiliateOptimization = dynamic(
  () => import('@/components/admin/AffiliateOptimization').then(mod => ({ default: mod.AffiliateOptimization })),
  { 
    loading: () => <LoadingPlaceholder />,
    ssr: false 
  }
);

export const AmazonProductImporter = dynamic(
  () => import('@/components/admin/AmazonProductImporter').then(mod => ({ default: mod.AmazonProductImporter })),
  { 
    loading: () => <LoadingPlaceholder height="h-96" />,
    ssr: false 
  }
);

// Video components - heavy with YouTube embeds
export const VideoSection = dynamic(
  () => import('@/components/videos/VideoSection').then(mod => ({ default: mod.VideoSection })),
  { 
    loading: () => <LoadingPlaceholder />,
    ssr: false 
  }
);

// Guide components
export const GuideViewer = dynamic(
  () => import('@/components/guides/GuideViewer').then(mod => ({ default: mod.GuideViewer })),
  { 
    loading: () => <LoadingPlaceholder height="h-96" />,
    ssr: true // Guides should be SSR for SEO
  }
);

// Builder components
export const BuilderTable = dynamic(
  () => import('@/components/builder/BuilderTable').then(mod => ({ default: mod.BuilderTable })),
  { 
    loading: () => <LoadingPlaceholder height="h-96" />,
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
