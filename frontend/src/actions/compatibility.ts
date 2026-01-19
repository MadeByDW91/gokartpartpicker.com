'use server';

/**
 * Server actions for compatibility operations
 * Compatibility rules are deterministic and explainable - no AI/ML
 */

import { createClient } from '@/lib/supabase/server';
import { 
  compatibilityRulesFiltersSchema,
  checkCompatibilitySchema,
  parseInput,
  type CompatibilityRulesFiltersInput,
  type CheckCompatibilityInput 
} from '@/lib/validation/schemas';
import { 
  type ActionResult, 
  success, 
  error, 
  handleError 
} from '@/lib/api/types';
import type { 
  CompatibilityRule, 
  CompatibilityWarning,
  Engine,
  Part 
} from '@/types/database';

/**
 * Fetch all active compatibility rules
 * Public action - no auth required
 * Rules are applied client-side for real-time feedback
 */
export async function getCompatibilityRules(
  filters?: Partial<CompatibilityRulesFiltersInput>
): Promise<ActionResult<CompatibilityRule[]>> {
  try {
    // Validate filters
    const parsed = parseInput(compatibilityRulesFiltersSchema, filters ?? {});
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    
    const { ruleType, sourceCategory, targetCategory, isActive } = parsed.data;
    
    const supabase = await createClient();
    
    let query = supabase
      .from('compatibility_rules')
      .select('*');
    
    // Apply filters
    if (isActive !== undefined) {
      query = query.eq('is_active', isActive);
    }
    if (ruleType) {
      query = query.eq('rule_type', ruleType);
    }
    if (sourceCategory) {
      query = query.eq('source_category', sourceCategory);
    }
    if (targetCategory) {
      query = query.eq('target_category', targetCategory);
    }
    
    query = query.order('severity').order('rule_type');
    
    const { data, error: dbError } = await query;
    
    if (dbError) {
      console.error('[getCompatibilityRules] Database error:', dbError);
      return error('Failed to fetch compatibility rules');
    }
    
    return success(data ?? []);
  } catch (err) {
    return handleError(err, 'getCompatibilityRules');
  }
}

/**
 * Get direct engine-part compatibility mappings
 * These are explicit mappings set by admins for specific engine-part combinations
 */
export async function getEnginePartCompatibility(
  engineId: string
): Promise<ActionResult<{
  partId: string;
  compatibilityLevel: 'direct_fit' | 'requires_modification' | 'adapter_required';
  notes: string | null;
}[]>> {
  try {
    if (!engineId) {
      return success([]);
    }
    
    const supabase = await createClient();
    
    const { data, error: dbError } = await supabase
      .from('engine_part_compatibility')
      .select('part_id, compatibility_level, notes')
      .eq('engine_id', engineId);
    
    if (dbError) {
      console.error('[getEnginePartCompatibility] Database error:', dbError);
      return error('Failed to fetch engine-part compatibility');
    }
    
    // Transform to camelCase for frontend
    const mappings = (data ?? []).map((item: { 
      part_id: string; 
      compatibility_level: string; 
      notes: string | null;
    }) => ({
      partId: item.part_id,
      compatibilityLevel: item.compatibility_level as 'direct_fit' | 'requires_modification' | 'adapter_required',
      notes: item.notes,
    }));
    
    return success(mappings);
  } catch (err) {
    return handleError(err, 'getEnginePartCompatibility');
  }
}

/**
 * Get rules applicable to a specific source category (e.g., 'engine' or 'clutch')
 * Useful for filtering rules when a user selects a specific item
 */
export async function getRulesForCategory(
  sourceCategory: string
): Promise<ActionResult<CompatibilityRule[]>> {
  return getCompatibilityRules({ 
    sourceCategory, 
    isActive: true 
  });
}

/**
 * Get rules that target a specific part category
 * Useful for showing what rules will be checked when adding a part
 */
export async function getRulesTargetingCategory(
  targetCategory: string
): Promise<ActionResult<CompatibilityRule[]>> {
  return getCompatibilityRules({ 
    targetCategory, 
    isActive: true 
  });
}

/**
 * Check compatibility between an engine and a single part
 * Returns warnings/errors based on compatibility rules
 */
export async function checkCompatibility(
  input: CheckCompatibilityInput
): Promise<ActionResult<CompatibilityWarning[]>> {
  try {
    const parsed = parseInput(checkCompatibilitySchema, input);
    if (!parsed.success) {
      return error(parsed.error, parsed.fieldErrors);
    }
    
    const { engineId, partIds } = parsed.data;
    
    if (!engineId && partIds.length === 0) {
      return success([]);
    }
    
    const supabase = await createClient();
    const warnings: CompatibilityWarning[] = [];
    
    // Fetch engine if provided
    let engine: Engine | null = null;
    if (engineId) {
      const { data } = await supabase
        .from('engines')
        .select('*')
        .eq('id', engineId)
        .single();
      engine = data;
    }
    
    // Fetch parts if provided
    let parts: Part[] = [];
    if (partIds.length > 0) {
      const { data } = await supabase
        .from('parts')
        .select('*')
        .in('id', partIds);
      parts = data ?? [];
    }
    
    // Fetch active compatibility rules
    const { data: rules } = await supabase
      .from('compatibility_rules')
      .select('*')
      .eq('is_active', true);
    
    if (!rules || rules.length === 0) {
      return success([]);
    }
    
    // Apply rules to check compatibility
    for (const rule of rules) {
      const warning = evaluateRule(rule, engine, parts);
      if (warning) {
        warnings.push(warning);
      }
    }
    
    // Check direct engine-part compatibility if engine is provided
    if (engine && partIds.length > 0) {
      const { data: directMappings } = await supabase
        .from('engine_part_compatibility')
        .select('part_id, compatibility_level, notes')
        .eq('engine_id', engineId)
        .in('part_id', partIds);
      
      if (directMappings) {
        for (const mapping of directMappings) {
          if (mapping.compatibility_level === 'requires_modification') {
            warnings.push({
              type: 'warning',
              source: engine.name,
              target: parts.find(p => p.id === mapping.part_id)?.name ?? 'Unknown part',
              message: mapping.notes ?? 'This part requires modification to fit this engine',
            });
          } else if (mapping.compatibility_level === 'adapter_required') {
            warnings.push({
              type: 'info',
              source: engine.name,
              target: parts.find(p => p.id === mapping.part_id)?.name ?? 'Unknown part',
              message: mapping.notes ?? 'An adapter is required to use this part with this engine',
            });
          }
        }
      }
    }
    
    return success(warnings);
  } catch (err) {
    return handleError(err, 'checkCompatibility');
  }
}

/**
 * Check compatibility for all parts in a build
 * Returns all warnings/errors for the build
 */
export async function getBuildCompatibility(
  buildId: string
): Promise<ActionResult<CompatibilityWarning[]>> {
  try {
    const supabase = await createClient();
    
    // Fetch the build
    const { data: build, error: buildError } = await supabase
      .from('builds')
      .select('engine_id, parts')
      .eq('id', buildId)
      .single();
    
    if (buildError) {
      if (buildError.code === 'PGRST116') {
        return error('Build not found');
      }
      return error('Failed to fetch build');
    }
    
    // Extract part IDs from the build
    const partIds = Object.values(build.parts as Record<string, string> ?? {});
    
    // Check compatibility
    return checkCompatibility({
      engineId: build.engine_id ?? undefined,
      partIds,
    });
  } catch (err) {
    return handleError(err, 'getBuildCompatibility');
  }
}

/**
 * Get parts that are compatible with a specific engine
 * Filters parts by direct compatibility mappings and rule-based checks
 */
export async function getCompatibleParts(
  engineId: string,
  category?: string
): Promise<ActionResult<Part[]>> {
  try {
    const supabase = await createClient();
    
    // Fetch the engine
    const { data: engine, error: engineError } = await supabase
      .from('engines')
      .select('*')
      .eq('id', engineId)
      .eq('is_active', true)
      .single();
    
    if (engineError) {
      if (engineError.code === 'PGRST116') {
        return error('Engine not found');
      }
      return error('Failed to fetch engine');
    }
    
    // Fetch all active parts (optionally filtered by category)
    let partsQuery = supabase
      .from('parts')
      .select('*')
      .eq('is_active', true);
    
    if (category) {
      partsQuery = partsQuery.eq('category', category);
    }
    
    const { data: allParts, error: partsError } = await partsQuery;
    
    if (partsError) {
      return error('Failed to fetch parts');
    }
    
    if (!allParts || allParts.length === 0) {
      return success([]);
    }
    
    // Fetch direct compatibility mappings for this engine
    const { data: directMappings } = await supabase
      .from('engine_part_compatibility')
      .select('part_id, compatibility_level')
      .eq('engine_id', engineId);
    
    // Create a set of directly compatible part IDs
    const directFitPartIds = new Set(
      (directMappings ?? [])
        .filter((m: { compatibility_level: string }) => m.compatibility_level === 'direct_fit')
        .map((m: { part_id: string }) => m.part_id)
    );
    
    // Fetch active rules
    const { data: rules } = await supabase
      .from('compatibility_rules')
      .select('*')
      .eq('is_active', true)
      .eq('source_category', 'engine');
    
    // Filter parts based on compatibility
    const compatibleParts: Part[] = [];
    
    for (const part of allParts) {
      // If there's a direct fit mapping, include the part
      if (directFitPartIds.has(part.id)) {
        compatibleParts.push(part);
        continue;
      }
      
      // Check rule-based compatibility
      let isCompatible = true;
      
      if (rules) {
        for (const rule of rules) {
          if (rule.target_category !== part.category) continue;
          
          const warning = evaluateRule(rule, engine, [part]);
          if (warning && warning.type === 'error') {
            isCompatible = false;
            break;
          }
        }
      }
      
      if (isCompatible) {
        compatibleParts.push(part);
      }
    }
    
    return success(compatibleParts);
  } catch (err) {
    return handleError(err, 'getCompatibleParts');
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Evaluate a single compatibility rule against an engine and parts
 * Returns a warning if the rule is violated, null otherwise
 */
function evaluateRule(
  rule: CompatibilityRule,
  engine: Engine | null,
  parts: Part[]
): CompatibilityWarning | null {
  const condition = rule.condition as {
    compare?: string;
    source_field?: string;
    target_field?: string;
    value?: unknown;
  };
  
  if (!condition.compare || !condition.source_field || !condition.target_field) {
    return null;
  }
  
  // Find source value (from engine or a part)
  let sourceValue: unknown = null;
  let sourceName = 'Unknown';
  
  if (rule.source_category === 'engine' && engine) {
    sourceValue = getNestedValue(engine as unknown as Record<string, unknown>, condition.source_field);
    sourceName = engine.name;
  } else {
    const sourcePart = parts.find(p => p.category === rule.source_category);
    if (sourcePart) {
      sourceValue = getNestedValue(sourcePart as unknown as Record<string, unknown>, condition.source_field);
      sourceName = sourcePart.name;
    }
  }
  
  // Find target parts and check each
  const targetParts = parts.filter(p => p.category === rule.target_category);
  
  for (const targetPart of targetParts) {
    const targetValue = getNestedValue(targetPart as unknown as Record<string, unknown>, condition.target_field);
    
    const isValid = compareValues(condition.compare, sourceValue, targetValue);
    
    if (!isValid) {
      return {
        type: rule.severity,
        source: sourceName,
        target: targetPart.name,
        message: rule.warning_message,
      };
    }
  }
  
  return null;
}

/**
 * Get a nested value from an object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  
  return current;
}

/**
 * Compare two values based on the comparison operator
 */
function compareValues(operator: string, source: unknown, target: unknown): boolean {
  if (source === null || source === undefined || target === null || target === undefined) {
    return true; // Skip check if values are missing
  }
  
  switch (operator) {
    case 'equal':
      return source === target;
    case 'not_equal':
      return source !== target;
    case 'greater_than':
      return Number(source) > Number(target);
    case 'less_than':
      return Number(source) < Number(target);
    case 'greater_than_or_equal':
      return Number(source) >= Number(target);
    case 'less_than_or_equal':
      return Number(source) <= Number(target);
    case 'contains':
      return String(source).includes(String(target));
    default:
      return true;
  }
}
