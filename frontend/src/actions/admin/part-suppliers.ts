'use server';

/**
 * Server actions for managing part supplier links
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
  part_id: z.string().uuid(),
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

export interface PartSupplierLink {
  id: string;
  part_id: string;
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
 * Get all supplier links for a part
 * Requires admin role
 */
export async function getPartSupplierLinks(
  partId: string
): Promise<ActionResult<PartSupplierLink[]>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<PartSupplierLink[]>;
    }

    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('part_supplier_links')
      .select('*')
      .eq('part_id', partId)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (dbError) {
      console.error('[getPartSupplierLinks] Database error:', dbError);
      return error('Failed to fetch supplier links');
    }

    return success(data ?? []);
  } catch (err) {
    return handleError(err, 'getPartSupplierLinks');
  }
}

/**
 * Create a new supplier link for a part
 * Requires admin role
 */
export async function createPartSupplierLink(
  input: Omit<SupplierLinkInput, 'id'>
): Promise<ActionResult<PartSupplierLink>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<PartSupplierLink>;
    }
    const { userId } = authResult as { userId: string };

    const parsed = parseInput(supplierLinkSchema, input);
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }

    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from('part_supplier_links')
      .insert({
        ...parsed.data,
        created_by: userId,
      })
      .select()
      .single();

    if (dbError) {
      console.error('[createPartSupplierLink] Database error:', dbError);
      return error('Failed to create supplier link');
    }

    revalidatePath('/admin/parts');
    revalidatePath(`/admin/parts/${parsed.data.part_id}`);
    revalidatePath(`/parts/${parsed.data.part_id}`);

    return success(data);
  } catch (err) {
    return handleError(err, 'createPartSupplierLink');
  }
}

/**
 * Update an existing supplier link
 * Requires admin role
 */
export async function updatePartSupplierLink(
  id: string,
  input: Partial<Omit<SupplierLinkInput, 'id' | 'part_id'>>
): Promise<ActionResult<PartSupplierLink>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<PartSupplierLink>;
    }

    const supabase = await createClient();

    // Get existing link to know which part it belongs to
    const { data: existing } = await supabase
      .from('part_supplier_links')
      .select('part_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return error('Supplier link not found');
    }

    const { data, error: dbError } = await supabase
      .from('part_supplier_links')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (dbError) {
      console.error('[updatePartSupplierLink] Database error:', dbError);
      return error('Failed to update supplier link');
    }

    revalidatePath('/admin/parts');
    revalidatePath(`/admin/parts/${existing.part_id}`);
    revalidatePath(`/parts/${existing.part_id}`);

    return success(data);
  } catch (err) {
    return handleError(err, 'updatePartSupplierLink');
  }
}

/**
 * Delete a supplier link
 * Requires admin role
 */
export async function deletePartSupplierLink(
  id: string
): Promise<ActionResult<{ deleted: true }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<{ deleted: true }>;
    }

    const supabase = await createClient();

    // Get existing link to know which part it belongs to
    const { data: existing } = await supabase
      .from('part_supplier_links')
      .select('part_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return error('Supplier link not found');
    }

    const { error: dbError } = await supabase
      .from('part_supplier_links')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('[deletePartSupplierLink] Database error:', dbError);
      return error('Failed to delete supplier link');
    }

    revalidatePath('/admin/parts');
    revalidatePath(`/admin/parts/${existing.part_id}`);
    revalidatePath(`/parts/${existing.part_id}`);

    return success({ deleted: true });
  } catch (err) {
    return handleError(err, 'deletePartSupplierLink');
  }
}

/**
 * Bulk update supplier links for a part (replace all)
 * Requires admin role
 */
export async function updatePartSupplierLinks(
  partId: string,
  links: Array<Omit<SupplierLinkInput, 'part_id'>>
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
      .from('part_supplier_links')
      .select('id')
      .eq('part_id', partId);

    const existingIds = new Set(
      (existing ?? []).map((row: { id: string }) => row.id)
    );
    const newLinks = links.filter(l => !l.id);
    const updatedLinks = links.filter(l => l.id && existingIds.has(l.id));
    const linksToDelete = Array.from(existingIds).filter(id =>
      !links.some(l => l.id === id)
    );

    let created = 0;
    let updated = 0;
    let deleted = 0;

    // Create new links
    if (newLinks.length > 0) {
      const { error: createError } = await supabase
        .from('part_supplier_links')
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
            part_id: partId,
            created_by: userId,
          }))
        );

      if (createError) {
        console.error('[updatePartSupplierLinks] Create error:', createError);
        return error('Failed to create supplier links');
      }
      created = newLinks.length;
    }

    // Update existing links
    for (const link of updatedLinks) {
      if (link.id) {
        const { error: updateError } = await supabase
          .from('part_supplier_links')
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
          console.error('[updatePartSupplierLinks] Update error:', updateError);
          return error('Failed to update supplier links');
        }
        updated++;
      }
    }

    // Delete removed links
    if (linksToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('part_supplier_links')
        .delete()
        .in('id', linksToDelete);

      if (deleteError) {
        console.error('[updatePartSupplierLinks] Delete error:', deleteError);
        return error('Failed to delete supplier links');
      }
      deleted = linksToDelete.length;
    }

    revalidatePath('/admin/parts');
    revalidatePath(`/admin/parts/${partId}`);
    revalidatePath(`/parts/${partId}`);

    return success({ created, updated, deleted });
  } catch (err) {
    return handleError(err, 'updatePartSupplierLinks');
  }
}
