'use server';

/**
 * Server actions for parts operations
 * These replace direct Supabase calls from client components
 */

import { unstable_cache } from 'next/cache';
import { createClient, createCacheableClient } from '@/lib/supabase/server';
import { 
  partFiltersSchema, 
  getPartSchema,
  getPartBySlugSchema,
  parseInput,
  type PartFiltersInput,
  type PartCategoryInfo 
} from '@/lib/validation/schemas';
import { 
  type ActionResult, 
  success, 
  error, 
  handleError 
} from '@/lib/api/types';
import type { Part, PartCategory } from '@/types/database';

/** Cache TTL for public read-heavy data (10 min) */
const PARTS_CACHE_REVALIDATE = 600;

/**
 * Fetch all active parts with optional filters
 * Public action - no auth required
 * Cached for 10 min to reduce DB load at scale
 */
export async function getParts(
  filters?: Partial<PartFiltersInput>
): Promise<ActionResult<Part[]>> {
  try {
    const parsed = parseInput(partFiltersSchema, filters ?? {});
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }

    const cacheKey = JSON.stringify(parsed.data);

    return unstable_cache(
      async () => {
        const supabase = createCacheableClient();
        const { category, brand, min_price, max_price, sort, order, limit } = parsed.data;

        let query = supabase.from('parts').select('*').eq('is_active', true);

        if (category) query = query.eq('category', category);
        if (brand) query = query.eq('brand', brand);
        if (min_price !== undefined) query = query.gte('price', min_price).not('price', 'is', null);
        if (max_price !== undefined) query = query.lte('price', max_price);

        query = query.order(sort, { ascending: order === 'asc' }).limit(limit);

        const { data, error: dbError } = await query;

        if (dbError) {
          console.error('[getParts] Database error:', dbError);
          return error('Failed to fetch parts');
        }

        return success(data ?? []);
      },
      ['parts', cacheKey],
      { revalidate: PARTS_CACHE_REVALIDATE }
    )() as Promise<ActionResult<Part[]>>;
  } catch (err) {
    return handleError(err, 'getParts');
  }
}

/**
 * Fetch parts by category
 * Convenience wrapper around getParts
 */
export async function getPartsByCategory(
  category: PartCategory
): Promise<ActionResult<Part[]>> {
  return getParts({ category });
}

/**
 * Fetch single part by ID
 * Public action - no auth required
 */
export async function getPart(
  id: string
): Promise<ActionResult<Part>> {
  try {
    // Validate input
    const parsed = parseInput(getPartSchema, { id });
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    
    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('parts')
      .select('*')
      .eq('id', parsed.data.id)
      .eq('is_active', true)
      .single();
    
    if (dbError) {
      return handleError(dbError, 'getPart', 'Part');
    }
    
    return success(data);
  } catch (err) {
    return handleError(err, 'getPart');
  }
}

/**
 * Fetch single part by slug
 * Public action - no auth required
 * Cached for 10 min (detail pages are hot read paths)
 */
export async function getPartBySlug(
  slug: string
): Promise<ActionResult<Part>> {
  try {
    const parsed = parseInput(getPartBySlugSchema, { slug });
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }

    const slugKey = parsed.data.slug;

    return unstable_cache(
      async () => {
        const supabase = createCacheableClient();
        const { data, error: dbError } = await supabase
          .from('parts')
          .select('*')
          .eq('slug', slugKey)
          .eq('is_active', true)
          .single();

        if (dbError) {
          return handleError(dbError, 'getPartBySlug', 'Part');
        }
        return success(data);
      },
      ['part-by-slug', slugKey],
      { revalidate: PARTS_CACHE_REVALIDATE }
    )() as Promise<ActionResult<Part>>;
  } catch (err) {
    return handleError(err, 'getPartBySlug');
  }
}

/**
 * Fetch all part categories
 * Public action - no auth required
 * Cached for 10 min
 */
export async function getPartCategories(): Promise<ActionResult<PartCategoryInfo[]>> {
  try {
    return unstable_cache(
      async () => {
        const supabase = createCacheableClient();
        const { data, error: dbError } = await supabase
          .from('part_categories')
          .select('id, slug, name, description, icon, sort_order, is_active')
          .eq('is_active', true)
          .order('sort_order');

        if (dbError) {
          console.error('[getPartCategories] Database error:', dbError);
          return error('Failed to fetch part categories');
        }
        return success(data ?? []);
      },
      ['part-categories'],
      { revalidate: PARTS_CACHE_REVALIDATE }
    )() as Promise<ActionResult<PartCategoryInfo[]>>;
  } catch (err) {
    return handleError(err, 'getPartCategories');
  }
}

/**
 * Fetch multiple parts by their IDs
 * Useful for loading parts in a build
 */
export async function getPartsById(
  ids: string[]
): Promise<ActionResult<Part[]>> {
  try {
    if (ids.length === 0) {
      return success([]);
    }
    
    // Validate all IDs
    for (const id of ids) {
      const parsed = parseInput(getPartSchema, { id });
      if (!parsed.success) {
        return error(`Invalid part ID: ${id}`);
      }
    }
    
    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('parts')
      .select('*')
      .in('id', ids)
      .eq('is_active', true);
    
    if (dbError) {
      console.error('[getPartsById] Database error:', dbError);
      return error('Failed to fetch parts');
    }
    
    return success(data ?? []);
  } catch (err) {
    return handleError(err, 'getPartsById');
  }
}

/**
 * Fetch unique part brands, optionally filtered by category
 * Public action - no auth required
 */
export async function getPartBrands(
  category?: PartCategory
): Promise<ActionResult<string[]>> {
  try {
    const supabase = await createClient();
    
    let query = supabase
      .from('parts')
      .select('brand')
      .eq('is_active', true);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error: dbError } = await query.order('brand');
    
    if (dbError) {
      console.error('[getPartBrands] Database error:', dbError);
      return error('Failed to fetch part brands');
    }
    
    // Get unique brands
    const brandList: string[] = data?.map((p: { brand: string }) => p.brand) ?? [];
    const uniqueBrands: string[] = [...new Set(brandList)];
    return success(uniqueBrands);
  } catch (err) {
    return handleError(err, 'getPartBrands');
  }
}
