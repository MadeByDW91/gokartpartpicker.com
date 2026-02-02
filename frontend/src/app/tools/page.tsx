'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calculator, 
  FileSpreadsheet, 
  FileText,
  Zap, 
  Gauge, 
  Settings,
  ArrowRight,
  BookOpen,
  Film,
  Search,
  Clock,
  TrendingUp,
  Grid3x3,
  Star,
  Sparkles,
  BarChart3,
  Wrench,
  Cog,
  Filter,
  X,
  CircleDot,
  Layers,
  ChevronDown,
  ChevronUp,
  Battery,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { PageHero } from '@/components/layout/PageHero';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { getGuides } from '@/actions/guides';
import type { Guide } from '@/types/guides';
import { getAllVideos } from '@/actions/videos';
import { useEngines } from '@/hooks/use-engines';
import { useMotors } from '@/hooks/use-motors';
import { VideoGrid } from '@/components/videos/VideoGrid';
import { getTorqueSpecs } from '@/data/torque-specs';
import { TemplatesListing } from '@/components/templates/TemplatesListing';
import { ManualCard } from '@/components/engines/ManualCard';
import { HPContributionCalculator } from '@/components/tools/HPContributionCalculator';
import { GearRatioCalculator } from '@/components/tools/GearRatioCalculator';
import { IgnitionTimingCalculator } from '@/components/tools/IgnitionTimingCalculator';
import { GuidesList } from '@/components/guides/GuidesList';
import { VIDEO_CATEGORIES, type VideoCategory, type Video, type Engine } from '@/types/database';
import { Select } from '@/components/ui/Select';

type ResourceType = 'all' | 'tool' | 'calculator' | 'guide' | 'video' | 'template';

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  type: 'tool' | 'calculator' | 'template';
  featured?: boolean;
  popular?: boolean;
  category?: string;
}

const tools: Tool[] = [
  {
    id: 'templates',
    title: 'Build Templates',
    description: 'Start your build from a pre-configured template. Browse community templates or create your own.',
    icon: Layers,
    href: '/templates',
    type: 'template',
    featured: true,
    popular: true,
    category: 'Planning',
  },
  {
    id: 'hp-contribution',
    title: 'HP Contribution Calculator',
    description: 'See how much HP each part individually adds to your build. Compare parts side-by-side.',
    icon: Zap,
    href: '/tools/hp-contribution',
    type: 'calculator',
    popular: true,
    category: 'Performance',
  },
  {
    id: 'chassis-layout',
    title: 'Chassis Layout',
    description: 'Generic go-kart chassis blueprint: top and side view. Plan where the engine, axle, and key parts go.',
    icon: Grid3x3,
    href: '/tools/chassis-layout',
    type: 'tool',
    category: 'Reference',
  },
  {
    id: 'ignition-timing',
    title: 'Ignition Timing Calculator',
    description: 'Calculate optimal ignition timing with advanced timing keys. See HP impact and safety warnings.',
    icon: Gauge,
    href: '/tools/ignition-timing',
    type: 'calculator',
    category: 'Performance',
  },
  {
    id: 'gear-ratio',
    title: 'Gear Ratio Calculator',
    description: 'Calculate optimal sprocket combinations for your desired top speed and acceleration.',
    icon: Settings,
    href: '/tools/gear-ratio',
    type: 'calculator',
    category: 'Performance',
  },
];

const categories = [
  { 
    id: 'all', 
    label: 'All Resources', 
    icon: Grid3x3,
    color: 'orange',
  },
  { 
    id: 'tool', 
    label: 'Tools', 
    icon: Wrench,
    color: 'blue',
  },
  { 
    id: 'calculator', 
    label: 'Calculators', 
    icon: Calculator,
    color: 'green',
  },
  { 
    id: 'guide', 
    label: 'Guides', 
    icon: BookOpen,
    color: 'purple',
  },
  { 
    id: 'video', 
    label: 'Videos', 
    icon: Film,
    color: 'red',
  },
  { 
    id: 'template', 
    label: 'Templates', 
    icon: Layers,
    color: 'amber',
  },
];

const CATEGORY_LABELS: Record<VideoCategory, string> = {
  unboxing: 'Unboxing',
  installation: 'Installation',
  maintenance: 'Maintenance',
  modification: 'Modification',
  troubleshooting: 'Troubleshooting',
  tutorial: 'Tutorial',
  review: 'Review',
  tips: 'Tips',
};

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ResourceType>('all');
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loadingGuides, setLoadingGuides] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [selectedEngineId, setSelectedEngineId] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<VideoCategory | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [toolsPanelsExpanded, setToolsPanelsExpanded] = useState({ manuals: false, torque: false });
  const [selectedManualEngineSlug, setSelectedManualEngineSlug] = useState<string>('');
  const [selectedTorqueEngineSlug, setSelectedTorqueEngineSlug] = useState<string>('');
  const [selectedCalculatorId, setSelectedCalculatorId] = useState<string>('hp-contribution');
  
  // Fetch engines and motors for manuals / torque specs expandables
  const { data: engines = [], isLoading: enginesLoading } = useEngines();
  const { data: motors = [] } = useMotors();

  useEffect(() => {
    loadGuides();
    loadVideos();
  }, []);

  const loadGuides = async () => {
    setLoadingGuides(true);
    try {
      const result = await getGuides();
      if (result.success && result.data) {
        setGuides(result.data);
      }
    } catch (err) {
      console.error('Failed to load guides:', err);
    } finally {
      setLoadingGuides(false);
    }
  };

  const loadVideos = async () => {
    setLoadingVideos(true);
    try {
      const result = await getAllVideos();
      if (result.success && result.data) {
        setVideos(result.data);
      }
    } catch (err) {
      console.error('Failed to load videos:', err);
    } finally {
      setLoadingVideos(false);
    }
  };

  // Convert guides to unified format
  const guideItems = useMemo(() => {
    return guides.map(guide => ({
      id: guide.id,
      title: guide.title,
      description: guide.excerpt || `Step-by-step guide for ${guide.title}`,
      icon: BookOpen,
      href: `/guides/${guide.slug}`,
      type: 'guide' as const,
      guide: guide,
    }));
  }, [guides]);

  // Combine all resources
  const allResources = useMemo(() => {
    return [
      ...tools.map(t => ({ ...t, guide: undefined })),
      ...guideItems,
    ];
  }, [guideItems]);

  // All engines for dropdowns (sorted by brand, name); show all so user can always choose
  const allEnginesSorted = useMemo(() => {
    return [...(engines as Engine[])].sort((a, b) =>
      `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`)
    );
  }, [engines]);

  const filteredResources = useMemo(() => {
    let filtered = allResources;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => {
        if (item.guide) {
          return item.guide.category === selectedCategory;
        }
        return item.category === selectedCategory;
      });
    }

    // Filter by search query (text search only, not category)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        (item.guide?.tags?.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    // Sort: featured first, then popular, then alphabetical
    return filtered.sort((a, b) => {
      const aFeatured = 'featured' in a ? a.featured : false;
      const bFeatured = 'featured' in b ? b.featured : false;
      const aPopular = 'popular' in a ? a.popular : false;
      const bPopular = 'popular' in b ? b.popular : false;
      
      if (aFeatured && !bFeatured) return -1;
      if (!aFeatured && bFeatured) return 1;
      if (aPopular && !bPopular) return -1;
      if (!aPopular && bPopular) return 1;
      return a.title.localeCompare(b.title);
    });
  }, [allResources, searchQuery, selectedType, selectedCategory]);

  // Get featured/popular resources
  const featuredResources = useMemo(() => {
    return filteredResources.filter(r => 
      ('featured' in r && r.featured) || ('popular' in r && r.popular)
    );
  }, [filteredResources]);

  const regularResources = useMemo(() => {
    return filteredResources.filter(r => 
      !('featured' in r && r.featured) && !('popular' in r && r.popular)
    );
  }, [filteredResources]);

  // Filter videos based on engine and task
  const filteredVideos = useMemo(() => {
    let filtered = [...videos];

    // Filter by engine
    if (selectedEngineId !== 'all') {
      filtered = filtered.filter(v => v.engine_id === selectedEngineId);
    }

    // Filter by task/category
    if (selectedTask !== 'all') {
      filtered = filtered.filter(v => v.category === selectedTask);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v =>
        v.title.toLowerCase().includes(query) ||
        v.description?.toLowerCase().includes(query) ||
        v.channel_name?.toLowerCase().includes(query) ||
        v.engine?.name.toLowerCase().includes(query) ||
        v.engine?.brand.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [videos, selectedEngineId, selectedTask, searchQuery]);

  const typeCounts = useMemo(() => {
    return {
      all: allResources.length + videos.length,
      tool: allResources.filter(r => r.type === 'tool').length,
      calculator: allResources.filter(r => r.type === 'calculator').length,
      guide: allResources.filter(r => r.type === 'guide').length,
      video: videos.length,
      template: allResources.filter(r => r.type === 'template').length,
    };
  }, [allResources, videos]);

  return (
    <div className="min-h-screen bg-olive-900">
      <PageHero
        eyebrow="Resources"
        icon={<BarChart3 className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />}
        title="Tools & Resources"
        subtitle="Professional tools, calculators, and guides for your go-kart builds."
        sticky
      >
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-400" />
            <Input
              type="text"
              placeholder={selectedType === 'video' ? 'Search videos...' : 'Search tools, calculators, guides, and templates...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 bg-olive-800/70 border-olive-700/50 text-cream-100 placeholder-cream-500 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-olive-700/50 rounded transition-colors"
                aria-label="Clear search"
              >
                <span className="text-cream-400 text-sm">×</span>
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedType === category.id;
            const count = typeCounts[category.id as keyof typeof typeCounts];
            const colorClasses = {
              orange: isActive ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' : 'bg-olive-800/50 border-olive-700/50 text-cream-400 hover:bg-olive-800/70',
              blue: isActive ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-olive-800/50 border-olive-700/50 text-cream-400 hover:bg-olive-800/70',
              green: isActive ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-olive-800/50 border-olive-700/50 text-cream-400 hover:bg-olive-800/70',
              purple: isActive ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'bg-olive-800/50 border-olive-700/50 text-cream-400 hover:bg-olive-800/70',
              red: isActive ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-olive-800/50 border-olive-700/50 text-cream-400 hover:bg-olive-800/70',
              amber: isActive ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-olive-800/50 border-olive-700/50 text-cream-400 hover:bg-olive-800/70',
            };
            return (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedType(category.id as ResourceType);
                  setSelectedCategory('all');
                }}
                className={cn(
                  'px-5 py-2.5 rounded-lg border transition-all duration-200',
                  'flex items-center gap-2.5 font-medium text-sm',
                  colorClasses[category.color as keyof typeof colorClasses]
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{category.label}</span>
                <Badge
                  variant="default"
                  className={cn(
                    'text-xs px-2 py-0.5 ml-1',
                    isActive ? 'bg-white/10 text-cream-200 border-white/20' : 'bg-olive-700/50 text-cream-500 border-olive-600/50'
                  )}
                >
                  {count}
                </Badge>
              </button>
            );
          })}
        </div>
      </PageHero>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Videos Section */}
        {selectedType === 'video' && (
          <div className="space-y-6">
            {/* Enhanced Filter Section */}
            <Card className="border-red-500/30 bg-gradient-to-br from-red-500/5 via-olive-800/40 to-olive-800/40">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                    <Filter className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-cream-100">Filter Videos</h3>
                    <p className="text-sm text-cream-400">Find videos by engine or task</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-cream-200 mb-2">
                      <Cog className="w-4 h-4 text-red-400" />
                      Filter by Engine
                    </label>
                    <Select
                      value={selectedEngineId}
                      onChange={(e) => setSelectedEngineId(e.target.value)}
                      options={[
                        { value: 'all', label: 'All Engines' },
                        ...engines.map(engine => ({
                          value: engine.id,
                          label: `${engine.brand} ${engine.name}`,
                        })),
                      ]}
                      className="bg-olive-800/70 border-olive-700/50 hover:border-red-500/50 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-cream-200 mb-2">
                      <Settings className="w-4 h-4 text-red-400" />
                      Filter by Task
                    </label>
                    <Select
                      value={selectedTask}
                      onChange={(e) => setSelectedTask(e.target.value as VideoCategory | 'all')}
                      options={[
                        { value: 'all', label: 'All Tasks' },
                        ...VIDEO_CATEGORIES.map(cat => ({
                          value: cat,
                          label: CATEGORY_LABELS[cat],
                        })),
                      ]}
                      className="bg-olive-800/70 border-olive-700/50 hover:border-red-500/50 focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Active Filters Display */}
                {(selectedEngineId !== 'all' || selectedTask !== 'all') && (
                  <div className="mt-4 pt-4 border-t border-olive-700/30">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-xs text-cream-400">Active filters:</span>
                      {selectedEngineId !== 'all' && (
                        <Badge variant="default" className="bg-red-500/20 text-red-300 border-red-500/30 text-xs px-2.5 py-1">
                          {engines.find(e => e.id === selectedEngineId)?.name || 'Engine'}
                          <button
                            onClick={() => setSelectedEngineId('all')}
                            className="ml-2 hover:text-red-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      )}
                      {selectedTask !== 'all' && (
                        <Badge variant="default" className="bg-red-500/20 text-red-300 border-red-500/30 text-xs px-2.5 py-1">
                          {CATEGORY_LABELS[selectedTask]}
                          <button
                            onClick={() => setSelectedTask('all')}
                            className="ml-2 hover:text-red-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedEngineId('all');
                          setSelectedTask('all');
                        }}
                        className="text-xs h-7 px-2 text-cream-400 hover:text-cream-100"
                      >
                        Clear all
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Video Count Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-cream-100 mb-1">Videos</h2>
                <p className="text-cream-400 text-sm">
                  {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'} available
                  {searchQuery && ` matching "${searchQuery}"`}
                  {selectedEngineId !== 'all' && ` for ${engines.find(e => e.id === selectedEngineId)?.name || 'selected engine'}`}
                  {selectedTask !== 'all' && ` in ${CATEGORY_LABELS[selectedTask]}`}
                </p>
              </div>
            </div>

            {/* Loading State */}
            {loadingVideos ? (
              <div className="text-center py-20">
                <div className="inline-block w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin mb-4"></div>
                <p className="text-cream-400">Loading videos...</p>
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-olive-800/50 flex items-center justify-center">
                  <Film className="w-10 h-10 text-cream-400/50" />
                </div>
                <h3 className="text-xl font-semibold text-cream-100 mb-2">No videos found</h3>
                <p className="text-cream-400 mb-6 max-w-md mx-auto">
                  {searchQuery || selectedEngineId !== 'all' || selectedTask !== 'all'
                    ? 'No videos match your filters. Try adjusting your search or filters.'
                    : 'No videos available at this time.'}
                </p>
                {(searchQuery || selectedEngineId !== 'all' || selectedTask !== 'all') && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedEngineId('all');
                      setSelectedTask('all');
                    }}
                  >
                    Show All Videos
                  </Button>
                )}
              </div>
            ) : (
              <VideoGrid videos={filteredVideos} loading={false} />
            )}
          </div>
        )}

        {/* Build Templates full listing when Templates tab is selected */}
        {selectedType === 'template' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-cream-100 mb-1">Templates</h2>
              <p className="text-cream-400 text-sm">
                Pre-built configurations for common goals. Apply a template to the builder and customize it.
              </p>
            </div>
            <TemplatesListing />
          </div>
        )}

        {/* Calculators Section: embedded calculators + selector */}
        {selectedType === 'calculator' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-cream-100 mb-1">Calculators</h2>
              <p className="text-cream-400 text-sm">
                All calculators run here in the tab. Choose one below to use it.
              </p>
            </div>

            {/* Calculator selector tabs */}
            <div className="flex flex-wrap gap-2 border-b border-olive-700/50 pb-4">
              {[
                { id: 'hp-contribution', label: 'HP Contribution', icon: Zap },
                { id: 'gear-ratio', label: 'Gear Ratio', icon: Settings },
                { id: 'ignition-timing', label: 'Ignition Timing', icon: Gauge },
              ].map(({ id, label, icon: Icon }) => {
                const isActive = selectedCalculatorId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedCalculatorId(id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium text-sm transition-colors',
                      isActive
                        ? 'bg-green-500/20 border-green-500/50 text-green-400'
                        : 'bg-olive-800/50 border-olive-700/50 text-cream-400 hover:bg-olive-800/70 hover:text-cream-200'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Embedded calculator content — all functional within the tab */}
            <div className="min-h-[320px]">
              {selectedCalculatorId === 'hp-contribution' && <HPContributionCalculator />}
              {selectedCalculatorId === 'gear-ratio' && <GearRatioCalculator />}
              {selectedCalculatorId === 'ignition-timing' && <IgnitionTimingCalculator />}
            </div>
          </div>
        )}

        {/* Guides Section – same filter style as Videos (Filter Guides card + related + all guides) */}
        {selectedType === 'guide' && (
          <div className="space-y-6">
            <GuidesList />
          </div>
        )}

        {/* Other Resources Section (Tools, All - not Videos, not Templates, not Calculators, not Guides) */}
        {selectedType !== 'video' && selectedType !== 'template' && selectedType !== 'calculator' && selectedType !== 'guide' && (
          <>
            {/* Loading State */}
            {loadingGuides ? (
              <div className="text-center py-20">
                <div className="inline-block w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                <p className="text-cream-400">Loading resources...</p>
              </div>
            ) : filteredResources.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-olive-800/50 flex items-center justify-center">
              <Search className="w-10 h-10 text-cream-400/50" />
            </div>
            <h3 className="text-xl font-semibold text-cream-100 mb-2">No resources found</h3>
            <p className="text-cream-400 mb-6 max-w-md mx-auto">
              {searchQuery 
                ? `No resources match "${searchQuery}". Try different keywords or clear your search.`
                : 'No resources available in this category.'}
            </p>
            {(searchQuery || selectedType !== 'all') && (
              <Button
                variant="primary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                }}
              >
                Show All Resources
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* All Resources: dashboard layout */}
            {selectedType === 'all' && (
              <>
                {/* Category summary tiles – click to switch tab */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const count = typeCounts[cat.id as keyof typeof typeCounts] ?? 0;
                    const isActive = selectedType === cat.id;
                    const colorClasses: Record<string, string> = {
                      orange: 'border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/15',
                      blue: 'border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/15',
                      green: 'border-green-500/40 bg-green-500/10 hover:bg-green-500/15',
                      purple: 'border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/15',
                      red: 'border-red-500/40 bg-red-500/10 hover:bg-red-500/15',
                      amber: 'border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/15',
                    };
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedType(cat.id as ResourceType)}
                        className={cn(
                          'rounded-lg border p-3 text-left transition-colors',
                          colorClasses[cat.color] ?? 'border-olive-600 bg-olive-800/50 hover:bg-olive-800/70'
                        )}
                      >
                        <Icon className="w-5 h-5 text-cream-300 mb-1.5" />
                        <div className="text-sm font-medium text-cream-100 truncate">{cat.label}</div>
                        <div className="text-xs text-cream-500">{count}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Featured strip – compact */}
                {featuredResources.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-cream-300 uppercase tracking-wide mb-3">Featured & popular</h3>
                    <div className="flex flex-wrap gap-2">
                      {featuredResources.slice(0, 4).map((resource) => {
                        const Icon = resource.icon;
                        return (
                          <Link
                            key={resource.id}
                            href={resource.href}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-olive-800/60 border border-olive-600/50 hover:border-orange-500/40 text-cream-100 text-sm transition-colors"
                          >
                            <Icon className="w-4 h-4 text-orange-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{resource.title}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-cream-500 shrink-0" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Dense resource list */}
                <div>
                  <h3 className="text-sm font-semibold text-cream-300 uppercase tracking-wide mb-3">
                    All resources
                    {searchQuery && ` matching "${searchQuery}"`}
                  </h3>
                  <div className="rounded-lg border border-olive-700/50 bg-olive-800/20 overflow-hidden">
                    <div className="divide-y divide-olive-700/50 max-h-[420px] overflow-y-auto">
                      {filteredResources.length === 0 ? (
                        <div className="py-8 text-center text-cream-500 text-sm">No resources match.</div>
                      ) : (
                        filteredResources.map((resource) => {
                          const Icon = resource.icon;
                          const typeColors: Record<string, string> = {
                            tool: 'text-blue-400',
                            calculator: 'text-green-400',
                            guide: 'text-purple-400',
                            template: 'text-amber-400',
                          };
                          return (
                            <Link
                              key={resource.id}
                              href={resource.href}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-olive-700/30 transition-colors group"
                            >
                              <div className="w-9 h-9 rounded-lg bg-olive-800 flex items-center justify-center shrink-0 border border-olive-600/50">
                                <Icon className={cn('w-4 h-4', typeColors[resource.type] ?? 'text-cream-400')} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-cream-100 group-hover:text-orange-400 truncate">
                                  {resource.title}
                                </div>
                                <div className="text-xs text-cream-500 truncate">{resource.description}</div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {resource.category && (
                                  <span className="text-xs text-cream-500 hidden sm:inline">{resource.category}</span>
                                )}
                                <ArrowRight className="w-4 h-4 text-cream-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Non-all: single category view (Tools, etc.) */}
            {selectedType !== 'all' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-cream-100 mb-1">
                    {categories.find(c => c.id === selectedType)?.label}
                  </h2>
                  <p className="text-cream-400 text-sm">
                    {filteredResources.length} {filteredResources.length === 1 ? 'resource' : 'resources'} available
                    {searchQuery && ` matching "${searchQuery}"`}
                    {selectedCategory !== 'all' && ` in ${selectedCategory}`}
                  </p>
                </div>
              </div>

              {/* Tools tab: expandable Engine Manuals and Torque Specs by engine – side by side, compact */}
              {selectedType === 'tool' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {/* Engine & EV Manuals */}
                  <Card className="border-olive-700/50 bg-olive-800/30 overflow-hidden">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setToolsPanelsExpanded((prev) => ({ ...prev, manuals: !prev.manuals }));
                      }}
                      className="w-full flex items-center justify-between gap-2 p-3 sm:p-4 text-left hover:bg-olive-700/20 transition-colors"
                      aria-expanded={toolsPanelsExpanded.manuals}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 shrink-0">
                          <FileText className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-cream-100 truncate">Engine & EV Manuals</h3>
                          <p className="text-xs text-cream-400 mt-0.5 line-clamp-2">
                            Access owner&apos;s manuals for engines with manuals available
                          </p>
                        </div>
                      </div>
                      {toolsPanelsExpanded.manuals ? (
                        <ChevronUp className="w-4 h-4 text-cream-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-cream-400 shrink-0" />
                      )}
                    </button>
                    {toolsPanelsExpanded.manuals && (
                      <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0 border-t border-olive-700/50">
                        <label className="block text-xs font-medium text-cream-200 mb-1.5">Choose engine</label>
                        <Select
                          value={selectedManualEngineSlug}
                          onChange={(e) => setSelectedManualEngineSlug(e.target.value)}
                          placeholder={enginesLoading ? 'Loading...' : 'Select engine...'}
                          options={allEnginesSorted.map((e) => ({
                            value: e.slug,
                            label: `${e.brand} ${e.name}`,
                          }))}
                          disabled={enginesLoading}
                          className="mb-3 bg-olive-800/70 border-olive-700/50 hover:border-blue-500/50 focus:border-blue-500 text-sm"
                        />
                        {enginesLoading ? (
                          <p className="text-sm text-cream-500 py-2">Loading engines...</p>
                        ) : allEnginesSorted.length === 0 ? (
                          <p className="text-sm text-cream-500 py-2">No engines in database yet.</p>
                        ) : selectedManualEngineSlug ? (
                          (() => {
                            const engine = allEnginesSorted.find((e) => e.slug === selectedManualEngineSlug);
                            if (!engine) return null;
                            const hasManual = engine.manual_url && engine.manual_url.trim() !== '';
                            if (hasManual) {
                              return (
                                <ManualCard
                                  manualUrl={engine.manual_url!}
                                  engineName={`${engine.brand} ${engine.name}`}
                                />
                              );
                            }
                            return (
                              <p className="text-sm text-cream-500 py-2">
                                No manual for this engine.{' '}
                                <Link href={`/engines/${engine.slug}`} className="text-blue-400 hover:underline">
                                  View engine details
                                </Link>
                              </p>
                            );
                          })()
                        ) : (
                          <p className="text-sm text-cream-500 py-2">Select an engine to view manual options.</p>
                        )}
                      </div>
                    )}
                  </Card>

                  {/* Torque Specifications by Engine */}
                  <Card className="border-olive-700/50 bg-olive-800/30 overflow-hidden">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setToolsPanelsExpanded((prev) => ({ ...prev, torque: !prev.torque }));
                      }}
                      className="w-full flex items-center justify-between gap-2 p-3 sm:p-4 text-left hover:bg-olive-700/20 transition-colors"
                      aria-expanded={toolsPanelsExpanded.torque}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 shrink-0">
                          <Wrench className="w-4 h-4 text-orange-400" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-cream-100 truncate">Torque Specs by Engine</h3>
                          <p className="text-xs text-cream-400 mt-0.5 line-clamp-2">
                            Fastener torque values for each engine
                          </p>
                        </div>
                      </div>
                      {toolsPanelsExpanded.torque ? (
                        <ChevronUp className="w-4 h-4 text-cream-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-cream-400 shrink-0" />
                      )}
                    </button>
                    {toolsPanelsExpanded.torque && (
                      <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0 border-t border-olive-700/50">
                        <label className="block text-xs font-medium text-cream-200 mb-1.5">Choose engine</label>
                        <Select
                          value={selectedTorqueEngineSlug}
                          onChange={(e) => setSelectedTorqueEngineSlug(e.target.value)}
                          placeholder={enginesLoading ? 'Loading...' : 'Select engine...'}
                          options={allEnginesSorted.map((e) => ({
                            value: e.slug,
                            label: `${e.brand} ${e.name}`,
                          }))}
                          disabled={enginesLoading}
                          className="mb-3 bg-olive-800/70 border-olive-700/50 hover:border-orange-500/50 focus:border-orange-500 text-sm"
                        />
                        {enginesLoading ? (
                          <p className="text-sm text-cream-500 py-2">Loading engines...</p>
                        ) : allEnginesSorted.length === 0 ? (
                          <p className="text-sm text-cream-500 py-2">No engines in database yet.</p>
                        ) : selectedTorqueEngineSlug ? (
                          getTorqueSpecs(selectedTorqueEngineSlug) ? (
                            <Link
                              href={`/engines/${selectedTorqueEngineSlug}/torque-specs`}
                              className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium text-cream-100 bg-orange-500/20 border border-orange-500/30 hover:bg-orange-500/30 hover:border-orange-500/50 transition-colors w-fit"
                            >
                              <Wrench className="w-4 h-4 text-orange-400 shrink-0" />
                              View torque specifications
                              <ArrowRight className="w-4 h-4 shrink-0" />
                            </Link>
                          ) : (
                            <p className="text-sm text-cream-500 py-2">
                              No torque specs for this engine.{' '}
                              <Link
                                href={`/engines/${selectedTorqueEngineSlug}`}
                                className="text-orange-400 hover:underline"
                              >
                                View engine details
                              </Link>
                            </p>
                          )
                        ) : (
                          <p className="text-sm text-cream-500 py-2">Select an engine to view torque specifications.</p>
                        )}
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {/* Resources Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </div>
            )}
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}

interface ResourceCardProps {
  resource: {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    type: 'tool' | 'calculator' | 'guide' | 'template';
    featured?: boolean;
    popular?: boolean;
    category?: string;
    guide?: Guide;
  };
  featured?: boolean;
}

function ResourceCard({ resource, featured = false }: ResourceCardProps) {
  const Icon = resource.icon;
  const isGuide = resource.type === 'guide';
  const guide = resource.guide;

  // Color scheme based on type
  const typeStyles = {
    tool: {
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      iconColor: 'text-blue-400',
      border: 'border-blue-500/20',
      hoverBorder: 'hover:border-blue-500/40',
      accent: 'text-blue-400',
    },
    calculator: {
      iconBg: 'bg-green-500/10 border-green-500/20',
      iconColor: 'text-green-400',
      border: 'border-green-500/20',
      hoverBorder: 'hover:border-green-500/40',
      accent: 'text-green-400',
    },
    guide: {
      iconBg: 'bg-purple-500/10 border-purple-500/20',
      iconColor: 'text-purple-400',
      border: 'border-purple-500/20',
      hoverBorder: 'hover:border-purple-500/40',
      accent: 'text-purple-400',
    },
    template: {
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      iconColor: 'text-amber-400',
      border: 'border-amber-500/20',
      hoverBorder: 'hover:border-amber-500/40',
      accent: 'text-amber-400',
    },
  };

  const styles = typeStyles[resource.type] || typeStyles.tool;

  return (
    <Link href={resource.href}>
      <Card 
        className={cn(
          'h-full group cursor-pointer transition-all duration-300',
          'hover:-translate-y-1 hover:shadow-xl',
          featured 
            ? 'border-orange-500/40 bg-gradient-to-br from-orange-500/5 via-olive-800/50 to-olive-800/40 hover:border-orange-500/60' 
            : `border-olive-700/50 bg-olive-800/40 ${styles.border} ${styles.hoverBorder}`
        )}
      >
        {/* Guide Image Header */}
        {isGuide && guide?.featured_image_url && (
          <div className="relative w-full h-40 bg-olive-800 overflow-hidden rounded-t-xl">
            <Image
              src={guide.featured_image_url}
              alt={resource.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-olive-900/90 via-olive-900/20 to-transparent" />
          </div>
        )}
        
        <CardContent className={cn('p-6', isGuide && guide?.featured_image_url && 'pt-6')}>
          {/* Featured Badge */}
          {featured && (
            <div className="mb-3">
              <Badge 
                variant="default" 
                className="text-xs px-2.5 py-1 bg-orange-500/20 text-orange-400 border-orange-500/30"
              >
                <Star className="w-3 h-3 mr-1 inline" />
                {resource.featured ? 'Featured' : 'Popular'}
              </Badge>
            </div>
          )}

          {/* Icon and Title */}
          <div className="flex items-start gap-4 mb-4">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110',
              featured ? 'bg-orange-500/20 border border-orange-500/30' : `${styles.iconBg} border`,
              styles.iconColor
            )}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                'font-bold text-lg leading-tight mb-2 transition-colors',
                featured ? 'text-orange-400' : 'text-cream-100 group-hover:' + styles.accent
              )}>
                {resource.title}
              </h3>
              {/* Category Badge */}
              {resource.category && (
                <Badge variant="default" className="text-xs px-2 py-0.5 bg-olive-700/50 text-cream-300 border-olive-600/50 mb-2">
                  {resource.category}
                </Badge>
              )}
              {/* Guide-specific badges */}
              {isGuide && guide && (
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {guide.category && (
                    <Badge variant="default" className="text-xs px-2 py-0.5 bg-olive-700/50 text-cream-300 border-olive-600/50">
                      {guide.category}
                    </Badge>
                  )}
                  {guide.difficulty_level && (
                    <Badge 
                      variant={guide.difficulty_level === 'beginner' ? 'success' : guide.difficulty_level === 'intermediate' ? 'info' : guide.difficulty_level === 'advanced' ? 'warning' : 'error'} 
                      className="text-xs px-2 py-0.5"
                    >
                      {guide.difficulty_level}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Description */}
          <p className="text-cream-300/80 text-sm leading-relaxed line-clamp-3 mb-5">
            {resource.description}
          </p>
          
          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-olive-700/30">
            <div className={cn(
              'flex items-center text-sm font-semibold transition-all',
              featured ? 'text-orange-400' : styles.accent,
              'group-hover:underline'
            )}>
              <span>
                {isGuide ? 'View Guide' : resource.type === 'calculator' ? 'Open Calculator' : 'Open Tool'}
              </span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
            {isGuide && guide?.estimated_time_minutes && (
              <div className="flex items-center gap-1.5 text-xs text-cream-400">
                <Clock className="w-4 h-4" />
                <span>~{guide.estimated_time_minutes}m</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
