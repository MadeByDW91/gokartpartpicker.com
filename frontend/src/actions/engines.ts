'use server';

/**
 * Server actions for engine operations
 * These replace direct Supabase calls from client components
 */

import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { 
  engineFiltersSchema, 
  getEngineSchema,
  getEngineBySlugSchema,
  parseInput,
  type EngineFiltersInput 
} from '@/lib/validation/schemas';
import { 
  type ActionResult, 
  success, 
  error, 
  handleError 
} from '@/lib/api/types';
import type { Engine } from '@/types/database';

/** Cache TTL for public read-heavy data (10 min) */
const ENGINES_CACHE_REVALIDATE = 600;

/**
 * Fetch all active engines with optional filters
 * Public action - no auth required
 * Cached for 10 min to reduce DB load at scale
 */
export async function getEngines(
  filters?: Partial<EngineFiltersInput>
): Promise<ActionResult<Engine[]>> {
  try {
    // Validate filters
    const parsed = parseInput(engineFiltersSchema, filters ?? {});
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }

    const cacheKey = JSON.stringify(parsed.data);

    return unstable_cache(
      async () => {
        const supabase = await createClient();

        if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
          return error('Database connection not configured. Please check environment variables.');
        }

        const {
          brand,
          min_hp,
          max_hp,
          min_cc,
          max_cc,
          shaft_type,
          sort,
          order,
          limit,
        } = parsed.data;

        let query = supabase
          .from('engines')
          .select('*')
          .eq('is_active', true);

        if (brand) query = query.eq('brand', brand);
        if (min_hp !== undefined) query = query.gte('horsepower', min_hp);
        if (max_hp !== undefined) query = query.lte('horsepower', max_hp);
        if (min_cc !== undefined) query = query.gte('displacement_cc', min_cc);
        if (max_cc !== undefined) query = query.lte('displacement_cc', max_cc);
        if (shaft_type) query = query.eq('shaft_type', shaft_type);

        query = query.order(sort, { ascending: order === 'asc' }).limit(limit);

        const { data, error: dbError } = await query;

        if (dbError) {
          console.error('[getEngines] Database error:', dbError);
          return error('Failed to fetch engines');
        }

        return success(data ?? []);
      },
      ['engines', cacheKey],
      { revalidate: ENGINES_CACHE_REVALIDATE }
    )() as Promise<ActionResult<Engine[]>>;
  } catch (err) {
    return handleError(err, 'getEngines');
  }
}

/**
 * Fetch single engine by ID
 * Public action - no auth required
 */
export async function getEngine(
  id: string
): Promise<ActionResult<Engine>> {
  try {
    // Validate input
    const parsed = parseInput(getEngineSchema, { id });
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    
    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('engines')
      .select('*')
      .eq('id', parsed.data.id)
      .eq('is_active', true)
      .single();
    
    if (dbError) {
      return handleError(dbError, 'getEngine', 'Engine');
    }
    
    return success(data);
  } catch (err) {
    return handleError(err, 'getEngine');
  }
}

/**
 * Fetch single engine by slug
 * Public action - no auth required
 * Cached for 10 min (detail pages are hot read paths)
 */
export async function getEngineBySlug(
  slug: string
): Promise<ActionResult<Engine>> {
  try {
    const parsed = parseInput(getEngineBySlugSchema, { slug });
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }

    const slugKey = parsed.data.slug;

    return unstable_cache(
      async () => {
        const supabase = await createClient();
        const { data, error: dbError } = await supabase
          .from('engines')
          .select('*')
          .eq('slug', slugKey)
          .eq('is_active', true)
          .single();

        if (dbError) {
          return handleError(dbError, 'getEngineBySlug', 'Engine');
        }
        return success(data);
      },
      ['engine-by-slug', slugKey],
      { revalidate: ENGINES_CACHE_REVALIDATE }
    )() as Promise<ActionResult<Engine>>;
  } catch (err) {
    return handleError(err, 'getEngineBySlug');
  }
}

/**
 * Fetch unique engine brands for filtering UI
 * Public action - no auth required
 * Cached for 10 min
 */
export async function getEngineBrands(): Promise<ActionResult<string[]>> {
  try {
    return unstable_cache(
      async (): Promise<ActionResult<string[]>> => {
        const supabase = await createClient();
        const { data, error: dbError } = await supabase
          .from('engines')
          .select('brand')
          .eq('is_active', true)
          .order('brand');

        if (dbError) {
          console.error('[getEngineBrands] Database error:', dbError);
          return error('Failed to fetch engine brands');
        }

        const brandList: string[] = data?.map((e: { brand: string }) => e.brand) ?? [];
        const uniqueBrands: string[] = [...new Set(brandList)];
        return success(uniqueBrands);
      },
      ['engine-brands'],
      { revalidate: ENGINES_CACHE_REVALIDATE }
    )() as Promise<ActionResult<string[]>>;
  } catch (err) {
    return handleError(err, 'getEngineBrands');
  }
}
