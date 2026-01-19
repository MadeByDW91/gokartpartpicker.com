'use server';

/**
 * Server actions for engine operations
 * These replace direct Supabase calls from client components
 */

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

/**
 * Fetch all active engines with optional filters
 * Public action - no auth required
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
    
    const { 
      brand, 
      min_hp, 
      max_hp, 
      min_cc, 
      max_cc, 
      shaft_type,
      sort, 
      order, 
      limit 
    } = parsed.data;
    
    const supabase = await createClient();
    
    // Build query - only active engines are visible
    let query = supabase
      .from('engines')
      .select('*')
      .eq('is_active', true);
    
    // Apply filters
    if (brand) {
      query = query.eq('brand', brand);
    }
    if (min_hp !== undefined) {
      query = query.gte('horsepower', min_hp);
    }
    if (max_hp !== undefined) {
      query = query.lte('horsepower', max_hp);
    }
    if (min_cc !== undefined) {
      query = query.gte('displacement_cc', min_cc);
    }
    if (max_cc !== undefined) {
      query = query.lte('displacement_cc', max_cc);
    }
    if (shaft_type) {
      query = query.eq('shaft_type', shaft_type);
    }
    
    // Apply sorting and limit
    query = query
      .order(sort, { ascending: order === 'asc' })
      .limit(limit);
    
    const { data, error: dbError } = await query;
    
    if (dbError) {
      console.error('[getEngines] Database error:', dbError);
      return error('Failed to fetch engines');
    }
    
    return success(data ?? []);
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
 * Used for detail pages with SEO-friendly URLs
 */
export async function getEngineBySlug(
  slug: string
): Promise<ActionResult<Engine>> {
  try {
    // Validate input
    const parsed = parseInput(getEngineBySlugSchema, { slug });
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    
    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('engines')
      .select('*')
      .eq('slug', parsed.data.slug)
      .eq('is_active', true)
      .single();
    
    if (dbError) {
      return handleError(dbError, 'getEngineBySlug', 'Engine');
    }
    
    return success(data);
  } catch (err) {
    return handleError(err, 'getEngineBySlug');
  }
}

/**
 * Fetch unique engine brands for filtering UI
 * Public action - no auth required
 */
export async function getEngineBrands(): Promise<ActionResult<string[]>> {
  try {
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
    
    // Get unique brands
    const brandList: string[] = data?.map((e: { brand: string }) => e.brand) ?? [];
    const uniqueBrands: string[] = [...new Set(brandList)];
    return success(uniqueBrands);
  } catch (err) {
    return handleError(err, 'getEngineBrands');
  }
}
