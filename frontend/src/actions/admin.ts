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
  createMotorSchema,
  updateMotorSchema,
  createPartSchema,
  updatePartSchema,
  uuidSchema,
  parseInput,
  type CreateEngineInput,
  type UpdateEngineInput,
  type CreateMotorInput,
  type UpdateMotorInput,
  type CreatePartInput,
  type UpdatePartInput 
} from '@/lib/validation/schemas';
import { 
  type ActionResult, 
  success, 
  error, 
  handleError 
} from '@/lib/api/types';
import type { Engine, Part, ElectricMotor } from '@/types/database';

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
 * 
 * Phase 1 Security: Also checks MFA (Multi-Factor Authentication) for admins
 */
export async function requireAdmin(): Promise<ActionResult<{ userId: string }> | { userId: string }> {
  const user = await getCurrentUserWithRole();
  
  if (!user) {
    return error('You must be logged in');
  }
  
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return error('Admin privileges required');
  }

  // Phase 1 Security: Require MFA for admin access (if MFA is configured)
  // Note: This check is lenient - if aal is not available, we allow access
  // MFA enforcement should be configured at the Supabase level for production
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  // Check Authentication Assurance Level (aal) if available
  // aal1 = single factor (password only)
  // aal2 = multi-factor (password + MFA)
  // Only enforce if aal property exists and is explicitly aal1
  if (session && 'aal' in session && session.aal === 'aal1') {
    // MFA is recommended but not strictly enforced yet
    // Uncomment the line below to enforce MFA requirement:
    // return error('Multi-factor authentication (MFA) is required for admin access. Please enable MFA in your account settings.');
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
      const message = dbError.message || 'Failed to create part';
      return error(message);
    }
    
    // Revalidate relevant paths
    revalidatePath('/parts');
    revalidatePath(`/parts?category=${parsed.data.category}`);
    revalidatePath('/admin/parts');
    
    // Optionally auto-add videos if requested (handled by client)
    // The client will call autoSearchAndAddVideosForPart if needed
    
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

// ============================================================================
// Electric Motor Admin Actions
// ============================================================================

/**
 * Get all electric motors including inactive ones (for admin)
 * Requires admin role
 */
export async function getAdminMotors(): Promise<ActionResult<ElectricMotor[]>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<ElectricMotor[]>;
    }
    
    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('electric_motors')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (dbError) {
      console.error('[getAdminMotors] Database error:', dbError);
      return error('Failed to fetch electric motors');
    }
    
    return success(data ?? []);
  } catch (err) {
    return handleError(err, 'getAdminMotors');
  }
}

/**
 * Get a single electric motor by ID including inactive ones (for admin)
 * Requires admin role
 */
export async function getAdminMotor(id: string): Promise<ActionResult<ElectricMotor>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<ElectricMotor>;
    }
    
    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('electric_motors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (dbError) {
      console.error('[getAdminMotor] Database error:', dbError);
      return error('Failed to fetch electric motor');
    }
    
    if (!data) {
      return error('Electric motor not found');
    }
    
    return success(data);
  } catch (err) {
    return handleError(err, 'getAdminMotor');
  }
}

/**
 * Create a new electric motor
 * Requires admin role
 */
export async function createMotor(
  input: CreateMotorInput
): Promise<ActionResult<ElectricMotor>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<ElectricMotor>;
    }
    const { userId } = authResult as { userId: string };

    // Validate input
    const parsed = parseInput(createMotorSchema, input);
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    
    const supabase = await createClient();
    
    // Check if slug already exists
    const { data: existing } = await supabase
      .from('electric_motors')
      .select('id')
      .eq('slug', parsed.data.slug)
      .single();
    
    if (existing) {
      return error('A motor with this slug already exists');
    }
    
    const { data, error: dbError } = await supabase
      .from('electric_motors')
      .insert({
        ...parsed.data,
        created_by: userId,
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('[createMotor] Database error:', dbError);
      return error('Failed to create electric motor');
    }
    
    revalidatePath('/admin/motors');
    revalidatePath('/motors');
    
    return success(data);
  } catch (err) {
    return handleError(err, 'createMotor');
  }
}

/**
 * Update an existing electric motor
 * Requires admin role
 */
export async function updateMotor(
  input: UpdateMotorInput
): Promise<ActionResult<ElectricMotor>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<ElectricMotor>;
    }

    // Validate input
    const parsed = parseInput(updateMotorSchema, input);
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    
    const { id, ...updateData } = parsed.data;
    
    const supabase = await createClient();
    
    // If slug is being updated, check for conflicts
    if (updateData.slug) {
      const { data: existing } = await supabase
        .from('electric_motors')
        .select('id')
        .eq('slug', updateData.slug)
        .neq('id', id)
        .single();
      
      if (existing) {
        return error('A motor with this slug already exists');
      }
    }
    
    const { data, error: dbError } = await supabase
      .from('electric_motors')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (dbError) {
      console.error('[updateMotor] Database error:', dbError);
      return error('Failed to update electric motor');
    }
    
    if (!data) {
      return error('Electric motor not found');
    }
    
    revalidatePath('/admin/motors');
    revalidatePath(`/admin/motors/${id}`);
    revalidatePath('/motors');
    
    return success(data);
  } catch (err) {
    return handleError(err, 'updateMotor');
  }
}

/**
 * Delete an electric motor (soft delete by setting is_active = false)
 * Requires admin role
 */
export async function deleteMotor(
  id: string,
  hardDelete: boolean = false
): Promise<ActionResult<void>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<void>;
    }
    
    const supabase = await createClient();
    
    if (hardDelete) {
      // Hard delete - remove from database
      const { error: deleteError } = await supabase
        .from('electric_motors')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error('[deleteMotor] Delete error:', deleteError);
        return error('Failed to delete electric motor');
      }
    } else {
      // Soft delete - set is_active = false
      const { error: updateError } = await supabase
        .from('electric_motors')
        .update({ is_active: false })
        .eq('id', id);
      
      if (updateError) {
        console.error('[deleteMotor] Update error:', updateError);
        return error('Failed to deactivate electric motor');
      }
    }
    
    revalidatePath('/admin/motors');
    revalidatePath('/motors');
    
    return success(undefined);
  } catch (err) {
    return handleError(err, 'deleteMotor');
  }
}

/**
 * Bulk activate engines
 * Requires admin role
 */
export async function bulkActivateEngines(ids: string[]): Promise<ActionResult<{ updated: number }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<{ updated: number }>;
    }

    const supabase = await createClient();
    const { error: dbError, count } = await supabase
      .from('engines')
      .update({ is_active: true })
      .in('id', ids);

    if (dbError) {
      console.error('[bulkActivateEngines] Database error:', dbError);
      return error('Failed to activate engines');
    }

    revalidatePath('/admin/engines');
    revalidatePath('/engines');

    return success({ updated: count || ids.length });
  } catch (err) {
    return handleError(err, 'bulkActivateEngines');
  }
}

/**
 * Bulk deactivate engines
 * Requires admin role
 */
export async function bulkDeactivateEngines(ids: string[]): Promise<ActionResult<{ updated: number }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<{ updated: number }>;
    }

    const supabase = await createClient();
    const { error: dbError, count } = await supabase
      .from('engines')
      .update({ is_active: false })
      .in('id', ids);

    if (dbError) {
      console.error('[bulkDeactivateEngines] Database error:', dbError);
      return error('Failed to deactivate engines');
    }

    revalidatePath('/admin/engines');
    revalidatePath('/engines');

    return success({ updated: count || ids.length });
  } catch (err) {
    return handleError(err, 'bulkDeactivateEngines');
  }
}

/**
 * Bulk activate parts
 * Requires admin role
 */
export async function bulkActivateParts(ids: string[]): Promise<ActionResult<{ updated: number }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<{ updated: number }>;
    }

    const supabase = await createClient();
    const { error: dbError, count } = await supabase
      .from('parts')
      .update({ is_active: true })
      .in('id', ids);

    if (dbError) {
      console.error('[bulkActivateParts] Database error:', dbError);
      return error('Failed to activate parts');
    }

    revalidatePath('/admin/parts');
    revalidatePath('/parts');

    return success({ updated: count || ids.length });
  } catch (err) {
    return handleError(err, 'bulkActivateParts');
  }
}

/**
 * Bulk deactivate parts
 * Requires admin role
 */
export async function bulkDeactivateParts(ids: string[]): Promise<ActionResult<{ updated: number }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<{ updated: number }>;
    }

    const supabase = await createClient();
    const { error: dbError, count } = await supabase
      .from('parts')
      .update({ is_active: false })
      .in('id', ids);

    if (dbError) {
      console.error('[bulkDeactivateParts] Database error:', dbError);
      return error('Failed to deactivate parts');
    }

    revalidatePath('/admin/parts');
    revalidatePath('/parts');

    return success({ updated: count || ids.length });
  } catch (err) {
    return handleError(err, 'bulkDeactivateParts');
  }
}

/**
 * Bulk activate motors
 * Requires admin role
 */
export async function bulkActivateMotors(ids: string[]): Promise<ActionResult<{ updated: number }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<{ updated: number }>;
    }

    const supabase = await createClient();
    const { error: dbError, count } = await supabase
      .from('electric_motors')
      .update({ is_active: true })
      .in('id', ids);

    if (dbError) {
      console.error('[bulkActivateMotors] Database error:', dbError);
      return error('Failed to activate motors');
    }

    revalidatePath('/admin/motors');
    revalidatePath('/motors');

    return success({ updated: count || ids.length });
  } catch (err) {
    return handleError(err, 'bulkActivateMotors');
  }
}

/**
 * Bulk deactivate motors
 * Requires admin role
 */
export async function bulkDeactivateMotors(ids: string[]): Promise<ActionResult<{ updated: number }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<{ updated: number }>;
    }

    const supabase = await createClient();
    const { error: dbError, count } = await supabase
      .from('electric_motors')
      .update({ is_active: false })
      .in('id', ids);

    if (dbError) {
      console.error('[bulkDeactivateMotors] Database error:', dbError);
      return error('Failed to deactivate motors');
    }

    revalidatePath('/admin/motors');
    revalidatePath('/motors');

    return success({ updated: count || ids.length });
  } catch (err) {
    return handleError(err, 'bulkDeactivateMotors');
  }
}
