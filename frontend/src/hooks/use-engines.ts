'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Engine, EngineFilters } from '@/types/database';

/**
 * Fetch all engines with optional filters
 * Per db-query-contract.md: GET /api/engines
 */
const ENGINES_STALE_MS = 5 * 60 * 1000; // 5 min — reduces refetches for public data

export function useEngines(filters?: EngineFilters) {
  return useQuery({
    queryKey: ['engines', filters],
    staleTime: ENGINES_STALE_MS,
    queryFn: async (): Promise<Engine[]> => {
      const supabase = createClient();
      
      // Check if Supabase client was created successfully
      if (!supabase) {
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
          // Abort = component unmounted or query cancelled; resolve with empty so nothing is logged
          const msg = error.message ?? '';
          if (msg.toLowerCase().includes('abort') || (error as { name?: string }).name === 'AbortError') {
            return [];
          }
          const errorMessage = error.message ?? error.code ?? String(error);
          console.error('[useEngines] Error fetching engines:', errorMessage || 'Unknown error', error);
          if (error.code === '42P01' || error.message?.includes('does not exist')) {
            throw new Error('Database tables not found. Please run migrations first.');
          }
          if (error.message?.includes('JWT') || error.message?.includes('auth')) {
            throw new Error('Authentication error. Please refresh the page.');
          }
          if (error.message?.includes('network') || error.message?.includes('fetch')) {
            throw new Error('Network error. Please check your internet connection.');
          }
          
          throw new Error(`Failed to load engines: ${errorMessage || 'Unknown error'}`);
        }
        
        if (!data) {
          console.warn('[useEngines] No data returned from query');
          return [];
        }
        
        return data;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return [];
        }
        console.error('[useEngines] Unexpected error:', {
          error,
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('An unexpected error occurred while loading engines');
      }
    },
    retry: (failureCount, error) => {
      if (error instanceof Error && (error.message.includes('not configured') || error.name === 'AbortError')) {
        return false;
      }
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
    staleTime: ENGINES_STALE_MS,
    queryFn: async (): Promise<Engine> => {
      const supabase = createClient();
      
      if (!supabase) {
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
          const msg = error.message ?? '';
          if (msg.toLowerCase().includes('abort') || (error as { name?: string }).name === 'AbortError') {
            throw new DOMException('The operation was aborted.', 'AbortError');
          }
          const errorMessage = error.message ?? error.code ?? String(error);
          console.error('[useEngine] Error fetching engine:', errorMessage || 'Unknown error', error);
          if (error.code === 'PGRST116' || error.message?.includes('not found')) {
            throw new Error('Engine not found');
          }
          if (error.code === '42P01' || error.message?.includes('does not exist')) {
            throw new Error('Database tables not found. Please run migrations first.');
          }
          if (error.message?.includes('JWT') || error.message?.includes('auth')) {
            throw new Error('Authentication error. Please refresh the page.');
          }
          if (error.message?.includes('network') || error.message?.includes('fetch')) {
            throw new Error('Network error. Please check your internet connection.');
          }
          
          throw new Error(`Failed to load engine: ${errorMessage}`);
        }
        if (!data) {
          throw new Error('Engine not found');
        }
        return data;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new DOMException('The operation was aborted.', 'AbortError');
        }
        
        console.error('[useEngine] Unexpected error:', {
          error,
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('An unexpected error occurred while loading engine');
      }
    },
    enabled: !!id,
    retry: (failureCount, error) => {
      if (error instanceof Error && (error.message.includes('not configured') || error.message.includes('not found') || error.name === 'AbortError')) {
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
    staleTime: ENGINES_STALE_MS,
    queryFn: async (): Promise<string[]> => {
      const supabase = createClient();
      
      if (!supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }
      
      try {

        const { data, error } = await supabase
          .from('engines')
          .select('brand')
          .eq('is_active', true)
          .order('brand');
        
        if (error) {
          const msg = error.message ?? '';
          if (msg.toLowerCase().includes('abort') || (error as { name?: string }).name === 'AbortError') {
            return [];
          }
          const errorMessage = error.message ?? error.code ?? String(error);
          console.error('[useEngineBrands] Error fetching brands:', errorMessage || 'Unknown error', error);
          if (error.code === '42P01' || error.message?.includes('does not exist')) {
            throw new Error('Database tables not found. Please run migrations first.');
          }
          if (error.message?.includes('JWT') || error.message?.includes('auth')) {
            throw new Error('Authentication error. Please refresh the page.');
          }
          if (error.message?.includes('network') || error.message?.includes('fetch')) {
            throw new Error('Network error. Please check your internet connection.');
          }
          
          throw new Error(`Failed to load brands: ${errorMessage || 'Unknown error'}`);
        }
        
        // Get unique brands
        const brandList: string[] = data?.map((e: { brand: string }) => e.brand) ?? [];
        const brands: string[] = [...new Set(brandList)];
        return brands;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return [];
        }
        console.error('[useEngineBrands] Unexpected error:', {
          error,
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('An unexpected error occurred while loading brands');
      }
    },
    retry: (failureCount, error) => {
      if (error instanceof Error && (error.message.includes('not configured') || error.name === 'AbortError')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
