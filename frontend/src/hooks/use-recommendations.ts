'use client';

import { useMemo } from 'react';
import { useParts } from '@/hooks/use-parts';
import { useEngines } from '@/hooks/use-engines';
import type { Engine, Part, PartCategory } from '@/types/database';

interface Recommendation {
  part: Part;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Smart recommendations engine
 * Provides part recommendations based on:
 * - Selected engine
 * - Selected parts
 * - Category compatibility
 * - Popular combinations
 */
export function useRecommendations(
  selectedEngine: Engine | null,
  selectedParts: Map<PartCategory, Part[]>,
  category?: PartCategory
): Recommendation[] {
  const { data: allParts = [] } = useParts();
  const { data: allEngines = [] } = useEngines();

  return useMemo(() => {
    if (!selectedEngine && selectedParts.size === 0) {
      return [];
    }

    const recommendations: Recommendation[] = [];
    const selectedCategories = new Set(selectedParts.keys());

    // Get parts for the requested category or all parts
    let candidateParts = allParts;
    if (category) {
      candidateParts = allParts.filter((p) => p.category === category);
    }

    // Filter out already selected parts
    candidateParts = candidateParts.filter((part) => {
      const selectedInCategory = selectedParts.get(part.category) || [];
      return !selectedInCategory.some((p) => p.id === part.id);
    });

    // Recommendation 1: Same brand parts (popular combinations)
    if (selectedEngine) {
      const brandParts = candidateParts.filter(
        (p) => (p.brand ?? '').toLowerCase() === selectedEngine.brand.toLowerCase()
      );
      brandParts.forEach((part) => {
        recommendations.push({
          part,
          reason: `Same brand as your ${selectedEngine.brand} engine`,
          priority: 'medium',
        });
      });
    }

    // Recommendation 2: Complete category set
    // If user has selected some parts from a category group, recommend others
    const categoryGroups: Record<string, PartCategory[]> = {
      drivetrain: ['clutch', 'torque_converter', 'chain', 'sprocket'],
      engine_parts: ['carburetor', 'exhaust', 'air_filter', 'camshaft', 'valve_spring'],
      chassis: ['axle', 'wheel', 'tire', 'brake', 'throttle', 'pedals'],
    };

    Object.entries(categoryGroups).forEach(([group, categories]) => {
      const hasSomeFromGroup = categories.some((cat) => selectedCategories.has(cat));
      if (hasSomeFromGroup) {
        const missingFromGroup = categories.filter((cat) => !selectedCategories.has(cat));
        missingFromGroup.forEach((cat) => {
          const compatibleParts = candidateParts.filter((p) => p.category === cat);
          compatibleParts.slice(0, 2).forEach((part) => {
            recommendations.push({
              part,
              reason: `Complete your ${group.replace('_', ' ')} setup`,
              priority: 'high',
            });
          });
        });
      }
    });

    // Recommendation 3: Engine-specific compatible parts
    if (selectedEngine) {
      // For clutches/torque converters: match shaft diameter
      const shaftDiameter = selectedEngine.shaft_diameter;
      candidateParts
        .filter((p) => {
          if (p.category !== 'clutch' && p.category !== 'torque_converter') return false;
          const specs = p.specifications || {};
          const bore = specs.bore_diameter || specs.bore_in;
          return bore === shaftDiameter;
        })
        .forEach((part) => {
          recommendations.push({
            part,
            reason: `Ultimate fit for ${selectedEngine.shaft_diameter}" shaft`,
            priority: 'high',
          });
        });
    }

    // Recommendation 4: Price-conscious alternatives (if user has expensive parts)
    const expensiveParts = Array.from(selectedParts.values())
      .flat()
      .filter((p) => (p.price || 0) > 100)
      .sort((a, b) => (b.price || 0) - (a.price || 0));

    expensiveParts.slice(0, 2).forEach((expensivePart) => {
      const cheaperAlternative = candidateParts.find(
        (p) =>
          p.category === expensivePart.category &&
          p.id !== expensivePart.id &&
          (p.price || 0) < (expensivePart.price || 0) &&
          (p.price || 0) > 0
      );
      if (cheaperAlternative) {
        const savings = (expensivePart.price || 0) - (cheaperAlternative.price || 0);
        recommendations.push({
          part: cheaperAlternative,
          reason: `Save $${savings.toFixed(2)} vs. ${expensivePart.name}`,
          priority: 'medium',
        });
      }
    });

    // Recommendation 5: Popular parts (based on category selection frequency)
    // This is a simple heuristic - in production, you'd track actual selection data
    if (selectedCategories.size > 0) {
      const popularCategories = Array.from(selectedCategories);
      popularCategories.forEach((cat) => {
        const popularParts = candidateParts
          .filter((p) => p.category === cat)
          .slice(0, 1);
        popularParts.forEach((part) => {
          recommendations.push({
            part,
            reason: 'Popular choice for this category',
            priority: 'low',
          });
        });
      });
    }

    // Deduplicate and prioritize
    const seen = new Set<string>();
    const deduplicated = recommendations.filter((rec) => {
      if (seen.has(rec.part.id)) return false;
      seen.add(rec.part.id);
      return true;
    });

    // Sort by priority (high -> medium -> low) and limit
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    deduplicated.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return deduplicated.slice(0, 6);
  }, [selectedEngine, selectedParts, allParts, allEngines, category]);
}
