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
        if (!supabase) {
          throw new Error('Supabase client is not available. Please check your environment variables.');
        }

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
          // Better error logging - handle cases where error.message might not exist
          const errorMessage = error.message || error.code || JSON.stringify(error) || 'Unknown error';
          const errorDetails = {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            fullError: error,
          };
          console.error('[useEngines] Error fetching engines:', errorDetails);
          
          // Provide more helpful error messages
          if (error.code === '42P01' || error.message?.includes('does not exist')) {
            throw new Error('Database tables not found. Please run migrations first.');
          }
          if (error.message?.includes('JWT') || error.message?.includes('auth')) {
            throw new Error('Authentication error. Please refresh the page.');
          }
          if (error.message?.includes('network') || error.message?.includes('fetch')) {
            throw new Error('Network error. Please check your internet connection.');
          }
          
          throw new Error(`Failed to load engines: ${errorMessage}`);
        }
        
        if (!data) {
          console.warn('[useEngines] No data returned from query');
          return [];
        }
        
        return data;
      } catch (error) {
        // Handle AbortError specifically
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn('[useEngines] Query was aborted (likely component unmounted)');
          throw new Error('Request was cancelled');
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
        if (!supabase) {
          throw new Error('Supabase client is not available. Please check your environment variables.');
        }

        const { data, error } = await supabase
          .from('engines')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .single();
        
        if (error) {
          // Better error logging
          const errorMessage = error.message || error.code || JSON.stringify(error) || 'Unknown error';
          const errorDetails = {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            fullError: error,
          };
          console.error('[useEngine] Error fetching engine:', errorDetails);
          
          // Provide more helpful error messages
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
        // Handle AbortError specifically
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn('[useEngine] Query was aborted (likely component unmounted)');
          throw new Error('Request was cancelled');
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
        if (!supabase) {
          throw new Error('Supabase client is not available. Please check your environment variables.');
        }

        const { data, error } = await supabase
          .from('engines')
          .select('brand')
          .eq('is_active', true)
          .order('brand');
        
        if (error) {
          // Better error logging
          const errorMessage = error.message || error.code || JSON.stringify(error) || 'Unknown error';
          const errorDetails = {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            fullError: error,
          };
          console.error('[useEngineBrands] Error fetching brands:', errorDetails);
          
          // Provide more helpful error messages
          if (error.code === '42P01' || error.message?.includes('does not exist')) {
            throw new Error('Database tables not found. Please run migrations first.');
          }
          if (error.message?.includes('JWT') || error.message?.includes('auth')) {
            throw new Error('Authentication error. Please refresh the page.');
          }
          if (error.message?.includes('network') || error.message?.includes('fetch')) {
            throw new Error('Network error. Please check your internet connection.');
          }
          
          throw new Error(`Failed to load brands: ${errorMessage}`);
        }
        
        // Get unique brands
        const brandList: string[] = data?.map((e: { brand: string }) => e.brand) ?? [];
        const brands: string[] = [...new Set(brandList)];
        return brands;
      } catch (error) {
        // Handle AbortError specifically
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn('[useEngineBrands] Query was aborted (likely component unmounted)');
          throw new Error('Request was cancelled');
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
      if (error instanceof Error && error.message.includes('not configured')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
