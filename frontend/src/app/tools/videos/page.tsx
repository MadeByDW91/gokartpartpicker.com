'use client';

import { useState, useEffect } from 'react';
import { Film, Search, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { VideoCard } from '@/components/videos/VideoCard';
import { VideoGrid } from '@/components/videos/VideoGrid';
import { getAllVideos } from '@/actions/videos';
import { VIDEO_CATEGORIES, type VideoCategory, type Video } from '@/types/database';
import { Pagination } from '@/components/ui/Pagination';
import { usePagination } from '@/hooks/use-pagination';

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

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory | 'all'>('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  // Load all videos
  useEffect(() => {
    async function loadVideos() {
      setLoading(true);
      setError(null);
      try {
        const result = await getAllVideos();
        if (result.success && result.data) {
          setVideos(result.data);
        } else {
          setError(result.success ? 'Unknown error' : (result.error || 'Failed to load videos'));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load videos');
      } finally {
        setLoading(false);
      }
    }
    loadVideos();
  }, []);

  // Filter videos based on search and category
  useEffect(() => {
    let filtered = [...videos];

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(v => v.category === selectedCategory);
    }

    // Apply featured filter
    if (showFeaturedOnly) {
      filtered = filtered.filter(v => v.is_featured);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v => 
        v.title.toLowerCase().includes(query) ||
        v.description?.toLowerCase().includes(query) ||
        v.channel_name?.toLowerCase().includes(query)
      );
    }

    setFilteredVideos(filtered);
  }, [videos, selectedCategory, showFeaturedOnly, searchQuery]);

  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedVideos,
    goToPage,
    totalItems,
  } = usePagination(filteredVideos, { itemsPerPage: 24 });

  const getCategoryCount = (category: VideoCategory) => {
    return videos.filter(v => v.category === category).length;
  };

  const featuredCount = videos.filter(v => v.is_featured).length;

  return (
    <div className="min-h-screen bg-olive-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Film className="w-10 h-10 text-orange-400" />
            <h1 className="text-display text-4xl md:text-5xl text-cream-100">
              Useful Videos
            </h1>
          </div>
          <p className="text-lg text-cream-300 max-w-2xl mx-auto">
            Browse our complete library of go-kart videos. Installation guides, tutorials, reviews, and more.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cream-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search videos by title, description, or channel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-olive-800 border-olive-600 text-cream-100 placeholder:text-cream-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cream-400 hover:text-cream-200"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Category and Featured Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant={selectedCategory === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Categories
            </Button>
            {VIDEO_CATEGORIES.map((category) => {
              const count = getCategoryCount(category);
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  disabled={count === 0}
                  className={count === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  {CATEGORY_LABELS[category]}
                  <Badge variant="default" size="sm" className="ml-2">
                    {count}
                  </Badge>
                </Button>
              );
            })}
            <div className="flex-1" />
            <Button
              variant={showFeaturedOnly ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
            >
              Featured Only
              {featuredCount > 0 && (
                <Badge variant="default" size="sm" className="ml-2">
                  {featuredCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-cream-400">
            {loading ? (
              'Loading videos...'
            ) : (
              <>
                Showing{' '}
                <span className="text-cream-100 font-medium">
                  {totalItems > 0 ? ((currentPage - 1) * 24 + 1) : 0}
                </span>
                -
                <span className="text-cream-100 font-medium">
                  {Math.min(currentPage * 24, totalItems)}
                </span>{' '}
                of{' '}
                <span className="text-cream-100 font-medium">
                  {totalItems}
                </span>{' '}
                videos
                {selectedCategory !== 'all' && (
                  <> in <span className="text-orange-400">{CATEGORY_LABELS[selectedCategory]}</span></>
                )}
              </>
            )}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <Card className="bg-olive-800 border-olive-600 mb-8">
            <CardContent className="py-8 text-center">
              <p className="text-cream-100 mb-2">Failed to load videos</p>
              <p className="text-cream-400 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="bg-olive-800 border-olive-600">
                <CardContent className="p-0">
                  <div className="animate-pulse bg-olive-700 h-40 rounded-t-lg" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-olive-700 rounded w-3/4" />
                    <div className="h-3 bg-olive-700 rounded w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Videos Grid */}
        {!loading && !error && paginatedVideos.length > 0 && (
          <>
            <VideoGrid videos={paginatedVideos} loading={false} />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                />
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !error && paginatedVideos.length === 0 && (
          <Card className="bg-olive-800 border-olive-600">
            <CardContent className="py-12 text-center">
              <Film className="w-16 h-16 text-olive-500 mx-auto mb-4 opacity-50" />
              <p className="text-cream-100 text-lg mb-2">No videos found</p>
              <p className="text-cream-400 text-sm">
                {searchQuery || selectedCategory !== 'all' || showFeaturedOnly
                  ? 'Try adjusting your filters or search query.'
                  : 'Check back soon for new videos.'}
              </p>
              {(searchQuery || selectedCategory !== 'all' || showFeaturedOnly) && (
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setShowFeaturedOnly(false);
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
