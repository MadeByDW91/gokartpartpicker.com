'use server';

/**
 * Server actions for guides
 */

import { createClient } from '@/lib/supabase/server';
import { 
  type ActionResult, 
  success, 
  error, 
  handleError 
} from '@/lib/api/types';
import type { Guide, GuideStep, GuideWithSteps } from '@/types/guides';

/**
 * Get all published guides
 */
export async function getGuides(filters?: {
  category?: string;
  difficulty?: string;
  engine_id?: string;
  part_id?: string;
}): Promise<ActionResult<Guide[]>> {
  try {
    const supabase = await createClient();
    
    let query = supabase
      .from('content')
      .select('*')
      .eq('content_type', 'guide')
      .eq('is_published', true)
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
    
    const { data, error: dbError } = await query;
    
    if (dbError) {
      console.error('[getGuides] Error:', dbError);
      return error('Failed to fetch guides');
    }
    
    return success((data || []) as Guide[]);
  } catch (err) {
    return handleError(err, 'getGuides');
  }
}

/**
 * Get a single guide by slug with steps
 */
export async function getGuideBySlug(slug: string): Promise<ActionResult<GuideWithSteps>> {
  try {
    const supabase = await createClient();
    
    // Get guide with engine info
    const { data: guide, error: guideError } = await supabase
      .from('content')
      .select(`
        *,
        engine:engines!content_related_engine_id_fkey(id, name, brand)
      `)
      .eq('slug', slug)
      .eq('content_type', 'guide')
      .eq('is_published', true)
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
      console.error('[getGuideBySlug] Steps error:', stepsError);
    }
    
    // Increment view count (fire and forget)
    supabase
      .from('content')
      .update({ views_count: (guide.views_count || 0) + 1 })
      .eq('id', guide.id)
      .then(() => {
        // View count updated
      });
    
    return success({
      ...(guide as Guide),
      steps: (steps || []) as GuideStep[],
    });
  } catch (err) {
    return handleError(err, 'getGuideBySlug');
  }
}

/**
 * Mark a guide as helpful
 */
export async function markGuideHelpful(
  guideId: string,
  isHelpful: boolean = true
): Promise<ActionResult<{ helpful_count: number }>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return error('Must be logged in to mark guide as helpful');
    }
    
    // Upsert helpful vote
    const { error: voteError } = await supabase
      .from('guide_helpful')
      .upsert({
        guide_id: guideId,
        user_id: user.id,
        is_helpful: isHelpful,
      }, {
        onConflict: 'guide_id,user_id',
      });
    
    if (voteError) {
      console.error('[markGuideHelpful] Vote error:', voteError);
      return error('Failed to record vote');
    }
    
    // Get updated helpful count
    const { data: votes, error: countError } = await supabase
      .from('guide_helpful')
      .select('id')
      .eq('guide_id', guideId)
      .eq('is_helpful', true);
    
    if (countError) {
      console.error('[markGuideHelpful] Count error:', countError);
    }
    
    const helpfulCount = votes?.length || 0;
    
    // Update guide helpful count
    await supabase
      .from('content')
      .update({ helpful_count: helpfulCount })
      .eq('id', guideId);
    
    return success({ helpful_count: helpfulCount });
  } catch (err) {
    return handleError(err, 'markGuideHelpful');
  }
}
