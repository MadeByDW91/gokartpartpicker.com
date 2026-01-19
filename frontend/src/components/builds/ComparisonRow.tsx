'use client';

import { useMemo } from 'react';
import { formatPrice } from '@/lib/utils';
import { ComparisonMetric } from './BuildComparison';
import { cn } from '@/lib/utils';
import type { Build } from '@/types/database';

interface ComparisonRowProps {
  metric: ComparisonMetric;
  builds: Build[];
}

/**
 * Individual comparison metric row
 * Shows values for each build with visual highlighting
 */
export function ComparisonRow({ metric, builds }: ComparisonRowProps) {
  const Icon = metric.icon;

  // Determine best and worst values
  const { bestIndex, worstIndex, formattedValues } = useMemo(() => {
    const numericValues = metric.values.map((v) => {
      if (typeof v === 'number') return v;
      if (typeof v === 'string') {
        const parsed = parseFloat(v);
        return isNaN(parsed) ? null : parsed;
      }
      return null;
    });

    let bestIndex = -1;
    let worstIndex = -1;

    if (metric.better && numericValues.some((v) => v !== null)) {
      const validValues = numericValues.filter((v) => v !== null) as number[];
      if (validValues.length > 0) {
        if (metric.better === 'higher') {
          bestIndex = numericValues.indexOf(Math.max(...validValues));
          worstIndex = numericValues.indexOf(Math.min(...validValues));
        } else {
          bestIndex = numericValues.indexOf(Math.min(...validValues));
          worstIndex = numericValues.indexOf(Math.max(...validValues));
        }
      }
    }

    // Format values
    const formatted = metric.values.map((value) => {
      if (value === null || value === undefined) return 'N/A';
      
      switch (metric.format) {
        case 'currency':
          return formatPrice(typeof value === 'number' ? value : 0);
        case 'number':
          return typeof value === 'number' ? value.toFixed(1) : String(value);
        case 'percentage':
          return typeof value === 'number' ? `${value.toFixed(0)}%` : String(value);
        default:
          return String(value);
      }
    });

    return { bestIndex, worstIndex, formattedValues: formatted };
  }, [metric]);

  return (
    <div className={cn(
      'grid gap-4 p-4 hover:bg-olive-800/30 transition-colors',
      builds.length === 2 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-4'
    )}>
      {/* Metric Label */}
      <div className="flex items-center gap-2 md:col-span-1">
        {Icon && <Icon className="w-4 h-4 text-orange-400 flex-shrink-0" />}
        <span className="text-sm font-medium text-cream-200">{metric.label}</span>
      </div>

      {/* Build Values */}
      {builds.map((build, index) => {
        const value = formattedValues[index];
        const isBest = index === bestIndex && metric.better !== undefined;
        const isWorst = index === worstIndex && metric.better !== undefined && bestIndex !== worstIndex;
        const hasValue = metric.values[index] !== null && metric.values[index] !== undefined;

        return (
          <div
            key={build.id}
            className={cn(
              'flex items-center justify-center p-2 rounded-md transition-colors',
              isBest && 'bg-[rgba(34,197,94,0.2)] border border-[var(--success)]',
              isWorst && 'bg-[rgba(166,61,64,0.2)] border border-[var(--error)]',
              !isBest && !isWorst && hasValue && 'bg-olive-800/50'
            )}
          >
            <span
              className={cn(
                'text-sm font-semibold',
                isBest && 'text-[var(--success)]',
                isWorst && 'text-[var(--error)]',
                !isBest && !isWorst && 'text-cream-100'
              )}
            >
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
