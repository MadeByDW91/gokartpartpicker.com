'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { VIDEO_CATEGORIES, type Video, type VideoCategory } from '@/types/database';
import { createVideo, updateVideo } from '@/actions/admin/videos';
import { getEngines } from '@/actions/engines';
import { getParts } from '@/actions/parts';
import type { Engine } from '@/types/database';
import type { Part } from '@/types/database';

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

interface VideoFormProps {
  video?: Video;
  mode: 'create' | 'edit';
  initialEngineId?: string;
  initialPartId?: string;
}

export function VideoForm({ video, mode, initialEngineId, initialPartId }: VideoFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [engines, setEngines] = useState<Engine[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [linkType, setLinkType] = useState<'engine' | 'part'>(initialEngineId ? 'engine' : initialPartId ? 'part' : 'engine');

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    video_url: string;
    thumbnail_url: string;
    duration_seconds: number | string | null;
    category: VideoCategory;
    engine_id: string | null;
    part_id: string | null;
    channel_name: string;
    channel_url: string;
    published_date: string;
    language: string;
    is_featured: boolean;
    display_order: number;
    is_active: boolean;
  }>({
    title: video?.title || '',
    description: video?.description || '',
    video_url: video?.video_url || '',
    thumbnail_url: video?.thumbnail_url || '',
    duration_seconds: video?.duration_seconds || null,
    category: (video?.category || 'tutorial') as VideoCategory,
    engine_id: video?.engine_id || initialEngineId || null,
    part_id: video?.part_id || initialPartId || null,
    channel_name: video?.channel_name || '',
    channel_url: video?.channel_url || '',
    published_date: video?.published_date || '',
    language: video?.language || 'en',
    is_featured: video?.is_featured || false,
    display_order: video?.display_order || 0,
    is_active: video?.is_active ?? true,
  });

  // Fetch engines and parts for selectors
  useEffect(() => {
    const fetchData = async () => {
      const [enginesResult, partsResult] = await Promise.all([
        getEngines({ limit: 100 }),
        getParts({ limit: 100 }),
      ]);
      if (enginesResult.success) setEngines(enginesResult.data);
      if (partsResult.success) setParts(partsResult.data);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Format duration if provided as MM:SS
      let durationSeconds: number | null = null;
      if (formData.duration_seconds !== null && formData.duration_seconds !== '') {
        if (typeof formData.duration_seconds === 'string' && formData.duration_seconds.includes(':')) {
          const [mins, secs] = formData.duration_seconds.split(':').map(Number);
          durationSeconds = mins * 60 + secs;
        } else {
          durationSeconds = typeof formData.duration_seconds === 'number' 
            ? formData.duration_seconds 
            : parseInt(String(formData.duration_seconds)) || null;
        }
      }

      const submitData = {
        title: formData.title,
        description: formData.description || undefined,
        video_url: formData.video_url,
        thumbnail_url: formData.thumbnail_url || undefined,
        duration_seconds: durationSeconds,
        category: formData.category,
        engine_id: linkType === 'engine' ? formData.engine_id : null,
        part_id: linkType === 'part' ? formData.part_id : null,
        channel_name: formData.channel_name || null,
        channel_url: formData.channel_url || null,
        published_date: formData.published_date ? new Date(formData.published_date) : undefined,
        language: formData.language,
        is_featured: formData.is_featured,
        display_order: formData.display_order,
        is_active: formData.is_active,
      };

      let result;
      if (mode === 'create') {
        result = await createVideo(submitData);
      } else {
        result = await updateVideo(video!.id, submitData);
      }

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/videos');
          router.refresh();
        }, 1000);
      } else {
        setError(result.error || `Failed to ${mode} video`);
      }
    } catch (err) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} video:`, err);
      setError(err instanceof Error ? err.message : `Failed to ${mode} video`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-[rgba(166,61,64,0.1)] border border-[rgba(166,61,64,0.3)] rounded-lg">
          <p className="text-[var(--error)]">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-4 bg-[rgba(74,124,89,0.1)] border border-[rgba(74,124,89,0.3)] rounded-lg">
          <p className="text-[var(--success)]">
            Video {mode === 'create' ? 'created' : 'updated'} successfully!
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Video Information</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Title"
            placeholder="e.g., Predator 212 Installation Guide"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-cream-200 mb-1.5">
              Description
            </label>
            <textarea
              className="w-full px-4 py-3 bg-olive-800 border-2 border-olive-600 rounded-md text-cream-100 placeholder:text-cream-400 focus:outline-none focus:border-orange-500"
              placeholder="Video description..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <Input
            label="Video URL"
            placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
            value={formData.video_url}
            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
            required
          />

          <Input
            label="Thumbnail URL (optional - auto-extracted from YouTube if not provided)"
            placeholder="https://..."
            value={formData.thumbnail_url || ''}
            onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Duration (MM:SS or seconds)"
              placeholder="5:30 or 330"
              value={formData.duration_seconds?.toString() || ''}
              onChange={(e) => {
                const val = e.target.value;
                // Store as string to allow MM:SS format, will be converted on submit
                setFormData({ ...formData, duration_seconds: val || null });
              }}
            />

            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as VideoCategory })}
              required
            >
              {VIDEO_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-cream-200 mb-2">
              Link to
            </label>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="engine"
                  checked={linkType === 'engine'}
                  onChange={() => {
                    setLinkType('engine');
                    setFormData({ ...formData, engine_id: null, part_id: null });
                  }}
                  className="text-orange-500"
                />
                <span className="text-cream-200">Engine</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="part"
                  checked={linkType === 'part'}
                  onChange={() => {
                    setLinkType('part');
                    setFormData({ ...formData, engine_id: null, part_id: null });
                  }}
                  className="text-orange-500"
                />
                <span className="text-cream-200">Part</span>
              </label>
            </div>
            {linkType === 'engine' ? (
              <Select
                label="Engine"
                value={formData.engine_id || ''}
                onChange={(e) => setFormData({ ...formData, engine_id: e.target.value || null, part_id: null })}
                required
              >
                <option value="">Select Engine</option>
                {engines.map((engine) => (
                  <option key={engine.id} value={engine.id}>
                    {engine.name}
                  </option>
                ))}
              </Select>
            ) : (
              <Select
                label="Part"
                value={formData.part_id || ''}
                onChange={(e) => setFormData({ ...formData, part_id: e.target.value || null, engine_id: null })}
                required
              >
                <option value="">Select Part</option>
                {parts.map((part) => (
                  <option key={part.id} value={part.id}>
                    {part.name}
                  </option>
                ))}
              </Select>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Channel Name"
              placeholder="e.g., GoKart Builds"
              value={formData.channel_name || ''}
              onChange={(e) => setFormData({ ...formData, channel_name: e.target.value || '' })}
            />

            <Input
              label="Channel URL"
              placeholder="https://youtube.com/@channel"
              value={formData.channel_url || ''}
              onChange={(e) => setFormData({ ...formData, channel_url: e.target.value || '' })}
            />
          </div>

          <Input
            label="Published Date"
            type="date"
              value={formData.published_date ? formData.published_date : ''}
            onChange={(e) => setFormData({ ...formData, published_date: e.target.value || '' })}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Display Order"
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
            />

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="text-orange-500"
              />
              <span className="text-cream-200">Featured</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="text-orange-500"
              />
              <span className="text-cream-200">Active</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
        >
          {mode === 'create' ? 'Create Video' : 'Update Video'}
        </Button>
      </div>
    </form>
  );
}
