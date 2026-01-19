'use client';

import Link from 'next/link';
import { useParts } from '@/hooks/use-parts';
import { PartCard } from '@/components/PartCard';
import { PartCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Package, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import { getCategoryLabel, cn } from '@/lib/utils';
import type { PartCategory, Part, Engine } from '@/types/database';

interface CategoryPartsListProps {
  category: PartCategory;
  selectedPart: Part | null;
  onSelectPart: (part: Part) => void;
  selectedEngine?: Engine | null;
}

/**
 * Category parts list component for the builder
 * Displays parts for a specific category, optionally filtered by compatibility
 */
export function CategoryPartsList({ 
  category, 
  selectedPart, 
  onSelectPart,
  selectedEngine 
}: CategoryPartsListProps) {
  const { data: allParts, isLoading } = useParts({ category });

  // Filter and sort parts based on compatibility with selected engine
  const parts = useMemo(() => {
    if (!allParts) return [];
    
    let filtered = [...allParts];
    
    // If engine is selected, prioritize compatible parts (matching shaft diameter for clutches/torque converters)
    if (selectedEngine && (category === 'clutch' || category === 'torque_converter')) {
      filtered = filtered.sort((a, b) => {
        const aBore = a.specifications?.bore_diameter || a.specifications?.bore_in || 0;
        const bBore = b.specifications?.bore_diameter || b.specifications?.bore_in || 0;
        const aMatch = typeof aBore === 'number' && Math.abs(aBore - selectedEngine.shaft_diameter) < 0.01;
        const bMatch = typeof bBore === 'number' && Math.abs(bBore - selectedEngine.shaft_diameter) < 0.01;
        
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });
    }
    
    return filtered;
  }, [allParts, category, selectedEngine]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <PartCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (parts.length === 0) {
    return (
      <Card className="bg-olive-800 border-olive-600">
        <CardContent className="py-12 text-center">
          <Package className="w-12 h-12 text-olive-500 mx-auto mb-4" />
          <p className="text-cream-400">
            No {getCategoryLabel(category).toLowerCase()} parts available yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
        {parts.slice(0, 8).map((part) => (
          <PartCard
            key={part.id}
            part={part}
            onAddToBuild={onSelectPart}
            isSelected={selectedPart?.id === part.id}
          />
        ))}
      </div>
      
      {parts.length > 8 && (
        <div className="text-center pt-4">
          <Link href={`/parts?category=${category}`}>
            <Button variant="secondary">
              Browse All {getCategoryLabel(category)}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
