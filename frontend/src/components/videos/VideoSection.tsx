'use client';

import { useState, useEffect } from 'react';
import { Film, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { VideoGrid } from './VideoGrid';
import { VideoCard } from './VideoCard';
import { 
  getEngineVideos, 
  getPartVideos, 
  getFeaturedEngineVideos, 
  getFeaturedPartVideos 
} from '@/actions/videos';
import type { Video, VideoCategory } from '@/types/database';

const CATEGORIES: VideoCategory[] = [
  'unboxing',
  'installation',
  'maintenance',
  'modification',
  'troubleshooting',
  'tutorial',
  'review',
  'tips',
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

interface VideoSectionProps {
  engineId?: string;
  partId?: string;
  initialVideos?: Video[];
  featuredCount?: number;
}

export function VideoSection({ 
  engineId, 
  partId, 
  initialVideos = [],
  featuredCount = 5 
}: VideoSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory | 'all'>('all');
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [allVideos, setAllVideos] = useState<Video[]>(initialVideos); // Keep unfiltered list for counts
  const [featuredVideos, setFeaturedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load featured videos
  useEffect(() => {
    async function loadFeatured() {
      try {
        if (engineId) {
          const result = await getFeaturedEngineVideos(engineId, featuredCount);
          if (result.success && result.data) {
            setFeaturedVideos(result.data);
          }
        } else if (partId) {
          const result = await getFeaturedPartVideos(partId, featuredCount);
          if (result.success && result.data) {
            setFeaturedVideos(result.data);
          }
        }
      } catch (err) {
        console.error('Failed to load featured videos:', err);
      }
    }
    
    if (engineId || partId) {
      loadFeatured();
    }
  }, [engineId, partId, featuredCount]);

  // Load all videos once to get accurate category counts
  useEffect(() => {
    async function loadAllVideos() {
      if (!engineId && !partId) return;
      
      try {
        let result;
        if (engineId) {
          result = await getEngineVideos(engineId, undefined); // Get all videos
        } else if (partId) {
          result = await getPartVideos(partId, undefined); // Get all videos
        }
        
        if (result && result.success && result.data) {
          setAllVideos(result.data);
        }
      } catch (err) {
        console.error('Failed to load all videos:', err);
      }
    }
    
    loadAllVideos();
  }, [engineId, partId]);

  // Load videos by category
  useEffect(() => {
    async function loadVideos() {
      if (!engineId && !partId) return;
      
      setLoading(true);
      try {
        let result;
        if (engineId) {
          result = await getEngineVideos(
            engineId, 
            selectedCategory === 'all' ? undefined : selectedCategory
          );
        } else if (partId) {
          result = await getPartVideos(
            partId, 
            selectedCategory === 'all' ? undefined : selectedCategory
          );
        }
        
        if (result && result.success && result.data) {
          setVideos(result.data);
        }
      } catch (err) {
        console.error('Failed to load videos:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadVideos();
  }, [engineId, partId, selectedCategory]);

  // Filter out featured videos from main list
  const featuredIds = new Set(featuredVideos.map(v => v.id));
  const filteredVideos = videos.filter(v => !featuredIds.has(v.id));
  const displayedVideos = showAll ? filteredVideos : filteredVideos.slice(0, 12);
  const hasMore = filteredVideos.length > 12;
  const hasAnyVideos = videos.length > 0 || featuredVideos.length > 0;

  // Get category counts from unfiltered list so counts are always accurate
  const getCategoryCount = (category: VideoCategory) => {
    return allVideos.filter(v => v.category === category).length;
  };

  // Don't render at all if we have nothing to show videos for
  if (!engineId && !partId) {
    return null;
  }

  // Show initial preview (3 featured videos or first 3 videos)
  const previewVideos = featuredVideos.length > 0 
    ? featuredVideos.slice(0, 3)
    : filteredVideos.slice(0, 3);

  return (
    <Card className="mt-8 bg-olive-800/50 border-olive-600 shadow-lg">
      <CardHeader className="bg-olive-800/30 border-b border-olive-600/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Film className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-bold text-cream-100">Videos</h2>
          </div>
          {!isExpanded && hasAnyVideos && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              View All
            </Button>
          )}
        </div>

        {/* Category tabs - Always visible, even with 0 count */}
        {isExpanded && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Button>
            {CATEGORIES.map((category) => {
              const count = getCategoryCount(category);
              const isSelected = selectedCategory === category;
              return (
                <Button
                  key={category}
                  variant={isSelected ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  disabled={false}
                  className={count === 0 && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}
                  title={count === 0 ? 'No videos in this category' : ''}
                >
                  {CATEGORY_LABELS[category]}
                  <Badge variant="default" size="sm" className="ml-2">
                    {count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Collapsed Preview */}
        {!isExpanded && hasAnyVideos && (
          <div className="bg-olive-700/30 rounded-lg p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {previewVideos.map((video) => (
                <VideoCard key={video.id} video={video} compact />
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button
                variant="secondary"
                onClick={() => setIsExpanded(true)}
                icon={<ChevronDown className="w-4 h-4" />}
                className="bg-olive-700 hover:bg-olive-600 border-olive-500 text-cream-100"
              >
                View All Videos ({videos.length})
              </Button>
            </div>
          </div>
        )}

        {/* Expanded View */}
        {isExpanded && (
          <>
            {/* Featured videos section */}
            {featuredVideos.length > 0 && selectedCategory === 'all' && (
              <div className="mb-8 bg-olive-700/20 rounded-lg p-6 border border-olive-600/30">
                <h3 className="text-lg font-semibold text-cream-100 mb-4 flex items-center gap-2">
                  Featured Videos
                  <Badge variant="warning" size="sm">Featured</Badge>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {featuredVideos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </div>
            )}

            {/* Main videos section */}
            {selectedCategory === 'all' && filteredVideos.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-cream-100 mb-4">
                  All Videos
                </h3>
              </div>
            )}

            {/* Video grid or empty state */}
            {!hasAnyVideos && !loading ? (
              <div className="text-center py-12 text-cream-400">
                <p>No videos for this engine yet.</p>
                <p className="text-sm mt-2">Check back soon or browse our other engines.</p>
              </div>
            ) : (
              <>
                <VideoGrid videos={displayedVideos} loading={loading} />
                {hasMore && !showAll && (
                  <div className="mt-6 text-center">
                    <Button
                      variant="secondary"
                      onClick={() => setShowAll(true)}
                      icon={<ChevronDown className="w-4 h-4" />}
                    >
                      Load More Videos
                    </Button>
                  </div>
                )}
                {showAll && hasMore && (
                  <div className="mt-6 text-center">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowAll(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      icon={<ChevronUp className="w-4 h-4" />}
                    >
                      Show Less
                    </Button>
                  </div>
                )}
                {displayedVideos.length === 0 && !loading && hasAnyVideos && (
                  <div className="text-center py-8 text-cream-400">
                    No videos available in this category.
                  </div>
                )}
              </>
            )}

            {/* Collapse button */}
            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                icon={<ChevronUp className="w-4 h-4" />}
              >
                Show Less
              </Button>
            </div>
          </>
        )}

        {/* Empty state when collapsed */}
        {!isExpanded && !hasAnyVideos && !loading && (
          <div className="text-center py-8 text-cream-400">
            <p>No videos for this engine yet.</p>
            <p className="text-sm mt-2">Check back soon or browse our other engines.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
