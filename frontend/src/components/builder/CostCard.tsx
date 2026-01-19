'use client';

import { useState } from 'react';
import { useBuildCost } from '@/hooks/use-build-cost';
import { formatPrice } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { DollarSign, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CostCardProps {
  budget?: number;
  onBudgetChange?: (budget: number) => void;
  className?: string;
}

/**
 * Cost card component showing total cost, budget input, and budget status
 */
export function CostCard({ budget: initialBudget, onBudgetChange, className }: CostCardProps) {
  const [budget, setBudget] = useState<number | undefined>(initialBudget);
  const [inputValue, setInputValue] = useState(initialBudget?.toString() || '');
  
  const { totalCost, budgetStatus } = useBuildCost(budget);

  const handleBudgetChange = (value: string) => {
    setInputValue(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setBudget(numValue);
      onBudgetChange?.(numValue);
    } else if (value === '') {
      setBudget(undefined);
      onBudgetChange?.(0);
    }
  };

  return (
    <Card className={cn('bg-olive-800/50 border-olive-600', className)}>
      <CardContent className="space-y-4 pt-6">
        {/* Total Cost */}
        <div className="text-center">
          <p className="text-xs text-cream-400 uppercase tracking-wide mb-2">Total Build Cost</p>
          <div className="flex items-center justify-center gap-2">
            <DollarSign className="w-6 h-6 text-orange-400" />
            <span className="text-3xl font-bold text-orange-400">
              {formatPrice(totalCost)}
            </span>
          </div>
        </div>

        {/* Budget Input */}
        <Input
          type="number"
          label="Budget (Optional)"
          placeholder="Enter budget..."
          value={inputValue}
          onChange={(e) => handleBudgetChange(e.target.value)}
          className="bg-olive-700 border-olive-600 text-cream-100"
          min="0"
          step="0.01"
        />

        {/* Budget Status */}
        {budgetStatus && (
          <div className="space-y-3">
            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-cream-400">Budget Usage</span>
                <span className={cn(
                  'font-medium',
                  budgetStatus.status === 'over' && 'text-[var(--error)]',
                  budgetStatus.status === 'approaching' && 'text-[var(--warning)]',
                  budgetStatus.status === 'under' && 'text-[var(--success)]'
                )}>
                  {budgetStatus.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-olive-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-300',
                    budgetStatus.status === 'over' && 'bg-[var(--error)]',
                    budgetStatus.status === 'approaching' && 'bg-[var(--warning)]',
                    budgetStatus.status === 'under' && 'bg-[var(--success)]'
                  )}
                  style={{ width: `${budgetStatus.percentage}%` }}
                />
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              {budgetStatus.status === 'over' && (
                <>
                  <AlertTriangle className="w-4 h-4 text-[var(--error)]" />
                  <span className="text-sm text-[var(--error)] font-medium">
                    Over budget by {formatPrice(budgetStatus.overage)}
                  </span>
                </>
              )}
              {budgetStatus.status === 'approaching' && (
                <>
                  <TrendingUp className="w-4 h-4 text-[var(--warning)]" />
                  <span className="text-sm text-[var(--warning)] font-medium">
                    Approaching budget limit
                  </span>
                </>
              )}
              {budgetStatus.status === 'under' && budgetStatus.remaining > 0 && (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                  <span className="text-sm text-[var(--success)] font-medium">
                    {formatPrice(budgetStatus.remaining)} remaining
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
