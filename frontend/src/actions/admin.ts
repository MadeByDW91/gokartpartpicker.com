'use server';

/**
 * Admin server actions for engine and part management
 * All actions require admin or super_admin role
 */

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { 
  createEngineSchema,
  updateEngineSchema,
  createPartSchema,
  updatePartSchema,
  uuidSchema,
  parseInput,
  type CreateEngineInput,
  type UpdateEngineInput,
  type CreatePartInput,
  type UpdatePartInput 
} from '@/lib/validation/schemas';
import { 
  type ActionResult, 
  success, 
  error, 
  handleError 
} from '@/lib/api/types';
import type { Engine, Part } from '@/types/database';

// ============================================================================
// Auth Helpers
// ============================================================================

/**
 * Get the current authenticated user with their role
 */
async function getCurrentUserWithRole() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return null;
  }
  
  // Fetch the user's profile to get their role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (!profile) {
    return null;
  }
  
  return {
    id: user.id,
    role: profile.role as 'user' | 'admin' | 'super_admin',
  };
}

/**
 * Check if user is admin or super_admin
 * Exported for use in other admin action files
 */
export async function requireAdmin(): Promise<ActionResult<{ userId: string }> | { userId: string }> {
  const user = await getCurrentUserWithRole();
  
  if (!user) {
    return error('You must be logged in');
  }
  
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return error('Admin privileges required');
  }
  
  return { userId: user.id };
}

/**
 * Check if user is super_admin
 * Exported for use in other admin action files
 */
export async function requireSuperAdmin(): Promise<ActionResult<{ userId: string }> | { userId: string }> {
  const user = await getCurrentUserWithRole();
  
  if (!user) {
    return error('You must be logged in');
  }
  
  if (user.role !== 'super_admin') {
    return error('Super admin privileges required');
  }
  
  return { userId: user.id };
}

// ============================================================================
// Engine Admin Actions
// ============================================================================

/**
 * Create a new engine
 * Requires admin role
 */
export async function createEngine(
  input: CreateEngineInput
): Promise<ActionResult<Engine>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<Engine>;
    }
    const { userId } = authResult as { userId: string };
    
    // Validate input
    const parsed = parseInput(createEngineSchema, input);
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    
    const supabase = await createClient();
    
    // Check if slug already exists
    const { data: existing } = await supabase
      .from('engines')
      .select('id')
      .eq('slug', parsed.data.slug)
      .single();
    
    if (existing) {
      return error('An engine with this slug already exists');
    }
    
    const { data, error: dbError } = await supabase
      .from('engines')
      .insert({
        ...parsed.data,
        created_by: userId,
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('[createEngine] Database error:', dbError);
      return error('Failed to create engine');
    }
    
    // Revalidate relevant paths
    revalidatePath('/engines');
    revalidatePath('/admin/engines');
    
    return success(data);
  } catch (err) {
    return handleError(err, 'createEngine');
  }
}

/**
 * Update an existing engine
 * Requires admin role
 */
export async function updateEngine(
  input: UpdateEngineInput
): Promise<ActionResult<Engine>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<Engine>;
    }
    
    // Validate input
    const parsed = parseInput(updateEngineSchema, input);
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    
    const { id, ...updates } = parsed.data;
    
    const supabase = await createClient();
    
    // Check if engine exists
    const { data: existing } = await supabase
      .from('engines')
      .select('id')
      .eq('id', id)
      .single();
    
    if (!existing) {
      return error('Engine not found');
    }
    
    // If slug is being updated, check for duplicates
    if (updates.slug) {
      const { data: slugExists } = await supabase
        .from('engines')
        .select('id')
        .eq('slug', updates.slug)
        .neq('id', id)
        .single();
      
      if (slugExists) {
        return error('An engine with this slug already exists');
      }
    }
    
    const { data, error: dbError } = await supabase
      .from('engines')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (dbError) {
      console.error('[updateEngine] Database error:', dbError);
      return error('Failed to update engine');
    }
    
    // Revalidate relevant paths
    revalidatePath('/engines');
    revalidatePath(`/engines/${data.slug}`);
    revalidatePath('/admin/engines');
    
    return success(data);
  } catch (err) {
    return handleError(err, 'updateEngine');
  }
}

/**
 * Soft delete an engine (set is_active to false)
 * Requires super_admin role for hard delete, admin for soft delete
 */
export async function deleteEngine(
  id: string,
  hardDelete = false
): Promise<ActionResult<{ deleted: true }>> {
  try {
    // Hard delete requires super_admin
    const authResult = hardDelete 
      ? await requireSuperAdmin() 
      : await requireAdmin();
    
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<{ deleted: true }>;
    }
    
    // Validate ID
    const parsed = parseInput(uuidSchema, id);
    if (!parsed.success) {
      return error('Invalid engine ID');
    }
    
    const supabase = await createClient();
    
    if (hardDelete) {
      // Hard delete - completely remove the engine
      const { error: dbError } = await supabase
        .from('engines')
        .delete()
        .eq('id', id);
      
      if (dbError) {
        console.error('[deleteEngine] Database error:', dbError);
        return error('Failed to delete engine');
      }
    } else {
      // Soft delete - set is_active to false
      const { error: dbError } = await supabase
        .from('engines')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (dbError) {
        console.error('[deleteEngine] Database error:', dbError);
        return error('Failed to deactivate engine');
      }
    }
    
    // Revalidate relevant paths
    revalidatePath('/engines');
    revalidatePath('/admin/engines');
    
    return success({ deleted: true });
  } catch (err) {
    return handleError(err, 'deleteEngine');
  }
}

/**
 * Restore a soft-deleted engine
 * Requires admin role
 */
export async function restoreEngine(
  id: string
): Promise<ActionResult<Engine>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<Engine>;
    }
    
    // Validate ID
    const parsed = parseInput(uuidSchema, id);
    if (!parsed.success) {
      return error('Invalid engine ID');
    }
    
    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('engines')
      .update({ 
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (dbError) {
      console.error('[restoreEngine] Database error:', dbError);
      return error('Failed to restore engine');
    }
    
    // Revalidate relevant paths
    revalidatePath('/engines');
    revalidatePath('/admin/engines');
    
    return success(data);
  } catch (err) {
    return handleError(err, 'restoreEngine');
  }
}

// ============================================================================
// Part Admin Actions
// ============================================================================

/**
 * Create a new part
 * Requires admin role
 */
export async function createPart(
  input: CreatePartInput
): Promise<ActionResult<Part>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<Part>;
    }
    const { userId } = authResult as { userId: string };
    
    // Validate input
    const parsed = parseInput(createPartSchema, input);
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    
    const supabase = await createClient();
    
    // Check if slug already exists
    const { data: existing } = await supabase
      .from('parts')
      .select('id')
      .eq('slug', parsed.data.slug)
      .single();
    
    if (existing) {
      return error('A part with this slug already exists');
    }
    
    const { data, error: dbError } = await supabase
      .from('parts')
      .insert({
        ...parsed.data,
        created_by: userId,
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('[createPart] Database error:', dbError);
      return error('Failed to create part');
    }
    
    // Revalidate relevant paths
    revalidatePath('/parts');
    revalidatePath(`/parts?category=${parsed.data.category}`);
    revalidatePath('/admin/parts');
    
    return success(data);
  } catch (err) {
    return handleError(err, 'createPart');
  }
}

/**
 * Update an existing part
 * Requires admin role
 */
export async function updatePart(
  input: UpdatePartInput
): Promise<ActionResult<Part>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<Part>;
    }
    
    // Validate input
    const parsed = parseInput(updatePartSchema, input);
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    
    const { id, ...updates } = parsed.data;
    
    const supabase = await createClient();
    
    // Check if part exists
    const { data: existing } = await supabase
      .from('parts')
      .select('id, category')
      .eq('id', id)
      .single();
    
    if (!existing) {
      return error('Part not found');
    }
    
    // If slug is being updated, check for duplicates
    if (updates.slug) {
      const { data: slugExists } = await supabase
        .from('parts')
        .select('id')
        .eq('slug', updates.slug)
        .neq('id', id)
        .single();
      
      if (slugExists) {
        return error('A part with this slug already exists');
      }
    }
    
    const { data, error: dbError } = await supabase
      .from('parts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (dbError) {
      console.error('[updatePart] Database error:', dbError);
      return error('Failed to update part');
    }
    
    // Revalidate relevant paths
    revalidatePath('/parts');
    revalidatePath(`/parts/${data.slug}`);
    revalidatePath(`/parts?category=${existing.category}`);
    revalidatePath('/admin/parts');
    
    return success(data);
  } catch (err) {
    return handleError(err, 'updatePart');
  }
}

/**
 * Soft delete a part (set is_active to false)
 * Requires super_admin role for hard delete, admin for soft delete
 */
export async function deletePart(
  id: string,
  hardDelete = false
): Promise<ActionResult<{ deleted: true }>> {
  try {
    // Hard delete requires super_admin
    const authResult = hardDelete 
      ? await requireSuperAdmin() 
      : await requireAdmin();
    
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<{ deleted: true }>;
    }
    
    // Validate ID
    const parsed = parseInput(uuidSchema, id);
    if (!parsed.success) {
      return error('Invalid part ID');
    }
    
    const supabase = await createClient();
    
    if (hardDelete) {
      // Hard delete - completely remove the part
      const { error: dbError } = await supabase
        .from('parts')
        .delete()
        .eq('id', id);
      
      if (dbError) {
        console.error('[deletePart] Database error:', dbError);
        return error('Failed to delete part');
      }
    } else {
      // Soft delete - set is_active to false
      const { error: dbError } = await supabase
        .from('parts')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (dbError) {
        console.error('[deletePart] Database error:', dbError);
        return error('Failed to deactivate part');
      }
    }
    
    // Revalidate relevant paths
    revalidatePath('/parts');
    revalidatePath('/admin/parts');
    
    return success({ deleted: true });
  } catch (err) {
    return handleError(err, 'deletePart');
  }
}

/**
 * Restore a soft-deleted part
 * Requires admin role
 */
export async function restorePart(
  id: string
): Promise<ActionResult<Part>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<Part>;
    }
    
    // Validate ID
    const parsed = parseInput(uuidSchema, id);
    if (!parsed.success) {
      return error('Invalid part ID');
    }
    
    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('parts')
      .update({ 
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (dbError) {
      console.error('[restorePart] Database error:', dbError);
      return error('Failed to restore part');
    }
    
    // Revalidate relevant paths
    revalidatePath('/parts');
    revalidatePath('/admin/parts');
    
    return success(data);
  } catch (err) {
    return handleError(err, 'restorePart');
  }
}

// ============================================================================
// Admin Listing Actions (with inactive items)
// ============================================================================

/**
 * Get all engines including inactive ones (for admin)
 * Requires admin role
 */
export async function getAdminEngines(): Promise<ActionResult<Engine[]>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<Engine[]>;
    }
    
    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('engines')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (dbError) {
      console.error('[getAdminEngines] Database error:', dbError);
      return error('Failed to fetch engines');
    }
    
    return success(data ?? []);
  } catch (err) {
    return handleError(err, 'getAdminEngines');
  }
}

/**
 * Get a single engine by ID including inactive ones (for admin)
 * Requires admin role
 */
export async function getAdminEngine(id: string): Promise<ActionResult<Engine>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<Engine>;
    }
    
    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('engines')
      .select('*')
      .eq('id', id)
      .single();
    
    if (dbError) {
      console.error('[getAdminEngine] Database error:', dbError);
      return error('Failed to fetch engine');
    }
    
    if (!data) {
      return error('Engine not found');
    }
    
    return success(data);
  } catch (err) {
    return handleError(err, 'getAdminEngine');
  }
}

/**
 * Get all parts including inactive ones (for admin)
 * Requires admin role
 */
export async function getAdminParts(): Promise<ActionResult<Part[]>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<Part[]>;
    }
    
    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('parts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (dbError) {
      console.error('[getAdminParts] Database error:', dbError);
      return error('Failed to fetch parts');
    }
    
    return success(data ?? []);
  } catch (err) {
    return handleError(err, 'getAdminParts');
  }
}

/**
 * Get a single part by ID including inactive ones (for admin)
 * Requires admin role
 */
export async function getAdminPart(id: string): Promise<ActionResult<Part>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<Part>;
    }
    
    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('parts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (dbError) {
      console.error('[getAdminPart] Database error:', dbError);
      return error('Failed to fetch part');
    }
    
    if (!data) {
      return error('Part not found');
    }
    
    return success(data);
  } catch (err) {
    return handleError(err, 'getAdminPart');
  }
}
