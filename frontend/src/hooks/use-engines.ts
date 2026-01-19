'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Engine, EngineFilters } from '@/types/database';

/**
 * Fetch all engines with optional filters
 * Per db-query-contract.md: GET /api/engines
 */
export function useEngines(filters?: EngineFilters) {
  return useQuery({
    queryKey: ['engines', filters],
    queryFn: async (): Promise<Engine[]> => {
      const supabase = createClient();
      
      // Check if Supabase is properly configured
      if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }
      
      try {
        let query = supabase
          .from('engines')
          .select('*')
          .eq('is_active', true); // Only show active engines
        
        // Apply filters per contract
        if (filters?.brand) {
          query = query.eq('brand', filters.brand);
        }
        if (filters?.min_hp) {
          query = query.gte('horsepower', filters.min_hp);
        }
        if (filters?.max_hp) {
          query = query.lte('horsepower', filters.max_hp);
        }
        if (filters?.min_cc) {
          query = query.gte('displacement_cc', filters.min_cc);
        }
        if (filters?.max_cc) {
          query = query.lte('displacement_cc', filters.max_cc);
        }
        if (filters?.shaft_type) {
          query = query.eq('shaft_type', filters.shaft_type);
        }
        
        // Apply sorting
        const sortField = filters?.sort || 'created_at';
        const ascending = filters?.order === 'asc';
        query = query.order(sortField, { ascending });
        
        const { data, error } = await query;
        
        if (error) {
          console.error('[useEngines] Error fetching engines:', error);
          throw new Error(`Failed to load engines: ${error.message}`);
        }
        
        if (!data) {
          console.warn('[useEngines] No data returned from query');
          return [];
        }
        
        return data;
      } catch (error) {
        console.error('[useEngines] Unexpected error:', error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('An unexpected error occurred while loading engines');
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on configuration errors
      if (error instanceof Error && error.message.includes('not configured')) {
        return false;
      }
      // Retry up to 2 times for network errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Fetch single engine by ID
 * Per db-query-contract.md: GET /api/engines/:id
 */
export function useEngine(id: string) {
  return useQuery({
    queryKey: ['engine', id],
    queryFn: async (): Promise<Engine> => {
      const supabase = createClient();
      
      if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }
      
      try {
        const { data, error } = await supabase
          .from('engines')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .single();
        
        if (error) {
          console.error('[useEngine] Error fetching engine:', error);
          throw new Error(`Failed to load engine: ${error.message}`);
        }
        if (!data) {
          throw new Error('Engine not found');
        }
        return data;
      } catch (error) {
        console.error('[useEngine] Unexpected error:', error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('An unexpected error occurred while loading engine');
      }
    },
    enabled: !!id,
    retry: (failureCount, error) => {
      if (error instanceof Error && (error.message.includes('not configured') || error.message.includes('not found'))) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Fetch unique engine brands for filtering
 */
export function useEngineBrands() {
  return useQuery({
    queryKey: ['engine-brands'],
    queryFn: async (): Promise<string[]> => {
      const supabase = createClient();
      
      if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }
      
      try {
        const { data, error } = await supabase
          .from('engines')
          .select('brand')
          .eq('is_active', true)
          .order('brand');
        
        if (error) {
          console.error('[useEngineBrands] Error fetching brands:', error);
          throw new Error(`Failed to load brands: ${error.message}`);
        }
        
        // Get unique brands
        const brandList: string[] = data?.map((e: { brand: string }) => e.brand) ?? [];
        const brands: string[] = [...new Set(brandList)];
        return brands;
      } catch (error) {
        console.error('[useEngineBrands] Unexpected error:', error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('An unexpected error occurred while loading brands');
      }
    },
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('not configured')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
