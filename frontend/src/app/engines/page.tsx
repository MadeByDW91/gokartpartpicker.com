'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useEngines, useEngineBrands } from '@/hooks/use-engines';
import { useMotors, useMotorBrands } from '@/hooks/use-motors';
import { useBuildStore } from '@/store/build-store';
import { EngineCard } from '@/components/EngineCard';
import { MotorCard } from '@/components/MotorCard';
import { EngineCardSkeleton } from '@/components/ui/Skeleton';
import { EnginesComparisonTable } from '@/components/engines/EnginesComparisonTable';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { usePagination } from '@/hooks/use-pagination';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { PageHero } from '@/components/layout/PageHero';
import { BuilderInsights } from '@/components/builder/BuilderInsights';
import { formatPrice, cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import {
  Flame,
  LayoutGrid,
  X,
  List,
  Cog,
  Zap,
  Search,
  Filter,
  ChevronDown,
} from 'lucide-react';
import type { EngineFilters, MotorFilters, Engine, ElectricMotor, PowerSourceType } from '@/types/database';

type EngineTypeView = 'all' | 'gas' | 'electric';

export default function EnginesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [powerSourceView, setPowerSourceView] = useState<EngineTypeView>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [sortBy, setSortBy] = useState<'horsepower_desc' | 'horsepower_asc' | 'price_asc' | 'price_desc' | 'displacement_desc' | 'displacement_asc'>('horsepower_desc');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [engineFilters, setEngineFilters] = useState<EngineFilters>({
    sort: 'horsepower',
    order: 'desc',
  });
  const [motorFilters, setMotorFilters] = useState<MotorFilters>({
    sort: 'power_kw',
    order: 'desc',
  });

  // Sync brand into API filters when viewing gas or electric
  const effectiveEngineFilters = useMemo<EngineFilters>(() => {
    const base = { ...engineFilters };
    if (powerSourceView === 'gas' && selectedBrand) base.brand = selectedBrand;
    else if (powerSourceView === 'gas') delete base.brand;
    return base;
  }, [engineFilters, powerSourceView, selectedBrand]);
  const effectiveMotorFilters = useMemo<MotorFilters>(() => {
    const base = { ...motorFilters };
    if (powerSourceView === 'electric' && selectedBrand) base.brand = selectedBrand;
    else if (powerSourceView === 'electric') delete base.brand;
    return base;
  }, [motorFilters, powerSourceView, selectedBrand]);

  // Sync sortBy into API filters
  const engineFiltersWithSort = useMemo<EngineFilters>(() => {
    const [sort, order] = sortBy === 'horsepower_desc' ? ['horsepower', 'desc'] as const
      : sortBy === 'horsepower_asc' ? ['horsepower', 'asc'] as const
      : sortBy === 'price_asc' ? ['price', 'asc'] as const
      : sortBy === 'price_desc' ? ['price', 'desc'] as const
      : sortBy === 'displacement_desc' ? ['displacement_cc', 'desc'] as const
      : sortBy === 'displacement_asc' ? ['displacement_cc', 'asc'] as const
      : ['horsepower', 'desc'] as const;
    return { ...effectiveEngineFilters, sort: sort as EngineFilters['sort'], order };
  }, [effectiveEngineFilters, sortBy]);
  const motorFiltersWithSort = useMemo<MotorFilters>(() => {
    const [sort, order] = sortBy === 'horsepower_desc' ? ['power_kw', 'desc'] as const
      : sortBy === 'horsepower_asc' ? ['power_kw', 'asc'] as const
      : sortBy === 'price_asc' ? ['price', 'asc'] as const
      : sortBy === 'price_desc' ? ['price', 'desc'] as const
      : sortBy === 'displacement_desc' ? ['power_kw', 'desc'] as const
      : sortBy === 'displacement_asc' ? ['power_kw', 'asc'] as const
      : ['power_kw', 'desc'] as const;
    return { ...effectiveMotorFilters, sort: sort as MotorFilters['sort'], order };
  }, [effectiveMotorFilters, sortBy]);

  const { data: engines, isLoading: enginesLoading, error: enginesError, refetch: refetchEngines } = useEngines(engineFiltersWithSort);
  const { data: motors, isLoading: motorsLoading, error: motorsError, refetch: refetchMotors } = useMotors(motorFiltersWithSort);
  const { data: engineBrands } = useEngineBrands();
  const { data: motorBrands } = useMotorBrands();

  const brandsList = useMemo(() => {
    if (powerSourceView === 'gas') return engineBrands ?? [];
    if (powerSourceView === 'electric') return motorBrands ?? [];
    const combined = [...(engineBrands ?? []), ...(motorBrands ?? [])];
    return [...new Set(combined)].sort((a, b) => a.localeCompare(b));
  }, [powerSourceView, engineBrands, motorBrands]);

  const hasActiveFilters = selectedBrand !== '' || sortBy !== 'horsepower_desc';
  const { 
    selectedEngine, 
    selectedMotor, 
    setEngine, 
    setMotor, 
    powerSourceType: buildPowerSourceType, 
    setPowerSourceType: setBuildPowerSourceType 
  } = useBuildStore();
  
  // Determine active power source for view - can be 'all', 'gas', or 'electric'
  const activePowerSource = powerSourceView;
  const isLoading = activePowerSource === 'all' 
    ? (enginesLoading || motorsLoading) 
    : activePowerSource === 'gas' 
      ? enginesLoading 
      : motorsLoading;
  const error = activePowerSource === 'all' 
    ? (enginesError || motorsError) 
    : activePowerSource === 'gas' 
      ? enginesError 
      : motorsError;
  
  // Filter by search and (when view is "all") by brand; sort when view is "all"
  const filteredItems = useMemo(() => {
    let items: (Engine | ElectricMotor)[] = [];
    
    if (activePowerSource === 'all') {
      items = [...(engines || []), ...(motors || [])];
      if (selectedBrand) {
        items = items.filter(item => item.brand === selectedBrand);
      }
      // Client-side sort when viewing all
      const getSortVal = (item: Engine | ElectricMotor) => {
        if (sortBy === 'horsepower_desc' || sortBy === 'horsepower_asc') return item.horsepower ?? 0;
        if (sortBy === 'price_asc' || sortBy === 'price_desc') return item.price ?? 0;
        if ('displacement_cc' in item) return item.displacement_cc;
        return (item as ElectricMotor).power_kw ?? 0;
      };
      const dir = sortBy.endsWith('_asc') ? 1 : -1;
      items.sort((a, b) => (getSortVal(a) - getSortVal(b)) * dir);
    } else if (activePowerSource === 'gas') {
      items = engines || [];
    } else {
      items = motors || [];
    }
    
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.brand?.toLowerCase().includes(query) ||
      item.slug.toLowerCase().includes(query)
    );
  }, [engines, motors, activePowerSource, searchQuery, selectedBrand, sortBy]);

  // Pagination (only for grid view)
  const shouldPaginate = viewMode === 'grid';
  const {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    startIndex,
    endIndex,
    totalItems,
    hasNextPage,
  } = usePagination(filteredItems, { itemsPerPage: shouldPaginate ? 24 : filteredItems.length });
  
  const displayItems = shouldPaginate ? paginatedItems : filteredItems;

  // Infinite scroll for mobile (auto-loads more when scrolling near bottom)
  const loadMoreItems = () => {
    if (hasNextPage && !isLoading && shouldPaginate) {
      nextPage();
    }
  };

  const { observerTarget: infiniteScrollTarget, isFetching: isLoadingMore } = useInfiniteScroll({
    hasNextPage: hasNextPage && shouldPaginate,
    fetchNextPage: loadMoreItems,
    enabled: shouldPaginate, // Only enable for grid view
    threshold: 300,
  });

  // Pull to refresh
  const handleRefresh = async () => {
    if (activePowerSource === 'all') {
      await Promise.all([refetchEngines(), refetchMotors()]);
    } else if (activePowerSource === 'gas') {
      await refetchEngines();
    } else {
      await refetchMotors();
    }
  };

  const { isPulling, isRefreshing, pullDistance, pullProgress } = usePullToRefresh({
    onRefresh: handleRefresh,
    enabled: true,
    threshold: 80,
  });
  
  const handleAddToBuild = (item: Engine | ElectricMotor) => {
    // Determine if it's an engine or motor by checking if it has displacement_cc (engine) or voltage (motor)
    const isEngine = 'displacement_cc' in item;
    
    if (isEngine) {
      const engine = item as Engine;
      if (selectedEngine?.id === engine.id) {
        setEngine(null);
      } else {
        setEngine(engine);
        setBuildPowerSourceType('gas');
      }
    } else {
      const motor = item as ElectricMotor;
      if (selectedMotor?.id === motor.id) {
        setMotor(null);
      } else {
        setMotor(motor);
        setBuildPowerSourceType('electric');
      }
    }
  };
  
  const handlePowerSourceChange = (type: EngineTypeView) => {
    setPowerSourceView(type);
    if (type !== 'all') {
      setBuildPowerSourceType(type);
    }
  };

  const heroTitle = activePowerSource === 'all' ? 'Engines & Motors' : activePowerSource === 'gas' ? 'Engines' : 'Electric Motors';
  const heroSubtitle = activePowerSource === 'all'
    ? 'Browse and compare all power sources for your go-kart build'
    : `Browse and compare ${activePowerSource === 'gas' ? 'engines' : 'motors'} for your go-kart build`;
  const HeroIcon = activePowerSource === 'gas' ? Flame : activePowerSource === 'electric' ? Zap : LayoutGrid;

  return (
    <div className="min-h-screen bg-olive-900">
      <PageHero
        eyebrow="Power"
        icon={<HeroIcon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />}
        title={heroTitle}
        subtitle={heroSubtitle}
        sticky
      />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Builder Insights - Now includes Live Tools as first tab */}
        {!isLoading && (
          <div className="mb-8">
            <BuilderInsights
              engines={engines || []}
              motors={motors || []}
              selectedItem={selectedEngine || selectedMotor || null}
              activePowerSource={activePowerSource}
              variant="engines-page"
            />
          </div>
        )}

        {/* Selected Item Indicator — clear way to remove selection or go to builder */}
        {(selectedEngine || selectedMotor) && (
          <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-2 h-2 shrink-0 rounded-full bg-orange-400 animate-pulse" aria-hidden />
              <span className="text-sm text-cream-300 truncate">
                <span className="font-medium text-cream-100">
                  {selectedEngine 
                    ? `${selectedEngine.brand} ${selectedEngine.name}`
                    : selectedMotor
                      ? `${selectedMotor.brand} ${selectedMotor.name}`
                      : 'None selected'}
                </span>
                {' '}selected for your build
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (selectedEngine) setEngine(null);
                  if (selectedMotor) setMotor(null);
                }}
                className="border-olive-600 text-cream-200 hover:bg-olive-700 hover:text-cream-100"
                aria-label="Clear engine or motor selection"
              >
                <X className="w-4 h-4 mr-1.5" aria-hidden />
                Clear selection
              </Button>
              <Link href="/builder">
                <Button variant="primary" size="sm">
                  Go to Builder
                </Button>
              </Link>
            </div>
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

        {/* Search + Engine Type + Results Count + View Toggle — down by engine cards */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            {/* Search + clear */}
            <div className="relative flex-1 sm:max-w-xs min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-500 pointer-events-none" aria-hidden />
              <input
                type="search"
                placeholder="Search engines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'w-full pl-9 py-2.5 rounded-xl bg-olive-800/60 border border-olive-700/50 text-cream-100 placeholder:text-cream-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-colors duration-200',
                  searchQuery ? 'pr-9' : 'pr-4'
                )}
                aria-label="Search engines and motors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-cream-400 hover:text-cream-100 hover:bg-olive-700/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-olive-800 touch-manipulation"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" aria-hidden />
                </button>
              )}
            </div>
            {/* Engine type: All | Gas | EV — distinct colors per selection */}
            <div
              className="inline-flex p-1 rounded-xl bg-olive-800/60 border border-olive-700/50"
              role="radiogroup"
              aria-label="Engine type"
            >
              <button
                type="button"
                onClick={() => handlePowerSourceChange('all')}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-olive-800 touch-manipulation',
                  powerSourceView === 'all'
                    ? 'bg-cream-500/15 text-cream-100 border border-cream-500/30 focus-visible:ring-cream-400'
                    : 'text-cream-400 hover:text-cream-100 hover:bg-olive-700/50 focus-visible:ring-orange-500'
                )}
                role="radio"
                aria-checked={powerSourceView === 'all'}
                aria-label="All engines and motors"
              >
                <LayoutGrid className={cn('w-4 h-4 shrink-0', powerSourceView === 'all' && 'text-cream-300')} aria-hidden />
                All
              </button>
              <button
                type="button"
                onClick={() => handlePowerSourceChange('gas')}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-olive-800 touch-manipulation',
                  powerSourceView === 'gas'
                    ? 'bg-orange-500/25 text-orange-400 border border-orange-500/50 focus-visible:ring-orange-500'
                    : 'text-cream-400 hover:text-cream-100 hover:bg-olive-700/50 focus-visible:ring-orange-500'
                )}
                role="radio"
                aria-checked={powerSourceView === 'gas'}
                aria-label="Gas engines"
              >
                <Cog className={cn('w-4 h-4 shrink-0', powerSourceView === 'gas' && 'text-orange-400')} aria-hidden />
                Gas
              </button>
              <button
                type="button"
                onClick={() => handlePowerSourceChange('electric')}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-olive-800 touch-manipulation',
                  powerSourceView === 'electric'
                    ? 'bg-blue-500/25 text-blue-400 border border-blue-500/50 focus-visible:ring-blue-500'
                    : 'text-cream-400 hover:text-cream-100 hover:bg-olive-700/50 focus-visible:ring-blue-500'
                )}
                role="radio"
                aria-checked={powerSourceView === 'electric'}
                aria-label="Electric motors"
              >
                <Zap className={cn('w-4 h-4 shrink-0', powerSourceView === 'electric' && 'text-blue-400')} aria-hidden />
                EV
              </button>
            </div>

            {/* Filters button — highlighted when any filter active */}
            <button
              type="button"
              onClick={() => setShowFiltersPanel((p) => !p)}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-xl text-sm font-medium transition-all border focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-olive-800 touch-manipulation',
                hasActiveFilters
                  ? 'bg-olive-700/60 border-cream-200 text-cream-100'
                  : 'bg-olive-800/60 border-olive-700/50 text-cream-400 hover:text-cream-100 hover:bg-olive-700/50'
              )}
              aria-expanded={showFiltersPanel}
              aria-label={hasActiveFilters ? 'Filters active (click to toggle options)' : 'Show filter options'}
            >
              <Filter className="w-4 h-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Filters</span>
            </button>

            {/* All Brands dropdown */}
            <div className="relative min-w-0">
              <label htmlFor="engine-brand-filter" className="sr-only">
                Filter by brand
              </label>
              <select
                id="engine-brand-filter"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full min-w-[120px] sm:min-w-[140px] pl-3 pr-8 py-2 rounded-xl bg-olive-800/60 border border-olive-700/50 text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 appearance-none cursor-pointer"
                aria-label="Filter by brand"
              >
                <option value="">All Brands</option>
                {brandsList.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-500 pointer-events-none" aria-hidden />
            </div>

            {/* Sort dropdown */}
            <div className="relative min-w-0">
              <label htmlFor="engine-sort" className="sr-only">
                Sort by
              </label>
              <select
                id="engine-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full min-w-[140px] sm:min-w-[160px] pl-3 pr-8 py-2 rounded-xl bg-olive-800/60 border border-olive-700/50 text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 appearance-none cursor-pointer"
                aria-label="Sort by"
              >
                <option value="horsepower_desc">Horsepower (high first)</option>
                <option value="horsepower_asc">Horsepower (low first)</option>
                <option value="price_asc">Price (low to high)</option>
                <option value="price_desc">Price (high to low)</option>
                <option value="displacement_desc">Displacement (high first)</option>
                <option value="displacement_asc">Displacement (low first)</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-500 pointer-events-none" aria-hidden />
            </div>
          </div>

          {/* Optional filters panel (e.g. for mobile when Filters clicked) */}
          {showFiltersPanel && (
            <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-olive-800/40 border border-olive-700/50">
              <span className="text-xs font-medium text-cream-400 uppercase tracking-wider w-full sm:w-auto">Filter &amp; sort</span>
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="engine-brand-filter-panel" className="sr-only">Brand</label>
                <select
                  id="engine-brand-filter-panel"
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="min-w-[120px] pl-3 pr-8 py-2 rounded-lg bg-olive-800/60 border border-olive-700/50 text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none cursor-pointer"
                >
                  <option value="">All Brands</option>
                  {brandsList.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
                <label htmlFor="engine-sort-panel" className="sr-only">Sort</label>
                <select
                  id="engine-sort-panel"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="min-w-[160px] pl-3 pr-8 py-2 rounded-lg bg-olive-800/60 border border-olive-700/50 text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none cursor-pointer"
                >
                  <option value="horsepower_desc">Horsepower (high first)</option>
                  <option value="horsepower_asc">Horsepower (low first)</option>
                  <option value="price_asc">Price (low to high)</option>
                  <option value="price_desc">Price (high to low)</option>
                  <option value="displacement_desc">Displacement (high first)</option>
                  <option value="displacement_asc">Displacement (low first)</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-cream-400">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                  Loading...
                </span>
              ) : (
                <>
                  Showing <span className="text-cream-100 font-medium">
                    {viewMode === 'grid' ? `${startIndex + 1}-${Math.min(endIndex, totalItems)}` : totalItems}
                  </span> of <span className="text-cream-100 font-medium">{totalItems}</span> {activePowerSource === 'all' ? 'items' : activePowerSource === 'gas' ? 'engines' : 'motors'}
                  {searchQuery && ` matching "${searchQuery}"`}
                </>
              )}
            </p>
            {/* View Mode Toggle — same pill + orange selected style as engine type */}
            <div className="inline-flex items-center p-1 rounded-xl bg-olive-800/60 border border-olive-700/50">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'px-3 py-2 min-h-[44px] min-w-[44px] rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-olive-800 touch-manipulation flex items-center justify-center',
                  viewMode === 'grid'
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'text-cream-400 hover:text-cream-100 hover:bg-olive-700/50'
                )}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  'px-3 py-2 min-h-[44px] min-w-[44px] rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-olive-800 touch-manipulation flex items-center justify-center',
                  viewMode === 'list'
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'text-cream-400 hover:text-cream-100 hover:bg-olive-700/50'
                )}
                aria-label="Table view"
              >
                <List className="w-4 h-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>
        
        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto bg-olive-800/80 backdrop-blur-sm border border-olive-600/50 rounded-xl p-8 shadow-lg">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/10 flex items-center justify-center">
                <X className="w-8 h-8 text-orange-400" />
              </div>
              <p className="text-orange-400 text-lg font-semibold mb-2">
                Failed to load {activePowerSource === 'all' ? 'engines and motors' : activePowerSource === 'gas' ? 'engines' : 'motors'}
              </p>
              <p className="text-cream-400 text-sm mb-6">
                {error instanceof Error ? error.message : 'An error occurred while loading'}
              </p>
              <Button variant="primary" onClick={() => window.location.reload()}>
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
        
        {/* Table View - Professional Comparison Table */}
        {!isLoading && viewMode === 'list' && (
          <>
            {displayItems && displayItems.length > 0 ? (
              <EnginesComparisonTable
                items={displayItems}
                selectedEngine={selectedEngine}
                selectedMotor={selectedMotor}
                onAddToBuild={handleAddToBuild}
              />
            ) : (
              <div className="text-center py-16">
                <Image
                  src="/ui/ui-empty-no-results-v1.svg"
                  alt={`No ${activePowerSource === 'all' ? 'items' : activePowerSource === 'gas' ? 'engines' : 'motors'} found`}
                  width={300}
                  height={200}
                  className="mx-auto mb-6"
                />
                <h3 className="text-xl text-cream-100 mb-2">
                  No {activePowerSource === 'all' ? 'Items' : activePowerSource === 'gas' ? 'Engines' : 'Motors'} Found
                </h3>
                <p className="text-cream-400 mb-4">
                  {searchQuery 
                    ? `No ${activePowerSource === 'all' ? 'items' : activePowerSource === 'gas' ? 'engines' : 'motors'} match your search.`
                    : `No ${activePowerSource === 'all' ? 'items' : activePowerSource === 'gas' ? 'engines' : 'motors'} available at this time.`}
                </p>
                {searchQuery && (
                  <Button variant="secondary" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </>
        )}

        {/* Grid View */}
        {!isLoading && viewMode === 'grid' && (
          <>
            {displayItems && displayItems.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {displayItems.map((item) => {
                    const isEngine = 'displacement_cc' in item;
                    if (isEngine) {
                      const engine = item as Engine;
                      return (
                        <EngineCard
                          key={engine.id}
                          engine={engine}
                          onAddToBuild={handleAddToBuild}
                          isSelected={selectedEngine?.id === engine.id}
                          variant="grid"
                        />
                      );
                    } else {
                      const motor = item as ElectricMotor;
                      return (
                        <MotorCard
                          key={motor.id}
                          motor={motor}
                          onAddToBuild={handleAddToBuild}
                          isSelected={selectedMotor?.id === motor.id}
                        />
                      );
                    }
                  })}
                </div>
                
                {/* Infinite Scroll Trigger */}
                {hasNextPage && shouldPaginate && (
                  <div ref={infiniteScrollTarget as React.RefObject<HTMLDivElement>} className="py-8">
                    {isLoadingMore && (
                      <div className="flex items-center justify-center gap-2 text-cream-400">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Loading more...</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Pagination - Show on desktop, hidden on mobile when infinite scroll is active */}
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
            ) : (
              <div className="text-center py-16">
                <Image
                  src="/ui/ui-empty-no-results-v1.svg"
                  alt={`No ${activePowerSource === 'all' ? 'items' : activePowerSource === 'gas' ? 'engines' : 'motors'} found`}
                  width={300}
                  height={200}
                  className="mx-auto mb-6"
                />
                <h3 className="text-xl text-cream-100 mb-2">
                  No {activePowerSource === 'all' ? 'Items' : activePowerSource === 'gas' ? 'Engines' : 'Motors'} Found
                </h3>
                <p className="text-cream-400 mb-4">
                  {searchQuery 
                    ? `No ${activePowerSource === 'all' ? 'items' : activePowerSource === 'gas' ? 'engines' : 'motors'} match your search.`
                    : `No ${activePowerSource === 'all' ? 'items' : activePowerSource === 'gas' ? 'engines' : 'motors'} available at this time.`}
                </p>
                {searchQuery && (
                  <Button variant="secondary" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
