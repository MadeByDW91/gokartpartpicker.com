'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Part, PartFilters, PartCategory } from '@/types/database';

/**
 * Fetch all parts with optional filters
 * Per db-query-contract.md: GET /api/parts
 */
export function useParts(filters?: PartFilters) {
  return useQuery({
    queryKey: ['parts', filters],
    queryFn: async (): Promise<Part[]> => {
      const supabase = createClient();
      
      // Check if Supabase is properly configured
      if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
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
          console.error('[useParts] Error fetching parts:', error);
          throw new Error(`Failed to load parts: ${error.message}`);
        }
        
        if (!data) {
          console.warn('[useParts] No data returned from query');
          return [];
        }
        
        return data;
      } catch (error) {
        console.error('[useParts] Unexpected error:', error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('An unexpected error occurred while loading parts');
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
    queryFn: async (): Promise<Part> => {
      const supabase = createClient();
      
      if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
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
          console.error('[usePart] Error fetching part:', error);
          throw new Error(`Failed to load part: ${error.message}`);
        }
        if (!data) {
          throw new Error('Part not found');
        }
        return data;
      } catch (error) {
        console.error('[usePart] Unexpected error:', error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('An unexpected error occurred while loading part');
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
 * Fetch unique part brands for filtering
 */
export function usePartBrands(category?: PartCategory) {
  return useQuery({
    queryKey: ['part-brands', category],
    queryFn: async (): Promise<string[]> => {
      const supabase = createClient();
      
      if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
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
          console.error('[usePartBrands] Error fetching brands:', error);
          throw new Error(`Failed to load brands: ${error.message}`);
        }
        
        // Get unique brands
        const brandList: string[] = data?.map((p: { brand: string }) => p.brand) ?? [];
        const brands: string[] = [...new Set(brandList)];
        return brands;
      } catch (error) {
        console.error('[usePartBrands] Unexpected error:', error);
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
