'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { PartsTableView } from '@/components/parts/PartsTableView';
import { PageHero } from '@/components/layout/PageHero';
import { BuilderInsights } from '@/components/builder/BuilderInsights';
import { usePagination } from '@/hooks/use-pagination';
import { useSwipe } from '@/hooks/use-swipe';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { Package, Search, SlidersHorizontal, X, Grid, List, Filter, Loader2, ChevronDown, ChevronRight, Cog, Battery } from 'lucide-react';
import { PART_CATEGORIES, type PartCategory, type PartFilters, type Part, type PowerSourceType } from '@/types/database';
import { getCategoryLabel, getPartBrandDisplay, cn, CATEGORY_GROUPS, GAS_ONLY_CATEGORIES, ELECTRIC_ONLY_CATEGORIES, isCategoryCompatibleWithPowerSource } from '@/lib/utils';
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
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [powerSourceFilter, setPowerSourceFilter] = useState<'all' | PowerSourceType>('all');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['drivetrain', 'chassis', 'engine']));
  
  const { data: parts, isLoading, error, refetch } = useParts(filters);
  const { data: brands } = usePartBrands(filters.category);
  const { selectedParts, setPart, selectedEngine, selectedMotor, powerSourceType } = useBuildStore();
  
  // Update URL when category changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category) {
      params.set('category', filters.category);
    }
    const newUrl = params.toString() ? `/parts?${params.toString()}` : '/parts';
    router.replace(newUrl, { scroll: false });
  }, [filters.category, router]);
  
  // Filter by search query and power source locally
  const filteredParts = useMemo(() => {
    if (!parts) return [];
    return parts.filter((part) => {
      // Filter by power source compatibility
      if (powerSourceFilter !== 'all') {
        if (!isCategoryCompatibleWithPowerSource(part.category, powerSourceFilter)) {
          return false;
        }
      }
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          part.name.toLowerCase().includes(query) ||
          getPartBrandDisplay(part.brand).toLowerCase().includes(query) ||
          getCategoryLabel(part.category).toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [parts, searchQuery, powerSourceFilter]);

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
    hasNextPage,
  } = usePagination(filteredParts, { itemsPerPage: 24 });

  // Infinite scroll for mobile (auto-loads more when scrolling near bottom)
  const loadMoreItems = () => {
    if (hasNextPage && !isLoading) {
      nextPage();
    }
  };

  const { observerTarget: infiniteScrollTarget, isFetching: isLoadingMore } = useInfiniteScroll({
    hasNextPage: hasNextPage,
    fetchNextPage: loadMoreItems,
    enabled: true,
    threshold: 300,
  });

  // Pull to refresh
  const handleRefresh = async () => {
    await refetch();
  };

  const { isPulling, isRefreshing, pullDistance, pullProgress } = usePullToRefresh({
    onRefresh: handleRefresh,
    enabled: true,
    threshold: 80,
  });

  // Swipe left to close categories drawer
  const { ref: drawerSwipeRef } = useSwipe({
    onSwipeLeft: () => {
      if (showSidebar && window.innerWidth < 1024) {
        setShowSidebar(false);
      }
    },
    threshold: 100,
  });
  
  const handleAddToBuild = (part: Part) => {
    const partsArray = selectedParts.get(part.category) || [];
    const isSelected = partsArray.some(p => p.id === part.id);
    if (isSelected) {
      const { removePart } = useBuildStore.getState();
      removePart(part.category, part.id);
    } else {
      const { addPart } = useBuildStore.getState();
      addPart(part.category, part);
    }
  };
  
  const clearFilters = () => {
    setFilters({ sort: 'created_at', order: 'desc' });
    setSearchQuery('');
    setPowerSourceFilter('all');
  };
  
  const hasActiveFilters = filters.brand || filters.min_price || filters.max_price || powerSourceFilter !== 'all';
  
  return (
    <div className="min-h-screen bg-olive-900">
      <PageHero
        eyebrow="Catalog"
        icon={<Package className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />}
        title="Parts"
        subtitle="Find the perfect parts for your go-kart build."
        rightSlot={
          <>
            <span className="flex items-center gap-1.5">
              <Cog className="h-4 w-4 text-orange-500/80" aria-hidden />
              Gas & electric
            </span>
            <span className="flex items-center gap-1.5">
              <Package className="h-4 w-4 text-orange-500/80" aria-hidden />
              Compatibility checked
            </span>
          </>
        }
      />
      
      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Builder Insights */}
        {!isLoading && (
          <div className="mb-8">
            <BuilderInsights
              variant="builder-page"
            />
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar - Categories: desktop only; on mobile use the drawer (Categories button) */}
          <aside className={cn(
            'w-64 flex-shrink-0 transition-all duration-300',
            'hidden lg:block'
          )}>
            <div className="sticky top-24 bg-olive-800/50 rounded-xl border border-olive-700/50 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-cream-100 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-orange-400" />
                  Categories
                </h2>
              </div>
              
              <nav className="space-y-1">
                {/* All Parts Button */}
                <button
                  onClick={() => setFilters({ ...filters, category: undefined })}
                  className={cn(
                    'w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-colors mb-2',
                    !filters.category
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'text-cream-300 hover:text-cream-100 hover:bg-olive-700/50'
                  )}
                >
                  All Parts
                </button>

                {/* Category Groups with Expandable Subcategories */}
                {CATEGORY_GROUPS.map((group) => {
                  // Filter categories based on power source
                  const compatibleCategories = group.categories.filter((cat) => {
                    if (powerSourceFilter === 'all') return true;
                    return isCategoryCompatibleWithPowerSource(cat as PartCategory, powerSourceFilter);
                  });
                  
                  // Skip this group if no compatible categories
                  if (compatibleCategories.length === 0) return null;
                  
                  const isExpanded = expandedGroups.has(group.id);
                  const hasActiveCategory = filters.category && compatibleCategories.includes(filters.category);
                  
                  return (
                    <div key={group.id} className="mb-1">
                      {/* Group Header - Clickable to expand/collapse */}
                      <button
                        onClick={() => {
                          const newExpanded = new Set(expandedGroups);
                          if (isExpanded) {
                            newExpanded.delete(group.id);
                          } else {
                            newExpanded.add(group.id);
                          }
                          setExpandedGroups(newExpanded);
                        }}
                        className={cn(
                          'w-full text-left px-3 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center justify-between',
                          hasActiveCategory
                            ? 'text-orange-400 bg-orange-500/10'
                            : 'text-cream-200 hover:text-cream-100 hover:bg-olive-700/50'
                        )}
                      >
                        <span>{group.label}</span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 flex-shrink-0" />
                        )}
                      </button>
                      
                      {/* Subcategories - Expandable */}
                      {isExpanded && (
                        <div className="ml-4 mt-1 space-y-0.5 border-l border-olive-700/50 pl-2">
                          {compatibleCategories.map((category) => (
                            <button
                              key={category}
                              onClick={() => setFilters({ ...filters, category: category as PartCategory })}
                              className={cn(
                                'w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors',
                                filters.category === category
                                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                  : 'text-cream-400 hover:text-cream-200 hover:bg-olive-700/30'
                              )}
                            >
                              {getCategoryLabel(category)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* EV Category Group - Only show if power source filter allows EV parts */}
                {(() => {
                  if (powerSourceFilter === 'gas') return null; // Hide EV group for gas-only filter
                  
                  const evGroup = CATEGORY_GROUPS.find(g => g.id === 'ev_system');
                  if (!evGroup) return null;
                  
                  // Filter categories based on power source
                  const compatibleCategories = evGroup.categories.filter((cat) => {
                    if (powerSourceFilter === 'all') return true;
                    return isCategoryCompatibleWithPowerSource(cat as PartCategory, powerSourceFilter);
                  });
                  
                  if (compatibleCategories.length === 0) return null;
                  
                  const isExpanded = expandedGroups.has('ev_system');
                  const hasActiveCategory = filters.category && compatibleCategories.includes(filters.category);
                  
                  return (
                    <div className="mb-1 mt-2 pt-2 border-t border-olive-700/50">
                      <button
                        onClick={() => {
                          const newExpanded = new Set(expandedGroups);
                          if (isExpanded) {
                            newExpanded.delete('ev_system');
                          } else {
                            newExpanded.add('ev_system');
                          }
                          setExpandedGroups(newExpanded);
                        }}
                        className={cn(
                          'w-full text-left px-3 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center justify-between',
                          hasActiveCategory
                            ? 'text-orange-400 bg-orange-500/10'
                            : 'text-cream-200 hover:text-cream-100 hover:bg-olive-700/50'
                        )}
                      >
                        <span>{evGroup.label}</span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 flex-shrink-0" />
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="ml-4 mt-1 space-y-0.5 border-l border-olive-700/50 pl-2">
                          {compatibleCategories.map((category) => (
                            <button
                              key={category}
                              onClick={() => setFilters({ ...filters, category: category as PartCategory })}
                              className={cn(
                                'w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors',
                                filters.category === category
                                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                  : 'text-cream-400 hover:text-cream-200 hover:bg-olive-700/30'
                              )}
                            >
                              {getCategoryLabel(category)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Standalone categories not in any group */}
                {(() => {
                  const groupedCategories = new Set(
                    CATEGORY_GROUPS.flatMap(g => g.categories)
                  );
                  
                  const standalone = PART_CATEGORIES.filter(
                    cat => !groupedCategories.has(cat)
                  ).filter((category) => {
                    // Filter by power source compatibility
                    if (powerSourceFilter === 'all') return true;
                    return isCategoryCompatibleWithPowerSource(category, powerSourceFilter);
                  });
                  
                  if (standalone.length === 0) return null;
                  
                  return (
                    <div className="mt-2 pt-2 border-t border-olive-700/50 space-y-0.5">
                      {standalone.map((category) => (
                        <button
                          key={category}
                          onClick={() => setFilters({ ...filters, category })}
                          className={cn(
                            'w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors',
                            filters.category === category
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              : 'text-cream-400 hover:text-cream-200 hover:bg-olive-700/30'
                          )}
                        >
                          {getCategoryLabel(category)}
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Filters Bar - Cleaner */}
            <div className="sticky top-16 sm:top-18 z-30 bg-olive-900/95 backdrop-blur-sm border-b border-olive-700/50 mb-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
              {/* Mobile Layout: Top Row - Search Full Width */}
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-4">
                {/* Search - Full width on mobile */}
                <div className="flex-1 w-full lg:min-w-[200px] lg:max-w-md">
                  <Input
                    placeholder="Search parts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={<Search className="w-4 h-4" />}
                  />
                </div>
                
                {/* Power Source Selector */}
                <div className="flex items-center gap-2 bg-olive-800/50 rounded-lg p-1 border border-olive-700/50">
                  <button
                    onClick={() => setPowerSourceFilter('all')}
                    className={cn(
                      'px-3 py-2 text-sm font-medium rounded-md transition-colors touch-manipulation min-h-[44px] flex items-center justify-center gap-1.5',
                      powerSourceFilter === 'all'
                        ? 'bg-olive-700 text-orange-400'
                        : 'text-cream-400 hover:text-cream-100 active:bg-olive-600'
                    )}
                    aria-label="All parts"
                  >
                    <span className="hidden sm:inline">All</span>
                    <span className="sm:hidden">All</span>
                  </button>
                  <button
                    onClick={() => setPowerSourceFilter('gas')}
                    className={cn(
                      'px-3 py-2 text-sm font-medium rounded-md transition-colors touch-manipulation min-h-[44px] flex items-center justify-center gap-1.5',
                      powerSourceFilter === 'gas'
                        ? 'bg-olive-700 text-orange-400'
                        : 'text-cream-400 hover:text-cream-100 active:bg-olive-600'
                    )}
                    aria-label="Gas engine parts"
                  >
                    <Cog className="w-4 h-4" />
                    <span className="hidden sm:inline">Gas</span>
                  </button>
                  <button
                    onClick={() => setPowerSourceFilter('electric')}
                    className={cn(
                      'px-3 py-2 text-sm font-medium rounded-md transition-colors touch-manipulation min-h-[44px] flex items-center justify-center gap-1.5',
                      powerSourceFilter === 'electric'
                        ? 'bg-olive-700 text-orange-400'
                        : 'text-cream-400 hover:text-cream-100 active:bg-olive-600'
                    )}
                    aria-label="Electric motor parts"
                  >
                    <Battery className="w-4 h-4" />
                    <span className="hidden sm:inline">EV</span>
                  </button>
                </div>
                
                {/* Mobile: scrollable row so nothing is cut off */}
                <div className="lg:hidden overflow-x-auto overflow-y-hidden -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex items-center gap-2 flex-nowrap w-max min-w-full pb-1">
                    <Button
                      variant={filters.category ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setShowSidebar(!showSidebar)}
                      className="flex-shrink-0 min-h-[44px] touch-manipulation"
                      icon={<Filter className="w-4 h-4" />}
                    >
                      {filters.category ? getCategoryLabel(filters.category) : 'Category'}
                    </Button>
                    <Button
                      variant={hasActiveFilters ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex-shrink-0 min-h-[44px] touch-manipulation"
                      icon={<SlidersHorizontal className="w-4 h-4" />}
                    >
                      Filters
                    </Button>
                    <div className="flex items-center bg-olive-800/50 rounded-lg p-1 border border-olive-700/50 flex-shrink-0">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={cn(
                          'p-2 rounded min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation',
                          viewMode === 'grid' ? 'bg-olive-700 text-orange-400' : 'text-cream-400 hover:text-cream-100 active:bg-olive-600'
                        )}
                        aria-label="Grid view"
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                          'p-2 rounded min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation',
                          viewMode === 'list' ? 'bg-olive-700 text-orange-400' : 'text-cream-400 hover:text-cream-100 active:bg-olive-600'
                        )}
                        aria-label="List view"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
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
                  <div className="flex items-center bg-olive-800/50 rounded-lg p-1 border border-olive-700/50">
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
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {filters.category && (
                    <Badge variant="success" className="gap-1.5">
                      {getCategoryLabel(filters.category)}
                      <button
                        onClick={() => setFilters({ ...filters, category: undefined })}
                        className="hover:opacity-70 transition-opacity min-w-[20px] min-h-[20px] flex items-center justify-center touch-manipulation"
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
                        className="hover:opacity-70 transition-opacity min-w-[20px] min-h-[20px] flex items-center justify-center touch-manipulation"
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

            {/* Mobile Categories - Bottom sheet with chip grid for easier tapping */}
            {showSidebar && (
              <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end" aria-modal="true" role="dialog" aria-label="Choose category">
                <div
                  className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                  onClick={() => setShowSidebar(false)}
                  aria-hidden="true"
                />
                <div
                  ref={drawerSwipeRef as React.RefObject<HTMLDivElement>}
                  className="relative bg-olive-900 border-t border-olive-700 rounded-t-2xl shadow-[0_-8px_32px_rgba(0,0,0,0.4)] max-h-[70vh] flex flex-col safe-area-bottom"
                >
                  <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                    <div className="w-10 h-1 rounded-full bg-olive-600" aria-hidden />
                  </div>
                  <div className="px-4 pb-6 pt-2 flex flex-col flex-1 min-h-0">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-semibold text-cream-100">Choose category</h2>
                      <button
                        onClick={() => setShowSidebar(false)}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-cream-400 hover:text-cream-100 rounded-lg touch-manipulation"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <nav className="overflow-y-auto flex-1 -mx-1" aria-label="Part categories">
                      <button
                        onClick={() => {
                          setFilters({ ...filters, category: undefined });
                          setShowSidebar(false);
                        }}
                        className={cn(
                          'w-full text-center py-2.5 px-3 rounded-xl text-sm font-medium transition-colors touch-manipulation mb-3',
                          !filters.category
                            ? 'bg-orange-500 text-cream-100'
                            : 'bg-olive-800 text-cream-200 hover:bg-olive-700 active:bg-olive-600'
                        )}
                      >
                        All Parts
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        {PART_CATEGORIES.map((category) => (
                          <button
                            key={category}
                            onClick={() => {
                              setFilters({ ...filters, category });
                              setShowSidebar(false);
                            }}
                            className={cn(
                              'py-2.5 px-3 rounded-xl text-sm font-medium text-left transition-colors touch-manipulation min-h-[44px]',
                              filters.category === category
                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                                : 'bg-olive-800/80 text-cream-200 hover:bg-olive-700 border border-transparent active:bg-olive-700'
                            )}
                          >
                            {getCategoryLabel(category)}
                          </button>
                        ))}
                      </div>
                    </nav>
                  </div>
                </div>
              </div>
            )}
            
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
            
            {/* Pull-to-Refresh Indicator */}
            {(isPulling || isRefreshing) && (
              <div 
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-4 bg-olive-900/95 backdrop-blur-sm transition-transform duration-200"
                style={{
                  transform: isPulling ? `translateY(${Math.min(pullDistance, 80)}px)` : 'translateY(0)',
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  {isRefreshing ? (
                    <>
                      <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
                      <span className="text-sm text-cream-300">Refreshing...</span>
                    </>
                  ) : (
                    <>
                      <div 
                        className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full transition-transform"
                        style={{
                          transform: `rotate(${pullProgress * 360}deg)`,
                        }}
                      />
                      <span className="text-sm text-cream-400">
                        {pullProgress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Parts Grid/List */}
            {!isLoading && paginatedParts && paginatedParts.length > 0 && (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-children items-stretch">
                    {paginatedParts.map((part) => (
                      <PartCard
                        key={part.id}
                        part={part}
                        onAddToBuild={handleAddToBuild}
                        isSelected={(selectedParts.get(part.category) || []).some(p => p.id === part.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-olive-800 rounded-lg border border-olive-600 overflow-hidden">
                    <PartsTableView
                      parts={paginatedParts}
                      onAddToBuild={handleAddToBuild}
                      selectedParts={selectedParts}
                      sortBy={filters.sort}
                      sortOrder={filters.order}
                      onSort={(field) => {
                        const newOrder = filters.sort === field && filters.order === 'asc' ? 'desc' : 'asc';
                        setFilters({ ...filters, sort: field, order: newOrder });
                      }}
                    />
                  </div>
                )}
                
                {/* Infinite Scroll Trigger */}
                {hasNextPage && (
                  <div ref={infiniteScrollTarget as React.RefObject<HTMLDivElement>} className="py-8">
                    {isLoadingMore && (
                      <div className="flex items-center justify-center gap-2 text-cream-400">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Loading more...</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Pagination - Show on desktop, hidden when infinite scroll is active */}
                {totalPages > 1 && (
                  <div className="mt-8 hidden md:block">
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

export default PartsPageContent;
