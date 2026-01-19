'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, AlertTriangle, BookOpen, Filter, Search, ArrowRight, Cog } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getGuides } from '@/actions/guides';
import { useEngines } from '@/hooks/use-engines';
import type { Guide } from '@/types/guides';
import type { Engine } from '@/types/database';

const DIFFICULTY_COLORS = {
  beginner: 'success',
  intermediate: 'info',
  advanced: 'warning',
  expert: 'error',
} as const;

const CATEGORIES = [
  'All',
  'Installation',
  'Maintenance',
  'Performance',
  'Safety',
  'Troubleshooting',
] as const;

export function GuidesList() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedEngine, setSelectedEngine] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  
  const { data: engines } = useEngines();

  useEffect(() => {
    loadGuides();
  }, [selectedEngine]);

  const loadGuides = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: { engine_id?: string } = {};
      if (selectedEngine && selectedEngine !== 'All') {
        filters.engine_id = selectedEngine;
      }
      
      const result = await getGuides(filters);
      if (result.success && result.data) {
        setGuides(result.data);
      } else {
        setError('Failed to load guides');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load guides');
    } finally {
      setLoading(false);
    }
  };

  const filteredGuides = guides.filter(guide => {
    const matchesCategory = selectedCategory === 'All' || guide.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || guide.difficulty_level === selectedDifficulty;
    const matchesSearch = searchQuery === '' || 
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-cream-400">Loading guides...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-500/30 bg-red-500/10">
        <CardContent className="p-6 text-center">
          <p className="text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-400" />
              <input
                type="text"
                placeholder="Search guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-olive-800 border border-olive-600 rounded-md text-cream-100 placeholder:text-cream-400 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Category, Engine, and Difficulty Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-cream-200 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-olive-800 border border-olive-600 rounded-md text-cream-100"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-cream-200 mb-2 flex items-center gap-2">
                  <Cog className="w-4 h-4" />
                  Engine
                </label>
                <select
                  value={selectedEngine}
                  onChange={(e) => setSelectedEngine(e.target.value)}
                  className="w-full px-3 py-2 bg-olive-800 border border-olive-600 rounded-md text-cream-100"
                >
                  <option value="All">All Engines</option>
                  {engines?.map(engine => (
                    <option key={engine.id} value={engine.id}>
                      {engine.brand} {engine.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-cream-200 mb-2">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 bg-olive-800 border border-olive-600 rounded-md text-cream-100"
                >
                  <option value="All">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-cream-400">
          {filteredGuides.length} guide{filteredGuides.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Guides Grid */}
      {filteredGuides.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-olive-600 mx-auto mb-4 opacity-50" />
            <p className="text-cream-400">No guides found. Try adjusting your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map((guide) => (
            <Link key={guide.id} href={`/guides/${guide.slug}`}>
              <Card className="h-full hover:border-orange-500 transition-all cursor-pointer group">
                {guide.featured_image_url && (
                  <div className="relative w-full h-48 bg-olive-800 overflow-hidden rounded-t-lg">
                    <Image
                      src={guide.featured_image_url}
                      alt={guide.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      unoptimized
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2 className="text-xl font-bold text-cream-100 group-hover:text-orange-400 transition-colors flex-1">
                      {guide.title}
                    </h2>
                    {guide.difficulty_level && (
                      <Badge variant={DIFFICULTY_COLORS[guide.difficulty_level] || 'default'} className="flex-shrink-0">
                        {guide.difficulty_level}
                      </Badge>
                    )}
                  </div>
                  {guide.category && (
                    <Badge variant="default" className="text-xs mb-2">
                      {guide.category}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  {guide.excerpt && (
                    <p className="text-cream-300 text-sm mb-4 line-clamp-3">
                      {guide.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-cream-400 mb-4">
                    {guide.estimated_time_minutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>~{guide.estimated_time_minutes} min</span>
                      </div>
                    )}
                    {guide.views_count !== undefined && guide.views_count > 0 && (
                      <span>{guide.views_count} views</span>
                    )}
                  </div>
                  <div className="flex items-center text-orange-400 group-hover:text-orange-300 transition-colors">
                    <span className="text-sm font-medium">View Guide</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
