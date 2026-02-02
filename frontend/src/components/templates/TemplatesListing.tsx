'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTemplates } from '@/hooks/use-templates';
import { usePagination } from '@/hooks/use-pagination';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { TemplatePreview } from '@/components/templates/TemplatePreview';
import { TemplatesComparisonTable } from '@/components/templates/TemplatesComparisonTable';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Rocket,
  Zap,
  Wallet,
  GraduationCap,
  Trophy,
  Baby,
  Mountain,
  Car,
  Flag,
  Search,
  Filter,
  ChevronDown,
  LayoutGrid,
  List,
  X,
} from 'lucide-react';
import type { BuildTemplate, TemplateGoal } from '@/types/database';
import { TEMPLATE_GOALS } from '@/types/database';

function isValidGoal(g: string): g is TemplateGoal {
  return TEMPLATE_GOALS.includes(g as TemplateGoal);
}

const GOAL_LABELS: Record<TemplateGoal, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  speed: { label: 'Speed', icon: Rocket },
  torque: { label: 'Torque', icon: Zap },
  budget: { label: 'Budget', icon: Wallet },
  beginner: { label: 'Beginner', icon: GraduationCap },
  competition: { label: 'Competition', icon: Trophy },
  kids: { label: 'Kids', icon: Baby },
  offroad: { label: 'Off-Road', icon: Mountain },
  onroad: { label: 'On-Road', icon: Car },
  racing: { label: 'Racing', icon: Flag },
};

type SortOption =
  | 'name_asc'
  | 'name_desc'
  | 'price_asc'
  | 'price_desc'
  | 'hp_desc'
  | 'hp_asc'
  | 'torque_desc'
  | 'torque_asc';

export interface TemplatesListingProps {
  /** When provided (e.g. from URL on /templates), sync goal to this and call onGoalChange when user changes goal */
  initialGoal?: TemplateGoal | undefined;
  onGoalChange?: (goal: TemplateGoal | undefined) => void;
}

export function TemplatesListing({ initialGoal, onGoalChange }: TemplatesListingProps) {
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState<TemplateGoal | undefined>(initialGoal);
  const [previewTemplate, setPreviewTemplate] = useState<BuildTemplate | null>(null);

  useEffect(() => {
    if (initialGoal !== undefined) setSelectedGoal(initialGoal);
  }, [initialGoal]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('name_asc');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  const { data: templates = [], isLoading, error } = useTemplates(selectedGoal);

  const filteredTemplates = useMemo(() => {
    let items = [...templates];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (t) =>
          (t.name || '').toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q) ||
          (t.engine?.name || '').toLowerCase().includes(q) ||
          (GOAL_LABELS[t.goal]?.label || t.goal).toLowerCase().includes(q)
      );
    }
    const [sortField, dir] = sortBy.includes('name')
      ? ['name', sortBy === 'name_asc' ? 1 : -1]
      : sortBy.includes('price')
        ? ['price', sortBy === 'price_asc' ? 1 : -1]
        : sortBy.includes('hp')
          ? ['hp', sortBy === 'hp_asc' ? 1 : -1]
          : sortBy.includes('torque')
            ? ['torque', sortBy === 'torque_asc' ? 1 : -1]
            : ['name', 1];
    items.sort((a, b) => {
      let valA: number | string;
      let valB: number | string;
      if (sortField === 'name') {
        valA = (a.name || '').toLowerCase();
        valB = (b.name || '').toLowerCase();
        return dir * (valA < valB ? -1 : valA > valB ? 1 : 0);
      }
      if (sortField === 'price') {
        valA = a.total_price ?? 0;
        valB = b.total_price ?? 0;
        return dir * ((valA as number) - (valB as number));
      }
      if (sortField === 'hp') {
        valA = a.estimated_hp ?? 0;
        valB = b.estimated_hp ?? 0;
        return dir * ((valA as number) - (valB as number));
      }
      valA = a.estimated_torque ?? 0;
      valB = b.estimated_torque ?? 0;
      return dir * ((valA as number) - (valB as number));
    });
    return items;
  }, [templates, searchQuery, sortBy]);

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
  } = usePagination(filteredTemplates, {
    itemsPerPage: shouldPaginate ? 24 : filteredTemplates.length,
  });
  const displayItems = shouldPaginate ? paginatedItems : filteredTemplates;

  const hasActiveFilters = selectedGoal !== undefined || sortBy !== 'name_asc';

  const handleApplyTemplate = (template: BuildTemplate) => {
    router.push(`/builder?template=${template.id}`);
  };

  const handleGoalChange = (goal: TemplateGoal | undefined) => {
    setSelectedGoal(goal);
    onGoalChange?.(goal);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1 sm:max-w-xs min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-500 pointer-events-none" aria-hidden />
            <input
              type="search"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-9 py-2.5 rounded-xl bg-olive-800/60 border border-olive-700/50 text-cream-100 placeholder:text-cream-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-colors duration-200',
                searchQuery ? 'pr-9' : 'pr-4'
              )}
              aria-label="Search templates"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-cream-400 hover:text-cream-100 hover:bg-olive-700/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" aria-hidden />
              </button>
            )}
          </div>

          <div
            className="inline-flex flex-wrap gap-1 p-1 rounded-xl bg-olive-800/60 border border-olive-700/50"
            role="radiogroup"
            aria-label="Template goal"
          >
            <button
              type="button"
              onClick={() => handleGoalChange(undefined)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
                selectedGoal === undefined
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'text-cream-400 hover:text-cream-100 hover:bg-olive-700/50'
              )}
              role="radio"
              aria-checked={selectedGoal === undefined}
              aria-label="All templates"
            >
              All
            </button>
            {TEMPLATE_GOALS.map((goal) => {
              const config = GOAL_LABELS[goal];
              const Icon = config.icon;
              const isActive = selectedGoal === goal;
              return (
                <button
                  key={goal}
                  type="button"
                  onClick={() => handleGoalChange(goal)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
                    isActive
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'text-cream-400 hover:text-cream-100 hover:bg-olive-700/50'
                  )}
                  role="radio"
                  aria-checked={isActive}
                  aria-label={config.label}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden />
                  {config.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowFiltersPanel((p) => !p)}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
              hasActiveFilters
                ? 'bg-olive-700/60 border-cream-200 text-cream-100'
                : 'bg-olive-800/60 border-olive-700/50 text-cream-400 hover:text-cream-100 hover:bg-olive-700/50'
            )}
            aria-expanded={showFiltersPanel}
            aria-label={hasActiveFilters ? 'Filters active' : 'Show filter options'}
          >
            <Filter className="w-4 h-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">Filters</span>
          </button>

          <div className="relative min-w-0">
            <label htmlFor="templates-sort" className="sr-only">Sort by</label>
            <select
              id="templates-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full min-w-[140px] sm:min-w-[180px] pl-3 pr-8 py-2 rounded-xl bg-olive-800/60 border border-olive-700/50 text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 appearance-none cursor-pointer"
              aria-label="Sort templates"
            >
              <option value="name_asc">Name (A–Z)</option>
              <option value="name_desc">Name (Z–A)</option>
              <option value="price_asc">Price (low to high)</option>
              <option value="price_desc">Price (high to low)</option>
              <option value="hp_desc">Horsepower (high first)</option>
              <option value="hp_asc">Horsepower (low first)</option>
              <option value="torque_desc">Torque (high first)</option>
              <option value="torque_asc">Torque (low first)</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-500 pointer-events-none" aria-hidden />
          </div>
        </div>

        {showFiltersPanel && (
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-olive-800/40 border border-olive-700/50">
            <span className="text-xs font-medium text-cream-400 uppercase tracking-wider w-full sm:w-auto">Filter &amp; sort</span>
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="templates-sort-panel" className="sr-only">Sort</label>
              <select
                id="templates-sort-panel"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="min-w-[180px] pl-3 pr-8 py-2 rounded-lg bg-olive-800/60 border border-olive-700/50 text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none cursor-pointer"
              >
                <option value="name_asc">Name (A–Z)</option>
                <option value="name_desc">Name (Z–A)</option>
                <option value="price_asc">Price (low to high)</option>
                <option value="price_desc">Price (high to low)</option>
                <option value="hp_desc">Horsepower (high first)</option>
                <option value="hp_asc">Horsepower (low first)</option>
                <option value="torque_desc">Torque (high first)</option>
                <option value="torque_asc">Torque (low first)</option>
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
                Showing{' '}
                <span className="text-cream-100 font-medium">
                  {viewMode === 'grid' ? `${startIndex + 1}-${Math.min(endIndex, totalItems)}` : totalItems}
                </span>{' '}
                of <span className="text-cream-100 font-medium">{totalItems}</span> templates
                {searchQuery && ` matching "${searchQuery}"`}
              </>
            )}
          </p>
          <div className="inline-flex items-center p-1 rounded-xl bg-olive-800/60 border border-olive-700/50">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
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
                'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
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

      {error && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-[var(--error)]">Failed to load templates. Please try again.</p>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="relative h-48 sm:h-56 bg-white/5 overflow-hidden">
                <Skeleton className="absolute inset-0" />
                <div className="absolute top-3 left-3">
                  <Skeleton className="h-7 w-20 rounded-lg" />
                </div>
              </div>
              <CardContent className="p-4 sm:p-5 space-y-3">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-3/4" />
                </div>
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20 rounded-md" />
                  <Skeleton className="h-8 w-16 rounded-md" />
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
                <div className="pt-2 border-t border-olive-700/30">
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !error && (!templates || templates.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="w-16 h-16 text-olive-600 mx-auto mb-4" />
            <h2 className="text-xl text-cream-100 mb-2">No Templates Found</h2>
            <p className="text-cream-400">
              {selectedGoal
                ? `No ${GOAL_LABELS[selectedGoal].label.toLowerCase()} templates available yet.`
                : 'No templates available yet.'}
            </p>
            <p className="text-sm text-cream-500 mt-3">
              Run the build_templates seed migration if you haven’t yet.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && viewMode === 'list' && (
        <>
          {displayItems.length > 0 ? (
            <TemplatesComparisonTable
              templates={displayItems}
              onApply={(t) => setPreviewTemplate(t)}
            />
          ) : (
            templates.length > 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Sparkles className="w-16 h-16 text-olive-600 mx-auto mb-4" />
                  <h2 className="text-xl text-cream-100 mb-2">No Templates Found</h2>
                  <p className="text-cream-400">
                    {searchQuery ? 'No templates match your search.' : 'No templates available yet.'}
                  </p>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="mt-4 text-sm font-medium text-orange-400 hover:text-orange-300"
                    >
                      Clear search
                    </button>
                  )}
                </CardContent>
              </Card>
            )
          )}
        </>
      )}

      {!isLoading && !error && viewMode === 'grid' && (
        <>
          {displayItems.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                {displayItems.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onApply={(t) => setPreviewTemplate(t)}
                  />
                ))}
              </div>
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
          ) : (
            templates.length > 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Sparkles className="w-16 h-16 text-olive-600 mx-auto mb-4" />
                  <h2 className="text-xl text-cream-100 mb-2">No Templates Found</h2>
                  <p className="text-cream-400">
                    {searchQuery ? 'No templates match your search.' : 'No templates available yet.'}
                  </p>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="mt-4 text-sm font-medium text-orange-400 hover:text-orange-300"
                    >
                      Clear search
                    </button>
                  )}
                </CardContent>
              </Card>
            )
          )}
        </>
      )}

      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onApply={() => {
            handleApplyTemplate(previewTemplate);
            setPreviewTemplate(null);
          }}
        />
      )}
    </div>
  );
}
