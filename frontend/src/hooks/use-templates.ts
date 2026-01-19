'use client';

import { useQuery } from '@tanstack/react-query';
import { getTemplates, getTemplate } from '@/actions/templates';
import type { BuildTemplate, TemplateGoal } from '@/types/database';

/**
 * Fetch public templates
 * Optionally filter by goal
 */
export function useTemplates(goal?: TemplateGoal) {
  return useQuery({
    queryKey: ['templates', goal],
    queryFn: async () => {
      const result = await getTemplates(goal);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}

/**
 * Fetch a single template by ID
 */
export function useTemplate(id: string) {
  return useQuery({
    queryKey: ['template', id],
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
