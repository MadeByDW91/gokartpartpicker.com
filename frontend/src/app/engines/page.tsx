'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useEngines, useEngineBrands } from '@/hooks/use-engines';
import { useBuildStore } from '@/store/build-store';
import { EngineCard } from '@/components/EngineCard';
import { EngineCardSkeleton } from '@/components/ui/Skeleton';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { usePagination } from '@/hooks/use-pagination';
import { Cog, Search, SlidersHorizontal, X } from 'lucide-react';
import type { EngineFilters, ShaftType, Engine } from '@/types/database';

export default function EnginesPage() {
  const [filters, setFilters] = useState<EngineFilters>({
    sort: 'horsepower',
    order: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: engines, isLoading, error } = useEngines(filters);
  const { data: brands } = useEngineBrands();
  const { selectedEngine, setEngine } = useBuildStore();
  
  // Filter by search query locally
  const filteredEngines = useMemo(() => {
    if (!engines) return [];
    return engines.filter((engine) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        engine.name.toLowerCase().includes(query) ||
        engine.brand.toLowerCase().includes(query)
      );
    });
  }, [engines, searchQuery]);

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedEngines,
    goToPage,
    nextPage,
    prevPage,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination(filteredEngines, { itemsPerPage: 24 });
  
  const handleAddToBuild = (engine: Engine) => {
    if (selectedEngine?.id === engine.id) {
      setEngine(null);
    } else {
      setEngine(engine);
    }
  };
  
  const clearFilters = () => {
    setFilters({ sort: 'horsepower', order: 'desc' });
    setSearchQuery('');
  };
  
  const hasActiveFilters = filters.brand || filters.min_hp || filters.max_hp || filters.min_cc || filters.max_cc || filters.shaft_type;
  
  return (
    <div className="min-h-screen bg-olive-900">
      {/* Header */}
      <div className="bg-olive-800 border-b border-olive-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Cog className="w-8 h-8 text-orange-400" />
            <h1 className="text-display text-3xl sm:text-4xl text-cream-100">
              Engines
            </h1>
          </div>
          <p className="text-cream-400 max-w-2xl">
            Browse our selection of go-kart engines. From beginner-friendly to racing power plants.
          </p>
        </div>
      </div>
      
      {/* Filters Bar */}
      <div className="sticky top-16 z-30 bg-olive-900/95 backdrop-blur-sm border-b border-olive-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px] max-w-md">
              <Input
                placeholder="Search engines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            
            {/* Quick Filters */}
            <div className="hidden md:flex items-center gap-3">
              <Select
                options={[
                  { value: '', label: 'All Brands' },
                  ...(brands?.map((b) => ({ value: b, label: b })) || []),
                ]}
                value={filters.brand || ''}
                onChange={(e) => setFilters({ ...filters, brand: e.target.value || undefined })}
                className="w-36"
              />
              
              <Select
                options={[
                  { value: 'horsepower-desc', label: 'HP: High to Low' },
                  { value: 'horsepower-asc', label: 'HP: Low to High' },
                  { value: 'price-asc', label: 'Price: Low to High' },
                  { value: 'price-desc', label: 'Price: High to Low' },
                  { value: 'displacement_cc-desc', label: 'CC: High to Low' },
                ]}
                value={`${filters.sort}-${filters.order}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  setFilters({ 
                    ...filters, 
                    sort: sort as EngineFilters['sort'], 
                    order: order as 'asc' | 'desc' 
                  });
                }}
                className="w-44"
              />
            </div>
            
            {/* Mobile Filter Toggle */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
              icon={<SlidersHorizontal className="w-4 h-4" />}
            >
              Filters
            </Button>
            
            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                icon={<X className="w-4 h-4" />}
              >
                Clear
              </Button>
            )}
          </div>
          
          {/* Mobile Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-olive-800 rounded-lg border border-olive-600 md:hidden space-y-4">
              <Select
                label="Brand"
                options={[
                  { value: '', label: 'All Brands' },
                  ...(brands?.map((b) => ({ value: b, label: b })) || []),
                ]}
                value={filters.brand || ''}
                onChange={(e) => setFilters({ ...filters, brand: e.target.value || undefined })}
              />
              
              <Select
                label="Shaft Type"
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'straight', label: 'Straight' },
                  { value: 'tapered', label: 'Tapered' },
                  { value: 'threaded', label: 'Threaded' },
                ]}
                value={filters.shaft_type || ''}
                onChange={(e) => setFilters({ ...filters, shaft_type: (e.target.value || undefined) as ShaftType })}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Min HP"
                  type="number"
                  placeholder="0"
                  value={filters.min_hp || ''}
                  onChange={(e) => setFilters({ ...filters, min_hp: Number(e.target.value) || undefined })}
                />
                <Input
                  label="Max HP"
                  type="number"
                  placeholder="50"
                  value={filters.max_hp || ''}
                  onChange={(e) => setFilters({ ...filters, max_hp: Number(e.target.value) || undefined })}
                />
              </div>
              
              <Select
                label="Sort By"
                options={[
                  { value: 'horsepower-desc', label: 'HP: High to Low' },
                  { value: 'horsepower-asc', label: 'HP: Low to High' },
                  { value: 'price-asc', label: 'Price: Low to High' },
                  { value: 'price-desc', label: 'Price: High to Low' },
                ]}
                value={`${filters.sort}-${filters.order}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  setFilters({ 
                    ...filters, 
                    sort: sort as EngineFilters['sort'], 
                    order: order as 'asc' | 'desc' 
                  });
                }}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-cream-400">
            {isLoading ? (
              'Loading engines...'
            ) : (
              <>
                Showing <span className="text-cream-100 font-medium">{startIndex + 1}-{Math.min(endIndex, totalItems)}</span> of <span className="text-cream-100 font-medium">{totalItems}</span> engines
              </>
            )}
          </p>
          
          {selectedEngine && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-full">
              <span className="text-sm text-orange-400">
                Selected: {selectedEngine.brand} {selectedEngine.name}
              </span>
              <button
                onClick={() => setEngine(null)}
                className="p-0.5 hover:bg-orange-500/20 rounded"
              >
                <X className="w-3.5 h-3.5 text-orange-400" />
              </button>
            </div>
          )}
        </div>
        
        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto bg-olive-800 border border-olive-600 rounded-lg p-6">
              <p className="text-orange-400 text-lg font-semibold mb-2">Failed to load engines</p>
              <p className="text-cream-400 text-sm mb-4">
                {error instanceof Error ? error.message : 'An error occurred while loading engines'}
              </p>
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </div>
        )}
        
        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <EngineCardSkeleton key={i} />
            ))}
          </div>
        )}
        
        {/* Empty State */}
        {!isLoading && filteredEngines.length === 0 && (
          <div className="text-center py-16">
            <Image
              src="/ui/ui-empty-no-results-v1.svg"
              alt="No engines found"
              width={300}
              height={200}
              className="mx-auto mb-6"
            />
            <h3 className="text-xl text-cream-100 mb-2">No Engines Found</h3>
            <p className="text-cream-400 mb-4">Try adjusting your filters or search query.</p>
            <Button variant="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
        
        {/* Engine Grid */}
        {!isLoading && paginatedEngines && paginatedEngines.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {paginatedEngines.map((engine) => (
                <EngineCard
                  key={engine.id}
                  engine={engine}
                  onAddToBuild={handleAddToBuild}
                  isSelected={selectedEngine?.id === engine.id}
                />
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                  onNext={nextPage}
                  onPrev={prevPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
