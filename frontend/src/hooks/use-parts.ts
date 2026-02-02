'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Part, PartFilters, PartCategory } from '@/types/database';

/**
 * Fetch all parts with optional filters
 * Per db-query-contract.md: GET /api/parts
 */
const PARTS_STALE_MS = 5 * 60 * 1000; // 5 min — reduces refetches for public data

export function useParts(filters?: PartFilters) {
  return useQuery({
    queryKey: ['parts', filters],
    staleTime: PARTS_STALE_MS,
    queryFn: async (): Promise<Part[]> => {
      const supabase = createClient();
      
      // Check if Supabase client was created successfully
      if (!supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }
      
      try {

        let query = supabase
          .from('parts')
          .select('*')
          .eq('is_active', true); // Only show active parts
        
        // Apply filters per contract
        if (filters?.category) {
          query = query.eq('category', filters.category);
        }
        if (filters?.brand) {
          query = query.eq('brand', filters.brand);
        }
        if (filters?.min_price) {
          query = query.gte('price', filters.min_price);
        }
        if (filters?.max_price) {
          query = query.lte('price', filters.max_price);
        }
        
        // Apply sorting
        const sortField = filters?.sort || 'created_at';
        const ascending = filters?.order === 'asc';
        query = query.order(sortField, { ascending });
        
        const { data, error } = await query;
        
        if (error) {
          const msg = error.message ?? '';
          if (msg.toLowerCase().includes('abort') || (error as { name?: string }).name === 'AbortError') {
            return [];
          }
          const errorMessage = error.message ?? error.code ?? String(error);
          console.error('[useParts] Error fetching parts:', errorMessage || 'Unknown error', error);
          if (error.code === '42P01' || error.message?.includes('does not exist')) {
            throw new Error('Database tables not found. Please run migrations first.');
          }
          if (error.message?.includes('JWT') || error.message?.includes('auth')) {
            throw new Error('Authentication error. Please refresh the page.');
          }
          if (error.message?.includes('network') || error.message?.includes('fetch')) {
            throw new Error('Network error. Please check your internet connection.');
          }
          
          throw new Error(`Failed to load parts: ${errorMessage || 'Unknown error'}`);
        }
        
        if (!data) {
          console.warn('[useParts] No data returned from query');
          return [];
        }
        
        return data;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return [];
        }
        console.error('[useParts] Unexpected error:', {
          error,
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('An unexpected error occurred while loading parts');
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
 * Fetch parts by category
 */
export function usePartsByCategory(category: PartCategory) {
  return useParts({ category });
}

/**
 * Fetch single part by ID
 * Per db-query-contract.md: GET /api/parts/:id
 */
export function usePart(id: string) {
  return useQuery({
    queryKey: ['part', id],
    staleTime: PARTS_STALE_MS,
    queryFn: async (): Promise<Part> => {
      const supabase = createClient();
      
      if (!supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }
      
      try {

        const { data, error } = await supabase
          .from('parts')
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
          console.error('[usePart] Error fetching part:', errorMessage || 'Unknown error', error);
          if (error.code === 'PGRST116' || error.message?.includes('not found')) {
            throw new Error('Part not found');
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
          
          throw new Error(`Failed to load part: ${errorMessage || 'Unknown error'}`);
        }
        if (!data) {
          throw new Error('Part not found');
        }
        return data;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new DOMException('The operation was aborted.', 'AbortError');
        }
        console.error('[usePart] Unexpected error:', {
          error,
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('An unexpected error occurred while loading part');
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
 * Fetch unique part brands for filtering
 */
export function usePartBrands(category?: PartCategory) {
  return useQuery({
    queryKey: ['part-brands', category],
    staleTime: PARTS_STALE_MS,
    queryFn: async (): Promise<string[]> => {
      const supabase = createClient();
      
      if (!supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }
      
      try {

        let query = supabase
          .from('parts')
          .select('brand')
          .eq('is_active', true);
        
        if (category) {
          query = query.eq('category', category);
        }
        
        const { data, error } = await query.order('brand');
        
        if (error) {
          const msg = error.message ?? '';
          if (msg.toLowerCase().includes('abort') || (error as { name?: string }).name === 'AbortError') {
            return [];
          }
          const errorMessage = error.message ?? error.code ?? String(error);
          console.error('[usePartBrands] Error fetching brands:', errorMessage || 'Unknown error', error);
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
        const brandList: string[] = data?.map((p: { brand: string }) => p.brand) ?? [];
        const brands: string[] = [...new Set(brandList)];
        return brands;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return [];
        }
        console.error('[usePartBrands] Unexpected error:', {
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
