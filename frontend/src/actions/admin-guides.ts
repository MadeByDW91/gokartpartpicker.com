'use server';

/**
 * Admin server actions for guide management
 * All actions require admin or super_admin role
 */

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin, requireSuperAdmin } from './admin';
import { 
  type ActionResult, 
  success, 
  error, 
  handleError 
} from '@/lib/api/types';
import type { Guide, GuideStep, GuideWithSteps } from '@/types/guides';
import { z } from 'zod';

// ============================================================================
// Validation Schemas
// ============================================================================

const guideStepSchema = z.object({
  step_number: z.number().int().positive(),
  title: z.string().min(1, 'Step title is required'),
  description: z.string().nullable().optional(),
  instructions: z.string().min(1, 'Instructions are required'),
  image_url: z.string().url().nullable().optional(),
  video_url: z.string().url().nullable().optional(),
  warning: z.string().nullable().optional(),
  tips: z.string().nullable().optional(),
  sort_order: z.number().int().default(0),
});

const createGuideSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().nullable().optional(),
  body: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).nullable().optional(),
  estimated_time_minutes: z.number().int().positive().nullable().optional(),
  featured_image_url: z.string().url().nullable().optional(),
  related_engine_id: z.string().uuid().nullable().optional(),
  related_part_id: z.string().uuid().nullable().optional(),
  tags: z.array(z.string()).default([]),
  is_published: z.boolean().default(false),
  steps: z.array(guideStepSchema).optional(),
});

const updateGuideSchema = createGuideSchema.partial().extend({
  id: z.string().uuid(),
});

// ============================================================================
// Guide Admin Actions
// ============================================================================

/**
 * Get all guides (admin view - includes unpublished)
 */
export async function getAllGuides(filters?: {
  category?: string;
  difficulty?: string;
  engine_id?: string;
  part_id?: string;
  is_published?: boolean;
}): Promise<ActionResult<Guide[]>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<Guide[]>;
    }

    const supabase = await createClient();
    
    let query = supabase
      .from('content')
      .select('*')
      .eq('content_type', 'guide')
      .order('created_at', { ascending: false });
    
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters?.difficulty) {
      query = query.eq('difficulty_level', filters.difficulty);
    }
    
    if (filters?.engine_id) {
      query = query.eq('related_engine_id', filters.engine_id);
    }
    
    if (filters?.part_id) {
      query = query.eq('related_part_id', filters.part_id);
    }

    if (filters?.is_published !== undefined) {
      query = query.eq('is_published', filters.is_published);
    }
    
    const { data, error: dbError } = await query;
    
    if (dbError) {
      console.error('[getAllGuides] Error:', dbError);
      return error('Failed to fetch guides');
    }
    
    return success((data || []) as Guide[]);
  } catch (err) {
    return handleError(err, 'getAllGuides');
  }
}

/**
 * Get a single guide by ID with steps (admin view)
 */
export async function getGuideById(id: string): Promise<ActionResult<GuideWithSteps>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<GuideWithSteps>;
    }

    const supabase = await createClient();
    
    // Get guide
    const { data: guide, error: guideError } = await supabase
      .from('content')
      .select('*')
      .eq('id', id)
      .eq('content_type', 'guide')
      .single();
    
    if (guideError || !guide) {
      return error('Guide not found');
    }
    
    // Get steps
    const { data: steps, error: stepsError } = await supabase
      .from('guide_steps')
      .select('*')
      .eq('guide_id', guide.id)
      .order('sort_order', { ascending: true })
      .order('step_number', { ascending: true });
    
    if (stepsError) {
      console.error('[getGuideById] Steps error:', stepsError);
    }
    
    return success({
      ...(guide as Guide),
      steps: (steps || []) as GuideStep[],
    });
  } catch (err) {
    return handleError(err, 'getGuideById');
  }
}

/**
 * Create a new guide
 * Requires admin role
 */
export async function createGuide(
  input: z.infer<typeof createGuideSchema>
): Promise<ActionResult<GuideWithSteps>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<GuideWithSteps>;
    }
    const { userId } = authResult as { userId: string };

    // Validate input
    const parsed = createGuideSchema.safeParse(input);
    if (!parsed.success) {
      return error(parsed.error.issues[0]?.message || 'Validation failed');
    }

    const supabase = await createClient();
    
    // Check if slug already exists
    const { data: existing } = await supabase
      .from('content')
      .select('id')
      .eq('slug', parsed.data.slug)
      .eq('content_type', 'guide')
      .single();
    
    if (existing) {
      return error('A guide with this slug already exists');
    }

    const guideData = {
      slug: parsed.data.slug,
      title: parsed.data.title,
      content_type: 'guide' as const,
      excerpt: parsed.data.excerpt || null,
      body: parsed.data.body || null,
      category: parsed.data.category || null,
      difficulty_level: parsed.data.difficulty_level || null,
      estimated_time_minutes: parsed.data.estimated_time_minutes || null,
      featured_image_url: parsed.data.featured_image_url || null,
      related_engine_id: parsed.data.related_engine_id || null,
      related_part_id: parsed.data.related_part_id || null,
      tags: parsed.data.tags || [],
      is_published: parsed.data.is_published || false,
      published_at: parsed.data.is_published ? new Date().toISOString() : null,
      created_by: userId,
    };
    
    const { data: guide, error: guideError } = await supabase
      .from('content')
      .insert(guideData)
      .select()
      .single();
    
    if (guideError || !guide) {
      console.error('[createGuide] Database error:', guideError);
      return error('Failed to create guide');
    }

    // Create steps if provided
    if (parsed.data.steps && parsed.data.steps.length > 0) {
      const stepsData = parsed.data.steps.map(step => ({
        guide_id: guide.id,
        ...step,
      }));

      const { error: stepsError } = await supabase
        .from('guide_steps')
        .insert(stepsData);

      if (stepsError) {
        console.error('[createGuide] Steps error:', stepsError);
        // Continue even if steps fail - guide is created
      }
    }

    // Fetch the complete guide with steps
    const result = await getGuideById(guide.id);
    if (!result.success) {
      return success({
        ...(guide as Guide),
        steps: [],
      });
    }
    
    // Revalidate relevant paths
    revalidatePath('/guides');
    revalidatePath('/admin/guides');
    
    return result;
  } catch (err) {
    return handleError(err, 'createGuide');
  }
}

/**
 * Update an existing guide
 * Requires admin role
 */
export async function updateGuide(
  input: z.infer<typeof updateGuideSchema>
): Promise<ActionResult<GuideWithSteps>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<GuideWithSteps>;
    }
    const { userId } = authResult as { userId: string };

    // Validate input
    const parsed = updateGuideSchema.safeParse(input);
    if (!parsed.success) {
      return error(parsed.error.issues[0]?.message || 'Validation failed');
    }

    const { id, steps, ...updateData } = parsed.data;
    const supabase = await createClient();

    // Check if guide exists
    const { data: existing } = await supabase
      .from('content')
      .select('id, slug')
      .eq('id', id)
      .eq('content_type', 'guide')
      .single();

    if (!existing) {
      return error('Guide not found');
    }

    // Check slug uniqueness if slug is being updated
    if (updateData.slug && updateData.slug !== existing.slug) {
      const { data: slugExists } = await supabase
        .from('content')
        .select('id')
        .eq('slug', updateData.slug)
        .eq('content_type', 'guide')
        .neq('id', id)
        .single();

      if (slugExists) {
        return error('A guide with this slug already exists');
      }
    }

    // Prepare update data
    const guideUpdate: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updateData.slug !== undefined) guideUpdate.slug = updateData.slug;
    if (updateData.title !== undefined) guideUpdate.title = updateData.title;
    if (updateData.excerpt !== undefined) guideUpdate.excerpt = updateData.excerpt;
    if (updateData.body !== undefined) guideUpdate.body = updateData.body;
    if (updateData.category !== undefined) guideUpdate.category = updateData.category;
    if (updateData.difficulty_level !== undefined) guideUpdate.difficulty_level = updateData.difficulty_level;
    if (updateData.estimated_time_minutes !== undefined) guideUpdate.estimated_time_minutes = updateData.estimated_time_minutes;
    if (updateData.featured_image_url !== undefined) guideUpdate.featured_image_url = updateData.featured_image_url;
    if (updateData.related_engine_id !== undefined) guideUpdate.related_engine_id = updateData.related_engine_id;
    if (updateData.related_part_id !== undefined) guideUpdate.related_part_id = updateData.related_part_id;
    if (updateData.tags !== undefined) guideUpdate.tags = updateData.tags;
    
    // Handle publish status
    if (updateData.is_published !== undefined) {
      guideUpdate.is_published = updateData.is_published;
      if (updateData.is_published) {
        guideUpdate.published_at = new Date().toISOString();
      }
    }

    const { data: guide, error: guideError } = await supabase
      .from('content')
      .update(guideUpdate)
      .eq('id', id)
      .select()
      .single();

    if (guideError || !guide) {
      console.error('[updateGuide] Database error:', guideError);
      return error('Failed to update guide');
    }

    // Update steps if provided
    if (steps !== undefined) {
      // Delete existing steps
      await supabase
        .from('guide_steps')
        .delete()
        .eq('guide_id', id);

      // Insert new steps
      if (steps.length > 0) {
        const stepsData = steps.map(step => ({
          guide_id: id,
          ...step,
        }));

        const { error: stepsError } = await supabase
          .from('guide_steps')
          .insert(stepsData);

        if (stepsError) {
          console.error('[updateGuide] Steps error:', stepsError);
        }
      }
    }

    // Fetch the complete guide with steps
    const result = await getGuideById(id);
    if (!result.success) {
      return success({
        ...(guide as Guide),
        steps: [],
      });
    }
    
    // Revalidate relevant paths
    revalidatePath('/guides');
    revalidatePath(`/guides/${guide.slug}`);
    revalidatePath('/admin/guides');
    
    return result;
  } catch (err) {
    return handleError(err, 'updateGuide');
  }
}

/**
 * Toggle guide publish status
 */
export async function toggleGuidePublish(
  id: string,
  isPublished: boolean
): Promise<ActionResult<Guide>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult as ActionResult<Guide>;
    }

    const supabase = await createClient();

    const updateData: Record<string, unknown> = {
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    };

    if (isPublished) {
      updateData.published_at = new Date().toISOString();
    }

    const { data: guide, error: dbError } = await supabase
      .from('content')
      .update(updateData)
      .eq('id', id)
      .eq('content_type', 'guide')
      .select()
      .single();

    if (dbError || !guide) {
      console.error('[toggleGuidePublish] Database error:', dbError);
      return error('Failed to update guide status');
    }

    // Revalidate relevant paths
    revalidatePath('/guides');
    revalidatePath('/admin/guides');
    
    return success(guide as Guide);
  } catch (err) {
    return handleError(err, 'toggleGuidePublish');
  }
}

/**
 * Delete a guide
 * Requires super_admin role for hard delete, admin for soft delete
 */
export async function deleteGuide(
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

    const supabase = await createClient();
    
    if (hardDelete) {
      // Delete steps first (cascade should handle this, but being explicit)
      await supabase
        .from('guide_steps')
        .delete()
        .eq('guide_id', id);

      // Hard delete - completely remove the guide
      const { error: dbError } = await supabase
        .from('content')
        .delete()
        .eq('id', id)
        .eq('content_type', 'guide');
      
      if (dbError) {
        console.error('[deleteGuide] Database error:', dbError);
        return error('Failed to delete guide');
      }
    } else {
      // Soft delete - set is_published to false
      const { error: dbError } = await supabase
        .from('content')
        .update({ 
          is_published: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('content_type', 'guide');
      
      if (dbError) {
        console.error('[deleteGuide] Database error:', dbError);
        return error('Failed to deactivate guide');
      }
    }
    
    // Revalidate relevant paths
    revalidatePath('/guides');
    revalidatePath('/admin/guides');
    
    return success({ deleted: true });
  } catch (err) {
    return handleError(err, 'deleteGuide');
  }
}
