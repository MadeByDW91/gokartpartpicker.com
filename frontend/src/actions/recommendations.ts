'use server';

/**
 * Server actions for build recommendations
 * Provides goal-based, compatibility-based, and upgrade path recommendations
 */

import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/lib/api/types';
import type { Part, PartCategory, Engine } from '@/types/database';

export type RecommendationGoal = 'speed' | 'torque' | 'reliability' | 'budget';

export interface PartCombination {
  parts: Array<{ category: PartCategory; partId: string; partName: string }>;
  count: number; // Number of builds using this combination
  percentage: number; // Percentage of builds with this engine
}

export interface UpgradeStep {
  step: number;
  category: PartCategory;
  recommendedPart: Part | null;
  reason: string;
  estimatedHPGain: number;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Get recommendations for a category based on goal
 */
export async function getRecommendations(
  engineId: string | null,
  category: PartCategory,
  goal: RecommendationGoal
): Promise<ActionResult<Part[]>> {
  try {
    const supabase = await createClient();
    
    // Get all parts in this category
    const { data: parts, error: partsError } = await supabase
      .from('parts')
      .select('*')
      .eq('category', category)
      .eq('is_active', true);
    
    if (partsError) {
      return { success: false, error: 'Failed to fetch parts' };
    }
    
    if (!parts || parts.length === 0) {
      return { success: true, data: [] };
    }
    
    // Apply goal-based filtering and sorting
    const filtered = getRecommendationsForGoal(parts as Part[], category, goal);
    
    // Limit to top 5-10 recommendations
    return { success: true, data: filtered.slice(0, 10) };
  } catch (err) {
    console.error('[getRecommendations] Error:', err);
    return { success: false, error: 'Failed to get recommendations' };
  }
}

/**
 * Get popular part combinations for an engine
 * Based on saved builds data
 */
export async function getPopularCombinations(
  engineId: string
): Promise<ActionResult<PartCombination[]>> {
  try {
    const supabase = await createClient();
    
    // Get all builds with this engine that have parts
    const { data: builds, error: buildsError } = await supabase
      .from('builds')
      .select('parts')
      .eq('engine_id', engineId)
      .not('parts', 'eq', '{}');
    
    if (buildsError) {
      return { success: false, error: 'Failed to fetch builds' };
    }
    
    if (!builds || builds.length === 0) {
      return { success: true, data: [] };
    }
    
    // Count part combinations
    const combinationMap = new Map<string, {
      parts: Array<{ category: PartCategory; partId: string }>;
      count: number;
    }>();
    
    for (const build of builds) {
      const parts = build.parts as Record<string, string>;
      if (!parts || Object.keys(parts).length === 0) continue;
      
      // Create a canonical key for this combination (sorted by category)
      const sortedEntries = Object.entries(parts).sort(([a], [b]) => a.localeCompare(b));
      const key = JSON.stringify(sortedEntries);
      
      if (!combinationMap.has(key)) {
        combinationMap.set(key, {
          parts: sortedEntries.map(([category, partId]) => ({ 
            category: category as PartCategory, 
            partId 
          })),
          count: 0,
        });
      }
      
      combinationMap.get(key)!.count++;
    }
    
    // Convert to array and get part names
    const combinations: PartCombination[] = [];
    const totalBuilds = builds.length;
    
    for (const [_, { parts, count }] of combinationMap.entries()) {
      // Fetch part names
      const partIds = parts.map(p => p.partId);
      const { data: partData } = await supabase
        .from('parts')
        .select('id, name')
        .in('id', partIds);
      
      const partMap = new Map((partData || []).map((p: any) => [p.id, p.name]));
      
        combinations.push({
          parts: parts.map((p: any) => ({
          ...p,
          partName: partMap.get(p.partId) || 'Unknown Part',
        })),
        count,
        percentage: Math.round((count / totalBuilds) * 100),
      });
    }
    
    // Sort by count descending
    combinations.sort((a, b) => b.count - a.count);
    
    // Return top 5 combinations
    return { success: true, data: combinations.slice(0, 5) };
  } catch (err) {
    console.error('[getPopularCombinations] Error:', err);
    return { success: false, error: 'Failed to get popular combinations' };
  }
}

/**
 * Generate upgrade path for a build
 */
export async function getUpgradePath(
  engine: Engine | null,
  currentParts: Part[],
  goal: RecommendationGoal
): Promise<ActionResult<UpgradeStep[]>> {
  try {
    if (!engine) {
      return { success: true, data: [] };
    }
    
    const supabase = await createClient();
    
    // Define upgrade priority order
    const upgradeOrder: Array<{ category: PartCategory; priority: 'high' | 'medium' | 'low' }> = [
      { category: 'air_filter', priority: 'high' },
      { category: 'exhaust', priority: 'high' },
      { category: 'carburetor', priority: 'medium' },
      { category: 'camshaft', priority: 'medium' },
      { category: 'header', priority: 'low' },
      { category: 'flywheel', priority: 'low' },
      { category: 'piston', priority: 'low' },
      { category: 'connecting_rod', priority: 'low' },
    ];
    
    const currentCategories = new Set(currentParts.map(p => p.category));
    const steps: UpgradeStep[] = [];
    
    for (const { category, priority } of upgradeOrder) {
      // Skip if already has this category
      if (currentCategories.has(category)) continue;
      
      // Get recommendations for this category
      const recommendationsResult = await getRecommendations(engine.id, category, goal);
      const recommendations = recommendationsResult.success && recommendationsResult.data ? recommendationsResult.data : null;
      
      if (recommendations && recommendations.length > 0) {
        const recommendedPart = recommendations[0];
        const hpGain = (recommendedPart.specifications?.hp_contribution as number) || 0;
        
        steps.push({
          step: steps.length + 1,
          category,
          recommendedPart,
          reason: getUpgradeReason(category, goal),
          estimatedHPGain: hpGain,
          priority,
        });
      }
    }
    
    return { success: true, data: steps };
  } catch (err) {
    console.error('[getUpgradePath] Error:', err);
    return { success: false, error: 'Failed to generate upgrade path' };
  }
}

/**
 * Goal-based filtering and sorting
 */
function getRecommendationsForGoal(
  parts: Part[],
  category: PartCategory,
  goal: RecommendationGoal
): Part[] {
  let filtered = [...parts];
  
  switch (goal) {
    case 'speed':
      // Sort by RPM rating (max), HP contribution (descending)
      filtered.sort((a, b) => {
        const aRpm = (a.specifications?.rpm_range as { max?: number })?.max || 0;
        const bRpm = (b.specifications?.rpm_range as { max?: number })?.max || 0;
        const aHP = (a.specifications?.hp_contribution as number) || 0;
        const bHP = (b.specifications?.hp_contribution as number) || 0;
        
        // Prioritize high RPM and high HP contribution
        if (Math.abs(aRpm - bRpm) > 500) {
          return bRpm - aRpm;
        }
        return bHP - aHP;
      });
      break;
    
    case 'torque':
      // Sort by torque contribution, low-RPM performance
      filtered.sort((a, b) => {
        const aTorque = (a.specifications?.torque_contribution as number) || 0;
        const bTorque = (b.specifications?.torque_contribution as number) || 0;
        
        if (Math.abs(aTorque - bTorque) > 0.1) {
          return bTorque - aTorque;
        }
        
        // For torque converters, check engagement RPM (lower is better for torque)
        const aEngagement = (a.specifications?.engagement_rpm as number) || 9999;
        const bEngagement = (b.specifications?.engagement_rpm as number) || 9999;
        
        return aEngagement - bEngagement;
      });
      break;
    
    case 'reliability':
      // Filter by OEM compatibility, prioritize well-rated parts
      filtered = filtered.filter(p => {
        const oemCompatible = p.specifications?.oem_compatible;
        return oemCompatible !== false; // Include if not explicitly false
      });
      
      // Sort by price (lower = more reliable typically means better value)
      filtered.sort((a, b) => {
        const priceA = a.price || 999999;
        const priceB = b.price || 999999;
        return priceA - priceB;
      });
      break;
    
    case 'budget':
      // Sort by value (HP contribution / price ratio)
      filtered.sort((a, b) => {
        const aHP = (a.specifications?.hp_contribution as number) || 0;
        const bHP = (b.specifications?.hp_contribution as number) || 0;
        const priceA = a.price || 1;
        const priceB = b.price || 1;
        
        const valueA = aHP / priceA;
        const valueB = bHP / priceB;
        
        return valueB - valueA;
      });
      break;
  }
  
  return filtered;
}

/**
 * Get upgrade reason text
 */
function getUpgradeReason(category: PartCategory, goal: RecommendationGoal): string {
  const reasons: Record<string, Record<RecommendationGoal, string>> = {
    air_filter: {
      speed: 'High-flow air filter increases airflow for more HP',
      torque: 'Better air filtration improves low-end performance',
      reliability: 'Quality air filter protects engine longevity',
      budget: 'Best value upgrade for airflow improvements',
    },
    exhaust: {
      speed: 'Performance exhaust reduces backpressure',
      torque: 'Optimized exhaust improves torque curve',
      reliability: 'Quality exhaust components last longer',
      budget: 'Good HP gain for the price',
    },
    carburetor: {
      speed: 'Performance carb increases top-end HP',
      torque: 'Larger carb improves mid-range torque',
      reliability: 'Reliable carb for consistent performance',
      budget: 'Significant power gain per dollar',
    },
    camshaft: {
      speed: 'High-lift cam increases peak HP',
      torque: 'Low-RPM cam improves torque curve',
      reliability: 'Mild cam maintains engine reliability',
      budget: 'Best bang for buck power upgrade',
    },
    header: {
      speed: 'RLV-style header optimizes exhaust flow',
      torque: 'Tuned header improves torque',
      reliability: 'Quality header resists corrosion',
      budget: 'Affordable exhaust upgrade',
    },
    flywheel: {
      speed: 'Lightweight flywheel increases RPM',
      torque: 'Heavier flywheel stores more energy',
      reliability: 'Billet flywheel is safer than stock',
      budget: 'Good performance upgrade value',
    },
    piston: {
      speed: 'High-compression piston increases power',
      torque: 'Oversize piston increases displacement',
      reliability: 'Quality forged piston is durable',
      budget: 'Moderate cost for power gain',
    },
    connecting_rod: {
      speed: 'Billet rod handles high RPM safely',
      torque: 'Strong rod improves reliability',
      reliability: 'Essential for modified engines',
      budget: 'Safety upgrade worth the cost',
    },
  };
  
  return reasons[category]?.[goal] || `Recommended ${category} for ${goal} builds`;
}

/**
 * Get "also selected with" recommendations
 * Parts commonly selected together in saved builds
 */
export async function getAlsoSelectedWith(
  engineId: string,
  currentPartId: string
): Promise<ActionResult<Part[]>> {
  try {
    const supabase = await createClient();
    
    // Get all builds with this engine
    const { data: allBuilds, error: buildsError } = await supabase
      .from('builds')
      .select('parts')
      .eq('engine_id', engineId)
      .not('parts', 'eq', '{}');
    
    // Filter builds that contain this part
    const builds = (allBuilds || []).filter((build: any) => {
      const parts = build.parts as Record<string, string>;
      return parts && Object.values(parts).includes(currentPartId);
    });
    
    if (buildsError || !builds) {
      return { success: true, data: [] };
    }
    
    // Count which other parts appear with this one
    const partCounts = new Map<string, number>();
    const currentCategory = currentPartId; // We'll need to get this from the part itself
    
    for (const build of builds) {
      const parts = build.parts as Record<string, string>;
      for (const [category, partId] of Object.entries(parts)) {
        if (partId !== currentPartId) {
          partCounts.set(partId, (partCounts.get(partId) || 0) + 1);
        }
      }
    }
    
    // Get top 5 most frequently co-selected parts
    const topPartIds = Array.from(partCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([partId]) => partId);
    
    if (topPartIds.length === 0) {
      return { success: true, data: [] };
    }
    
    // Fetch full part data
    const { data: parts, error: partsError } = await supabase
      .from('parts')
      .select('*')
      .in('id', topPartIds)
      .eq('is_active', true);
    
    if (partsError) {
      return { success: false, error: 'Failed to fetch parts' };
    }
    
    // Sort by frequency
    const partMap = new Map(parts?.map((p: any) => [p.id, p]) || []);
    const sorted = topPartIds
      .map((id: string) => partMap.get(id))
      .filter((p: any): p is any => p !== undefined);
    
    return { success: true, data: sorted };
  } catch (err) {
    console.error('[getAlsoSelectedWith] Error:', err);
    return { success: false, error: 'Failed to get recommendations' };
  }
}
