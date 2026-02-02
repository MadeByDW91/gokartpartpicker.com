'use server';

/**
 * Server actions for build operations
 * These require authentication for mutations
 */

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { 
  createBuildSchema,
  updateBuildSchema,
  deleteBuildSchema,
  getBuildSchema,
  listBuildsSchema,
  addPartToBuildSchema,
  removePartFromBuildSchema,
  uuidSchema,
  parseInput,
  type CreateBuildInput,
  type UpdateBuildInput,
  type ListBuildsInput,
  type AddPartToBuildInput,
  type RemovePartFromBuildInput 
} from '@/lib/validation/schemas';
import { 
  type ActionResult, 
  success, 
  error, 
  handleError 
} from '@/lib/api/types';
import type { Build } from '@/types/database';
import { getImpersonationContext } from '@/lib/impersonation';

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
 * Calculate total price for a build
 */
async function calculateTotalPrice(
  engineId: string | null | undefined,
  parts: Record<string, string>
): Promise<number> {
  const supabase = await createClient();
  let total = 0;
  
  // Add engine price
  if (engineId) {
    const { data: engine } = await supabase
      .from('engines')
      .select('price')
      .eq('id', engineId)
      .single();
    
    if (engine?.price) {
      total += Number(engine.price);
    }
  }
  
  // Add parts prices
  const partIds = Object.values(parts);
  if (partIds.length > 0) {
    const { data: partsData } = await supabase
      .from('parts')
      .select('price')
      .in('id', partIds);
    
    if (partsData) {
      for (const part of partsData) {
        if (part.price) {
          total += Number(part.price);
        }
      }
    }
  }
  
  return total;
}

/**
 * Create a new build
 * Requires authentication
 */
export async function createBuild(
  input: CreateBuildInput
): Promise<ActionResult<Build>> {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return error('You must be logged in to create a build');
    }
    
    // Validate input
    const parsed = parseInput(createBuildSchema, input);
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    
    const { name, description, engine_id, motor_id, power_source_type, parts, is_public } = parsed.data;
    
    // Calculate total price
    const total_price = await calculateTotalPrice(engine_id, parts);
    
    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('builds')
      .insert({
        user_id: user.id,
        name,
        description,
        engine_id: engine_id ?? null,
        motor_id: motor_id ?? null,
        power_source_type: power_source_type ?? 'gas',
        parts,
        total_price,
        is_public,
      })
      .select(`
        *,
        engine:engines(*),
        motor:electric_motors(*),
        profile:profiles(username, avatar_url)
      `)
      .single();
    
    if (dbError) {
      console.error('[createBuild] Database error:', dbError);
      return error('Failed to create build');
    }
    
    // Revalidate relevant paths
    revalidatePath('/builds');
    revalidatePath('/builder');
    
    return success(data);
  } catch (err) {
    return handleError(err, 'createBuild');
  }
}

/**
 * Create a new build from a template.
 * Loads template engine + parts into a new build for the current user.
 * Requires authentication.
 */
export async function createBuildFromTemplate(
  templateId: string
): Promise<ActionResult<Build>> {
  try {
    const parsed = parseInput(z.object({ templateId: uuidSchema }), { templateId });
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    const { templateId: id } = parsed.data;

    const user = await getCurrentUser();
    if (!user) {
      return error('You must be logged in to create a build from a template');
    }

    const supabase = await createClient();
    const { data: template, error: templateError } = await supabase
      .from('build_templates')
      .select('id, name, description, engine_id, parts, total_price, approval_status')
      .eq('id', id)
      .eq('is_public', true)
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      return error('Template not found or not available');
    }
    // Respect approval_status when present (user_templates_approval migration)
    const t = template as { approval_status?: string };
    if (t.approval_status != null && t.approval_status !== 'approved') {
      return error('Template not found or not available');
    }

    if (!template.engine_id) {
      return error('Template must have an engine to create a build');
    }
    const parts = (template.parts as Record<string, string>) ?? {};

    const createInput: CreateBuildInput = {
      name: template.name || 'Build from template',
      description: (template.description as string) || null,
      engine_id: template.engine_id,
      motor_id: null,
      power_source_type: 'gas',
      parts,
      is_public: false,
    };
    return createBuild(createInput);
  } catch (err) {
    return handleError(err, 'createBuildFromTemplate');
  }
}

/**
 * Update an existing build
 * Requires authentication and ownership
 */
export async function updateBuild(
  input: UpdateBuildInput
): Promise<ActionResult<Build>> {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return error('You must be logged in to update a build');
    }
    
    // Validate input
    const parsed = parseInput(updateBuildSchema, input);
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    
    const { id, ...updates } = parsed.data;
    
    const supabase = await createClient();
    
    // Verify ownership (RLS will also enforce this)
    const { data: existingBuild } = await supabase
      .from('builds')
      .select('user_id, parts, engine_id, motor_id')
      .eq('id', id)
      .single();
    
    if (!existingBuild) {
      return error('Build not found');
    }
    
    if (existingBuild.user_id !== user.id) {
      return error('You do not have permission to update this build');
    }
    
    // Calculate new total price if parts or engine/motor changed
    const newParts = updates.parts ?? existingBuild.parts ?? {};
    const newEngineId = updates.engine_id !== undefined 
      ? updates.engine_id 
      : existingBuild.engine_id;
    
    const total_price = await calculateTotalPrice(newEngineId, newParts);
    
    // Perform update
    const { data, error: dbError } = await supabase
      .from('builds')
      .update({
        ...updates,
        total_price,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        engine:engines(*),
        motor:electric_motors(*),
        profile:profiles(username, avatar_url)
      `)
      .single();
    
    if (dbError) {
      console.error('[updateBuild] Database error:', dbError);
      return error('Failed to update build');
    }
    
    // Revalidate relevant paths
    revalidatePath('/builds');
    revalidatePath(`/builds/${id}`);
    revalidatePath('/builder');
    
    return success(data);
  } catch (err) {
    return handleError(err, 'updateBuild');
  }
}

/**
 * Delete a build
 * Requires authentication and ownership
 */
export async function deleteBuild(
  id: string
): Promise<ActionResult<{ deleted: true }>> {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return error('You must be logged in to delete a build');
    }
    
    // Validate input
    const parsed = parseInput(deleteBuildSchema, { id });
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    
    const supabase = await createClient();
    
    // RLS will enforce ownership
    const { error: dbError } = await supabase
      .from('builds')
      .delete()
      .eq('id', parsed.data.id)
      .eq('user_id', user.id); // Extra safety check
    
    if (dbError) {
      console.error('[deleteBuild] Database error:', dbError);
      return error('Failed to delete build');
    }
    
    // Revalidate relevant paths
    revalidatePath('/builds');
    
    return success({ deleted: true });
  } catch (err) {
    return handleError(err, 'deleteBuild');
  }
}

/**
 * Get a single build by ID
 * Public builds are accessible to everyone
 * Private builds require ownership
 */
export async function getBuild(
  id: string
): Promise<ActionResult<Build>> {
  try {
    // Validate input
    const parsed = parseInput(getBuildSchema, { id });
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    
    const supabase = await createClient();
    const user = await getCurrentUser();
    
    // Query the build - RLS will handle access control
    const { data, error: dbError } = await supabase
      .from('builds')
      .select(`
        *,
        engine:engines(*),
        motor:electric_motors(*),
        profile:profiles(username, avatar_url)
      `)
      .eq('id', parsed.data.id)
      .single();
    
    if (dbError) {
      return handleError(dbError, 'getBuild', 'Build');
    }
    
    // Check access: public builds are open, private require ownership
    if (!data.is_public && (!user || data.user_id !== user.id)) {
      return error('Build not found. It may be private or may have been removed.');
    }
    
    return success(data);
  } catch (err) {
    return handleError(err, 'getBuild');
  }
}

/**
 * Get builds for the current user (or impersonated user when admin view-as)
 * Requires authentication
 */
export async function getUserBuilds(): Promise<ActionResult<Build[]>> {
  try {
    const ctx = await getImpersonationContext();
    if (!ctx.realUser || !ctx.effectiveUserId) {
      return error('You must be logged in to view your builds');
    }
    
    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('builds')
      .select(`
        *,
        engine:engines(*),
        motor:electric_motors(*),
        profile:profiles(username, avatar_url)
      `)
      .eq('user_id', ctx.effectiveUserId)
      .order('updated_at', { ascending: false });
    
    if (dbError) {
      console.error('[getUserBuilds] Database error:', dbError);
      return error('Failed to fetch your builds');
    }
    
    return success(data ?? []);
  } catch (err) {
    return handleError(err, 'getUserBuilds');
  }
}

/**
 * Get a build by its share ID (for public sharing)
 * Public action - allows viewing public builds without auth
 */
export async function getBuildByShareId(
  shareId: string
): Promise<ActionResult<Build>> {
  try {
    // Share ID could be the build ID or a custom slug
    // For now, we use the build ID as the share ID
    const parsed = parseInput(getBuildSchema, { id: shareId });
    if (!parsed.success) {
      return error('Invalid share link');
    }
    
    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('builds')
      .select(`
        *,
        engine:engines(*),
        motor:electric_motors(*),
        profile:profiles(username, avatar_url)
      `)
      .eq('id', parsed.data.id)
      .eq('is_public', true)
      .single();
    
    if (dbError) {
      return handleError(dbError, 'getBuildByShareId', 'Build');
    }
    
    // Ensure it's public
    if (!data.is_public) {
      return error('This build is not publicly shared.');
    }
    
    return success(data);
  } catch (err) {
    return handleError(err, 'getBuildByShareId');
  }
}

/**
 * Add a part to a build
 * Requires authentication and ownership
 */
export async function addPartToBuild(
  input: AddPartToBuildInput
): Promise<ActionResult<Build>> {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return error('You must be logged in to modify a build');
    }
    
    // Validate input
    const parsed = parseInput(addPartToBuildSchema, input);
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    
    const { buildId, category, partId } = parsed.data;
    
    const supabase = await createClient();
    
    // Get existing build and verify ownership
    const { data: existingBuild } = await supabase
      .from('builds')
      .select('user_id, parts, engine_id')
      .eq('id', buildId)
      .single();
    
    if (!existingBuild) {
      return error('Build not found');
    }
    
    if (existingBuild.user_id !== user.id) {
      return error('You do not have permission to modify this build');
    }
    
    // Verify part exists
    const { data: part } = await supabase
      .from('parts')
      .select('id, category')
      .eq('id', partId)
      .eq('is_active', true)
      .single();
    
    if (!part) {
      return error('Part not found');
    }
    
    // Verify part matches the specified category
    if (part.category !== category) {
      return error(`Part is not in the ${category} category`);
    }
    
    // Update parts - add or replace the part in this category
    const updatedParts = {
      ...(existingBuild.parts as Record<string, string> ?? {}),
      [category]: partId,
    };
    
    // Calculate new total price
    const total_price = await calculateTotalPrice(existingBuild.engine_id, updatedParts);
    
    // Perform update
    const { data, error: dbError } = await supabase
      .from('builds')
      .update({
        parts: updatedParts,
        total_price,
        updated_at: new Date().toISOString(),
      })
      .eq('id', buildId)
      .select(`
        *,
        engine:engines(*),
        motor:electric_motors(*),
        profile:profiles(username, avatar_url)
      `)
      .single();
    
    if (dbError) {
      console.error('[addPartToBuild] Database error:', dbError);
      return error('Failed to add part to build');
    }
    
    // Revalidate relevant paths
    revalidatePath('/builds');
    revalidatePath(`/builds/${buildId}`);
    revalidatePath('/builder');
    
    return success(data);
  } catch (err) {
    return handleError(err, 'addPartToBuild');
  }
}

/**
 * Remove a part from a build
 * Requires authentication and ownership
 */
export async function removePartFromBuild(
  input: RemovePartFromBuildInput
): Promise<ActionResult<Build>> {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return error('You must be logged in to modify a build');
    }
    
    // Validate input
    const parsed = parseInput(removePartFromBuildSchema, input);
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    
    const { buildId, category } = parsed.data;
    
    const supabase = await createClient();
    
    // Get existing build and verify ownership
    const { data: existingBuild } = await supabase
      .from('builds')
      .select('user_id, parts, engine_id')
      .eq('id', buildId)
      .single();
    
    if (!existingBuild) {
      return error('Build not found');
    }
    
    if (existingBuild.user_id !== user.id) {
      return error('You do not have permission to modify this build');
    }
    
    // Remove part from the category
    const currentParts = existingBuild.parts as Record<string, string> ?? {};
    const { [category]: removed, ...updatedParts } = currentParts;
    
    if (!removed) {
      return error(`No part in category ${category} to remove`);
    }
    
    // Calculate new total price
    const total_price = await calculateTotalPrice(existingBuild.engine_id, updatedParts);
    
    // Perform update
    const { data, error: dbError } = await supabase
      .from('builds')
      .update({
        parts: updatedParts,
        total_price,
        updated_at: new Date().toISOString(),
      })
      .eq('id', buildId)
      .select(`
        *,
        engine:engines(*),
        motor:electric_motors(*),
        profile:profiles(username, avatar_url)
      `)
      .single();
    
    if (dbError) {
      console.error('[removePartFromBuild] Database error:', dbError);
      return error('Failed to remove part from build');
    }
    
    // Revalidate relevant paths
    revalidatePath('/builds');
    revalidatePath(`/builds/${buildId}`);
    revalidatePath('/builder');
    
    return success(data);
  } catch (err) {
    return handleError(err, 'removePartFromBuild');
  }
}

/**
 * Get multiple builds for comparison
 * Public action - fetches builds by IDs, respects privacy settings
 */
export async function getBuildsForComparison(
  buildIds: string[]
): Promise<ActionResult<Build[]>> {
  try {
    if (!buildIds || buildIds.length === 0) {
      return error('At least one build ID is required');
    }

    if (buildIds.length > 3) {
      return error('Cannot compare more than 3 builds');
    }

    const supabase = await createClient();
    const user = await getCurrentUser();

    // Fetch builds
    const { data, error: dbError } = await supabase
      .from('builds')
      .select(`
        *,
        engine:engines(*),
        motor:electric_motors(*),
        profile:profiles(username, avatar_url)
      `)
      .in('id', buildIds);

    if (dbError) {
      console.error('[getBuildsForComparison] Database error:', dbError);
      return error('Failed to fetch builds for comparison');
    }

    if (!data || data.length === 0) {
      return error('No builds found');
    }

    // Filter out private builds the user doesn't own
    const accessibleBuilds = data.filter((build: any) => {
      if (build.is_public) return true;
      if (user && build.user_id === user.id) return true;
      return false;
    });

    if (accessibleBuilds.length === 0) {
      return error('No accessible builds found. Some builds may be private.');
    }

    // Sort to match the order of input IDs
    const sortedBuilds = buildIds
      .map((id) => accessibleBuilds.find((b: any) => b.id === id))
      .filter((b: any): b is any => b !== undefined);

    return success(sortedBuilds);
  } catch (err) {
    return handleError(err, 'getBuildsForComparison');
  }
}

/**
 * Get public/community builds
 * Public action - no auth required
 */
export async function getPublicBuilds(
  filters?: Partial<ListBuildsInput>
): Promise<ActionResult<Build[]>> {
  try {
    // Validate filters
    const parsed = parseInput(listBuildsSchema, { ...filters, isPublic: true });
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    
    const { engineId, sort, order, limit } = parsed.data;
    
    const supabase = await createClient();
    
    let query = supabase
      .from('builds')
      .select(`
        *,
        engine:engines(name, brand, horsepower),
        motor:electric_motors(name, brand, horsepower, voltage),
        profile:profiles(username, avatar_url)
      `)
      .eq('is_public', true);
    
    if (engineId) {
      query = query.eq('engine_id', engineId);
    }
    
    query = query
      .order(sort, { ascending: order === 'asc' })
      .limit(limit);
    
    const { data, error: dbError } = await query;
    
    if (dbError) {
      console.error('[getPublicBuilds] Database error:', dbError);
      return error('Failed to fetch public builds');
    }
    
    return success(data ?? []);
  } catch (err) {
    return handleError(err, 'getPublicBuilds');
  }
}
