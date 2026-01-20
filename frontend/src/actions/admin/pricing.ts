'use server';

/**
 * Price Monitoring server actions
 * Handles price tracking and updates
 */

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '../admin';
import { 
  type ActionResult, 
  success, 
  error 
} from '@/lib/api/types';
import { uuidSchema, parseInput } from '@/lib/validation/schemas';

interface PriceChange {
  id: string;
  itemId: string;
  itemType: 'engine' | 'part';
  oldPrice: number | null;
  newPrice: number | null;
  changePercent: number;
  source: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  itemName?: string;
}

/**
 * Get price changes that need review
 */
export async function getPendingPriceChanges(): Promise<ActionResult<PriceChange[]>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    // For now, we'll check prices manually via a comparison
    // In production, this would query a price_history table
    const supabase = await createClient();

    // Get all items with prices
    const [enginesResult, partsResult] = await Promise.all([
      supabase.from('engines').select('id, name, price, affiliate_url').eq('is_active', true),
      supabase.from('parts').select('id, name, price, affiliate_url').eq('is_active', true),
    ]);

    if (enginesResult.error) return error('Failed to fetch engines');
    if (partsResult.error) return error('Failed to fetch parts');

    // Simple check: flag items with no price or no affiliate URL
    const changes: PriceChange[] = [];

    enginesResult.data?.forEach((engine: any) => {
      if (!engine.price || engine.price === 0) {
        changes.push({
          id: `engine-${engine.id}`,
          itemId: engine.id,
          itemType: 'engine',
          oldPrice: engine.price || 0,
          newPrice: null,
          changePercent: 0,
          source: 'manual',
          status: 'pending',
          createdAt: new Date().toISOString(),
          itemName: engine.name,
        });
      }
    });

    partsResult.data?.forEach((part: any) => {
      if (!part.price || part.price === 0) {
        changes.push({
          id: `part-${part.id}`,
          itemId: part.id,
          itemType: 'part',
          oldPrice: part.price || 0,
          newPrice: null,
          changePercent: 0,
          source: 'manual',
          status: 'pending',
          createdAt: new Date().toISOString(),
          itemName: part.name,
        });
      }
    });

    return success(changes);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to fetch price changes');
  }
}

/**
 * Update price for an item (manual price update)
 */
export async function updateItemPrice(
  itemId: string,
  itemType: 'engine' | 'part',
  newPrice: number | null
): Promise<ActionResult<{ updated: boolean }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    // Validate ID
    const parsed = parseInput(uuidSchema, itemId);
    if (!parsed.success) {
      return error('Invalid item ID');
    }

    const supabase = await createClient();
    const table = itemType === 'engine' ? 'engines' : 'parts';

    const { error: dbError } = await supabase
      .from(table)
      .update({
        price: newPrice,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId);

    if (dbError) {
      return error(`Failed to update ${itemType} price`);
    }

    revalidatePath(`/admin/${itemType === 'engine' ? 'engines' : 'parts'}`);
    revalidatePath(`/${itemType === 'engine' ? 'engines' : 'parts'}`);

    return success({ updated: true });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to update price');
  }
}

/**
 * Bulk update prices
 */
export async function bulkUpdatePrices(
  updates: Array<{ itemId: string; itemType: 'engine' | 'part'; price: number | null }>
): Promise<ActionResult<{ updated: number; failed: number }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();
    let updated = 0;
    let failed = 0;

    for (const update of updates) {
      const table = update.itemType === 'engine' ? 'engines' : 'parts';
      const { error } = await supabase
        .from(table)
        .update({
          price: update.price,
          updated_at: new Date().toISOString(),
        })
        .eq('id', update.itemId);

      if (error) {
        failed++;
      } else {
        updated++;
      }
    }

    revalidatePath('/admin/engines');
    revalidatePath('/admin/parts');
    revalidatePath('/engines');
    revalidatePath('/parts');

    return success({ updated, failed });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Bulk update failed');
  }
}

/**
 * Get items with missing prices
 */
export async function getItemsWithMissingPrices(): Promise<ActionResult<{
  engines: Array<{ id: string; name: string; currentPrice: number | null }>;
  parts: Array<{ id: string; name: string; currentPrice: number | null }>;
}>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();

    const [enginesResult, partsResult] = await Promise.all([
      supabase
        .from('engines')
        .select('id, name, price')
        .eq('is_active', true)
        .or('price.is.null,price.eq.0'),
      supabase
        .from('parts')
        .select('id, name, price')
        .eq('is_active', true)
        .or('price.is.null,price.eq.0'),
    ]);

    if (enginesResult.error) return error('Failed to fetch engines');
    if (partsResult.error) return error('Failed to fetch parts');

    return success({
      engines: (enginesResult.data || []).map((e: any) => ({
        id: e.id,
        name: e.name,
        currentPrice: e.price,
      })),
      parts: (partsResult.data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        currentPrice: p.price,
      })),
    });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to fetch items');
  }
}
