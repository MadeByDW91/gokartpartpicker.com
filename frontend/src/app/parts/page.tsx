'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useParts, usePartBrands } from '@/hooks/use-parts';
import { useBuildStore } from '@/store/build-store';
import { PartCard } from '@/components/PartCard';
import { PartCardSkeleton } from '@/components/ui/Skeleton';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { TemplateQuickAccess } from '@/components/parts/TemplateQuickAccess';
import { usePagination } from '@/hooks/use-pagination';
import { Package, Search, SlidersHorizontal, X, Grid, List, Filter, Loader2 } from 'lucide-react';
import { PART_CATEGORIES, type PartCategory, type PartFilters, type Part } from '@/types/database';
import { getCategoryLabel, cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

function PartsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') as PartCategory | null;
  
  const [filters, setFilters] = useState<PartFilters>({
    category: initialCategory || undefined,
    sort: 'created_at',
    order: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { data: parts, isLoading, error } = useParts(filters);
  const { data: brands } = usePartBrands(filters.category);
  const { selectedParts, setPart } = useBuildStore();
  
  // Update URL when category changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category) {
      params.set('category', filters.category);
    }
    const newUrl = params.toString() ? `/parts?${params.toString()}` : '/parts';
    router.replace(newUrl, { scroll: false });
  }, [filters.category, router]);
  
  // Filter by search query locally
  const filteredParts = useMemo(() => {
    if (!parts) return [];
    return parts.filter((part) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        part.name.toLowerCase().includes(query) ||
        part.brand?.toLowerCase().includes(query) ||
        getCategoryLabel(part.category).toLowerCase().includes(query)
      );
    });
  }, [parts, searchQuery]);

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedParts,
    goToPage,
    nextPage,
    prevPage,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination(filteredParts, { itemsPerPage: 24 });
  
  const handleAddToBuild = (part: Part) => {
    const currentPart = selectedParts.get(part.category);
    if (currentPart?.id === part.id) {
      setPart(part.category, null);
    } else {
      setPart(part.category, part);
    }
  };
  
  const clearFilters = () => {
    setFilters({ sort: 'created_at', order: 'desc' });
    setSearchQuery('');
  };
  
  const hasActiveFilters = filters.brand || filters.min_price || filters.max_price;
  
  return (
    <div className="min-h-screen bg-olive-900">
      {/* Header */}
      <div className="bg-olive-800 border-b border-olive-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-8 h-8 text-orange-400" />
            <h1 className="text-display text-3xl sm:text-4xl text-cream-100">
              Parts
            </h1>
          </div>
          <p className="text-cream-400 max-w-2xl">
            Find the ultimate parts for your go-kart build. Filter by category to find what you need.
          </p>
        </div>
      </div>
      
      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Categories */}
          <aside className={cn(
            'w-64 flex-shrink-0 transition-all duration-300',
            'hidden lg:block',
            !showSidebar && 'lg:hidden'
          )}>
            <div className="sticky top-20 bg-olive-800 rounded-lg border border-olive-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-cream-100 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-orange-400" />
                  Categories
                </h2>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="lg:hidden text-cream-400 hover:text-cream-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <nav className="space-y-1">
                <button
                  onClick={() => setFilters({ ...filters, category: undefined })}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    !filters.category
                      ? 'bg-orange-500 text-cream-100'
                      : 'text-cream-400 hover:text-cream-100 hover:bg-olive-700'
                  )}
                >
                  All Parts
                </button>
                {PART_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setFilters({ ...filters, category })}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      filters.category === category
                        ? 'bg-orange-500 text-cream-100'
                        : 'text-cream-400 hover:text-cream-100 hover:bg-olive-700'
                    )}
                  >
                    {getCategoryLabel(category)}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Filters Bar */}
            <div className="sticky top-16 z-30 bg-olive-900/95 backdrop-blur-sm border-b border-olive-700 mb-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Categories - opens mobile drawer, 44px touch target */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="lg:hidden min-h-[44px] touch-manipulation"
                  icon={<Filter className="w-4 h-4" />}
                >
                  Categories
                </Button>

                {/* Search */}
                <div className="flex-1 min-w-[200px] max-w-md">
                  <Input
                    placeholder="Search parts..."
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
                      { value: 'created_at-desc', label: 'Newest First' },
                      { value: 'price-asc', label: 'Price: Low to High' },
                      { value: 'price-desc', label: 'Price: High to Low' },
                      { value: 'name-asc', label: 'Name: A to Z' },
                    ]}
                    value={`${filters.sort}-${filters.order}`}
                    onChange={(e) => {
                      const [sort, order] = e.target.value.split('-');
                      setFilters({ ...filters, sort, order: order as 'asc' | 'desc' });
                    }}
                    className="w-44"
                  />
                </div>
                
                {/* View Mode Toggle */}
                <div className="hidden sm:flex items-center bg-olive-800 rounded-md p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-2 rounded transition-colors',
                      viewMode === 'grid' ? 'bg-olive-700 text-orange-400' : 'text-cream-400 hover:text-cream-100'
                    )}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'p-2 rounded transition-colors',
                      viewMode === 'list' ? 'bg-olive-700 text-orange-400' : 'text-cream-400 hover:text-cream-100'
                    )}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Mobile Filter Toggle - 44px touch target */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden min-h-[44px] touch-manipulation"
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
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Min Price"
                      type="number"
                      placeholder="$0"
                      value={filters.min_price || ''}
                      onChange={(e) => setFilters({ ...filters, min_price: Number(e.target.value) || undefined })}
                    />
                    <Input
                      label="Max Price"
                      type="number"
                      placeholder="$1000"
                      value={filters.max_price || ''}
                      onChange={(e) => setFilters({ ...filters, max_price: Number(e.target.value) || undefined })}
                    />
                  </div>
                  
                  <Select
                    label="Sort By"
                    options={[
                      { value: 'created_at-desc', label: 'Newest First' },
                      { value: 'price-asc', label: 'Price: Low to High' },
                      { value: 'price-desc', label: 'Price: High to Low' },
                    ]}
                    value={`${filters.sort}-${filters.order}`}
                    onChange={(e) => {
                      const [sort, order] = e.target.value.split('-');
                      setFilters({ ...filters, sort, order: order as 'asc' | 'desc' });
                    }}
                  />
                </div>
              )}
            </div>

            {/* Mobile Categories Drawer - 44px touch targets, closes on backdrop or category select */}
            {showSidebar && (
              <div className="lg:hidden fixed inset-0 z-50 flex" aria-modal="true" role="dialog" aria-label="Parts categories">
                <div 
                  className="flex-1 bg-olive-900/80 backdrop-blur-sm touch-manipulation"
                  onClick={() => setShowSidebar(false)}
                  aria-hidden="true"
                />
                <aside className="w-72 max-w-[85vw] bg-olive-800 border-l border-olive-700 p-4 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-cream-100 flex items-center gap-2">
                      <Filter className="w-5 h-5 text-orange-400" />
                      Categories
                    </h2>
                    <button
                      onClick={() => setShowSidebar(false)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-cream-400 hover:text-cream-100 hover:bg-olive-700 rounded-md touch-manipulation"
                      aria-label="Close categories"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <nav className="space-y-1">
                    <button
                      onClick={() => {
                        setFilters({ ...filters, category: undefined });
                        setShowSidebar(false);
                      }}
                      className={cn(
                        'w-full text-left px-4 py-3 min-h-[44px] flex items-center text-sm font-medium rounded-md transition-colors touch-manipulation',
                        !filters.category
                          ? 'bg-orange-500 text-cream-100'
                          : 'text-cream-400 hover:text-cream-100 hover:bg-olive-700 active:bg-olive-600'
                      )}
                    >
                      All Parts
                    </button>
                    {PART_CATEGORIES.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setFilters({ ...filters, category });
                          setShowSidebar(false);
                        }}
                        className={cn(
                          'w-full text-left px-4 py-3 min-h-[44px] flex items-center text-sm font-medium rounded-md transition-colors touch-manipulation',
                          filters.category === category
                            ? 'bg-orange-500 text-cream-100'
                            : 'text-cream-400 hover:text-cream-100 hover:bg-olive-700 active:bg-olive-600'
                        )}
                      >
                        {getCategoryLabel(category)}
                      </button>
                    ))}
                  </nav>
                </aside>
              </div>
            )}
            
            {/* Template Quick Access */}
            <TemplateQuickAccess />
            
            {/* Results */}
            {/* Results Count & Selected Parts */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <p className="text-sm text-cream-400">
            {isLoading ? (
              'Loading parts...'
            ) : (
              <>
                Showing <span className="text-cream-100 font-medium">{startIndex + 1}-{Math.min(endIndex, totalItems)}</span> of <span className="text-cream-100 font-medium">{totalItems}</span> parts
                {filters.category && (
                  <> in <span className="text-orange-400">{getCategoryLabel(filters.category)}</span></>
                )}
              </>
            )}
          </p>
          
          {selectedParts.size > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-cream-400">Selected:</span>
              {Array.from(selectedParts.entries()).map(([category, part]) => (
                <Badge 
                  key={category} 
                  variant="success"
                  className="cursor-pointer"
                  onClick={() => setPart(category, null)}
                >
                  {getCategoryLabel(category)}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </div>
        
            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-[var(--error)]">Failed to load parts. Please try again.</p>
              </div>
            )}
            
            {/* Loading State */}
            {isLoading && (
              <div className={cn(
                'gap-6',
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'flex flex-col'
              )}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <PartCardSkeleton key={i} />
                ))}
              </div>
            )}
            
            {/* Empty State */}
            {!isLoading && filteredParts.length === 0 && (
              <div className="text-center py-16">
                <Image
                  src="/ui/ui-empty-no-results-v1.svg"
                  alt="No parts found"
                  width={300}
                  height={200}
                  className="mx-auto mb-6"
                />
                <h3 className="text-xl text-cream-100 mb-2">No Parts Found</h3>
                <p className="text-cream-400 mb-4">Try adjusting your filters or search query.</p>
                <Button variant="secondary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
            
            {/* Parts Grid/List */}
            {!isLoading && paginatedParts && paginatedParts.length > 0 && (
              <>
                <div className={cn(
                  'gap-6 stagger-children',
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'flex flex-col'
                )}>
                  {paginatedParts.map((part) => (
                    <PartCard
                      key={part.id}
                      part={part}
                      onAddToBuild={handleAddToBuild}
                      isSelected={selectedParts.get(part.category)?.id === part.id}
                      compact={viewMode === 'list'}
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
      </div>
    </div>
  );
}

export default function PartsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-olive-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    }>
      <PartsPageContent />
    </Suspense>
  );
}
