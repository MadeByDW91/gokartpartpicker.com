'use server';

/**
 * Server actions for managing engine clone/compatibility relationships
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
import type { Engine } from '@/types/database';

export interface EngineClone {
  id: string;
  engine_id: string;
  clone_engine_id: string;
  relationship_type: 'clone' | 'compatible' | 'similar';
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  engine?: Engine;
  clone_engine?: Engine;
}

/**
 * Auto-detect potential clone engines based on specifications
 * Finds engines with matching shaft diameter, mount type, and similar displacement
 */
export async function detectPotentialClones(
  engineId: string
): Promise<ActionResult<Array<Engine & { matchScore: number; matchReasons: string[] }>>> {
  try {
    const supabase = await createClient();
    
    // Get the engine we're checking
    const { data: engine, error: engineError } = await supabase
      .from('engines')
      .select('*')
      .eq('id', engineId)
      .eq('is_active', true)
      .single();

    if (engineError || !engine) {
      return error('Engine not found');
    }

    // Find engines with similar specifications
    // Criteria for clone detection:
    // 1. Same shaft diameter (most important - parts compatibility)
    // 2. Similar displacement (±20cc tolerance)
    // 3. Same mount type (if available, but not required)
    // 4. Different brand (clones are usually different manufacturers)

    // Start with same shaft diameter (required for parts compatibility)
    let query = supabase
      .from('engines')
      .select('*')
      .eq('is_active', true)
      .eq('shaft_diameter', engine.shaft_diameter)
      .neq('id', engineId); // Exclude self

    // Similar displacement (±20cc) - this is important for clone detection
    const minDisplacement = engine.displacement_cc - 20;
    const maxDisplacement = engine.displacement_cc + 20;
    query = query.gte('displacement_cc', minDisplacement).lte('displacement_cc', maxDisplacement);

    const { data: potentialClones, error: dbError } = await query;

    if (dbError) {
      console.error('[detectPotentialClones] Database error:', dbError);
      return error('Failed to detect potential clones');
    }

    if (!potentialClones || potentialClones.length === 0) {
      return success([]);
    }

    // Calculate match scores and reasons
    const scored = potentialClones.map((clone: Engine) => {
      const reasons: string[] = [];
      let score = 0;

      // Shaft diameter match (required, so all have this)
      reasons.push(`Same ${engine.shaft_diameter}" shaft diameter`);
      score += 50;

      // Mount type match (bonus points, but not required)
      if (engine.mount_type && clone.mount_type && engine.mount_type === clone.mount_type) {
        reasons.push('Same mount type');
        score += 15;
      } else if (engine.mount_type && clone.mount_type) {
        // Different mount type but both specified - might still be compatible
        score += 5;
      }

      // Displacement match (exact)
      if (clone.displacement_cc === engine.displacement_cc) {
        reasons.push(`Same ${engine.displacement_cc}cc displacement`);
        score += 20;
      } else {
        reasons.push(`Similar displacement (${clone.displacement_cc}cc vs ${engine.displacement_cc}cc)`);
        score += 10;
      }

      // Shaft type match
      if (clone.shaft_type === engine.shaft_type) {
        reasons.push(`Same ${engine.shaft_type} shaft type`);
        score += 10;
      }

      // Different brand (clones are usually different manufacturers)
      if (clone.brand.toLowerCase() !== engine.brand.toLowerCase()) {
        reasons.push(`Different brand (${clone.brand} vs ${engine.brand})`);
        score += 5;
      }

      return {
        ...clone,
        matchScore: score,
        matchReasons: reasons,
      };
    });

    // Sort by match score (highest first)
    scored.sort((a: Engine & { matchScore: number; matchReasons: string[] }, b: Engine & { matchScore: number; matchReasons: string[] }) => b.matchScore - a.matchScore);

    return success(scored);
  } catch (err) {
    return handleError(err, 'detectPotentialClones');
  }
}

/**
 * Auto-create clone relationships for engines with matching specifications
 * Only creates relationships for high-confidence matches
 */
export async function autoCreateCloneRelationships(
  engineId: string,
  minMatchScore: number = 70
): Promise<ActionResult<{ created: number; relationships: EngineClone[] }>> {
  try {
    await requireAdmin();

    // Detect potential clones
    const detectResult = await detectPotentialClones(engineId);
    if (!detectResult.success || !detectResult.data) {
      return error('error' in detectResult ? detectResult.error : 'Failed to detect potential clones');
    }

    const potentialClones = detectResult.data.filter(
      (e) => e.matchScore >= minMatchScore
    );

    if (potentialClones.length === 0) {
      return success({ created: 0, relationships: [] });
    }

    const supabase = await createClient();
    const created: EngineClone[] = [];

    // Create bidirectional relationships for high-confidence matches
    for (const clone of potentialClones) {
      // Determine relationship type based on match score
      let relationshipType: 'clone' | 'compatible' | 'similar' = 'compatible';
      if (clone.matchScore >= 90) {
        relationshipType = 'clone';
      } else if (clone.matchScore >= 80) {
        relationshipType = 'compatible';
      } else {
        relationshipType = 'similar';
      }

      // Create notes from match reasons
      const notes = `Auto-detected: ${clone.matchReasons.join(', ')}`;

      // Check if relationship already exists
      const { data: existing } = await supabase
        .from('engine_clones')
        .select('id')
        .eq('engine_id', engineId)
        .eq('clone_engine_id', clone.id)
        .single();

      if (!existing) {
        // Create bidirectional relationship
        const { data: newClone, error: dbError } = await supabase
          .from('engine_clones')
          .insert({
            engine_id: engineId,
            clone_engine_id: clone.id,
            relationship_type: relationshipType,
            notes,
            is_active: true,
          })
          .select(`
            *,
            engine:engines!engine_clones_engine_id_fkey(*),
            clone_engine:engines!engine_clones_clone_engine_id_fkey(*)
          `)
          .single();

        if (!dbError && newClone) {
          created.push(newClone as EngineClone & { engine: Engine; clone_engine: Engine });

          // Create reverse relationship
          await supabase
            .from('engine_clones')
            .insert({
              engine_id: clone.id,
              clone_engine_id: engineId,
              relationship_type: relationshipType,
              notes: `Auto-detected: Reverse relationship with ${engineId}`,
              is_active: true,
            });
        }
      }
    }

    revalidatePath('/admin/engines');
    revalidatePath('/engines');

    return success({ created: created.length, relationships: created });
  } catch (err) {
    return handleError(err, 'autoCreateCloneRelationships');
  }
}

/**
 * Get all clone/compatible engines for a specific engine
 * Public action - no auth required (used on engine detail pages)
 */
export async function getEngineClones(
  engineId: string
): Promise<ActionResult<Array<EngineClone & { clone_engine: Engine }>>> {
  try {
    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('engine_clones')
      .select(`
        *,
        clone_engine:engines!clone_engine_id(*)
      `)
      .eq('engine_id', engineId)
      .eq('is_active', true)
      .order('relationship_type', { ascending: true })
      .order('created_at', { ascending: false });

    if (dbError) {
      const msg = (dbError as { message?: string; code?: string })?.message ?? (dbError as { code?: string })?.code ?? 'unknown';
      console.warn('[getEngineClones] Query failed, returning empty. Message:', msg);
      return success([]);
    }

    return success((data || []) as Array<EngineClone & { clone_engine: Engine }>);
  } catch (err) {
    return handleError(err, 'getEngineClones');
  }
}

/**
 * Get all clone relationships (admin only)
 */
export async function getAdminEngineClones(): Promise<ActionResult<Array<EngineClone & { engine: Engine; clone_engine: Engine }>>> {
  try {
    await requireAdmin();
    
    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('engine_clones')
      .select(`
        *,
        engine:engines!engine_clones_engine_id_fkey(*),
        clone_engine:engines!engine_clones_clone_engine_id_fkey(*)
      `)
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('[getAdminEngineClones] Database error:', dbError);
      return error('Failed to fetch engine clones');
    }

    return success((data || []) as Array<EngineClone & { engine: Engine; clone_engine: Engine }>);
  } catch (err) {
    return handleError(err, 'getAdminEngineClones');
  }
}

/**
 * Create a clone relationship between two engines
 */
export async function createEngineClone(
  input: {
    engine_id: string;
    clone_engine_id: string;
    relationship_type?: 'clone' | 'compatible' | 'similar';
    notes?: string | null;
  }
): Promise<ActionResult<EngineClone>> {
  try {
    await requireAdmin();

    if (input.engine_id === input.clone_engine_id) {
      return error('Engine cannot be a clone of itself');
    }

    const supabase = await createClient();

    // Check if relationship already exists
    const { data: existing } = await supabase
      .from('engine_clones')
      .select('id')
      .eq('engine_id', input.engine_id)
      .eq('clone_engine_id', input.clone_engine_id)
      .single();

    if (existing) {
      return error('This clone relationship already exists');
    }

    const { data, error: dbError } = await supabase
      .from('engine_clones')
      .insert({
        engine_id: input.engine_id,
        clone_engine_id: input.clone_engine_id,
        relationship_type: input.relationship_type || 'clone',
        notes: input.notes || null,
        is_active: true,
      })
      .select(`
        *,
        engine:engines!engine_clones_engine_id_fkey(*),
        clone_engine:engines!engine_clones_clone_engine_id_fkey(*)
      `)
      .single();

    if (dbError) {
      console.error('[createEngineClone] Database error:', dbError);
      return error('Failed to create clone relationship');
    }

    revalidatePath('/admin/engines');
    revalidatePath('/engines');

    return success(data as EngineClone & { engine: Engine; clone_engine: Engine });
  } catch (err) {
    return handleError(err, 'createEngineClone');
  }
}

/**
 * Update a clone relationship
 */
export async function updateEngineClone(
  id: string,
  input: {
    relationship_type?: 'clone' | 'compatible' | 'similar';
    notes?: string | null;
    is_active?: boolean;
  }
): Promise<ActionResult<EngineClone>> {
  try {
    await requireAdmin();

    const supabase = await createClient();

    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (input.relationship_type !== undefined) updates.relationship_type = input.relationship_type;
    if (input.notes !== undefined) updates.notes = input.notes;
    if (input.is_active !== undefined) updates.is_active = input.is_active;

    const { data, error: dbError } = await supabase
      .from('engine_clones')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        engine:engines!engine_clones_engine_id_fkey(*),
        clone_engine:engines!engine_clones_clone_engine_id_fkey(*)
      `)
      .single();

    if (dbError) {
      console.error('[updateEngineClone] Database error:', dbError);
      return error('Failed to update clone relationship');
    }

    revalidatePath('/admin/engines');
    revalidatePath('/engines');

    return success(data as EngineClone & { engine: Engine; clone_engine: Engine });
  } catch (err) {
    return handleError(err, 'updateEngineClone');
  }
}

/**
 * Delete a clone relationship
 */
export async function deleteEngineClone(
  id: string
): Promise<ActionResult<{ deleted: true }>> {
  try {
    await requireAdmin();

    const supabase = await createClient();

    const { error: dbError } = await supabase
      .from('engine_clones')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('[deleteEngineClone] Database error:', dbError);
      return error('Failed to delete clone relationship');
    }

    revalidatePath('/admin/engines');
    revalidatePath('/engines');

    return success({ deleted: true });
  } catch (err) {
    return handleError(err, 'deleteEngineClone');
  }
}

/**
 * Create bidirectional clone relationship (if A is clone of B, also create B is clone of A)
 */
export async function createBidirectionalClone(
  input: {
    engine_id: string;
    clone_engine_id: string;
    relationship_type?: 'clone' | 'compatible' | 'similar';
    notes?: string | null;
  }
): Promise<ActionResult<{ created: number }>> {
  try {
    await requireAdmin();

    const supabase = await createClient();

    // Create both directions
    const relationships = [
      {
        engine_id: input.engine_id,
        clone_engine_id: input.clone_engine_id,
        relationship_type: input.relationship_type || 'clone',
        notes: input.notes || null,
        is_active: true,
      },
      {
        engine_id: input.clone_engine_id,
        clone_engine_id: input.engine_id,
        relationship_type: input.relationship_type || 'clone',
        notes: input.notes || null,
        is_active: true,
      },
    ];

    // Check for existing relationships
    for (const rel of relationships) {
      const { data: existing } = await supabase
        .from('engine_clones')
        .select('id')
        .eq('engine_id', rel.engine_id)
        .eq('clone_engine_id', rel.clone_engine_id)
        .single();

      if (!existing) {
        const { error: dbError } = await supabase
          .from('engine_clones')
          .insert(rel);

        if (dbError) {
          console.error('[createBidirectionalClone] Database error:', dbError);
          return error('Failed to create clone relationship');
        }
      }
    }

    revalidatePath('/admin/engines');
    revalidatePath('/engines');

    return success({ created: 2 });
  } catch (err) {
    return handleError(err, 'createBidirectionalClone');
  }
}
