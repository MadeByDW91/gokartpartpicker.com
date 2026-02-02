'use server';

/**
 * Product Prices server actions
 * Handles multi-merchant price comparison data
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
import type { ProductPrice, Merchant } from '@/types/database';
import { z } from 'zod';

// ============================================================================
// Validation Schemas
// ============================================================================

const createProductPriceSchema = z.object({
  part_id: uuidSchema,
  merchant_id: uuidSchema,
  price: z.coerce.number().positive('Price must be positive'),
  shipping_cost: z.coerce.number().nonnegative('Shipping cost cannot be negative').default(0),
  availability_status: z.enum(['in_stock', 'out_of_stock']).default('in_stock'),
  product_url: z.string().url('Product URL must be a valid URL'),
  affiliate_url: z.string().url('Affiliate URL must be a valid URL').optional().nullable(),
});

const updateProductPriceSchema = z.object({
  id: uuidSchema,
  price: z.coerce.number().positive('Price must be positive').optional(),
  shipping_cost: z.coerce.number().nonnegative('Shipping cost cannot be negative').optional(),
  availability_status: z.enum(['in_stock', 'out_of_stock']).optional(),
  product_url: z.string().url('Product URL must be a valid URL').optional(),
  affiliate_url: z.string().url('Affiliate URL must be a valid URL').optional().nullable(),
});

// ============================================================================
// Get Functions
// ============================================================================

/**
 * Get all merchants
 */
export async function getMerchants(): Promise<ActionResult<Merchant[]>> {
  try {
    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('merchants')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });
    
    if (dbError) {
      return error('Failed to fetch merchants');
    }
    
    return success(data || []);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to fetch merchants');
  }
}

/**
 * Get all prices for a specific part
 */
export async function getPartPrices(partId: string): Promise<ActionResult<ProductPrice[]>> {
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
 * Get a single product price by ID
 */
export async function getProductPrice(priceId: string): Promise<ActionResult<ProductPrice>> {
  try {
    const parsed = parseInput(uuidSchema, priceId);
    if (!parsed.success) {
      return error('Invalid price ID');
    }

    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('product_prices')
      .select(`
        *,
        merchant:merchants(*)
      `)
      .eq('id', priceId)
      .single();
    
    if (dbError) {
      return error('Failed to fetch price');
    }
    
    if (!data) {
      return error('Price not found');
    }
    
    return success(data);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to fetch price');
  }
}

// ============================================================================
// Create/Update/Delete Functions
// ============================================================================

/**
 * Create a new product price
 */
export async function createProductPrice(
  input: z.infer<typeof createProductPriceSchema>
): Promise<ActionResult<ProductPrice>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const parsed = parseInput(createProductPriceSchema, input);
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }

    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('product_prices')
      .insert({
        part_id: parsed.data.part_id,
        merchant_id: parsed.data.merchant_id,
        price: parsed.data.price,
        shipping_cost: parsed.data.shipping_cost,
        availability_status: parsed.data.availability_status,
        product_url: parsed.data.product_url,
        affiliate_url: parsed.data.affiliate_url || null,
      })
      .select(`
        *,
        merchant:merchants(*)
      `)
      .single();
    
    if (dbError) {
      // Check for unique constraint violation
      if (dbError.code === '23505') {
        return error('A price for this part and merchant already exists');
      }
      return error('Failed to create price');
    }
    
    revalidatePath(`/admin/parts/${parsed.data.part_id}`);
    revalidatePath(`/parts`);
    
    return success(data);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to create price');
  }
}

/**
 * Update an existing product price
 */
export async function updateProductPrice(
  input: z.infer<typeof updateProductPriceSchema>
): Promise<ActionResult<ProductPrice>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const parsed = parseInput(updateProductPriceSchema, input);
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }

    const supabase = await createClient();
    
    // Build update object (only include provided fields)
    const updateData: Record<string, unknown> = {};
    if (parsed.data.price !== undefined) updateData.price = parsed.data.price;
    if (parsed.data.shipping_cost !== undefined) updateData.shipping_cost = parsed.data.shipping_cost;
    if (parsed.data.availability_status !== undefined) updateData.availability_status = parsed.data.availability_status;
    if (parsed.data.product_url !== undefined) updateData.product_url = parsed.data.product_url;
    if (parsed.data.affiliate_url !== undefined) updateData.affiliate_url = parsed.data.affiliate_url;
    
    // Get part_id for revalidation
    const { data: existingPrice } = await supabase
      .from('product_prices')
      .select('part_id')
      .eq('id', parsed.data.id)
      .single();
    
    const { data, error: dbError } = await supabase
      .from('product_prices')
      .update(updateData)
      .eq('id', parsed.data.id)
      .select(`
        *,
        merchant:merchants(*)
      `)
      .single();
    
    if (dbError) {
      return error('Failed to update price');
    }
    
    if (existingPrice) {
      revalidatePath(`/admin/parts/${existingPrice.part_id}`);
      revalidatePath(`/parts`);
    }
    
    return success(data);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to update price');
  }
}

/**
 * Delete a product price
 */
export async function deleteProductPrice(priceId: string): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const parsed = parseInput(uuidSchema, priceId);
    if (!parsed.success) {
      return error('Invalid price ID');
    }

    const supabase = await createClient();
    
    // Get part_id for revalidation before deleting
    const { data: existingPrice } = await supabase
      .from('product_prices')
      .select('part_id')
      .eq('id', parsed.data)
      .single();
    
    const { error: dbError } = await supabase
      .from('product_prices')
      .delete()
      .eq('id', parsed.data);
    
    if (dbError) {
      return error('Failed to delete price');
    }
    
    if (existingPrice) {
      revalidatePath(`/admin/parts/${existingPrice.part_id}`);
      revalidatePath(`/parts`);
    }
    
    return success({ deleted: true });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to delete price');
  }
}
