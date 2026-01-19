'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { slugify } from '@/lib/utils';
import { createGuide, updateGuide } from '@/actions/admin-guides';
import { getEngines } from '@/actions/engines';
import { getParts } from '@/actions/parts';
import type { GuideWithSteps, GuideStep } from '@/types/guides';
import type { Engine, Part } from '@/types/database';
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';

interface GuideFormProps {
  guide?: GuideWithSteps;
  mode: 'create' | 'edit';
}

const GUIDE_CATEGORIES = [
  'Installation',
  'Maintenance',
  'Modification',
  'Troubleshooting',
  'Safety',
  'General',
];

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

export function GuideForm({ guide, mode }: GuideFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [engines, setEngines] = useState<Engine[]>([]);
  const [parts, setParts] = useState<Part[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    slug: guide?.slug || '',
    title: guide?.title || '',
    excerpt: guide?.excerpt || '',
    body: guide?.body || '',
    category: guide?.category || '',
    difficulty_level: guide?.difficulty_level || null as 'beginner' | 'intermediate' | 'advanced' | 'expert' | null,
    estimated_time_minutes: guide?.estimated_time_minutes || null,
    featured_image_url: guide?.featured_image_url || '',
    related_engine_id: guide?.related_engine_id || '',
    related_part_id: guide?.related_part_id || '',
    tags: guide?.tags || [] as string[],
    is_published: guide?.is_published || false,
    steps: guide?.steps || [] as GuideStep[],
  });

  const [tagInput, setTagInput] = useState('');

  // Fetch engines and parts for dropdowns
  useEffect(() => {
    async function fetchData() {
      try {
        const [enginesResult, partsResult] = await Promise.all([
          getEngines(),
          getParts(),
        ]);

        if (enginesResult.success) {
          setEngines(enginesResult.data || []);
        }
        if (partsResult.success) {
          setParts(partsResult.data || []);
        }
      } catch (err) {
        console.error('Error fetching engines/parts:', err);
      }
    }

    fetchData();
  }, []);

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: mode === 'create' ? slugify(title) : prev.slug,
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleAddStep = () => {
    const newStepNumber = formData.steps.length > 0 
      ? Math.max(...formData.steps.map(s => s.step_number)) + 1
      : 1;

    const newStep: Omit<GuideStep, 'id' | 'guide_id'> = {
      step_number: newStepNumber,
      title: '',
      description: null,
      instructions: '',
      image_url: null,
      video_url: null,
      warning: null,
      tips: null,
      sort_order: formData.steps.length,
    };

    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep as GuideStep],
    }));
  };

  const handleUpdateStep = (index: number, field: keyof GuideStep, value: string | number | null) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      ),
    }));
  };

  const handleRemoveStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index).map((step, i) => ({
        ...step,
        step_number: i + 1,
      })),
    }));
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === formData.steps.length - 1)
    ) {
      return;
    }

    setFormData((prev) => {
      const newSteps = [...prev.steps];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
      
      // Update sort_order
      return {
        ...prev,
        steps: newSteps.map((step, i) => ({
          ...step,
          sort_order: i,
        })),
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title || !formData.slug) {
        throw new Error('Title and slug are required');
      }

      // Prepare data
      const data = {
        slug: formData.slug,
        title: formData.title,
        excerpt: formData.excerpt || null,
        body: formData.body || null,
        category: formData.category || null,
        difficulty_level: formData.difficulty_level,
        estimated_time_minutes: formData.estimated_time_minutes || null,
        featured_image_url: formData.featured_image_url || null,
        related_engine_id: formData.related_engine_id || null,
        related_part_id: formData.related_part_id || null,
        tags: formData.tags,
        is_published: formData.is_published,
        steps: formData.steps.map((step, index) => ({
          step_number: step.step_number,
          title: step.title,
          description: step.description || null,
          instructions: step.instructions,
          image_url: step.image_url || null,
          video_url: step.video_url || null,
          warning: step.warning || null,
          tips: step.tips || null,
          sort_order: index,
        })),
      };

      if (mode === 'create') {
        const result = await createGuide(data);
        if (!result.success) {
          throw new Error(result.error || 'Failed to create guide');
        }
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/guides');
          router.refresh();
        }, 1000);
      } else if (guide) {
        const result = await updateGuide({ ...data, id: guide.id });
        if (!result.success) {
          throw new Error(result.error || 'Failed to update guide');
        }
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/guides');
          router.refresh();
        }, 1000);
      }
    } catch (err) {
      console.error('Error saving guide:', err);
      setError(err instanceof Error ? err.message : 'Failed to save guide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
          {mode === 'create' ? 'Guide created successfully!' : 'Guide updated successfully!'}
        </div>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Basic Information</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Title"
              placeholder="e.g., How to Install Predator 212 Hemi"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
            <Input
              label="URL Slug"
              placeholder="e.g., install-predator-212-hemi"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cream-200 mb-2">
              Excerpt
            </label>
            <textarea
              className="w-full px-4 py-2 bg-olive-700 border border-olive-600 rounded-md text-cream-100 placeholder-cream-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Short description of the guide..."
              value={formData.excerpt || ''}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cream-200 mb-2">
              Body Content
            </label>
            <textarea
              className="w-full px-4 py-2 bg-olive-700 border border-olive-600 rounded-md text-cream-100 placeholder-cream-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Main content of the guide (Markdown supported)..."
              value={formData.body || ''}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              rows={6}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Select Category</option>
              {GUIDE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>

            <Select
              label="Difficulty Level"
              value={formData.difficulty_level || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                difficulty_level: e.target.value as typeof formData.difficulty_level || null 
              })}
            >
              <option value="">Select Difficulty</option>
              {DIFFICULTY_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </Select>

            <Input
              label="Estimated Time (minutes)"
              type="number"
              placeholder="e.g., 60"
              value={formData.estimated_time_minutes || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                estimated_time_minutes: e.target.value ? parseInt(e.target.value) : null 
              })}
            />
          </div>

          <Input
            label="Featured Image URL"
            placeholder="https://example.com/image.jpg"
            value={formData.featured_image_url || ''}
            onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
          />
        </CardContent>
      </Card>

      {/* Relations */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Related Items</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Related Engine"
              value={formData.related_engine_id}
              onChange={(e) => setFormData({ ...formData, related_engine_id: e.target.value })}
            >
              <option value="">No Engine</option>
              {engines.map((engine) => (
                <option key={engine.id} value={engine.id}>
                  {engine.brand} {engine.name}
                </option>
              ))}
            </Select>

            <Select
              label="Related Part"
              value={formData.related_part_id}
              onChange={(e) => setFormData({ ...formData, related_part_id: e.target.value })}
            >
              <option value="">No Part</option>
              {parts.map((part) => (
                <option key={part.id} value={part.id}>
                  {part.name}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Tags</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button type="button" onClick={handleAddTag} icon={<Plus className="w-4 h-4" />}>
              Add
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Steps */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-cream-100">Steps</h2>
          <Button type="button" onClick={handleAddStep} size="sm" icon={<Plus className="w-4 h-4" />}>
            Add Step
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.steps.length === 0 ? (
            <p className="text-cream-400 text-center py-8">No steps added yet. Click "Add Step" to get started.</p>
          ) : (
            formData.steps.map((step, index) => (
              <div key={index} className="p-4 bg-olive-800 rounded-lg border border-olive-700 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-cream-400" />
                    <span className="text-sm font-medium text-cream-300">Step {step.step_number}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMoveStep(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-cream-400 hover:text-cream-100 disabled:opacity-50"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveStep(index, 'down')}
                      disabled={index === formData.steps.length - 1}
                      className="p-1 text-cream-400 hover:text-cream-100 disabled:opacity-50"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(index)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <Input
                  label="Step Title"
                  placeholder="e.g., Prepare the Frame"
                  value={step.title}
                  onChange={(e) => handleUpdateStep(index, 'title', e.target.value)}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-cream-200 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full px-4 py-2 bg-olive-700 border border-olive-600 rounded-md text-cream-100 placeholder-cream-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Brief description of this step..."
                    value={step.description || ''}
                    onChange={(e) => handleUpdateStep(index, 'description', e.target.value || null)}
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-cream-200 mb-2">
                    Instructions *
                  </label>
                  <textarea
                    className="w-full px-4 py-2 bg-olive-700 border border-olive-600 rounded-md text-cream-100 placeholder-cream-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Detailed instructions for this step..."
                    value={step.instructions}
                    onChange={(e) => handleUpdateStep(index, 'instructions', e.target.value)}
                    required
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Image URL"
                    placeholder="https://example.com/step-image.jpg"
                    value={step.image_url || ''}
                    onChange={(e) => handleUpdateStep(index, 'image_url', e.target.value || null)}
                  />
                  <Input
                    label="Video URL"
                    placeholder="https://youtube.com/watch?v=..."
                    value={step.video_url || ''}
                    onChange={(e) => handleUpdateStep(index, 'video_url', e.target.value || null)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cream-200 mb-2">
                      Warning
                    </label>
                    <textarea
                      className="w-full px-4 py-2 bg-olive-700 border border-olive-600 rounded-md text-cream-100 placeholder-cream-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Safety warnings for this step..."
                      value={step.warning || ''}
                      onChange={(e) => handleUpdateStep(index, 'warning', e.target.value || null)}
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-cream-200 mb-2">
                      Tips
                    </label>
                    <textarea
                      className="w-full px-4 py-2 bg-olive-700 border border-olive-600 rounded-md text-cream-100 placeholder-cream-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Helpful tips for this step..."
                      value={step.tips || ''}
                      onChange={(e) => handleUpdateStep(index, 'tips', e.target.value || null)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Publish Status */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Publish Status</h2>
        </CardHeader>
        <CardContent>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="w-4 h-4 text-orange-500 bg-olive-700 border-olive-600 rounded focus:ring-orange-500"
            />
            <span className="text-cream-200">Publish this guide (make it visible to users)</span>
          </label>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/admin/guides')}
        >
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {mode === 'create' ? 'Create Guide' : 'Update Guide'}
        </Button>
      </div>
    </form>
  );
}
