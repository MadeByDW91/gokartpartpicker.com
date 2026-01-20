'use server';

/**
 * Bulk Operations server actions
 * Handle bulk updates with preview, undo, and scheduling
 */

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '../admin';
import { 
  type ActionResult, 
  success, 
  error, 
  handleError 
} from '@/lib/api/types';

export type BulkOperationType = 'update' | 'delete' | 'activate' | 'deactivate' | 'publish' | 'unpublish' | 'approve' | 'reject';
export type BulkEntityType = 'engine' | 'part' | 'build' | 'template' | 'guide' | 'video';
export type BulkOperationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface BulkOperation {
  id: string;
  name: string;
  description: string | null;
  operation_type: BulkOperationType;
  entity_type: BulkEntityType;
  status: BulkOperationStatus;
  filters: Record<string, unknown>;
  changes: Record<string, unknown>;
  affected_ids: string[];
  affected_count: number;
  completed_count: number;
  failed_count: number;
  error_log: Array<{ id: string; error: string }>;
  snapshot: Array<{ id: string; data: Record<string, unknown> }> | null;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  expires_at: string | null;
  can_undo: boolean;
}

export interface BulkOperationTemplate {
  id: string;
  name: string;
  description: string | null;
  entity_type: BulkEntityType;
  operation_type: BulkOperationType;
  filters: Record<string, unknown>;
  changes: Record<string, unknown>;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BulkOperationPreview {
  affectedCount: number;
  sampleItems: Array<{ id: string; name: string; current: Record<string, unknown>; preview: Record<string, unknown> }>;
  warnings: string[];
}

/**
 * Preview bulk operation (before executing)
 */
export async function previewBulkOperation(
  entityType: BulkEntityType,
  filters: Record<string, unknown>,
  changes: Record<string, unknown>
): Promise<ActionResult<BulkOperationPreview>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();
    const warnings: string[] = [];
    let query = supabase.from(entityType === 'engine' ? 'engines' : entityType === 'part' ? 'parts' : 'builds').select('id, name');

    // Apply filters
    if (entityType === 'engine' || entityType === 'part') {
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters.brand) {
        query = query.eq('brand', filters.brand);
      }
      if (entityType === 'part' && filters.category) {
        query = query.eq('category', filters.category);
      }
    }

    if (filters.search) {
      const searchTerm = String(filters.search).toLowerCase();
      query = query.or(`name.ilike.%${searchTerm}%`);
    }

    const { data, error: dbError } = await query.limit(100); // Get sample

    if (dbError) {
      return error('Failed to preview operation');
    }

    // Build count query with same filters
    let countQuery = supabase
      .from(entityType === 'engine' ? 'engines' : entityType === 'part' ? 'parts' : 'builds')
      .select('id', { count: 'exact', head: true });

    // Apply same filters for count
    if (entityType === 'engine' || entityType === 'part') {
      if (filters.is_active !== undefined) {
        countQuery = countQuery.eq('is_active', filters.is_active);
      }
      if (filters.brand) {
        countQuery = countQuery.eq('brand', filters.brand);
      }
      if (entityType === 'part' && filters.category) {
        countQuery = countQuery.eq('category', filters.category);
      }
    }

    if (filters.search) {
      const searchTerm = String(filters.search).toLowerCase();
      countQuery = countQuery.or(`name.ilike.%${searchTerm}%`);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('[previewBulkOperation] Count error:', countError);
    }

    const affectedCount = count || 0;
    const affectedIds = (data || []).map((item: any) => item.id);

    // Get sample items with current values
    const sampleSize = Math.min(5, (data || []).length);
    const sampleItems = [];

    for (let i = 0; i < sampleSize && i < (data || []).length; i++) {
      const item = data[i];
      const fullItem = await supabase
        .from(entityType === 'engine' ? 'engines' : entityType === 'part' ? 'parts' : 'builds')
        .select('*')
        .eq('id', item.id)
        .single();

      if (fullItem.data) {
        const current = { ...fullItem.data };
        const preview = { ...current, ...changes };
        sampleItems.push({
          id: item.id,
          name: item.name,
          current,
          preview,
        });
      }
    }

    // Generate warnings
    if (affectedCount > 100) {
      warnings.push(`This will affect ${affectedCount} items. Consider testing on a smaller subset first.`);
    }
    if (changes.price !== undefined && typeof changes.price === 'number' && changes.price < 0) {
      warnings.push('Negative prices detected. Please verify this is intentional.');
    }
    if (changes.is_active === false && affectedCount > 10) {
      warnings.push(`This will deactivate ${affectedCount} items. They will no longer be visible to users.`);
    }

    return success({
      affectedCount,
      sampleItems,
      warnings,
    });
  } catch (err) {
    return handleError(err, 'previewBulkOperation');
  }
}

/**
 * Execute bulk operation
 */
export async function executeBulkOperation(
  name: string,
  description: string | null,
  entityType: BulkEntityType,
  operationType: BulkOperationType,
  filters: Record<string, unknown>,
  changes: Record<string, unknown>,
  affectedIds: string[],
  scheduledAt?: string | null
): Promise<ActionResult<BulkOperation>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }
    const { userId } = authResult as { userId: string };

    const supabase = await createClient();
    const table = entityType === 'engine' ? 'engines' : entityType === 'part' ? 'parts' : 'builds';

    // Fetch affected IDs based on filters if not provided
    let finalAffectedIds = affectedIds;
    if (finalAffectedIds.length === 0) {
      let query = supabase.from(table).select('id');

      // Apply filters (same logic as preview)
      if (entityType === 'engine' || entityType === 'part') {
        if (filters.is_active !== undefined) {
          query = query.eq('is_active', filters.is_active);
        }
        if (filters.brand) {
          query = query.eq('brand', filters.brand);
        }
        if (entityType === 'part' && filters.category) {
          query = query.eq('category', filters.category);
        }
      }

      if (filters.search) {
        const searchTerm = String(filters.search).toLowerCase();
        query = query.or(`name.ilike.%${searchTerm}%`);
      }

      const { data: filteredData, error: fetchError } = await query;
      if (fetchError) {
        return error('Failed to fetch items for operation');
      }
      finalAffectedIds = (filteredData || []).map((item: any) => item.id);
    }

    // Create snapshot for undo (before state)
    const snapshot: Array<{ id: string; data: Record<string, unknown> }> = [];
    
    if (finalAffectedIds.length > 0) {
      // Process in batches to avoid query size limits
      for (let i = 0; i < Math.min(finalAffectedIds.length, 1000); i += 100) {
        const batch = finalAffectedIds.slice(i, i + 100);
        const { data: beforeData, error: snapshotError } = await supabase
          .from(table)
          .select('*')
          .in('id', batch);

        if (!snapshotError && beforeData) {
          snapshot.push(...beforeData.map((item: any) => ({
            id: item.id,
            data: item,
          })));
        }
      }
    }

    // Create bulk operation record
    const { data: operation, error: createError } = await supabase
      .from('bulk_operations')
      .insert({
        name,
        description,
        operation_type: operationType,
        entity_type: entityType,
        status: scheduledAt ? 'pending' : 'running',
        filters,
        changes,
        affected_ids: finalAffectedIds,
        affected_count: finalAffectedIds.length,
        snapshot: snapshot.length > 0 ? snapshot : null,
        scheduled_at: scheduledAt || null,
        started_at: scheduledAt ? null : new Date().toISOString(),
        created_by: userId,
        expires_at: scheduledAt
          ? new Date(new Date(scheduledAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        can_undo: true,
      })
      .select()
      .single();

    if (createError || !operation) {
      return error('Failed to create bulk operation');
    }

    // Execute immediately if not scheduled
    if (!scheduledAt) {
      await executeOperation(operation.id, entityType, table, changes, finalAffectedIds, supabase);
    }

    revalidatePath('/admin/bulk-operations');
    revalidatePath(`/admin/${entityType === 'engine' ? 'engines' : entityType === 'part' ? 'parts' : 'builds'}`);

    return success(operation as BulkOperation);
  } catch (err) {
    return handleError(err, 'executeBulkOperation');
  }
}

/**
 * Internal: Execute the actual operation
 */
async function executeOperation(
  operationId: string,
  entityType: BulkEntityType,
  table: string,
  changes: Record<string, unknown>,
  affectedIds: string[],
  supabase: any
) {
  let completed = 0;
  let failed = 0;
  const errors: Array<{ id: string; error: string }> = [];

  // Process in batches of 50
  const batchSize = 50;
  for (let i = 0; i < affectedIds.length; i += batchSize) {
    const batch = affectedIds.slice(i, i + batchSize);

    for (const id of batch) {
      try {
        const updateData: Record<string, unknown> = {
          ...changes,
          updated_at: new Date().toISOString(),
        };

        const { error: updateError } = await supabase
          .from(table)
          .update(updateData)
          .eq('id', id);

        if (updateError) {
          failed++;
          errors.push({ id, error: updateError.message });
        } else {
          completed++;
        }
      } catch (err) {
        failed++;
        errors.push({ id, error: err instanceof Error ? err.message : 'Unknown error' });
      }
    }

    // Update progress
    await supabase
      .from('bulk_operations')
      .update({
        completed_count: completed,
        failed_count: failed,
        error_log: errors,
      })
      .eq('id', operationId);
  }

  // Mark as completed
  await supabase
    .from('bulk_operations')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      completed_count: completed,
      failed_count: failed,
      error_log: errors,
    })
    .eq('id', operationId);
}

/**
 * Undo bulk operation
 */
export async function undoBulkOperation(
  operationId: string
): Promise<ActionResult<{ undone: true }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();

    // Get operation
    const { data: operation, error: fetchError } = await supabase
      .from('bulk_operations')
      .select('*')
      .eq('id', operationId)
      .single();

    if (fetchError || !operation) {
      return error('Operation not found');
    }

    if (!operation.can_undo) {
      return error('This operation cannot be undone');
    }

    if (operation.expires_at && new Date(operation.expires_at) < new Date()) {
      return error('Undo window has expired');
    }

    if (!operation.snapshot || !Array.isArray(operation.snapshot)) {
      return error('No snapshot available for undo');
    }

    const table = operation.entity_type === 'engine' ? 'engines' : operation.entity_type === 'part' ? 'parts' : 'builds';

    // Restore from snapshot
    let restored = 0;
    let failed = 0;

    for (const item of operation.snapshot) {
      const { id, data } = item;
      
      // Remove fields that shouldn't be restored
      const { id: _, created_at, updated_at, ...restoreData } = data as any;
      restoreData.updated_at = new Date().toISOString();

      const { error: restoreError } = await supabase
        .from(table)
        .update(restoreData)
        .eq('id', id);

      if (restoreError) {
        failed++;
      } else {
        restored++;
      }
    }

    // Mark operation as undone
    await supabase
      .from('bulk_operations')
      .update({
        can_undo: false,
        description: (operation.description || '') + ' [UNDONE]',
      })
      .eq('id', operationId);

    revalidatePath('/admin/bulk-operations');
    revalidatePath(`/admin/${operation.entity_type === 'engine' ? 'engines' : operation.entity_type === 'part' ? 'parts' : 'builds'}`);

    return success({ undone: true });
  } catch (err) {
    return handleError(err, 'undoBulkOperation');
  }
}

/**
 * Get bulk operations history
 */
export async function getBulkOperations(
  limit: number = 50
): Promise<ActionResult<BulkOperation[]>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from('bulk_operations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (dbError) {
      return error('Failed to fetch bulk operations');
    }

    return success((data || []) as BulkOperation[]);
  } catch (err) {
    return handleError(err, 'getBulkOperations');
  }
}

/**
 * Get bulk operation templates
 */
export async function getBulkOperationTemplates(): Promise<ActionResult<BulkOperationTemplate[]>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from('bulk_operation_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) {
      return error('Failed to fetch templates');
    }

    return success((data || []) as BulkOperationTemplate[]);
  } catch (err) {
    return handleError(err, 'getBulkOperationTemplates');
  }
}

/**
 * Save bulk operation template
 */
export async function saveBulkOperationTemplate(
  name: string,
  description: string | null,
  entityType: BulkEntityType,
  operationType: BulkOperationType,
  filters: Record<string, unknown>,
  changes: Record<string, unknown>,
  isPublic: boolean
): Promise<ActionResult<BulkOperationTemplate>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }
    const { userId } = authResult as { userId: string };

    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from('bulk_operation_templates')
      .insert({
        name,
        description,
        entity_type: entityType,
        operation_type: operationType,
        filters,
        changes,
        is_public: isPublic,
        created_by: userId,
      })
      .select()
      .single();

    if (dbError || !data) {
      return error('Failed to save template');
    }

    revalidatePath('/admin/bulk-operations');

    return success(data as BulkOperationTemplate);
  } catch (err) {
    return handleError(err, 'saveBulkOperationTemplate');
  }
}

/**
 * Delete bulk operation template
 */
export async function deleteBulkOperationTemplate(
  templateId: string
): Promise<ActionResult<{ deleted: true }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();

    const { error: dbError } = await supabase
      .from('bulk_operation_templates')
      .delete()
      .eq('id', templateId);

    if (dbError) {
      return error('Failed to delete template');
    }

    revalidatePath('/admin/bulk-operations');

    return success({ deleted: true });
  } catch (err) {
    return handleError(err, 'deleteBulkOperationTemplate');
  }
}
