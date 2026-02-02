'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Search, 
  Youtube, 
  CheckCircle2, 
  Loader2, 
  Plus,
  ExternalLink,
  AlertCircle,
  X
} from 'lucide-react';
import { searchYouTubeVideos, bulkCreateVideosFromYouTube } from '@/actions/admin/videos';
import type { YouTubeSearchResult } from '@/lib/youtube-api';
import { toast } from 'sonner';

interface VideoSearchAndAddProps {
  productType: 'engine' | 'part';
  productId: string;
  productName: string;
  productBrand?: string | null;
  suggestedQueries?: string[];
  onVideosAdded?: () => void;
}

export function VideoSearchAndAdd({
  productType,
  productId,
  productName,
  productBrand,
  suggestedQueries = [],
  onVideosAdded,
}: VideoSearchAndAddProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<YouTubeSearchResult[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build default search query
  const defaultQuery = [productBrand, productName, 'go kart'].filter(Boolean).join(' ');

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery || defaultQuery;
    if (!searchTerm.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setSearching(true);
    setError(null);
    setResults([]);
    setSelectedVideos(new Set());

    try {
      const result = await searchYouTubeVideos(searchTerm, 15);
      
      if (result.success && result.data) {
        setResults(result.data);
        if (result.data.length === 0) {
          toast.info('No videos found. Try a different search term.');
        }
      } else {
        const errorMsg = 'error' in result ? result.error : 'Failed to search YouTube';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to search YouTube';
      setError(message);
      toast.error(message);
    } finally {
      setSearching(false);
    }
  };

  const toggleVideoSelection = (videoId: string) => {
    const newSelected = new Set(selectedVideos);
    if (newSelected.has(videoId)) {
      newSelected.delete(videoId);
    } else {
      newSelected.add(videoId);
    }
    setSelectedVideos(newSelected);
  };

  const selectAll = () => {
    setSelectedVideos(new Set(results.map(r => r.videoId)));
  };

  const deselectAll = () => {
    setSelectedVideos(new Set());
  };

  const handleAddVideos = async () => {
    if (selectedVideos.size === 0) {
      toast.error('Please select at least one video');
      return;
    }

    setAdding(true);
    setError(null);

    const videosToAdd = results
      .filter(r => selectedVideos.has(r.videoId))
      .map(r => ({
        videoUrl: r.videoUrl,
        title: r.title,
        description: r.description,
        thumbnailUrl: r.thumbnailUrl,
        channelName: r.channelName,
        channelUrl: r.channelId ? `https://www.youtube.com/channel/${r.channelId}` : undefined,
        publishedDate: r.publishedAt,
        category: 'tutorial', // Default, can be updated later
      }));

    try {
      const result = await bulkCreateVideosFromYouTube(
        productType,
        productId,
        videosToAdd
      );

      if (result.success && result.data) {
        const { created, failed, errors } = result.data;
        toast.success(
          `Successfully added ${created} video(s)${failed > 0 ? ` (${failed} failed)` : ''}`
        );
        
        if (errors.length > 0) {
          console.warn('Video creation errors:', errors);
        }

        // Reset state
        setResults([]);
        setSelectedVideos(new Set());
        setSearchQuery('');

        // Notify parent
        if (onVideosAdded) {
          onVideosAdded();
        }
      } else {
        const errorMsg = 'error' in result ? result.error : 'Failed to add videos';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add videos';
      setError(message);
      toast.error(message);
    } finally {
      setAdding(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <Card className="border-olive-600 bg-olive-800/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-cream-100 flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-500" />
              Add YouTube Videos
            </h3>
            <p className="text-sm text-cream-400 mt-1">
              Search YouTube and add videos for {productName}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cream-400 w-5 h-5" />
            <Input
              type="text"
              placeholder={`Search YouTube (e.g., "${defaultQuery}")`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !searching) {
                  handleSearch();
                }
              }}
              className="pl-10 bg-olive-900 border-olive-600 text-cream-100"
            />
          </div>
          <Button
            variant="primary"
            icon={<Search className="w-4 h-4" />}
            onClick={() => handleSearch()}
            disabled={searching}
          >
            {searching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {/* Suggested Queries */}
        {suggestedQueries.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-cream-500">Quick searches:</span>
            {suggestedQueries.map((query, i) => (
              <button
                key={i}
                onClick={() => {
                  setSearchQuery(query);
                  handleSearch(query);
                }}
                className="text-xs px-2 py-1 rounded bg-olive-700/50 hover:bg-olive-700 text-cream-300 transition-colors"
                disabled={searching}
              >
                {query}
              </button>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-cream-400">
                  Found {results.length} video{results.length !== 1 ? 's' : ''}
                </span>
                {selectedVideos.size > 0 && (
                  <Badge variant="default" className="text-xs">
                    {selectedVideos.size} selected
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectedVideos.size === results.length ? deselectAll : selectAll}
                  className="text-xs"
                >
                  {selectedVideos.size === results.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={handleAddVideos}
                  disabled={adding || selectedVideos.size === 0}
                >
                  {adding
                    ? 'Adding...'
                    : `Add ${selectedVideos.size > 0 ? `${selectedVideos.size} ` : ''}Video${selectedVideos.size !== 1 ? 's' : ''}`}
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {results.map((video) => {
                const isSelected = selectedVideos.has(video.videoId);
                return (
                  <div
                    key={video.videoId}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-olive-600 bg-olive-800/30 hover:border-olive-500'
                    }`}
                    onClick={() => toggleVideoSelection(video.videoId)}
                  >
                    <div className="flex gap-3">
                      {/* Thumbnail */}
                      <div className="relative w-32 h-20 shrink-0 rounded overflow-hidden bg-olive-900">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-orange-400" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-cream-100 line-clamp-2 mb-1">
                          {video.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-cream-500 mb-1">
                          <span>{video.channelName}</span>
                          {video.publishedAt && (
                            <>
                              <span>•</span>
                              <span>{formatDate(video.publishedAt)}</span>
                            </>
                          )}
                        </div>
                        {video.description && (
                          <p className="text-xs text-cream-400 line-clamp-2">
                            {video.description}
                          </p>
                        )}
                        <a
                          href={video.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 mt-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View on YouTube
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!searching && results.length === 0 && searchQuery && (
          <div className="text-center py-8 text-cream-500">
            <Youtube className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No videos found. Try a different search term.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
