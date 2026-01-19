'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useBuildsForComparison } from '@/hooks/use-builds';
import { BuildComparison } from '@/components/builds/BuildComparison';
import { BuildSelector } from '@/components/builds/BuildSelector';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { GitCompare, Loader2, AlertCircle } from 'lucide-react';
import { useParts } from '@/hooks/use-parts';
import type { Part } from '@/types/database';

/**
 * Internal component that uses useSearchParams
 * Must be wrapped in Suspense
 */
function CompareBuildsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedBuildIds, setSelectedBuildIds] = useState<string[]>([]);
  const { data: allParts } = useParts();

  // Parse build IDs from URL
  useEffect(() => {
    const buildsParam = searchParams.get('builds');
    if (buildsParam) {
      const ids = buildsParam.split(',').filter(Boolean).slice(0, 3);
      setSelectedBuildIds(ids);
    }
  }, [searchParams]);

  // Fetch builds for comparison
  const { data: builds, isLoading, error } = useBuildsForComparison(selectedBuildIds);

  // Update URL when selection changes
  useEffect(() => {
    if (selectedBuildIds.length > 0) {
      const newParams = new URLSearchParams();
      newParams.set('builds', selectedBuildIds.join(','));
      router.replace(`/builds/compare?${newParams.toString()}`, { scroll: false });
    } else {
      router.replace('/builds/compare', { scroll: false });
    }
  }, [selectedBuildIds, router]);

  // Build parts data map for each build
  const partsData = useMemo(() => {
    if (!builds || !allParts) return new Map<string, Part[]>();
    
    const partsMap = new Map<string, Part[]>();
    
    builds.forEach((build) => {
      const buildParts = build.parts as Record<string, string> | null;
      if (!buildParts) return;

      const partIds = Object.values(buildParts);
      const matchingParts = allParts.filter((p) => partIds.includes(p.id));
      partsMap.set(build.id, matchingParts);
    });

    return partsMap;
  }, [builds, allParts]);

  const handleCompare = () => {
    if (selectedBuildIds.length < 2) return;
    const newParams = new URLSearchParams();
    newParams.set('builds', selectedBuildIds.join(','));
    router.push(`/builds/compare?${newParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-olive-900">
      {/* Header */}
      <div className="bg-olive-800 border-b border-olive-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <GitCompare className="w-8 h-8 text-orange-400" />
            <h1 className="text-display text-3xl sm:text-4xl text-cream-100">
              Compare Builds
            </h1>
          </div>
          <p className="text-cream-400 max-w-2xl">
            Select 2-3 builds to compare side-by-side. See differences in cost, performance, and parts.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Build Selector */}
          <div className="lg:col-span-1">
            <BuildSelector
              selectedBuildIds={selectedBuildIds}
              onSelectionChange={setSelectedBuildIds}
              maxSelection={3}
            />
            {selectedBuildIds.length >= 2 && (
              <div className="mt-4">
                <Button
                  variant="primary"
                  onClick={handleCompare}
                  className="w-full"
                  icon={<GitCompare className="w-4 h-4" />}
                >
                  Compare {selectedBuildIds.length} Builds
                </Button>
              </div>
            )}
          </div>

          {/* Comparison Results */}
          <div className="lg:col-span-2">
            {selectedBuildIds.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <GitCompare className="w-16 h-16 text-olive-600 mx-auto mb-4" />
                  <h2 className="text-xl text-cream-100 mb-2">Select Builds to Compare</h2>
                  <p className="text-cream-400">
                    Choose 2-3 builds from the list to see a side-by-side comparison.
                  </p>
                </CardContent>
              </Card>
            )}

            {selectedBuildIds.length === 1 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-16 h-16 text-[var(--warning)] mx-auto mb-4" />
                  <h2 className="text-xl text-cream-100 mb-2">Select More Builds</h2>
                  <p className="text-cream-400">
                    Select at least 2 builds to compare.
                  </p>
                </CardContent>
              </Card>
            )}

            {selectedBuildIds.length > 1 && isLoading && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-4" />
                  <p className="text-cream-400">Loading builds...</p>
                </CardContent>
              </Card>
            )}

            {selectedBuildIds.length > 1 && error && (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-16 h-16 text-[var(--error)] mx-auto mb-4" />
                  <h2 className="text-xl text-cream-100 mb-2">Error Loading Builds</h2>
                  <p className="text-cream-400">
                    {error instanceof Error ? error.message : 'Failed to load builds for comparison'}
                  </p>
                </CardContent>
              </Card>
            )}

            {selectedBuildIds.length > 1 && builds && builds.length > 0 && (
              <BuildComparison builds={builds} partsData={partsData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Build comparison page
 * URL format: /builds/compare?builds=id1,id2,id3
 */
export default function CompareBuildsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-olive-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    }>
      <CompareBuildsContent />
    </Suspense>
  );
}
