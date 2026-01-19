'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, DollarSign, BarChart3, Link2 } from 'lucide-react';
import { AffiliateLinkGenerator } from '@/components/admin/AffiliateLinkGenerator';
import { AffiliateAnalytics, AffiliateOptimization } from '@/components/lazy';
import { Button } from '@/components/ui/Button';

export default function AffiliatePage() {
  const [activeTab, setActiveTab] = useState<'generator' | 'analytics'>('analytics');

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-orange-400" />
          <div>
            <h1 className="text-display text-3xl text-cream-100">Affiliate Links</h1>
            <p className="text-cream-300 mt-1">
              Generate and manage affiliate links for revenue optimization
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-olive-600">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'analytics'
              ? 'text-orange-400 border-b-2 border-orange-400'
              : 'text-cream-400 hover:text-cream-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics & Management
          </div>
        </button>
        <button
          onClick={() => setActiveTab('generator')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'generator'
              ? 'text-orange-400 border-b-2 border-orange-400'
              : 'text-cream-400 hover:text-cream-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Link Generator
          </div>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'analytics' && <AffiliateAnalytics />}
      {activeTab === 'generator' && (
        <div className="space-y-6">
          <AffiliateLinkGenerator />

          {/* Info Section */}
          <div className="p-4 bg-olive-700/30 rounded-lg border border-olive-600">
            <h3 className="text-sm font-semibold text-cream-100 mb-2">Affiliate Program Configuration</h3>
            <p className="text-xs text-cream-400 mb-3">
              Configure affiliate tags in your environment variables:
            </p>
            <div className="space-y-1 font-mono text-xs text-cream-300">
              <p>NEXT_PUBLIC_AMAZON_AFFILIATE_TAG=your-amazon-tag</p>
              <p>NEXT_PUBLIC_EBAY_AFFILIATE_TAG=your-ebay-tag</p>
            </div>
            <p className="text-xs text-cream-400 mt-3">
              These tags are used automatically when generating affiliate links. Links can also be applied
              in bulk to selected parts or engines from their respective list pages.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
