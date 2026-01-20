'use server';

/**
 * Content Automation server actions
 * Handles auto-generation of descriptions, image sourcing, and duplicate detection
 */

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '../admin';
import { 
  type ActionResult, 
  success, 
  error 
} from '@/lib/api/types';

interface DuplicateCandidate {
  id: string;
  name: string;
  type: 'engine' | 'part';
  slug: string;
  brand: string | null;
  similarityScore: number;
}

/**
 * Generate description from specifications (template-based)
 */
export async function generateDescription(
  itemType: 'engine' | 'part',
  itemId: string,
  specs: Record<string, unknown>
): Promise<ActionResult<{ description: string }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    // Template-based description generation
    let description = '';

    if (itemType === 'engine') {
      const displacement = specs.displacement_cc || specs.displacement_cc;
      const hp = specs.horsepower || specs.horsepower;
      const brand = specs.brand || '';

      description = `${brand} ${displacement}cc engine producing ${hp} horsepower. `;
      description += specs.shaft_diameter ? `Features a ${specs.shaft_diameter}" output shaft. ` : '';
      description += specs.variant ? `${specs.variant} variant with improved performance. ` : '';
      description += 'Ultimate for go-kart builds and small engine applications.';
    } else {
      // Part description
      const category = specs.category || '';
      const brand = specs.brand || '';
      const name = specs.name || '';

      description = `${brand ? brand + ' ' : ''}${name || category} for go-kart applications. `;
      
      if (specs.chain_size) {
        description += `Compatible with ${specs.chain_size} chain. `;
      }
      if (specs.bore_in) {
        description += `Fits ${specs.bore_in}" shaft diameter. `;
      }
      if (specs.engagement_rpm) {
        description += `Engagement at ${specs.engagement_rpm} RPM. `;
      }

      description += 'Quality component designed for performance and durability.';
    }

    return success({ description: description.trim() });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to generate description');
  }
}

/**
 * Find potential duplicates
 */
export async function findDuplicates(): Promise<ActionResult<DuplicateCandidate[]>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();

    // Get all engines and parts
    const [enginesResult, partsResult] = await Promise.all([
      supabase.from('engines').select('id, name, slug, brand'),
      supabase.from('parts').select('id, name, slug, brand'),
    ]);

    if (enginesResult.error) return error('Failed to fetch engines');
    if (partsResult.error) return error('Failed to fetch parts');

    const engines = enginesResult.data || [];
    const parts = partsResult.data || [];

    // Simple duplicate detection based on name similarity
    const duplicates: DuplicateCandidate[] = [];
    const processed = new Set<string>();

    // Check engines
    for (let i = 0; i < engines.length; i++) {
      for (let j = i + 1; j < engines.length; j++) {
        const e1 = engines[i] as any;
        const e2 = engines[j] as any;
        const key = `${e1.id}-${e2.id}`;
        
        if (processed.has(key)) continue;
        processed.add(key);

        const similarity = calculateSimilarity(e1.name, e2.name);
        
        if (similarity > 0.85 && e1.slug !== e2.slug) {
          duplicates.push({
            id: e1.id,
            name: e1.name,
            type: 'engine',
            slug: e1.slug,
            brand: e1.brand,
            similarityScore: similarity,
          });
        }
      }
    }

    // Check parts
    for (let i = 0; i < parts.length; i++) {
      for (let j = i + 1; j < parts.length; j++) {
        const p1 = parts[i] as any;
        const p2 = parts[j] as any;
        const key = `${p1.id}-${p2.id}`;
        
        if (processed.has(key)) continue;
        processed.add(key);

        const similarity = calculateSimilarity(p1.name, p2.name);
        
        if (similarity > 0.85 && p1.slug !== p2.slug) {
          duplicates.push({
            id: p1.id,
            name: p1.name,
            type: 'part',
            slug: p1.slug,
            brand: p1.brand,
            similarityScore: similarity,
          });
        }
      }
    }

    return success(duplicates.sort((a: { similarityScore: number }, b: { similarityScore: number }) => b.similarityScore - a.similarityScore));
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Failed to find duplicates');
  }
}

/**
 * Simple similarity calculation (Levenshtein-based)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.9;

  // Simple word overlap
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  const intersection = words1.filter(w => words2.includes(w));
  const union = new Set([...words1, ...words2]);

  return intersection.length / union.size;
}

/**
 * Validate image URL
 */
export async function validateImageUrl(url: string): Promise<ActionResult<{ valid: boolean; error?: string }>> {
  try {
    await requireAdmin();

    if (!url || !url.trim()) {
      return success({ valid: false, error: 'URL is required' });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return success({ valid: false, error: 'Invalid URL format' });
    }

    // Check if it's an image URL
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const isImageUrl = imageExtensions.some(ext => 
      url.toLowerCase().includes(ext)
    ) || url.includes('image') || url.includes('img');

    if (!isImageUrl) {
      return success({ valid: true, error: 'URL may not be an image' });
    }

    return success({ valid: true });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Validation failed');
  }
}

/**
 * Bulk update images
 */
export async function bulkUpdateImages(
  updates: Array<{ itemId: string; itemType: 'engine' | 'part'; imageUrl: string }>
): Promise<ActionResult<{ updated: number; failed: number }>> {
  try {
    const authResult = await requireAdmin();
    if ('success' in authResult && !authResult.success) {
      return authResult;
    }

    const supabase = await createClient();
    let updated = 0;
    let failed = 0;

    for (const update of updates) {
      const table = update.itemType === 'engine' ? 'engines' : 'parts';
      const { error } = await supabase
        .from(table)
        .update({
          image_url: update.imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', update.itemId);

      if (error) {
        failed++;
      } else {
        updated++;
      }
    }

    revalidatePath('/admin/engines');
    revalidatePath('/admin/parts');
    revalidatePath('/engines');
    revalidatePath('/parts');

    return success({ updated, failed });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Bulk update failed');
  }
}
