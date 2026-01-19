'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { formatPrice, getCategoryLabel } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ComparisonRow } from './ComparisonRow';
import type { Build, Engine, Part } from '@/types/database';
import { Zap, DollarSign, Package, Weight, TrendingUp, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BuildComparisonProps {
  builds: Build[];
  partsData?: Map<string, Part[]>; // Map of build ID to parts
}

export interface ComparisonMetric {
  label: string;
  category: 'cost' | 'performance' | 'parts' | 'compatibility';
  values: (number | string | null)[];
  better?: 'higher' | 'lower';
  format?: 'currency' | 'number' | 'percentage' | 'text';
  icon?: React.ComponentType<{ className?: string }>;
}

/**
 * Main build comparison component
 * Displays builds side-by-side with comparison metrics
 */
export function BuildComparison({ builds, partsData = new Map() }: BuildComparisonProps) {
  // Calculate metrics for comparison
  const metrics = useMemo((): ComparisonMetric[] => {
    const comparisonMetrics: ComparisonMetric[] = [];

    // Total Cost
    comparisonMetrics.push({
      label: 'Total Cost',
      category: 'cost',
      values: builds.map((b) => b.total_price),
      better: 'lower',
      format: 'currency',
      icon: DollarSign,
    });

    // Estimated HP (from engine)
    comparisonMetrics.push({
      label: 'Engine HP',
      category: 'performance',
      values: builds.map((b) => (b.engine as Engine)?.horsepower || null),
      better: 'higher',
      format: 'number',
      icon: Zap,
    });

    // Estimated Torque (from engine)
    comparisonMetrics.push({
      label: 'Engine Torque',
      category: 'performance',
      values: builds.map((b) => (b.engine as Engine)?.torque || null),
      better: 'higher',
      format: 'number',
      icon: TrendingUp,
    });

    // Number of Parts
    comparisonMetrics.push({
      label: 'Parts Count',
      category: 'parts',
      values: builds.map((b) => {
        const parts = b.parts as Record<string, string> | null;
        return parts ? Object.keys(parts).length : 0;
      }),
      better: 'higher',
      format: 'number',
      icon: Package,
    });

    // Engine Weight
    comparisonMetrics.push({
      label: 'Engine Weight',
      category: 'performance',
      values: builds.map((b) => (b.engine as Engine)?.weight_lbs || null),
      better: 'lower',
      format: 'number',
      icon: Weight,
    });

    // Compatibility Status
    comparisonMetrics.push({
      label: 'Compatibility',
      category: 'compatibility',
      values: builds.map(() => 'Compatible'), // TODO: Check actual compatibility
      better: undefined,
      format: 'text',
      icon: CheckCircle2,
    });

    return comparisonMetrics;
  }, [builds]);

  // Find "best value" build (lowest cost per HP)
  const bestValueBuild = useMemo((): string | undefined => {
    type BestValue = { build: Build; value: number };
    let best: BestValue | null = null;

    builds.forEach((build) => {
      const engine = build.engine as Engine | undefined;
      const hp = engine?.horsepower || 1;
      const cost = build.total_price || 0;
      const value = hp / cost; // HP per dollar

      if (!best || value > best.value) {
        best = { build, value };
      }
    });

    return best ? (best as BestValue).build.id : undefined;
  }, [builds]);

  if (builds.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-cream-400">No builds selected for comparison</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Build Headers */}
      <div className={cn(
        'grid gap-4',
        builds.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'
      )}>
        {builds.map((build, index) => {
          const engine = build.engine as Engine | undefined;
          const isBestValue = build.id === bestValueBuild;

          return (
            <Card key={build.id} className={cn(
              'relative overflow-hidden',
              isBestValue && 'ring-2 ring-orange-500'
            )}>
              {isBestValue && (
                <div className="absolute top-0 right-0 bg-orange-500 text-cream-100 text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Best Value
                </div>
              )}
              <CardHeader>
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-cream-100 truncate">
                        {build.name}
                      </h3>
                      {build.profile && (
                        <p className="text-xs text-cream-400">
                          by {build.profile.username || 'Unknown'}
                        </p>
                      )}
                    </div>
                    <Badge variant={build.is_public ? 'success' : 'default'} size="sm">
                      {build.is_public ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                  {engine && (
                    <div className="text-sm text-cream-300">
                      <span className="font-medium">{engine.brand}</span>{' '}
                      <span className="text-cream-400">{engine.name}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Link href={`/builds/${build.id}`}>
                  <button className="text-sm text-orange-400 hover:text-orange-300 transition-colors">
                    View Details →
                  </button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparison Metrics */}
      <Card>
        <CardHeader>
          <h2 className="text-display text-xl text-cream-100">Comparison</h2>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-olive-600">
            {metrics.map((metric, idx) => (
              <ComparisonRow
                key={idx}
                metric={metric}
                builds={builds}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
