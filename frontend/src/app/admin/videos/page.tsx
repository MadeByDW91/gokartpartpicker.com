'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { VideoBatchResultPanel, type FillResult, type ThumbResult } from '@/components/admin/VideoBatchResultPanel';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  ImagePlus, 
  Youtube, 
  Trash, 
  ImageOff, 
  Film, 
  AlertTriangle, 
  Copy, 
  ChevronDown, 
  ChevronUp,
  Play,
  CheckCircle2,
  XCircle,
  Filter,
  Grid3x3,
  List,
  Eye,
  EyeOff
} from 'lucide-react';
import { getAdminVideos, deleteVideo, bulkDeleteVideos, refreshVideoThumbnails, fillVideoUrlsFromYouTube } from '@/actions/admin/videos';
import { getYouTubeThumbnailUrl, getYouTubeVideoId, isEmbeddableVideoUrl } from '@/lib/video-utils';
import type { Video } from '@/types/database';

type BatchResult = { type: 'fill'; data: FillResult } | { type: 'thumb'; data: ThumbResult };
type DuplicateGroup = { ytId: string; videos: Video[] };
type ViewMode = 'grid' | 'list';
type TabType = 'all' | 'live' | 'needs-attention' | 'duplicates';

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

function VideoThumbnail({ video, size = 'md' }: { video: Video; size?: 'sm' | 'md' | 'lg' }) {
  const [loadError, setLoadError] = useState(false);
  const thumbUrl = video.thumbnail_url || getYouTubeThumbnailUrl(video.video_url) || null;
  const isPlaceholder = !isEmbeddableVideoUrl(video.video_url);
  const sizeClasses = {
    sm: 'w-24 h-14',
    md: 'w-32 h-18',
    lg: 'w-full h-48',
  };

  if (isPlaceholder) {
    return (
      <div className={`${sizeClasses[size]} shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-2 border-amber-500/30 flex flex-col items-center justify-center relative`}>
        <Film className="w-5 h-5 text-amber-400 mb-1" />
        <span className="text-[10px] font-semibold text-amber-300 uppercase tracking-wide">Placeholder</span>
        <div className="absolute inset-0 bg-amber-500/10 animate-pulse" />
      </div>
    );
  }
  if (!thumbUrl) {
    return (
      <div className={`${sizeClasses[size]} shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-olive-700/50 to-olive-800/50 border border-olive-600/40 flex flex-col items-center justify-center`}>
        <ImageOff className="w-5 h-5 text-olive-400 mb-1" />
        <span className="text-[10px] text-olive-300">No thumbnail</span>
      </div>
    );
  }
  if (loadError) {
    return (
      <div className={`${sizeClasses[size]} shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-red-500/20 to-red-600/10 border-2 border-red-500/30 flex flex-col items-center justify-center`}>
        <ImageOff className="w-5 h-5 text-red-400 mb-1" />
        <span className="text-[10px] text-red-300">Failed to load</span>
      </div>
    );
  }
  return (
    <div className={`${sizeClasses[size]} shrink-0 rounded-lg overflow-hidden bg-olive-800 relative group cursor-pointer`}>
      <img
        src={thumbUrl}
        alt=""
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
        referrerPolicy="no-referrer"
        onError={() => setLoadError(true)}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
        <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
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
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [thumbRefreshing, setThumbRefreshing] = useState(false);
  const [urlFilling, setUrlFilling] = useState(false);
  const [fixingAll, setFixingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keepIdByYtId, setKeepIdByYtId] = useState<Record<string, string>>({});
  const [duplicatesExpanded, setDuplicatesExpanded] = useState(true);
  const [removingInGroup, setRemovingInGroup] = useState<string | null>(null);
  const [lastBatchResult, setLastBatchResult] = useState<BatchResult | null>(null);

  const scrollToDuplicates = useCallback(() => {
    setDuplicatesExpanded(true);
    requestAnimationFrame(() => {
      document.getElementById('duplicates')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const duplicateGroups = useMemo((): DuplicateGroup[] => {
    const byYtId = new Map<string, Video[]>();
    for (const v of videos) {
      const ytId = getYouTubeVideoId(v.video_url);
      if (!ytId) continue;
      const list = byYtId.get(ytId) ?? [];
      list.push(v);
      byYtId.set(ytId, list);
    }
    return Array.from(byYtId.entries())
      .filter(([, list]) => list.length > 1)
      .map(([ytId, list]) => ({
        ytId,
        videos: [...list].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
      }));
  }, [videos]);

  const stats = useMemo(() => {
    const total = videos.length;
    const live = videos.filter(v => v.is_active).length;
    const inactive = total - live;
    const placeholders = videos.filter(v => !isEmbeddableVideoUrl(v.video_url)).length;
    const missingThumb = videos.filter(v => {
      if (!isEmbeddableVideoUrl(v.video_url)) return false;
      return !v.thumbnail_url && !getYouTubeThumbnailUrl(v.video_url);
    }).length;
    const duplicates = duplicateGroups.reduce((sum, g) => sum + g.videos.length, 0);
    const needsAttention = placeholders + missingThumb + duplicates;
    
    return { total, live, inactive, placeholders, missingThumb, duplicates, needsAttention };
  }, [videos, duplicateGroups]);

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
        const data = result.data;
        setLastBatchResult({ 
          type: 'fill', 
          data: {
            ...data,
            errors: 0,
            skippedDuplicates: 0,
          }
        });
        if (data.filled > 0) {
          toast.success(`Filled ${data.filled} URL${data.filled !== 1 ? 's' : ''} from YouTube`);
        } else if (data.remaining === 0) {
          toast.success('No placeholder URLs left — all videos have real YouTube links');
        } else {
          toast.warning('No new URLs filled. See details below.');
        }
      } else {
        const msg = 'error' in result ? result.error : 'Failed to fill URLs';
        setError(msg);
        toast.error(msg);
      }
    } catch (e) {
      console.error(e);
      const errorMsg = e instanceof Error ? e.message : 'Failed to fill URLs from YouTube';
      setError(errorMsg);
      toast.error(errorMsg);
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
        const data = result.data;
        setLastBatchResult({ type: 'thumb', data });
        if (data.updated > 0) {
          toast.success(`Updated ${data.updated} thumbnail${data.updated !== 1 ? 's' : ''}`);
        } else if (data.placeholderUrlCount > 0) {
          toast.warning('No thumbnails updated — placeholder URLs remain. See details below.');
        } else {
          toast.info('No thumbnails to update');
        }
      } else {
        const msg = 'error' in result ? result.error : 'Failed to refresh thumbnails';
        setError(msg);
        toast.error(msg);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to refresh thumbnails');
      toast.error('Failed to refresh thumbnails');
    } finally {
      setThumbRefreshing(false);
    }
  };

  const handleFixAll = async () => {
    if (!confirm('This will fill placeholder URLs and refresh all thumbnails. This may take a few minutes. Continue?')) {
      return;
    }
    
    setFixingAll(true);
    setError(null);
    setLastBatchResult(null);
    try {
      // Step 1: Fill placeholder URLs
      const fillResult = await fillVideoUrlsFromYouTube();
      let urlsFilled = 0;
      let remainingPlaceholders = 0;
      
      if (fillResult.success && fillResult.data) {
        urlsFilled = fillResult.data.filled;
        remainingPlaceholders = fillResult.data.remaining;
        // Set batch result for display
        setLastBatchResult({ 
          type: 'fill', 
          data: {
            ...fillResult.data,
            errors: 0,
            skippedDuplicates: 0,
          }
        });
      }
      
      // Step 2: Refresh thumbnails
      const thumbResult = await refreshVideoThumbnails();
      let thumbnailsUpdated = 0;
      
      if (thumbResult.success && thumbResult.data) {
        thumbnailsUpdated = thumbResult.data.updated;
        // Update batch result for display
        setLastBatchResult({ 
          type: 'thumb', 
          data: thumbResult.data 
        });
      }
      
      await fetchVideos();
      const messages: string[] = [];
      if (urlsFilled > 0) {
        messages.push(`Filled ${urlsFilled} URL${urlsFilled !== 1 ? 's' : ''}`);
      }
      if (thumbnailsUpdated > 0) {
        messages.push(`Updated ${thumbnailsUpdated} thumbnail${thumbnailsUpdated !== 1 ? 's' : ''}`);
      }
      if (messages.length > 0) {
        toast.success(messages.join(' · '));
      } else {
        toast.info('No changes needed — all videos are up to date');
      }
      if (remainingPlaceholders > 0) {
        toast.warning(`${remainingPlaceholders} placeholder${remainingPlaceholders !== 1 ? 's' : ''} remain. Run again to process more.`);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to fix videos');
      toast.error('Failed to fix videos');
    } finally {
      setFixingAll(false);
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
        toast.success(`Removed ${result.data.deleted} video${result.data.deleted !== 1 ? 's' : ''}`);
      } else {
        const msg = 'error' in result ? result.error : 'Failed to remove videos';
        setError(msg);
        toast.error(msg);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to remove videos');
      toast.error('Failed to remove videos');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleDelete = async (video: Video) => {
    if (!confirm(`Are you sure you want to delete "${video.title}"?`)) return;

    setDeleting(video.id);
    setError(null);
    try {
      const result = await deleteVideo(video.id);
      if (result.success) {
        await fetchVideos();
        toast.success('Video deleted');
      } else {
        const errorMsg = 'error' in result ? result.error : 'Failed to delete video';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Error deleting video:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete video';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setDeleting(null);
    }
  };

  const getKeeperForGroup = (g: DuplicateGroup) =>
    keepIdByYtId[g.ytId] ?? g.videos[0]?.id ?? null;

  const handleKeepForGroup = (ytId: string, videoId: string) => {
    setKeepIdByYtId((prev) => ({ ...prev, [ytId]: videoId }));
  };

  const duplicateVideoCount = useMemo(
    () => duplicateGroups.reduce((sum, g) => sum + g.videos.length, 0),
    [duplicateGroups]
  );

  const duplicateVideoIds = useMemo(
    () => new Set(duplicateGroups.flatMap((g) => g.videos.map((v) => v.id))),
    [duplicateGroups]
  );

  const selectAllDuplicatesToRemove = () => {
    const ids = new Set<string>();
    for (const g of duplicateGroups) {
      const keeper = getKeeperForGroup(g);
      for (const v of g.videos) if (v.id !== keeper) ids.add(v.id);
    }
    setSelectedIds(ids);
  };

  const handleRemoveDuplicatesInGroup = async (ytId: string) => {
    const g = duplicateGroups.find((x) => x.ytId === ytId);
    if (!g) return;
    const keeper = getKeeperForGroup(g);
    const toRemove = g.videos.filter((v) => v.id !== keeper).map((v) => v.id);
    if (toRemove.length === 0) return;
    if (!confirm(`Remove ${toRemove.length} duplicate video(s)? The one you marked "Keep" will remain.`)) return;
    setRemovingInGroup(ytId);
    setError(null);
    try {
      const result = await bulkDeleteVideos(toRemove);
      if (result.success && result.data) {
        setKeepIdByYtId((prev) => {
          const next = { ...prev };
          delete next[ytId];
          return next;
        });
        await fetchVideos();
        toast.success(`Removed ${result.data.deleted} duplicate${result.data.deleted !== 1 ? 's' : ''}`);
      } else {
        const msg = 'error' in result ? result.error : 'Failed to remove duplicates';
        setError(msg);
        toast.error(msg);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to remove duplicates');
      toast.error('Failed to remove duplicates');
    } finally {
      setRemovingInGroup(null);
    }
  };

  const filteredVideos = useMemo(() => {
    let filtered = videos;
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((video) =>
        video.title.toLowerCase().includes(query) ||
        video.description?.toLowerCase().includes(query) ||
        video.channel_name?.toLowerCase().includes(query)
      );
    }
    
    // Apply tab filter
    if (activeTab === 'live') {
      filtered = filtered.filter(v => v.is_active);
    } else if (activeTab === 'needs-attention') {
      filtered = filtered.filter(v => {
        const isPlaceholder = !isEmbeddableVideoUrl(v.video_url);
        const missingThumb = !v.thumbnail_url && !getYouTubeThumbnailUrl(v.video_url) && isEmbeddableVideoUrl(v.video_url);
        const isDuplicate = duplicateVideoIds.has(v.id);
        return isPlaceholder || missingThumb || isDuplicate;
      });
    } else if (activeTab === 'duplicates') {
      // Show only videos that are part of duplicate groups
      filtered = filtered.filter(v => duplicateVideoIds.has(v.id));
    }
    
    return filtered;
  }, [videos, searchQuery, activeTab, duplicateVideoIds]);

  const getVideoStatus = (video: Video) => {
    const issues: string[] = [];
    if (!video.is_active) issues.push('inactive');
    if (!isEmbeddableVideoUrl(video.video_url)) issues.push('placeholder');
    if (isEmbeddableVideoUrl(video.video_url) && !video.thumbnail_url && !getYouTubeThumbnailUrl(video.video_url)) {
      issues.push('no-thumb');
    }
    if (duplicateVideoIds.has(video.id)) issues.push('duplicate');
    return issues;
  };

  const getDuplicateGroupForVideo = (video: Video) => {
    const ytId = getYouTubeVideoId(video.video_url);
    if (!ytId) return null;
    return duplicateGroups.find(g => g.ytId === ytId);
  };

  const getKeeperForVideo = (video: Video) => {
    const group = getDuplicateGroupForVideo(video);
    if (!group) return null;
    return getKeeperForGroup(group);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      <VideoBatchResultPanel
        result={lastBatchResult}
        onDismiss={() => setLastBatchResult(null)}
        onRunFill={handleFillUrlsFromYouTube}
        onRunThumb={handleRefreshThumbnails}
        onViewDuplicates={scrollToDuplicates}
        isFilling={urlFilling}
        isRefreshingThumbnails={thumbRefreshing}
      />

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-olive-600/50 bg-gradient-to-br from-olive-800/40 to-olive-800/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cream-400 mb-1">Total Videos</p>
                <p className="text-3xl font-bold text-cream-100">{stats.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-olive-600/20 border border-olive-500/30">
                <Play className="w-6 h-6 text-olive-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-600/50 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cream-400 mb-1">Live Videos</p>
                <p className="text-3xl font-bold text-emerald-400">{stats.live}</p>
                <p className="text-xs text-cream-500 mt-1">{stats.inactive} inactive</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-600/50 bg-gradient-to-br from-amber-500/10 to-amber-600/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cream-400 mb-1">Needs Attention</p>
                <p className="text-3xl font-bold text-amber-400">{stats.needsAttention}</p>
                <p className="text-xs text-cream-500 mt-1">
                  {stats.placeholders} placeholders · {stats.missingThumb} no thumb
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-600/50 bg-gradient-to-br from-red-500/10 to-red-600/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cream-400 mb-1">Duplicates</p>
                <p className="text-3xl font-bold text-red-400">{stats.duplicates}</p>
                <p className="text-xs text-cream-500 mt-1">{duplicateGroups.length} groups</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30">
                <Copy className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Bar */}
      {(stats.placeholders > 0 || stats.missingThumb > 0) && (
        <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-300">
                    {stats.needsAttention} video{stats.needsAttention !== 1 ? 's' : ''} need{stats.needsAttention === 1 ? 's' : ''} attention
                  </h3>
                  <p className="text-sm text-amber-200/80">
                    {stats.placeholders > 0 && `${stats.placeholders} need real YouTube links`}
                    {stats.placeholders > 0 && stats.missingThumb > 0 && ' · '}
                    {stats.missingThumb > 0 && `${stats.missingThumb} need thumbnails`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  onClick={handleFixAll}
                  disabled={fixingAll || urlFilling || thumbRefreshing}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                >
                  {fixingAll ? 'Fixing all videos…' : 'Fix All Videos'}
                </Button>
                {stats.placeholders > 0 && (
                  <Button
                    variant="secondary"
                    onClick={handleFillUrlsFromYouTube}
                    disabled={urlFilling || fixingAll}
                    icon={<Youtube className="w-4 h-4" />}
                  >
                    {urlFilling ? 'Searching…' : `Fill URLs (${stats.placeholders})`}
                  </Button>
                )}
                {stats.missingThumb > 0 && (
                  <Button
                    variant="secondary"
                    onClick={() => handleRefreshThumbnails()}
                    disabled={thumbRefreshing || fixingAll}
                    icon={<ImagePlus className="w-4 h-4" />}
                  >
                    {thumbRefreshing ? 'Refreshing…' : `Fix Thumbs (${stats.missingThumb})`}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Duplicates Section */}
      {duplicateGroups.length > 0 && (
        <Card id="duplicates" className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <button
              type="button"
              onClick={() => setDuplicatesExpanded(!duplicatesExpanded)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-cream-100">
                  Duplicate videos ({duplicateGroups.length} group{duplicateGroups.length !== 1 ? 's' : ''}, {duplicateVideoCount} total)
                </h2>
              </div>
              {duplicatesExpanded ? (
                <ChevronUp className="w-5 h-5 text-cream-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-cream-400" />
              )}
            </button>
          </CardHeader>
          {duplicatesExpanded && (
            <CardContent className="space-y-6">
              <p className="text-sm text-cream-400">
                Same YouTube video linked multiple times. Choose one to keep per group, then remove the rest. Use checkboxes to select specific duplicates and bulk delete.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllDuplicatesToRemove}
                  className="text-sm text-amber-400 hover:text-amber-300 underline"
                >
                  Select all duplicates to remove
                </button>
                <span className="text-cream-500">·</span>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-sm text-cream-400 hover:text-cream-200 underline"
                >
                  Clear selection
                </button>
                {selectedIds.size > 0 && (
                  <>
                    <span className="text-cream-500">·</span>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleBulkRemove}
                      disabled={bulkDeleting}
                      icon={<Trash className="w-4 h-4" />}
                    >
                      {bulkDeleting ? 'Removing…' : `Remove selected (${selectedIds.size})`}
                    </Button>
                  </>
                )}
              </div>
              {duplicateGroups.map((g) => {
                const keeper = getKeeperForGroup(g);
                const toRemoveCount = g.videos.filter((v) => v.id !== keeper).length;
                return (
                  <div
                    key={g.ytId}
                    className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 space-y-4"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <a
                        href={`https://www.youtube.com/watch?v=${g.ytId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-amber-400 hover:text-amber-300"
                      >
                        YouTube: {g.ytId}
                      </a>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveDuplicatesInGroup(g.ytId)}
                        disabled={removingInGroup === g.ytId || toRemoveCount === 0}
                        icon={<Trash2 className="w-4 h-4" />}
                      >
                        {removingInGroup === g.ytId ? 'Removing…' : `Remove ${toRemoveCount} duplicate${toRemoveCount !== 1 ? 's' : ''}`}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {g.videos.map((video) => {
                        const isKeeper = video.id === keeper;
                        return (
                        <div
                          key={video.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                            isKeeper
                              ? 'border-orange-500/50 bg-orange-500/10'
                              : 'border-olive-600 bg-olive-800/50'
                          } ${selectedIds.has(video.id) ? 'ring-1 ring-amber-400' : ''}`}
                        >
                          <label className="flex items-center pt-0.5 shrink-0 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(video.id)}
                              onChange={() => toggleSelect(video.id)}
                              disabled={isKeeper}
                              className="rounded border-olive-500 text-orange-500 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              title={isKeeper ? 'Keeping this one' : 'Select to remove'}
                            />
                          </label>
                          <VideoThumbnail video={video} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-cream-100">{video.title}</div>
                            <div className="text-xs text-cream-500">
                              {video.engine_id && 'Engine · '}
                              {video.part_id && 'Part · '}
                              {formatPublished(video.created_at)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isKeeper ? (
                              <Badge variant="warning" size="sm">Keeping</Badge>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleKeepForGroup(g.ytId, video.id)}
                              >
                                Keep this one
                              </Button>
                            )}
                            <Button
                              variant="danger"
                              size="sm"
                              icon={<Trash2 className="w-4 h-4" />}
                              onClick={() => handleDelete(video)}
                              disabled={deleting === video.id}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ); })}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          )}
        </Card>
      )}

      {/* Main Video List */}
      <Card>
        <CardHeader>
          {/* Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-1 bg-olive-800/50 rounded-lg p-1 border border-olive-600/40">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'text-cream-400 hover:text-cream-200'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('live')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'live'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-cream-400 hover:text-cream-200'
                }`}
              >
                Live ({stats.live})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('needs-attention')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'needs-attention'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-cream-400 hover:text-cream-200'
                }`}
              >
                Needs Attention ({stats.needsAttention})
              </button>
              {stats.duplicates > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('duplicates')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'duplicates'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'text-cream-400 hover:text-cream-200'
                  }`}
                >
                  Duplicates ({stats.duplicates})
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'text-cream-400 hover:text-cream-200 border border-transparent'
                }`}
                title="Grid view"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'text-cream-400 hover:text-cream-200 border border-transparent'
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            {(stats.placeholders > 0 || stats.missingThumb > 0) && (
              <Button
                variant="primary"
                onClick={handleFixAll}
                disabled={fixingAll || urlFilling || thumbRefreshing}
                icon={<CheckCircle2 className="w-4 h-4" />}
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                {fixingAll ? 'Fixing…' : 'Fix All'}
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleFillUrlsFromYouTube}
              disabled={urlFilling || fixingAll}
              icon={<Youtube className="w-4 h-4" />}
              size="sm"
            >
              {urlFilling ? 'Searching…' : 'Auto-fill URLs'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleRefreshThumbnails()}
              disabled={thumbRefreshing || fixingAll}
              icon={<ImagePlus className="w-4 h-4" />}
              size="sm"
            >
              {thumbRefreshing ? 'Refreshing…' : 'Fix Thumbs'}
            </Button>
            {selectedIds.size > 0 && (
              <>
                <Button
                  variant="danger"
                  onClick={handleBulkRemove}
                  disabled={bulkDeleting}
                  icon={<Trash className="w-4 h-4" />}
                  size="sm"
                >
                  {bulkDeleting ? 'Removing…' : `Remove (${selectedIds.size})`}
                </Button>
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
              </>
            )}
            <Button variant="secondary" onClick={fetchVideos} size="sm">
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
            <>
              {/* Selection Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-4 border-b border-olive-600/30">
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
                </div>
              </div>

              {/* Video Grid/List */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredVideos.map((video) => {
                    const status = getVideoStatus(video);
                    const isPlaceholder = !isEmbeddableVideoUrl(video.video_url);
                    const missingThumb = isEmbeddableVideoUrl(video.video_url) && !video.thumbnail_url && !getYouTubeThumbnailUrl(video.video_url);
                    const isDuplicate = duplicateVideoIds.has(video.id);
                    const duplicateGroup = getDuplicateGroupForVideo(video);
                    const keeperId = duplicateGroup ? getKeeperForGroup(duplicateGroup) : null;
                    const isKeeper = keeperId === video.id;
                    const duplicateCount = duplicateGroup ? duplicateGroup.videos.length : 0;
                    const ytId = getYouTubeVideoId(video.video_url);
                    
                    return (
                      <div
                        key={video.id}
                        className={`group relative rounded-xl border-2 transition-all ${
                          selectedIds.has(video.id)
                            ? 'border-orange-500 bg-orange-500/10'
                            : isDuplicate && activeTab === 'duplicates'
                              ? isKeeper
                                ? 'border-orange-500/70 bg-orange-500/15 ring-2 ring-orange-500/40'
                                : 'border-red-500/50 bg-red-500/10 ring-2 ring-red-500/30'
                              : video.is_active
                                ? 'border-olive-600/50 bg-olive-800/40 hover:border-orange-500/50 hover:bg-olive-800/60'
                                : 'border-olive-700/30 bg-olive-800/20 opacity-75'
                        } ${isDuplicate && activeTab !== 'duplicates' ? 'ring-2 ring-red-500/30' : status.length > 0 ? 'ring-2 ring-amber-500/30' : ''}`}
                      >
                        {/* Status Indicators */}
                        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
                          {!video.is_active && (
                            <Badge variant="error" size="sm" className="text-[10px] px-1.5 py-0">
                              <EyeOff className="w-3 h-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                          {isPlaceholder && (
                            <Badge variant="warning" size="sm" className="text-[10px] px-1.5 py-0">
                              <Film className="w-3 h-3 mr-1" />
                              Placeholder
                            </Badge>
                          )}
                          {missingThumb && (
                            <Badge variant="warning" size="sm" className="text-[10px] px-1.5 py-0">
                              <ImageOff className="w-3 h-3 mr-1" />
                              No Thumb
                            </Badge>
                          )}
                          {isDuplicate && (
                            <Badge 
                              variant={isKeeper ? "warning" : "error"} 
                              size="sm" 
                              className="text-[10px] px-1.5 py-0"
                              title={isKeeper ? 'This video is marked to keep' : `Duplicate of YouTube: ${ytId || 'unknown'}`}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              {isKeeper ? 'Keeping' : `Duplicate (${duplicateCount})`}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Duplicate YouTube ID indicator */}
                        {isDuplicate && activeTab === 'duplicates' && ytId && (
                          <div className="absolute top-2 left-12 z-10">
                            <a
                              href={`https://www.youtube.com/watch?v=${ytId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-mono text-red-300 bg-red-500/20 px-2 py-0.5 rounded border border-red-500/30 hover:bg-red-500/30 transition-colors"
                              title="View on YouTube"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {ytId}
                            </a>
                          </div>
                        )}

                        {/* Checkbox */}
                        <div className="absolute top-2 left-2 z-10">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(video.id)}
                              onChange={() => toggleSelect(video.id)}
                              className="rounded border-olive-500 text-orange-500 focus:ring-orange-500 w-4 h-4"
                            />
                          </label>
                        </div>

                        {/* Thumbnail */}
                        <div className="relative">
                          <VideoThumbnail video={video} size="lg" />
                          {video.is_featured && (
                            <div className="absolute top-2 left-2">
                              <Badge variant="warning" size="sm" className="text-[10px]">
                                Featured
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-2">
                          <h3 className="font-semibold text-cream-100 line-clamp-2 text-sm leading-tight">
                            {video.title}
                          </h3>
                          
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="default" size="sm" className="text-[10px]">
                              {CATEGORY_LABELS[video.category]}
                            </Badge>
                            {isDuplicate && activeTab === 'duplicates' && duplicateGroup && (
                              <Badge 
                                variant={isKeeper ? "warning" : "error"} 
                                size="sm" 
                                className="text-[10px]"
                              >
                                {isKeeper ? '✓ Keep this one' : `${duplicateGroup.videos.length - 1} other${duplicateGroup.videos.length - 1 !== 1 ? 's' : ''} duplicate${duplicateGroup.videos.length - 1 !== 1 ? 's' : ''}`}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs text-cream-500 pt-2 border-t border-olive-600/30">
                            <span>{formatDuration(video.duration_seconds)}</span>
                            <span>{formatViews(video.view_count)} views</span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-2">
                            <Link href={`/admin/videos/${video.id}`} className="flex-1">
                              <Button variant="ghost" size="sm" className="w-full" icon={<Pencil className="w-3 h-3" />}>
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="danger"
                              size="sm"
                              icon={<Trash2 className="w-3 h-3" />}
                              onClick={() => handleDelete(video)}
                              disabled={deleting === video.id}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredVideos.map((video) => {
                    const status = getVideoStatus(video);
                    const isPlaceholder = !isEmbeddableVideoUrl(video.video_url);
                    const missingThumb = isEmbeddableVideoUrl(video.video_url) && !video.thumbnail_url && !getYouTubeThumbnailUrl(video.video_url);
                    const isDuplicate = duplicateVideoIds.has(video.id);
                    const duplicateGroup = getDuplicateGroupForVideo(video);
                    const keeperId = duplicateGroup ? getKeeperForGroup(duplicateGroup) : null;
                    const isKeeper = keeperId === video.id;
                    const duplicateCount = duplicateGroup ? duplicateGroup.videos.length : 0;
                    const ytId = getYouTubeVideoId(video.video_url);
                    
                    return (
                      <div
                        key={video.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                          selectedIds.has(video.id)
                            ? 'border-orange-500 bg-orange-500/10'
                            : isDuplicate && activeTab === 'duplicates'
                              ? isKeeper
                                ? 'border-orange-500/70 bg-orange-500/15 ring-2 ring-orange-500/40'
                                : 'border-red-500/50 bg-red-500/10 ring-2 ring-red-500/30'
                              : video.is_active
                                ? 'border-olive-600/50 bg-olive-800/40 hover:border-orange-500/50'
                                : 'border-olive-700/30 bg-olive-800/20 opacity-75'
                        } ${isDuplicate && activeTab !== 'duplicates' ? 'ring-2 ring-red-500/30' : status.length > 0 ? 'ring-2 ring-amber-500/30' : ''}`}
                      >
                        <label className="flex items-center shrink-0 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(video.id)}
                            onChange={() => toggleSelect(video.id)}
                            className="rounded border-olive-500 text-orange-500 focus:ring-orange-500"
                          />
                        </label>
                        
                        <VideoThumbnail video={video} size="md" />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h3 className="font-semibold text-cream-100">{video.title}</h3>
                                {!video.is_active && (
                                  <Badge variant="error" size="sm">
                                    <EyeOff className="w-3 h-3 mr-1" />
                                    Inactive
                                  </Badge>
                                )}
                                {isPlaceholder && (
                                  <Badge variant="warning" size="sm">
                                    <Film className="w-3 h-3 mr-1" />
                                    Placeholder URL
                                  </Badge>
                                )}
                                {missingThumb && (
                                  <Badge variant="warning" size="sm">
                                    <ImageOff className="w-3 h-3 mr-1" />
                                    No Thumbnail
                                  </Badge>
                                )}
                                {isDuplicate && (
                                  <Badge 
                                    variant={isKeeper ? "warning" : "error"} 
                                    size="sm"
                                    title={isKeeper ? 'This video is marked to keep' : `Duplicate of YouTube: ${ytId || 'unknown'}`}
                                  >
                                    <Copy className="w-3 h-3 mr-1" />
                                    {isKeeper ? 'Keeping' : `Duplicate (${duplicateCount})`}
                                  </Badge>
                                )}
                                {isDuplicate && activeTab === 'duplicates' && ytId && (
                                  <a
                                    href={`https://www.youtube.com/watch?v=${ytId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-mono text-red-300 bg-red-500/20 px-2 py-1 rounded border border-red-500/30 hover:bg-red-500/30 transition-colors"
                                    title="View on YouTube"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    YouTube: {ytId}
                                  </a>
                                )}
                                {video.is_featured && (
                                  <Badge variant="warning" size="sm">Featured</Badge>
                                )}
                                <Badge variant="default" size="sm">
                                  {CATEGORY_LABELS[video.category]}
                                </Badge>
                                {isDuplicate && activeTab === 'duplicates' && duplicateGroup && (
                                  <Badge 
                                    variant={isKeeper ? "warning" : "error"} 
                                    size="sm"
                                  >
                                    {isKeeper ? '✓ Keep this one' : `${duplicateGroup.videos.length - 1} other${duplicateGroup.videos.length - 1 !== 1 ? 's' : ''} duplicate${duplicateGroup.videos.length - 1 !== 1 ? 's' : ''}`}
                                  </Badge>
                                )}
                              </div>
                              {video.description && (
                                <p className="text-sm text-cream-400 line-clamp-2 mb-2">
                                  {video.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-cream-500 flex-wrap">
                            {video.engine_id && <span>Engine: {video.engine_id.slice(0, 8)}…</span>}
                            {video.part_id && <span>Part: {video.part_id.slice(0, 8)}…</span>}
                            {video.channel_name && <span>Channel: {video.channel_name}</span>}
                            <span>Dur: {formatDuration(video.duration_seconds)}</span>
                            <span>Views: {formatViews(video.view_count)}</span>
                            <span>Pub: {formatPublished(video.published_date)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
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
                    );
                  })}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
