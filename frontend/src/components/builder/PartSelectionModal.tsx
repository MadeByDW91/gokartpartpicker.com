'use client';

import { X, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PartCard } from '@/components/PartCard';
import { EngineCard } from '@/components/EngineCard';
import { PartCardSkeleton, EngineCardSkeleton } from '@/components/ui/Skeleton';
import { getCategoryLabel } from '@/lib/utils';
import type { Engine, Part, PartCategory } from '@/types/database';

interface PartSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: PartCategory | 'engine';
  items: (Engine | Part)[];
  isLoading: boolean;
  error: Error | null;
  selectedItem: Engine | Part | null;
  onSelect: (item: Engine | Part) => void;
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
  onSelect,
  searchQuery,
  onSearchChange,
}: PartSelectionModalProps) {
  if (!isOpen) return null;

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if (category === 'engine') {
      const engine = item as Engine;
      return (
        engine.name.toLowerCase().includes(query) ||
        engine.brand.toLowerCase().includes(query)
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-olive-800 rounded-lg border border-olive-600 w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-olive-600">
          <h2 className="text-display text-2xl text-cream-100">
            {category === 'engine' ? 'Choose An Engine' : `Choose ${getCategoryLabel(category)}`}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-olive-600">
          <Input
            placeholder={`Search ${category === 'engine' ? 'engines' : getCategoryLabel(category).toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
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
                } else {
                  return (
                    <PartCard
                      key={item.id}
                      part={item as Part}
                      onAddToBuild={(part) => {
                        onSelect(part);
                        onClose();
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
        <div className="p-4 border-t border-olive-600 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
