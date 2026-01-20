'use server';

/**
 * Server actions for build template operations
 * Templates allow users to quickly start builds from presets
 */

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { 
  type ActionResult, 
  success, 
  error, 
  handleError 
} from '@/lib/api/types';
import type { BuildTemplate, TemplateGoal } from '@/types/database';

/**
 * Get the current authenticated user
 * Returns null if not authenticated
 */
async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

/**
 * Check if user is admin
 */
async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return data?.role === 'admin' || data?.role === 'super_admin';
}

/**
 * Get public templates
 * Optionally filter by goal
 */
export async function getTemplates(
  goal?: TemplateGoal
): Promise<ActionResult<BuildTemplate[]>> {
  try {
    const supabase = await createClient();
    
    // Query public, active templates. approval_status is applied in app when the column exists
    // (avoids "column does not exist" when 20260116000013_user_templates_approval hasn't run)
    let query = supabase
      .from('build_templates')
      .select('*')
      .eq('is_public', true)
      .eq('is_active', true);

    if (goal) {
      query = query.eq('goal', goal);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error: dbError } = await query;

    if (dbError) {
      console.error('[getTemplates] Database error:', dbError);
      console.error('[getTemplates] Error code:', dbError.code);
      console.error('[getTemplates] Error message:', dbError.message);
      
      if (dbError.code === '42501' || dbError.message?.includes('permission') || dbError.message?.includes('policy')) {
        return error('Permission denied. Please check RLS policies for build_templates table.');
      }
      return error(`Failed to fetch templates: ${dbError.message || 'Unknown error'}`);
    }

    // Only show approved when approval_status exists; else allow rows without it (pre-migration)
    let list = (data || []).filter(
      (t: { approval_status?: string }) => t.approval_status === 'approved' || t.approval_status === undefined
    );

    if (list.length === 0) {
      return success([]);
    }

    // Enrich with engine data if engine_id exists (don't fail if engines fetch errors)
    const templatesWithEngines = await Promise.all(
      list.map(async (template: any) => {
        if (template.engine_id) {
          try {
            const { data: engine, error: engineError } = await supabase
              .from('engines')
              .select('*')
              .eq('id', template.engine_id)
              .eq('is_active', true)
              .single();
            
            if (engineError) {
              console.warn(`[getTemplates] Failed to fetch engine ${template.engine_id}:`, engineError.message);
              return template;
            }
            
            return {
              ...template,
              engine: engine || null,
            };
          } catch (err) {
            console.warn(`[getTemplates] Error fetching engine for template ${template.id}:`, err);
            return template;
          }
        }
        return template;
      })
    );

    return success(templatesWithEngines as BuildTemplate[]);
  } catch (err) {
    console.error('[getTemplates] Unexpected error:', err);
    return handleError(err, 'getTemplates');
  }
}

/**
 * Get all templates for admin (including inactive and private)
 * Requires admin role
 */
export async function getAdminTemplates(): Promise<ActionResult<BuildTemplate[]>> {
  try {
    if (!(await isAdmin())) {
      return error('Unauthorized: Admin access required');
    }

    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('build_templates')
      .select(`
        *,
        engine:engines(*),
        profile:profiles(username, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('[getAdminTemplates] Database error:', dbError);
      return error('Failed to fetch templates');
    }

    return success(data ?? []);
  } catch (err) {
    return handleError(err, 'getAdminTemplates');
  }
}

/**
 * Get a single template by ID
 * Public templates are accessible to everyone
 * Admins can view all templates
 */
export async function getTemplate(
  id: string
): Promise<ActionResult<BuildTemplate>> {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const admin = await isAdmin();

    let query = supabase
      .from('build_templates')
      .select(`
        *,
        engine:engines(*),
        profile:profiles(username, avatar_url)
      `)
      .eq('id', id)
      .single();

    // Non-admins can only see public, active templates
    if (!admin) {
      query = query.eq('is_public', true).eq('is_active', true);
    }

    const { data, error: dbError } = await query;

    if (dbError) {
      return handleError(dbError, 'getTemplate', 'Template');
    }

    return success(data);
  } catch (err) {
    return handleError(err, 'getTemplate');
  }
}

/**
 * Get all templates (admin only)
 */
export async function getAllTemplates(): Promise<ActionResult<BuildTemplate[]>> {
  try {
    if (!(await isAdmin())) {
      return error('Unauthorized: Admin access required');
    }

    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('build_templates')
      .select(`
        *,
        engine:engines(*),
        profile:profiles(username, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('[getAllTemplates] Database error:', dbError);
      return error('Failed to fetch templates');
    }

    return success(data ?? []);
  } catch (err) {
    return handleError(err, 'getAllTemplates');
  }
}

/**
 * Create a new template
 * Admins can create approved templates, users create pending templates
 */
export async function createTemplate(
  input: {
    name: string;
    description?: string;
    goal: TemplateGoal;
    engine_id?: string | null;
    parts: { [category: string]: string };
    total_price?: number | null;
    estimated_hp?: number | null;
    estimated_torque?: number | null;
    is_public?: boolean;
    is_active?: boolean;
  }
): Promise<ActionResult<BuildTemplate>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return error('You must be logged in');
    }

    const admin = await isAdmin();
    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from('build_templates')
      .insert({
        name: input.name,
        description: input.description || null,
        goal: input.goal,
        engine_id: input.engine_id || null,
        parts: input.parts,
        total_price: input.total_price || null,
        estimated_hp: input.estimated_hp || null,
        estimated_torque: input.estimated_torque || null,
        is_public: input.is_public ?? true,
        is_active: input.is_active ?? true,
        created_by: admin ? user.id : null, // Only set created_by for admins
        submitted_by: admin ? null : user.id, // Regular users use submitted_by
        approval_status: admin ? 'approved' : 'pending', // Admins auto-approve
      })
      .select(`
        *,
        engine:engines(*),
        profile:profiles(username, avatar_url)
      `)
      .single();

    if (dbError) {
      console.error('[createTemplate] Database error:', dbError);
      return error('Failed to create template');
    }

    revalidatePath('/templates');
    revalidatePath('/admin/templates');

    return success(data);
  } catch (err) {
    return handleError(err, 'createTemplate');
  }
}

/**
 * Submit template for admin approval (user action)
 */
export async function submitTemplate(
  templateId: string
): Promise<ActionResult<BuildTemplate>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return error('You must be logged in');
    }

    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from('build_templates')
      .update({
        approval_status: 'pending',
        submitted_by: user.id,
      })
      .eq('id', templateId)
      .eq('created_by', user.id) // Only allow owner to submit
      .select(`
        *,
        engine:engines(*),
        profile:profiles(username, avatar_url)
      `)
      .single();

    if (dbError) {
      console.error('[submitTemplate] Database error:', dbError);
      return error('Failed to submit template');
    }

    revalidatePath('/templates');
    revalidatePath('/admin/templates');

    return success(data);
  } catch (err) {
    return handleError(err, 'submitTemplate');
  }
}

/**
 * Approve or reject a template (admin only)
 */
export async function reviewTemplate(
  templateId: string,
  decision: 'approved' | 'rejected',
  reviewNotes?: string
): Promise<ActionResult<BuildTemplate>> {
  try {
    if (!(await isAdmin())) {
      return error('Unauthorized: Admin access required');
    }

    const user = await getCurrentUser();
    if (!user) {
      return error('You must be logged in');
    }

    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from('build_templates')
      .update({
        approval_status: decision,
        reviewed_by: user.id,
        review_notes: reviewNotes || null,
        reviewed_at: new Date().toISOString(),
        is_public: decision === 'approved', // Only approved templates are public
      })
      .eq('id', templateId)
      .select(`
        *,
        engine:engines(*),
        profile:profiles(username, avatar_url)
      `)
      .single();

    if (dbError) {
      console.error('[reviewTemplate] Database error:', dbError);
      return error('Failed to review template');
    }

    revalidatePath('/templates');
    revalidatePath('/admin/templates');

    return success(data);
  } catch (err) {
    return handleError(err, 'reviewTemplate');
  }
}

/**
 * Get pending templates for admin review
 */
export async function getPendingTemplates(): Promise<ActionResult<BuildTemplate[]>> {
  try {
    if (!(await isAdmin())) {
      return error('Unauthorized: Admin access required');
    }

    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from('build_templates')
      .select(`
        *,
        engine:engines(*),
        profile:profiles(username, avatar_url),
        submitter:profiles!build_templates_submitted_by_fkey(username, avatar_url)
      `)
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('[getPendingTemplates] Database error:', dbError);
      return error('Failed to fetch pending templates');
    }

    return success(data ?? []);
  } catch (err) {
    return handleError(err, 'getPendingTemplates');
  }
}

/**
 * Update a template (admin only)
 */
export async function updateTemplate(
  id: string,
  input: {
    name?: string;
    description?: string;
    goal?: TemplateGoal;
    engine_id?: string | null;
    parts?: { [category: string]: string };
    total_price?: number | null;
    estimated_hp?: number | null;
    estimated_torque?: number | null;
    is_public?: boolean;
    is_active?: boolean;
  }
): Promise<ActionResult<BuildTemplate>> {
  try {
    if (!(await isAdmin())) {
      return error('Unauthorized: Admin access required');
    }

    const supabase = await createClient();

    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (input.name !== undefined) updates.name = input.name;
    if (input.description !== undefined) updates.description = input.description;
    if (input.goal !== undefined) updates.goal = input.goal;
    if (input.engine_id !== undefined) updates.engine_id = input.engine_id;
    if (input.parts !== undefined) updates.parts = input.parts;
    if (input.total_price !== undefined) updates.total_price = input.total_price;
    if (input.estimated_hp !== undefined) updates.estimated_hp = input.estimated_hp;
    if (input.estimated_torque !== undefined) updates.estimated_torque = input.estimated_torque;
    if (input.is_public !== undefined) updates.is_public = input.is_public;
    if (input.is_active !== undefined) updates.is_active = input.is_active;

    const { data, error: dbError } = await supabase
      .from('build_templates')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        engine:engines(*),
        profile:profiles(username, avatar_url)
      `)
      .single();

    if (dbError) {
      console.error('[updateTemplate] Database error:', dbError);
      return error('Failed to update template');
    }

    revalidatePath('/templates');
    revalidatePath(`/admin/templates/${id}`);
    revalidatePath('/admin/templates');

    return success(data);
  } catch (err) {
    return handleError(err, 'updateTemplate');
  }
}

/**
 * Delete a template (admin only)
 */
export async function deleteTemplate(
  id: string
): Promise<ActionResult<{ deleted: true }>> {
  try {
    if (!(await isAdmin())) {
      return error('Unauthorized: Admin access required');
    }

    const supabase = await createClient();

    const { error: dbError } = await supabase
      .from('build_templates')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('[deleteTemplate] Database error:', dbError);
      return error('Failed to delete template');
    }

    revalidatePath('/templates');
    revalidatePath('/admin/templates');

    return success({ deleted: true });
  } catch (err) {
    return handleError(err, 'deleteTemplate');
  }
}
