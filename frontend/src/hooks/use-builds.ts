'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { getUserBuilds } from '@/actions';
import type { Build, BuildParts } from '@/types/database';

/**
 * Fetch user's saved builds (server action).
 * Supports admin "view as user": when impersonating, returns the viewed user's builds.
 */
export function useUserBuilds() {
  return useQuery({
    queryKey: ['user-builds'],
    queryFn: async (): Promise<Build[]> => {
      const res = await getUserBuilds();
      if (!res.success) throw new Error(res.error ?? 'Failed to load builds');
      return res.data ?? [];
    },
  });
}

/**
 * Fetch public/community builds
 * Per db-query-contract.md: GET /api/builds/public
 */
export function usePublicBuilds(limit = 20) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['public-builds', limit],
    staleTime: 5 * 60 * 1000, // 5 min — public builds change infrequently
    queryFn: async (): Promise<Build[]> => {
      if (!supabase) {
        throw new Error('Supabase client is not available');
      }
      
      const { data, error } = await supabase
        .from('builds')
        .select(`
          *,
          engine:engines(name, brand, horsepower),
          profile:profiles(username, avatar_url)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    },
  });
}

/**
 * Fetch single build by ID
 */
export function useBuild(id: string) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['build', id],
    staleTime: 2 * 60 * 1000, // 2 min — single build detail
    queryFn: async (): Promise<Build> => {
      if (!supabase) {
        throw new Error('Supabase client is not available');
      }
      
      const { data, error } = await supabase
        .from('builds')
        .select(`
          *,
          engine:engines(*),
          motor:electric_motors(*),
          profile:profiles(username, avatar_url)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

interface CreateBuildInput {
  name: string;
  description?: string;
  engine_id?: string;
  motor_id?: string;
  power_source_type?: 'gas' | 'electric';
  parts: BuildParts;
  total_price: number;
  is_public?: boolean;
}

/**
 * Create a new build
 * Per db-query-contract.md: POST /api/builds (Auth Required)
 */
export function useCreateBuild() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateBuildInput): Promise<Build> => {
      if (!supabase) {
        throw new Error('Supabase client is not available');
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('builds')
        .insert({
          user_id: user.id,
          name: input.name,
          description: input.description || null,
          engine_id: input.engine_id || null,
          motor_id: input.motor_id || null,
          power_source_type: input.power_source_type || 'gas',
          parts: input.parts,
          total_price: input.total_price,
          is_public: input.is_public ?? false,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-builds'] });
    },
  });
}

interface UpdateBuildInput {
  id: string;
  name?: string;
  description?: string;
  engine_id?: string;
  parts?: BuildParts;
  total_price?: number;
  is_public?: boolean;
}

/**
 * Update an existing build
 * Per db-query-contract.md: PUT /api/builds/:id (Auth Required)
 */
export function useUpdateBuild() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: UpdateBuildInput): Promise<Build> => {
      if (!supabase) {
        throw new Error('Supabase client is not available');
      }
      
      const { id, ...updates } = input;
      
      const { data, error } = await supabase
        .from('builds')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-builds'] });
      queryClient.invalidateQueries({ queryKey: ['build', data.id] });
    },
  });
}

/**
 * Delete a build
 * Per db-query-contract.md: DELETE /api/builds/:id (Auth Required)
 */
export function useDeleteBuild() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!supabase) {
        throw new Error('Supabase client is not available');
      }
      
      const { error } = await supabase
        .from('builds')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-builds'] });
    },
  });
}

/**
 * Fetch multiple builds for comparison
 */
export function useBuildsForComparison(buildIds: string[]) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['builds-comparison', buildIds.sort().join(',')],
    queryFn: async (): Promise<Build[]> => {
      if (!supabase) {
        throw new Error('Supabase client is not available');
      }
      
      if (buildIds.length === 0 || buildIds.length > 3) {
        throw new Error('Invalid number of build IDs');
      }

      // Fetch builds in parallel
      const buildPromises = buildIds.map(async (id) => {
        const { data, error } = await supabase
          .from('builds')
          .select(`
            *,
            engine:engines(*),
            profile:profiles(username, avatar_url)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        return data;
      });

      const builds = await Promise.all(buildPromises);
      
      // Filter out null/undefined results
      return builds.filter((b): b is Build => b !== null && b !== undefined);
    },
    enabled: buildIds.length > 0 && buildIds.length <= 3,
  });
}
