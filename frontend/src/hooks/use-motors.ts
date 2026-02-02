'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { ElectricMotor, MotorFilters } from '@/types/database';

const MOTORS_STALE_MS = 5 * 60 * 1000; // 5 min — reduces refetches for public data

/**
 * Fetch all electric motors with optional filters
 * Per A13 EV Implementation Agent spec
 */
export function useMotors(filters?: MotorFilters) {
  return useQuery({
    queryKey: ['motors', filters],
    staleTime: MOTORS_STALE_MS,
    queryFn: async (): Promise<ElectricMotor[]> => {
      const supabase = createClient();
      
      if (!supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }
      
      try {
        let query = supabase
          .from('electric_motors')
          .select('*')
          .eq('is_active', true); // Only show active motors
        
        // Apply filters
        if (filters?.brand) {
          query = query.eq('brand', filters.brand);
        }
        if (filters?.voltage) {
          query = query.eq('voltage', filters.voltage);
        }
        if (filters?.min_hp) {
          query = query.gte('horsepower', filters.min_hp);
        }
        if (filters?.max_hp) {
          query = query.lte('horsepower', filters.max_hp);
        }
        if (filters?.min_power_kw) {
          query = query.gte('power_kw', filters.min_power_kw);
        }
        if (filters?.max_power_kw) {
          query = query.lte('power_kw', filters.max_power_kw);
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
          console.error('[useMotors] Error fetching motors:', errorMessage || 'Unknown error', error);
          if (error.code === '42P01' || error.message?.includes('does not exist')) {
            throw new Error('Database tables not found. Please run migrations first.');
          }
          if (error.message?.includes('JWT') || error.message?.includes('auth')) {
            throw new Error('Authentication error. Please refresh the page.');
          }
          if (error.message?.includes('network') || error.message?.includes('fetch')) {
            throw new Error('Network error. Please check your internet connection.');
          }
          
          throw new Error(`Failed to load motors: ${errorMessage || 'Unknown error'}`);
        }
        
        if (!data) {
          console.warn('[useMotors] No data returned from query');
          return [];
        }
        
        return data;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return [];
        }
        console.error('[useMotors] Unexpected error:', {
          error,
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('An unexpected error occurred while loading motors');
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
 * Fetch single motor by ID
 */
export function useMotor(id: string) {
  return useQuery({
    queryKey: ['motor', id],
    staleTime: MOTORS_STALE_MS,
    queryFn: async (): Promise<ElectricMotor> => {
      const supabase = createClient();
      
      if (!supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }
      
      try {
        const { data, error } = await supabase
          .from('electric_motors')
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
          console.error('[useMotor] Error fetching motor:', errorMessage || 'Unknown error', error);
          if (error.code === 'PGRST116' || error.message?.includes('not found')) {
            throw new Error('Motor not found');
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
          
          throw new Error(`Failed to load motor: ${errorMessage}`);
        }
        if (!data) {
          throw new Error('Motor not found');
        }
        return data;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new DOMException('The operation was aborted.', 'AbortError');
        }
        
        console.error('[useMotor] Unexpected error:', {
          error,
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('An unexpected error occurred while loading motor');
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
 * Fetch single motor by slug
 */
export function useMotorBySlug(slug: string) {
  return useQuery({
    queryKey: ['motor', 'slug', slug],
    staleTime: MOTORS_STALE_MS,
    queryFn: async (): Promise<ElectricMotor> => {
      const supabase = createClient();
      
      if (!supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }
      
      try {
        const { data, error } = await supabase
          .from('electric_motors')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();
        
        if (error) {
          const msg = error.message ?? '';
          if (msg.toLowerCase().includes('abort') || (error as { name?: string }).name === 'AbortError') {
            throw new DOMException('The operation was aborted.', 'AbortError');
          }
          const errorMessage = error.message ?? error.code ?? String(error);
          console.error('[useMotorBySlug] Error fetching motor:', errorMessage || 'Unknown error', error);
          if (error.code === 'PGRST116' || error.message?.includes('not found')) {
            throw new Error('Motor not found');
          }
          if (error.code === '42P01' || error.message?.includes('does not exist')) {
            throw new Error('Database tables not found. Please run migrations first.');
          }
          
          throw new Error(`Failed to load motor: ${errorMessage}`);
        }
        if (!data) {
          throw new Error('Motor not found');
        }
        return data;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new DOMException('The operation was aborted.', 'AbortError');
        }
        
        console.error('[useMotorBySlug] Unexpected error:', {
          error,
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
        });
        
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('An unexpected error occurred while loading motor');
      }
    },
    enabled: !!slug,
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
 * Fetch unique motor brands for filtering
 */
export function useMotorBrands() {
  return useQuery({
    queryKey: ['motor-brands'],
    staleTime: MOTORS_STALE_MS,
    queryFn: async (): Promise<string[]> => {
      const supabase = createClient();
      
      if (!supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }
      
      try {
        const { data, error } = await supabase
          .from('electric_motors')
          .select('brand')
          .eq('is_active', true)
          .order('brand');
        
        if (error) {
          const msg = error.message ?? '';
          if (msg.toLowerCase().includes('abort') || (error as { name?: string }).name === 'AbortError') {
            return [];
          }
          const errorMessage = error.message ?? error.code ?? String(error);
          console.error('[useMotorBrands] Error fetching brands:', errorMessage || 'Unknown error', error);
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
        const brandList: string[] = data?.map((m: { brand: string }) => m.brand) ?? [];
        const brands: string[] = [...new Set(brandList)];
        return brands;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return [];
        }
        console.error('[useMotorBrands] Unexpected error:', {
          error,
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
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
