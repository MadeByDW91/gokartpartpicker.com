'use server';

/**
 * Public price comparison actions
 * No authentication required - for user-facing price comparison
 */

import { createClient } from '@/lib/supabase/server';
import { 
  type ActionResult, 
  success, 
  error 
} from '@/lib/api/types';
import { uuidSchema, parseInput } from '@/lib/validation/schemas';
import type { ProductPrice, Merchant } from '@/types/database';

/**
 * Get all prices for a specific part (public - no auth required)
 */
export async function getPartPricesPublic(partId: string): Promise<ActionResult<ProductPrice[]>> {
  try {
    // Validate part ID
    const parsed = parseInput(uuidSchema, partId);
    if (!parsed.success) {
      return error('Invalid part ID');
    }

    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('product_prices')
      .select(`
        *,
        merchant:merchants(*)
      `)
      .eq('part_id', partId)
      .eq('availability_status', 'in_stock') // Only show in-stock items by default
      .order('total_price', { ascending: true });
    
    if (dbError) {
      return error('Failed to fetch prices');
    }
    
    return success(data || []);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to fetch prices');
  }
}

/**
 * Get all prices for a part including out of stock (public)
 */
export async function getPartPricesAll(partId: string): Promise<ActionResult<ProductPrice[]>> {
  try {
    const parsed = parseInput(uuidSchema, partId);
    if (!parsed.success) {
      return error('Invalid part ID');
    }

    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('product_prices')
      .select(`
        *,
        merchant:merchants(*)
      `)
      .eq('part_id', partId)
      .order('total_price', { ascending: true });
    
    if (dbError) {
      return error('Failed to fetch prices');
    }
    
    return success(data || []);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to fetch prices');
  }
}
