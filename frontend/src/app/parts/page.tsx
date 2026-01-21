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
      {/* Header - Mobile Optimized */}
      <div className="bg-olive-800 border-b border-olive-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400 flex-shrink-0" />
            <h1 className="text-display text-2xl sm:text-3xl lg:text-4xl text-cream-100">
              Parts
            </h1>
          </div>
          <p className="text-sm sm:text-base text-cream-400 max-w-2xl">
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
            {/* Filters Bar - Mobile Optimized */}
            <div className="sticky top-14 sm:top-16 z-30 bg-olive-900/95 backdrop-blur-sm border-b border-olive-700 mb-6 -mx-4 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
              {/* Mobile Layout: Top Row - Search Full Width */}
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
                {/* Search - Full width on mobile */}
                <div className="flex-1 w-full lg:min-w-[200px] lg:max-w-md">
                  <Input
                    placeholder="Search parts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={<Search className="w-4 h-4" />}
                  />
                </div>
                
                {/* Mobile Action Buttons Row - Compact & Professional */}
                <div className="flex items-center gap-2 lg:hidden">
                  {/* Categories Button */}
                  <Button
                    variant={filters.category ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="flex-1 min-h-[44px] touch-manipulation justify-center"
                    icon={<Filter className="w-4 h-4" />}
                  >
                    <span className="hidden min-[380px]:inline">
                      {filters.category ? getCategoryLabel(filters.category) : 'Categories'}
                    </span>
                    <span className="min-[380px]:hidden">Filter</span>
                  </Button>
                  
                  {/* Filters/Advanced Button */}
                  <Button
                    variant={hasActiveFilters ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex-1 min-h-[44px] touch-manipulation justify-center"
                    icon={<SlidersHorizontal className="w-4 h-4" />}
                  >
                    Filters
                  </Button>
                  
                  {/* View Toggle - Compact Icon Only */}
                  <div className="flex items-center bg-olive-800 rounded-md p-0.5 border border-olive-600">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        'p-2 rounded transition-colors touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center',
                        viewMode === 'grid' ? 'bg-olive-700 text-orange-400' : 'text-cream-400 hover:text-cream-100'
                      )}
                      aria-label="Grid view"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn(
                        'p-2 rounded transition-colors touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center',
                        viewMode === 'list' ? 'bg-olive-700 text-orange-400' : 'text-cream-400 hover:text-cream-100'
                      )}
                      aria-label="List view"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Desktop Layout: Filters Row */}
                <div className="hidden lg:flex items-center gap-3">
                  {/* Categories - Hidden on mobile (using drawer) */}
                  <Button
                    variant={filters.category ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="min-h-[44px]"
                    icon={<Filter className="w-4 h-4" />}
                  >
                    {filters.category ? getCategoryLabel(filters.category) : 'Categories'}
                  </Button>
                  
                  {/* Quick Filters */}
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
                  
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-olive-800 rounded-md p-1 border border-olive-600">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        'p-2 rounded transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center',
                        viewMode === 'grid' ? 'bg-olive-700 text-orange-400' : 'text-cream-400 hover:text-cream-100'
                      )}
                      aria-label="Grid view"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn(
                        'p-2 rounded transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center',
                        viewMode === 'list' ? 'bg-olive-700 text-orange-400' : 'text-cream-400 hover:text-cream-100'
                      )}
                      aria-label="List view"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      icon={<X className="w-4 h-4" />}
                      className="min-h-[44px]"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Active Filters Display - Mobile */}
              {(filters.category || hasActiveFilters || searchQuery) && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {filters.category && (
                    <Badge variant="success" className="gap-1.5">
                      {getCategoryLabel(filters.category)}
                      <button
                        onClick={() => setFilters({ ...filters, category: undefined })}
                        className="hover:opacity-70 transition-opacity"
                        aria-label={`Remove ${getCategoryLabel(filters.category)} filter`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="default" className="gap-1.5">
                      Search: {searchQuery}
                      <button
                        onClick={() => setSearchQuery('')}
                        className="hover:opacity-70 transition-opacity"
                        aria-label="Clear search"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-orange-400 hover:text-orange-300 underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              )}
              
              {/* Mobile Filters Panel - Slide Down Animation */}
              {showFilters && (
                <div className="mt-3 lg:hidden transition-all duration-200">
                  <div className="bg-olive-800 rounded-lg border border-olive-600 p-4 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-cream-100">Filter Options</h3>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="text-cream-400 hover:text-cream-100 transition-colors p-1"
                        aria-label="Close filters"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <Select
                      label="Brand"
                      options={[
                        { value: '', label: 'All Brands' },
                        ...(brands?.map((b) => ({ value: b, label: b })) || []),
                      ]}
                      value={filters.brand || ''}
                      onChange={(e) => setFilters({ ...filters, brand: e.target.value || undefined })}
                    />
                    
                    <div className="grid grid-cols-2 gap-3">
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
                        { value: 'name-asc', label: 'Name: A to Z' },
                      ]}
                      value={`${filters.sort}-${filters.order}`}
                      onChange={(e) => {
                        const [sort, order] = e.target.value.split('-');
                        setFilters({ ...filters, sort, order: order as 'asc' | 'desc' });
                      }}
                    />
                    
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="w-full mt-2"
                        icon={<X className="w-4 h-4" />}
                      >
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Categories Drawer - Professional Slide-in */}
            {showSidebar && (
              <div className="lg:hidden fixed inset-0 z-50 flex" aria-modal="true" role="dialog" aria-label="Parts categories">
                {/* Backdrop */}
                <div 
                  className="flex-1 bg-black/60 backdrop-blur-sm touch-manipulation transition-opacity duration-200"
                  onClick={() => setShowSidebar(false)}
                  aria-hidden="true"
                />
                {/* Drawer Panel */}
                <aside className="w-80 max-w-[90vw] bg-olive-800 border-l border-olive-700 shadow-xl transform transition-transform duration-300 ease-out">
                  {/* Header */}
                  <div className="sticky top-0 bg-olive-800 border-b border-olive-700 p-4 flex items-center justify-between z-10">
                    <h2 className="text-lg font-semibold text-cream-100 flex items-center gap-2">
                      <Filter className="w-5 h-5 text-orange-400" />
                      Categories
                    </h2>
                    <button
                      onClick={() => setShowSidebar(false)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-cream-400 hover:text-cream-100 hover:bg-olive-700 rounded-md touch-manipulation transition-colors"
                      aria-label="Close categories"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Categories List */}
                  <nav className="p-4 space-y-1 overflow-y-auto safe-area-bottom">
                    <button
                      onClick={() => {
                        setFilters({ ...filters, category: undefined });
                        setShowSidebar(false);
                      }}
                      className={cn(
                        'w-full text-left px-4 py-3 min-h-[48px] flex items-center text-sm font-medium rounded-lg transition-all touch-manipulation',
                        !filters.category
                          ? 'bg-orange-500 text-cream-100 shadow-md'
                          : 'text-cream-400 hover:text-cream-100 hover:bg-olive-700 active:bg-olive-600'
                      )}
                    >
                      <span className="font-semibold">All Parts</span>
                    </button>
                    {PART_CATEGORIES.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setFilters({ ...filters, category });
                          setShowSidebar(false);
                        }}
                        className={cn(
                          'w-full text-left px-4 py-3 min-h-[48px] flex items-center text-sm font-medium rounded-lg transition-all touch-manipulation',
                          filters.category === category
                            ? 'bg-orange-500 text-cream-100 shadow-md'
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
