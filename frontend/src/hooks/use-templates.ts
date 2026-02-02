'use client';

import { useQuery } from '@tanstack/react-query';
import { getTemplates, getTemplate } from '@/actions/templates';
import type { BuildTemplate, TemplateGoal } from '@/types/database';

/**
 * Fetch public templates
 * Optionally filter by goal and/or engineId
 * When engineId is provided, only templates for that engine are returned.
 * Set enabled=false to skip fetching (e.g. when engine filter is required but not set)
 */
export function useTemplates(
  goal?: TemplateGoal,
  engineId?: string,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: ['templates', goal, engineId],
    staleTime: 5 * 60 * 1000, // 5 min — templates change infrequently
    queryFn: async () => {
      const result = await getTemplates(goal, engineId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled,
  });
}

/**
 * Fetch a single template by ID
 */
export function useTemplate(id: string) {
  return useQuery({
    queryKey: ['template', id],
    staleTime: 5 * 60 * 1000, // 5 min
    queryFn: async () => {
      const result = await getTemplate(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!id,
  });
}
