'use client';

import { useMemo } from 'react';
import { useBuildStore } from '@/store/build-store';
import { CATEGORY_GROUPS, getCategoryLabel } from '@/lib/utils';
import type { Engine, Part, PartCategory } from '@/types/database';

export interface CostBreakdown {
  category: string;
  label: string;
  cost: number;
  percentage: number;
  parts: Array<{ name: string; cost: number }>;
}

export interface BudgetStatus {
  status: 'under' | 'approaching' | 'over';
  percentage: number;
  remaining: number;
  overage: number;
}

/**
 * Hook for calculating build costs and budget tracking
 */
export function useBuildCost(budget?: number) {
  const { selectedEngine, selectedParts } = useBuildStore();

  // Calculate total cost
  const totalCost = useMemo(() => {
    let total = selectedEngine?.price || 0;
    selectedParts.forEach((part) => {
      total += part.price || 0;
    });
    return total;
  }, [selectedEngine, selectedParts]);

  // Calculate cost by category group
  const costBreakdown = useMemo((): CostBreakdown[] => {
    const breakdown: Map<string, CostBreakdown> = new Map();

    // Add engine cost
    if (selectedEngine && selectedEngine.price) {
      breakdown.set('engine', {
        category: 'engine',
        label: 'Engine',
        cost: selectedEngine.price,
        percentage: 0, // Will calculate after
        parts: [{ name: selectedEngine.name, cost: selectedEngine.price }],
      });
    }

    // Add parts by category
    selectedParts.forEach((part, category) => {
      const group = CATEGORY_GROUPS.find((g) => g.categories.includes(category));
      const groupId = group?.id || 'other';
      const groupLabel = group?.label || 'Other';

      const existing = breakdown.get(groupId);
      const partCost = part.price || 0;

      if (existing) {
        existing.cost += partCost;
        existing.parts.push({ name: part.name, cost: partCost });
      } else {
        breakdown.set(groupId, {
          category: groupId,
          label: groupLabel,
          cost: partCost,
          percentage: 0, // Will calculate after
          parts: [{ name: part.name, cost: partCost }],
        });
      }
    });

    // Calculate percentages
    const result = Array.from(breakdown.values());
    result.forEach((item) => {
      item.percentage = totalCost > 0 ? (item.cost / totalCost) * 100 : 0;
    });

    // Sort by cost (descending)
    return result.sort((a, b) => b.cost - a.cost);
  }, [selectedEngine, selectedParts, totalCost]);

  // Calculate budget status
  const budgetStatus = useMemo((): BudgetStatus | null => {
    if (!budget || budget <= 0) return null;

    const percentage = (totalCost / budget) * 100;
    const remaining = Math.max(0, budget - totalCost);
    const overage = Math.max(0, totalCost - budget);

    let status: 'under' | 'approaching' | 'over' = 'under';
    if (percentage > 100) {
      status = 'over';
    } else if (percentage >= 80) {
      status = 'approaching';
    }

    return {
      status,
      percentage: Math.min(100, percentage), // Cap at 100% for display
      remaining,
      overage,
    };
  }, [budget, totalCost]);

  // Find most expensive parts for suggestions
  const expensiveParts = useMemo(() => {
    const parts: Array<{ part: Part; category: PartCategory; savings?: number }> = [];
    
    selectedParts.forEach((part, category) => {
      if (part.price && part.price > 0) {
        parts.push({ part, category });
      }
    });

    // Sort by price descending
    return parts.sort((a, b) => (b.part.price || 0) - (a.part.price || 0));
  }, [selectedParts]);

  return {
    totalCost,
    costBreakdown,
    budgetStatus,
    expensiveParts,
  };
}
