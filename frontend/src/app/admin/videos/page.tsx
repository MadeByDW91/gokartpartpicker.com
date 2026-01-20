'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Plus, Search, Pencil, Trash2, ImagePlus, Youtube, Trash, ImageOff, Film } from 'lucide-react';
import { getAdminVideos, deleteVideo, bulkDeleteVideos, refreshVideoThumbnails, fillVideoUrlsFromYouTube } from '@/actions/admin/videos';
import { getYouTubeThumbnailUrl, isEmbeddableVideoUrl } from '@/lib/video-utils';
import type { Video } from '@/types/database';

function formatDuration(s: number | null | undefined): string {
  if (s == null || s < 0) return '—';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function formatViews(n: number | null | undefined): string {
  if (n == null || n < 1) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function formatPublished(d: string | null | undefined): string {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '—';
  }
}

function ThumbnailCell({ video }: { video: Video }) {
  const [loadError, setLoadError] = useState(false);
  const thumbUrl = video.thumbnail_url || getYouTubeThumbnailUrl(video.video_url) || null;
  const isPlaceholder = !isEmbeddableVideoUrl(video.video_url);

  if (isPlaceholder) {
    return (
      <div className="w-20 h-[45px] shrink-0 rounded overflow-hidden bg-olive-700 flex flex-col items-center justify-center" title="Placeholder URL – replace with real YouTube link">
        <Film className="w-4 h-4 text-olive-500" />
        <span className="text-[10px] text-cream-500">Placeholder</span>
      </div>
    );
  }
  if (!thumbUrl) {
    return (
      <div className="w-20 h-[45px] shrink-0 rounded overflow-hidden bg-olive-700 flex flex-col items-center justify-center" title="No thumbnail (non-YouTube or missing)">
        <ImageOff className="w-4 h-4 text-olive-500" />
        <span className="text-[10px] text-cream-500">No thumb</span>
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="w-20 h-[45px] shrink-0 rounded overflow-hidden bg-olive-700 flex flex-col items-center justify-center" title="Thumbnail failed to load">
        <ImageOff className="w-4 h-4 text-amber-500" />
        <span className="text-[10px] text-amber-400">Broken</span>
      </div>
    );
  }
  return (
    <div className="w-20 h-[45px] shrink-0 rounded overflow-hidden bg-olive-700 relative" title="Thumbnail OK">
      <img
        src={thumbUrl}
        alt=""
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
        onError={() => setLoadError(true)}
      />
    </div>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  unboxing: 'Unboxing',
  installation: 'Installation',
  maintenance: 'Maintenance',
  modification: 'Modification',
  troubleshooting: 'Troubleshooting',
  tutorial: 'Tutorial',
  review: 'Review',
  tips: 'Tips',
};

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [thumbRefreshing, setThumbRefreshing] = useState(false);
  const [urlFilling, setUrlFilling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminVideos({ search: searchQuery || undefined });
      if (result.success && result.data) {
        setVideos(result.data);
      } else if (!result.success) {
        setError('error' in result ? result.error : 'Failed to fetch videos');
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleFillUrlsFromYouTube = async () => {
    setUrlFilling(true);
    setError(null);
    try {
      const result = await fillVideoUrlsFromYouTube();
      if (result.success && result.data) {
        await fetchVideos();
        const { filled, remaining, limit } = result.data;
        if (filled > 0) {
          alert(`Filled ${filled} video URL(s) from YouTube.${remaining > 0 ? ` ${remaining} placeholder(s) left. Run again (quota: ~${limit}/day) or tomorrow.` : ''}`);
        } else if (remaining === 0) {
          alert('No placeholder URLs left to fill.');
        } else {
          alert(`No new URLs filled (API may have no results or quota). ${remaining} placeholder(s) remain.`);
        }
      } else if (!result.success) {
        const msg = 'error' in result ? result.error : 'Failed to fill URLs';
        setError(msg);
        alert(msg);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to fill URLs from YouTube');
      alert('Failed to fill URLs from YouTube');
    } finally {
      setUrlFilling(false);
    }
  };

  const handleRefreshThumbnails = async () => {
    setThumbRefreshing(true);
    setError(null);
    try {
      const result = await refreshVideoThumbnails();
      if (result.success && result.data) {
        await fetchVideos();
        const { updated, placeholderUrlCount } = result.data;
        if (updated > 0) {
          alert(`Updated ${updated} thumbnail(s) from video URLs.`);
        } else if (placeholderUrlCount > 0) {
          alert(
            `No thumbnails updated. ${placeholderUrlCount} video(s) still have placeholder URLs.\n\n` +
            `Run "Auto-fill URLs from YouTube" first to replace placeholders with real YouTube links. ` +
            `After that, thumbnails will be set automatically (or run this again).`
          );
        } else {
          alert(
            'No thumbnails to update. All videos either already have thumbnails or use non-YouTube URLs.'
          );
        }
      } else if (!result.success) {
        const msg = 'error' in result ? result.error : 'Failed to refresh thumbnails';
        setError(msg);
        alert(msg);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to refresh thumbnails');
      alert('Failed to refresh thumbnails');
    } finally {
      setThumbRefreshing(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredVideos.map((v) => v.id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkRemove = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Remove ${selectedIds.size} selected video(s)? This cannot be undone.`)) return;
    setBulkDeleting(true);
    setError(null);
    try {
      const result = await bulkDeleteVideos(Array.from(selectedIds));
      if (result.success && result.data) {
        setSelectedIds(new Set());
        await fetchVideos();
        alert(`Removed ${result.data.deleted} video(s).`);
      } else if (!result.success) {
        const msg = 'error' in result ? result.error : 'Failed to remove videos';
        setError(msg);
        alert(msg);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to remove videos');
      alert('Failed to remove videos');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleDelete = async (video: Video) => {
    if (!confirm(`Are you sure you want to delete "${video.title}"?`)) {
      return;
    }

    setDeleting(video.id);
    setError(null);
    try {
      const result = await deleteVideo(video.id);
      if (result.success) {
        await fetchVideos();
      } else if (!result.success) {
        const errorMsg = 'error' in result ? result.error : 'Failed to delete video';
        setError(errorMsg);
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete video';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setDeleting(null);
    }
  };

  const filteredVideos = videos.filter((video) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      video.title.toLowerCase().includes(query) ||
      video.description?.toLowerCase().includes(query) ||
      video.channel_name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cream-100">Video Management</h1>
          <p className="text-cream-400 mt-1">Manage educational videos for engines and parts</p>
        </div>
        <Link href="/admin/videos/new">
          <Button icon={<Plus className="w-4 h-4" />}>
            Add Video
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-[rgba(166,61,64,0.1)] border border-[rgba(166,61,64,0.3)] rounded-lg">
          <p className="text-[var(--error)]">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <Button
              variant="primary"
              onClick={handleFillUrlsFromYouTube}
              disabled={urlFilling}
              icon={<Youtube className="w-4 h-4" />}
            >
              {urlFilling ? 'Searching YouTube…' : 'Auto-fill URLs from YouTube'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleRefreshThumbnails}
              disabled={thumbRefreshing}
              icon={<ImagePlus className="w-4 h-4" />}
            >
              {thumbRefreshing ? 'Refreshing…' : 'Auto-fill thumbnails'}
            </Button>
            {selectedIds.size > 0 && (
              <>
                <Button
                  variant="danger"
                  onClick={handleBulkRemove}
                  disabled={bulkDeleting}
                  icon={<Trash className="w-4 h-4" />}
                >
                  {bulkDeleting ? 'Removing…' : `Remove selected (${selectedIds.size})`}
                </Button>
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
              </>
            )}
            <Button variant="secondary" onClick={fetchVideos}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-cream-400">Loading videos...</p>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-cream-400">No videos found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVideos.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-sm text-cream-400">
                    <button type="button" onClick={selectAll} className="hover:text-cream-200 underline">
                      Select all
                    </button>
                    <span>·</span>
                    <button type="button" onClick={clearSelection} className="hover:text-cream-200 underline">
                      Clear selection
                    </button>
                  </div>
                  <div className="text-xs text-cream-500">
                    {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
                    {(() => {
                      const placeholders = filteredVideos.filter((v) => !isEmbeddableVideoUrl(v.video_url)).length;
                      const noThumb = filteredVideos.filter((v) => !v.thumbnail_url && !getYouTubeThumbnailUrl(v.video_url)).length;
                      return (
                        <>
                          {placeholders > 0 && <> · {placeholders} placeholder URL{placeholders !== 1 ? 's' : ''}</>}
                          {noThumb > 0 && <> · {noThumb} missing thumb</>}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  className={`p-4 bg-olive-800 border rounded-lg transition-colors ${selectedIds.has(video.id) ? 'border-orange-500' : 'border-olive-600 hover:border-orange-500'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <label className="flex items-center pt-0.5 shrink-0 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(video.id)}
                          onChange={() => toggleSelect(video.id)}
                          className="rounded border-olive-500 text-orange-500 focus:ring-orange-500"
                        />
                      </label>
                      <ThumbnailCell video={video} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-semibold text-cream-100">{video.title}</h3>
                          {video.is_featured && (
                            <Badge variant="warning" size="sm">Featured</Badge>
                          )}
                          <Badge variant="default" size="sm">
                            {CATEGORY_LABELS[video.category]}
                          </Badge>
                          {!video.is_active && (
                            <Badge variant="error" size="sm">Inactive</Badge>
                          )}
                          {!isEmbeddableVideoUrl(video.video_url) && (
                            <Badge variant="warning" size="sm" title="Replace with real YouTube URL">Placeholder URL</Badge>
                          )}
                        </div>
                        {video.description && (
                          <p className="text-sm text-cream-400 line-clamp-2 mb-2">
                            {video.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-cream-500 flex-wrap">
                          {video.engine_id && <span>Engine: {video.engine_id.slice(0, 8)}…</span>}
                          {video.part_id && <span>Part: {video.part_id.slice(0, 8)}…</span>}
                          {video.channel_name && <span>Channel: {video.channel_name}</span>}
                          <span>Dur: {formatDuration(video.duration_seconds)}</span>
                          <span>Views: {formatViews(video.view_count)}</span>
                          <span>Pub: {formatPublished(video.published_date)}</span>
                          <span>Order: {video.display_order}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/videos/${video.id}`}>
                        <Button variant="ghost" size="sm" icon={<Pencil className="w-4 h-4" />}>
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => handleDelete(video)}
                        disabled={deleting === video.id}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
