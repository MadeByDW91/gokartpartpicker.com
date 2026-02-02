'use server';

/**
 * Server actions for managing engine supplier links
 * All actions require admin or super_admin role
 */

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { 
  type ActionResult, 
  success, 
  error, 
  handleError 
} from '@/lib/api/types';
import { requireAdmin } from '../admin';
import { parseInput } from '@/lib/validation/schemas';

// ============================================================================
// Validation Schemas
// ============================================================================

const supplierLinkSchema = z.object({
  id: z.string().uuid().optional(),
  engine_id: z.string().uuid(),
  supplier_name: z.string().min(1, 'Supplier name is required').max(100),
  supplier_url: z.string().url('Must be a valid URL'),
  price: z.coerce.number().nonnegative().optional().nullable(),
  shipping_cost: z.coerce.number().nonnegative().default(0).optional(),
  availability_status: z.enum(['in_stock', 'out_of_stock', 'unknown']).default('in_stock').optional(),
  display_order: z.coerce.number().int().default(0).optional(),
  is_active: z.boolean().default(true).optional(),
  notes: z.string().max(500).optional().nullable(),
});

export type SupplierLinkInput = z.infer<typeof supplierLinkSchema>;

export interface EngineSupplierLink {
  id: string;
  engine_id: string;
  supplier_name: string;
  supplier_url: string;
  price: number | null;
  shipping_cost: number;
  availability_status: 'in_stock' | 'out_of_stock' | 'unknown';
  display_order: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

/**
 * Get all supplier links for an engine
 * Requires admin role
 */
export async function getEngineSupplierLinks(
  engineId: string
): Promise<ActionResult<EngineSupplierLink[]>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<EngineSupplierLink[]>;
    }

    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('engine_supplier_links')
      .select('*')
      .eq('engine_id', engineId)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (dbError) {
      console.error('[getEngineSupplierLinks] Database error:', dbError);
      return error('Failed to fetch supplier links');
    }

    return success(data ?? []);
  } catch (err) {
    return handleError(err, 'getEngineSupplierLinks');
  }
}

/**
 * Create a new supplier link for an engine
 * Requires admin role
 */
export async function createEngineSupplierLink(
  input: Omit<SupplierLinkInput, 'id'>
): Promise<ActionResult<EngineSupplierLink>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<EngineSupplierLink>;
    }
    const { userId } = authResult as { userId: string };

    const parsed = parseInput(supplierLinkSchema, input);
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }

    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from('engine_supplier_links')
      .insert({
        ...parsed.data,
        created_by: userId,
      })
      .select()
      .single();

    if (dbError) {
      console.error('[createEngineSupplierLink] Database error:', dbError);
      return error('Failed to create supplier link');
    }

    revalidatePath('/admin/engines');
    revalidatePath(`/admin/engines/${parsed.data.engine_id}`);
    revalidatePath(`/engines/${parsed.data.engine_id}`);

    return success(data);
  } catch (err) {
    return handleError(err, 'createEngineSupplierLink');
  }
}

/**
 * Update an existing supplier link
 * Requires admin role
 */
export async function updateEngineSupplierLink(
  id: string,
  input: Partial<Omit<SupplierLinkInput, 'id' | 'engine_id'>>
): Promise<ActionResult<EngineSupplierLink>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<EngineSupplierLink>;
    }

    const supabase = await createClient();

    // Get existing link to know which engine it belongs to
    const { data: existing } = await supabase
      .from('engine_supplier_links')
      .select('engine_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return error('Supplier link not found');
    }

    const { data, error: dbError } = await supabase
      .from('engine_supplier_links')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (dbError) {
      console.error('[updateEngineSupplierLink] Database error:', dbError);
      return error('Failed to update supplier link');
    }

    revalidatePath('/admin/engines');
    revalidatePath(`/admin/engines/${existing.engine_id}`);
    revalidatePath(`/engines/${existing.engine_id}`);

    return success(data);
  } catch (err) {
    return handleError(err, 'updateEngineSupplierLink');
  }
}

/**
 * Delete a supplier link
 * Requires admin role
 */
export async function deleteEngineSupplierLink(
  id: string
): Promise<ActionResult<{ deleted: true }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<{ deleted: true }>;
    }

    const supabase = await createClient();

    // Get existing link to know which engine it belongs to
    const { data: existing } = await supabase
      .from('engine_supplier_links')
      .select('engine_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return error('Supplier link not found');
    }

    const { error: dbError } = await supabase
      .from('engine_supplier_links')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('[deleteEngineSupplierLink] Database error:', dbError);
      return error('Failed to delete supplier link');
    }

    revalidatePath('/admin/engines');
    revalidatePath(`/admin/engines/${existing.engine_id}`);
    revalidatePath(`/engines/${existing.engine_id}`);

    return success({ deleted: true });
  } catch (err) {
    return handleError(err, 'deleteEngineSupplierLink');
  }
}

/**
 * Bulk update supplier links for an engine (replace all)
 * Requires admin role
 */
export async function updateEngineSupplierLinks(
  engineId: string,
  links: Array<Omit<SupplierLinkInput, 'engine_id'>>
): Promise<ActionResult<{ created: number; updated: number; deleted: number }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<{ created: number; updated: number; deleted: number }>;
    }
    const { userId } = authResult as { userId: string };

    const supabase = await createClient();

    // Get existing links
    const { data: existing } = await supabase
      .from('engine_supplier_links')
      .select('id')
      .eq('engine_id', engineId);

    const existingIds = new Set<string>((existing ?? []).map((l: { id: string }) => l.id));
    const newLinks = links.filter((l) => !l.id);
    const updatedLinks = links.filter((l) => l.id && existingIds.has(l.id));
    const linksToDelete = Array.from<string>(existingIds).filter((id) => 
      !links.some((l) => l.id === id)
    );

    let created = 0;
    let updated = 0;
    let deleted = 0;

    // Create new links
    if (newLinks.length > 0) {
      const { error: createError } = await supabase
        .from('engine_supplier_links')
        .insert(
          newLinks.map((link, idx) => ({
            supplier_name: link.supplier_name,
            supplier_url: link.supplier_url,
            price: link.price ?? null,
            shipping_cost: link.shipping_cost ?? 0,
            availability_status: link.availability_status ?? 'in_stock',
            display_order: link.display_order ?? idx,
            is_active: link.is_active ?? true,
            notes: link.notes ?? null,
            engine_id: engineId,
            created_by: userId,
          }))
        );

      if (createError) {
        console.error('[updateEngineSupplierLinks] Create error:', createError);
        return error('Failed to create supplier links');
      }
      created = newLinks.length;
    }

    // Update existing links
    for (const link of updatedLinks) {
      if (link.id) {
        const { error: updateError } = await supabase
          .from('engine_supplier_links')
          .update({
            supplier_name: link.supplier_name,
            supplier_url: link.supplier_url,
            price: link.price ?? null,
            shipping_cost: link.shipping_cost ?? 0,
            availability_status: link.availability_status ?? 'in_stock',
            display_order: link.display_order ?? 0,
            is_active: link.is_active ?? true,
            notes: link.notes ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', link.id);

        if (updateError) {
          console.error('[updateEngineSupplierLinks] Update error:', updateError);
          return error('Failed to update supplier links');
        }
        updated++;
      }
    }

    // Delete removed links
    if (linksToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('engine_supplier_links')
        .delete()
        .in('id', linksToDelete);

      if (deleteError) {
        console.error('[updateEngineSupplierLinks] Delete error:', deleteError);
        return error('Failed to delete supplier links');
      }
      deleted = linksToDelete.length;
    }

    revalidatePath('/admin/engines');
    revalidatePath(`/admin/engines/${engineId}`);
    revalidatePath(`/engines/${engineId}`);

    return success({ created, updated, deleted });
  } catch (err) {
    return handleError(err, 'updateEngineSupplierLinks');
  }
}
