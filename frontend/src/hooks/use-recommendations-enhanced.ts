'use client';

import { useQuery } from '@tanstack/react-query';
import { getRecommendations, getPopularCombinations, getUpgradePath } from '@/actions/recommendations';
import type { Part, PartCategory, Engine } from '@/types/database';
import type { RecommendationGoal, PartCombination, UpgradeStep } from '@/actions/recommendations';

/**
 * Enhanced recommendations hook that uses server actions
 * Compatible with RecommendationsPanel component
 */
export function useRecommendations(
  engineId: string | null,
  category: PartCategory | null,
  goal: RecommendationGoal,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['recommendations', engineId, category, goal],
    queryFn: async (): Promise<Part[]> => {
      if (!category || !engineId) return [];
      const result = await getRecommendations(engineId, category, goal);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!category && !!engineId,
  });
}

/**
 * Get popular part combinations for an engine
 */
export function usePopularCombinations(
  engineId: string | null,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['popular-combinations', engineId],
    queryFn: async (): Promise<PartCombination[]> => {
      if (!engineId) return [];
      const result = await getPopularCombinations(engineId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!engineId,
  });
}

/**
 * Get upgrade path for current build
 */
export function useUpgradePath(
  engine: Engine | null,
  currentParts: Part[],
  goal: RecommendationGoal,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['upgrade-path', engine?.id, currentParts.map(p => p.id).join(','), goal],
    queryFn: async (): Promise<UpgradeStep[]> => {
      if (!engine) return [];
      const result = await getUpgradePath(engine, currentParts, goal);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!engine,
  });
}
