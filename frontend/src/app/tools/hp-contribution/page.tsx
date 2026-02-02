'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { HPContributionCalculator } from '@/components/tools/HPContributionCalculator';

export default function HPContributionPage() {
  return (
    <div className="min-h-screen bg-olive-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            href="/tools"
            className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Tools
          </Link>
          <div>
            <h1 className="text-display text-3xl text-cream-100 mb-2">HP Contribution Calculator</h1>
            <p className="text-cream-300">
              See how much HP each part individually adds to your build
            </p>
          </div>
        </div>

        <HPContributionCalculator />
      </div>
    </div>
  );
}
