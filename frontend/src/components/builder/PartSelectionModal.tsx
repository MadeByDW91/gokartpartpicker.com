'use client';

import { useState, useMemo } from 'react';
import { X, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { PartCard } from '@/components/PartCard';
import { EngineCard } from '@/components/EngineCard';
import { MotorCard } from '@/components/MotorCard';
import { PartCardSkeleton, EngineCardSkeleton } from '@/components/ui/Skeleton';
import { useSwipe } from '@/hooks/use-swipe';
import { getCategoryLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Engine, Part, PartCategory, ElectricMotor } from '@/types/database';

interface PartSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: PartCategory | 'engine' | 'motor';
  items: (Engine | Part | ElectricMotor)[];
  isLoading: boolean;
  error: Error | null;
  selectedItem: Engine | Part | ElectricMotor | null;
  selectedParts?: Map<PartCategory, Part[]>; // Optional: for checking if parts are already selected
  onSelect: (item: Engine | Part | ElectricMotor) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function PartSelectionModal({
  isOpen,
  onClose,
  category,
  items,
  isLoading,
  error,
  selectedItem,
  selectedParts,
  onSelect,
  searchQuery,
  onSearchChange,
}: PartSelectionModalProps) {
  const [brakeTypeFilter, setBrakeTypeFilter] = useState<'all' | 'mechanical' | 'hydraulic'>('all');

  // Swipe down to dismiss on mobile
  const { ref: swipeRef } = useSwipe({
    onSwipeDown: () => {
      // Only dismiss on mobile (full-screen modal)
      if (window.innerWidth < 640) {
        onClose();
      }
    },
    threshold: 100,
  });

  // Filter items by search query and brake type (if brake category) — must run before any early return (Rules of Hooks)
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Filter by brake type if category is brake
    if (category === 'brake' && brakeTypeFilter !== 'all') {
      filtered = filtered.filter((item) => {
        const part = item as Part;
        const specs = part.specifications as Record<string, unknown> | null;
        const brakeType = specs?.brake_type as string | undefined;
        return brakeType?.toLowerCase() === brakeTypeFilter.toLowerCase();
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        if (category === 'engine') {
          const engine = item as Engine;
          return (
            engine.name.toLowerCase().includes(query) ||
            engine.brand.toLowerCase().includes(query)
          );
        } else if (category === 'motor') {
          const motor = item as ElectricMotor;
          return (
            motor.name.toLowerCase().includes(query) ||
            motor.brand.toLowerCase().includes(query)
          );
        } else {
          const part = item as Part;
          return (
            part.name.toLowerCase().includes(query) ||
            part.brand?.toLowerCase().includes(query) ||
            false
          );
        }
      });
    }

    return filtered;
  }, [items, category, brakeTypeFilter, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div 
        ref={swipeRef as React.RefObject<HTMLDivElement>}
        className="bg-olive-800 rounded-none sm:rounded-lg border-0 sm:border border-olive-600 w-full h-full sm:h-auto sm:max-w-6xl sm:max-h-[90vh] flex flex-col touch-pan-y"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-olive-600 flex-shrink-0">
          <h2 className="text-display text-xl sm:text-2xl text-cream-100">
            {category === 'engine' 
              ? 'Choose An Engine' 
              : category === 'motor'
              ? 'Choose An Electric Motor'
              : `Choose ${getCategoryLabel(category)}`}
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] touch-manipulation"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-olive-600 flex-shrink-0 space-y-3">
          <Input
            placeholder={`Search ${category === 'engine' 
              ? 'engines' 
              : category === 'motor'
              ? 'electric motors'
              : getCategoryLabel(category).toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            icon={<Search className="w-4 h-4" />}
            className="min-h-[44px]"
          />
          
          {/* Brake Type Filter */}
          {category === 'brake' && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-cream-400" />
              <span className="text-sm text-cream-400">Filter by type:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setBrakeTypeFilter('all')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    brakeTypeFilter === 'all'
                      ? "bg-orange-500 text-cream-100"
                      : "bg-olive-700/50 text-cream-300 hover:bg-olive-700"
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setBrakeTypeFilter('mechanical')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    brakeTypeFilter === 'mechanical'
                      ? "bg-orange-500 text-cream-100"
                      : "bg-olive-700/50 text-cream-300 hover:bg-olive-700"
                  )}
                >
                  Mechanical
                </button>
                <button
                  onClick={() => setBrakeTypeFilter('hydraulic')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    brakeTypeFilter === 'hydraulic'
                      ? "bg-orange-500 text-cream-100"
                      : "bg-olive-700/50 text-cream-300 hover:bg-olive-700"
                  )}
                >
                  Hydraulic
                </button>
              </div>
              {brakeTypeFilter !== 'all' && (
                <Badge variant="default" className="ml-auto">
                  {filteredItems.length} {brakeTypeFilter} brake{filteredItems.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 safe-area-bottom">
          {error ? (
            <div className="text-center py-12">
              <p className="text-orange-400 mb-4">Failed to load items</p>
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) =>
                category === 'engine' ? (
                  <EngineCardSkeleton key={i} />
                ) : category === 'motor' ? (
                  <EngineCardSkeleton key={i} />
                ) : (
                  <PartCardSkeleton key={i} />
                )
              )}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-cream-400 mb-4">
                {searchQuery ? 'No items found matching your search' : 'No items available'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
              {filteredItems.map((item) => {
                // For parts, check if item is in the selectedParts array
                // For engines/motors, check against selectedItem
                const isSelected = category === 'engine' || category === 'motor'
                  ? selectedItem?.id === item.id
                  : selectedParts?.get(category as PartCategory)?.some(p => p.id === item.id) || false;
                if (category === 'engine') {
                  return (
                    <EngineCard
                      key={item.id}
                      engine={item as Engine}
                      onAddToBuild={(engine) => {
                        onSelect(engine);
                        onClose();
                      }}
                      isSelected={isSelected}
                    />
                  );
                } else if (category === 'motor') {
                  return (
                    <MotorCard
                      key={item.id}
                      motor={item as ElectricMotor}
                      onAddToBuild={(motor) => {
                        onSelect(motor);
                        onClose();
                      }}
                      isSelected={isSelected}
                    />
                  );
                } else {
                  // For parts, don't close modal automatically - allow adding multiple
                  return (
                    <PartCard
                      key={item.id}
                      part={item as Part}
                      onAddToBuild={(part) => {
                        onSelect(part);
                        // Don't close modal - user can add multiple parts
                      }}
                      isSelected={isSelected}
                    />
                  );
                }
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-olive-600 flex justify-end flex-shrink-0">
          <Button 
            variant="secondary" 
            onClick={onClose}
            className="min-h-[44px] touch-manipulation"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
