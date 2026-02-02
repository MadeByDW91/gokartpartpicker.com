'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { 
  CompatibilityRule, 
  CompatibilityWarning, 
  Engine, 
  Part, 
  PartCategory 
} from '@/types/database';

/**
 * Fetch compatibility rules
 */
export function useCompatibilityRules() {
  return useQuery({
    queryKey: ['compatibility-rules'],
    queryFn: async (): Promise<CompatibilityRule[]> => {
      const supabase = createClient();
      
      if (!supabase) {
        throw new Error('Supabase client is not available');
      }
      
      try {
        const { data, error } = await supabase
          .from('compatibility_rules')
          .select('*')
          .eq('is_active', true); // Only active rules
        
        if (error) {
          console.error('[useCompatibilityRules] Error fetching rules:', error);
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error('[useCompatibilityRules] Unexpected error:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

/**
 * Check compatibility between selected engine and parts
 * This is computed client-side using the rules from the database
 * Supports both Map<PartCategory, Part> and Map<PartCategory, Part[]>
 */
export function checkCompatibility(
  engine: Engine | null,
  parts: Map<PartCategory, Part> | Map<PartCategory, Part[]>,
  rules: CompatibilityRule[]
): CompatibilityWarning[] {
  const warnings: CompatibilityWarning[] = [];
  
  // Convert Map<PartCategory, Part[]> to Map<PartCategory, Part> for compatibility checking
  // We check the first part in each category array
  const partsMap = new Map<PartCategory, Part>();
  parts.forEach((partOrArray, category) => {
    if (Array.isArray(partOrArray)) {
      // Take the first part from the array
      if (partOrArray.length > 0) {
        partsMap.set(category, partOrArray[0]);
      }
    } else {
      // Already a single Part
      partsMap.set(category, partOrArray);
    }
  });
  
  // Helper to get part specification with key aliasing
  // Supports both ingestion keys (bore_in) and legacy keys (bore_diameter)
  const getSpec = (part: Part, key: string): unknown => {
    const specs = part.specifications;
    if (!specs) return undefined;
    
    // Direct match
    if (key in specs) return specs[key];
    
    // Key aliases for backwards compatibility
    const aliases: Record<string, string[]> = {
      'bore_diameter': ['bore_in', 'bore_mm'],
      'bore_in': ['bore_diameter'],
      'pitch': ['chain_size'],
      'chain_size': ['pitch'],
    };
    
    const altKeys = aliases[key];
    if (altKeys) {
      for (const altKey of altKeys) {
        if (altKey in specs) return specs[altKey];
      }
    }
    
    return undefined;
  };
  
  // Check shaft compatibility (Engine ↔ Clutch/TC)
  if (engine) {
    const clutch = partsMap.get('clutch');
    if (clutch) {
      const clutchBore = getSpec(clutch, 'bore_diameter') as number | undefined;
      if (clutchBore && clutchBore !== engine.shaft_diameter) {
        warnings.push({
          type: 'error',
          source: 'Engine',
          target: 'Clutch',
          message: `Shaft diameter mismatch: Engine has ${engine.shaft_diameter}" shaft, but clutch bore is ${clutchBore}"`,
        });
      }
    }
    
    const tc = partsMap.get('torque_converter');
    if (tc) {
      const tcBore = getSpec(tc, 'bore_diameter') as number | undefined;
      if (tcBore && tcBore !== engine.shaft_diameter) {
        warnings.push({
          type: 'error',
          source: 'Engine',
          target: 'Torque Converter',
          message: `Shaft diameter mismatch: Engine has ${engine.shaft_diameter}" shaft, but torque converter bore is ${tcBore}"`,
        });
      }
    }
  }
  
  // Check chain compatibility (Chain ↔ Sprockets)
  const chain = partsMap.get('chain');
  const sprocket = partsMap.get('sprocket');
  
  if (chain && sprocket) {
    const chainPitch = getSpec(chain, 'pitch') as string | undefined;
    const sprocketPitch = getSpec(sprocket, 'pitch') as string | undefined;
    
    if (chainPitch && sprocketPitch && chainPitch !== sprocketPitch) {
      warnings.push({
        type: 'error',
        source: 'Chain',
        target: 'Sprocket',
        message: `Chain pitch mismatch: Chain is ${chainPitch} pitch, but sprocket is ${sprocketPitch} pitch`,
      });
    }
  }
  
  // Check brake-axle compatibility
  const brake = partsMap.get('brake');
  const axle = partsMap.get('axle');
  
  if (brake && axle) {
    const brakeAxleDiameter = getSpec(brake, 'axle_diameter') as number | undefined;
    const axleDiameter = getSpec(axle, 'diameter') as number | undefined;
    
    if (brakeAxleDiameter && axleDiameter && Math.abs(brakeAxleDiameter - axleDiameter) > 0.01) {
      warnings.push({
        type: 'error',
        source: 'Brake',
        target: 'Axle',
        message: `Axle diameter mismatch: Brake requires ${brakeAxleDiameter}" axle, but selected axle is ${axleDiameter}"`,
      });
    }
  }
  
  // Check tire/wheel compatibility
  const tire = partsMap.get('tire') || partsMap.get('tire_front') || partsMap.get('tire_rear');
  const wheel = partsMap.get('wheel');
  
  if (tire && wheel) {
    const tireDiameter = getSpec(tire, 'wheel_diameter') as number | undefined;
    const wheelDiameter = getSpec(wheel, 'diameter') as number | undefined;
    
    if (tireDiameter && wheelDiameter && tireDiameter !== wheelDiameter) {
      warnings.push({
        type: 'error',
        source: 'Tire',
        target: 'Wheel',
        message: `Size mismatch: Tire is for ${tireDiameter}" wheels, but wheel diameter is ${wheelDiameter}"`,
      });
    }
  }
  
  // Check wheel-axle compatibility (reusing axle from above)
  if (wheel && axle) {
    const wheelBoltPattern = getSpec(wheel, 'bolt_pattern') as string | undefined;
    const axleBoltPattern = getSpec(axle, 'bolt_pattern') as string | undefined;
    
    if (wheelBoltPattern && axleBoltPattern && wheelBoltPattern !== axleBoltPattern) {
      warnings.push({
        type: 'error',
        source: 'Wheel',
        target: 'Axle',
        message: `Bolt pattern mismatch: Wheel has ${wheelBoltPattern} pattern, but axle hub is ${axleBoltPattern}`,
      });
    }
  }
  
  // Add info warnings for missing critical components
  if (engine && !partsMap.get('clutch') && !partsMap.get('torque_converter')) {
    warnings.push({
      type: 'info',
      source: 'Engine',
      target: 'Drive System',
      message: 'Consider adding a clutch or torque converter for power transfer',
    });
  }
  
  if (partsMap.get('clutch') && partsMap.get('torque_converter')) {
    warnings.push({
      type: 'warning',
      source: 'Clutch',
      target: 'Torque Converter',
      message: 'You have both a clutch and torque converter selected. Usually only one is needed.',
    });
  }
  
  // Apply custom rules from database
  rules.forEach((rule) => {
    const sourcePart = partsMap.get(rule.source_category as PartCategory);
    const targetPart = partsMap.get(rule.target_category as PartCategory);
    
    if (sourcePart && targetPart) {
      const condition = rule.condition as {
        source_key?: string;
        target_key?: string;
        comparison?: 'equals' | 'not_equals';
      };
      
      if (condition.source_key && condition.target_key) {
        const sourceValue = getSpec(sourcePart, condition.source_key);
        const targetValue = getSpec(targetPart, condition.target_key);
        
        if (sourceValue && targetValue) {
          const matches = sourceValue === targetValue;
          const shouldMatch = condition.comparison !== 'not_equals';
          
          if (matches !== shouldMatch) {
            warnings.push({
              type: 'warning',
              source: rule.source_category,
              target: rule.target_category,
              message: rule.warning_message,
            });
          }
        }
      }
    }
  });
  
  return warnings;
}
