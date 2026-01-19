'use client';

import { useBuildCost } from '@/hooks/use-build-cost';
import { useParts } from '@/hooks/use-parts';
import { formatPrice, getCategoryLabel } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBuildStore } from '@/store/build-store';
import type { Part } from '@/types/database';

interface BudgetSuggestionsProps {
  budget: number;
  className?: string;
}

/**
 * Component suggesting cheaper alternatives when over budget
 */
export function BudgetSuggestions({ budget, className }: BudgetSuggestionsProps) {
  const { expensiveParts } = useBuildCost(budget);
  const { setPart } = useBuildStore();
  const { data: allParts } = useParts();

  if (expensiveParts.length === 0) return null;

  // Find cheaper alternatives for the most expensive parts
  const suggestions = expensiveParts.slice(0, 3).map(({ part, category }) => {
    const alternatives = allParts
      ?.filter((p) => p.category === category && p.id !== part.id && p.price && p.price < (part.price || 0))
      .sort((a, b) => (a.price || 0) - (b.price || 0))
      .slice(0, 2) || [];

    const savings = alternatives[0] 
      ? (part.price || 0) - (alternatives[0].price || 0)
      : 0;

    return {
      currentPart: part,
      category,
      alternatives,
      savings,
    };
  }).filter((s) => s.alternatives.length > 0 && s.savings > 0);

  if (suggestions.length === 0) return null;

  return (
    <Card className={cn('bg-[rgba(212,128,60,0.1)] border-[var(--warning)]', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-[var(--warning)]" />
          <h3 className="text-sm font-semibold text-cream-100">Budget Suggestions</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, idx) => (
          <div key={idx} className="space-y-2 p-3 bg-olive-800/30 rounded-lg border border-olive-600/50">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-cream-400 mb-1">
                  Current: <span className="text-cream-200 font-medium">{suggestion.currentPart.name}</span>
                </p>
                <p className="text-xs text-[var(--warning)] font-medium">
                  Save {formatPrice(suggestion.savings)} with {suggestion.alternatives[0].name}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {suggestion.alternatives.map((alt) => (
                <Button
                  key={alt.id}
                  variant="secondary"
                  size="sm"
                  onClick={() => setPart(suggestion.category, alt)}
                  className="text-xs"
                >
                  Switch to {alt.name}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
