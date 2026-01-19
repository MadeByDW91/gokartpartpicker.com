'use client';

import { useBuildCost } from '@/hooks/use-build-cost';
import { formatPrice } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { TrendingDown, PieChart } from 'lucide-react';

interface CostBreakdownProps {
  showDetails?: boolean;
  className?: string;
}

/**
 * Cost breakdown component showing cost by category
 */
export function CostBreakdown({ showDetails = true, className }: CostBreakdownProps) {
  const { totalCost, costBreakdown } = useBuildCost();

  if (totalCost === 0 || costBreakdown.length === 0) {
    return null;
  }

  const mostExpensive = costBreakdown[0];

  return (
    <Card className={cn('bg-olive-800/50 border-olive-600', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-semibold text-cream-100">Cost Breakdown</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {costBreakdown.map((item) => {
          const isMostExpensive = item.category === mostExpensive.category;
          
          return (
            <div key={item.category} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-cream-300">{item.label}</span>
                  {isMostExpensive && (
                    <span title="Most expensive category">
                      <TrendingDown className="w-3 h-3 text-orange-400" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-cream-400">
                    {item.percentage.toFixed(0)}%
                  </span>
                  <span className="text-sm font-semibold text-orange-400">
                    {formatPrice(item.cost)}
                  </span>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="h-1.5 bg-olive-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all',
                    isMostExpensive ? 'bg-orange-500' : 'bg-olive-600'
                  )}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>

              {/* Part details */}
              {showDetails && item.parts.length > 0 && item.parts.length <= 3 && (
                <div className="pl-2 space-y-0.5">
                  {item.parts.map((part, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-cream-400 truncate">{part.name}</span>
                      <span className="text-cream-300 ml-2 flex-shrink-0">
                        {formatPrice(part.cost)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
