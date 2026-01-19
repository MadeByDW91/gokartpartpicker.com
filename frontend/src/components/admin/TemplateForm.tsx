'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { createTemplate, updateTemplate } from '@/actions/templates';
import { getAdminEngines, getAdminParts } from '@/actions/admin';
import { PART_CATEGORIES } from '@/types/database';
import { getCategoryLabel } from '@/lib/utils';
import { TEMPLATE_GOALS } from '@/types/templates';
import type { BuildTemplate, TemplateFormInput } from '@/types/templates';
import type { Engine, Part } from '@/types/database';
import { Loader2 } from 'lucide-react';

interface TemplateFormProps {
  template?: BuildTemplate;
  mode: 'create' | 'edit';
}

const GOAL_LABELS: Record<string, string> = {
  speed: 'Speed',
  torque: 'Torque',
  budget: 'Budget',
  beginner: 'Beginner',
  competition: 'Competition',
  kids: 'Kids',
};

export function TemplateForm({ template, mode }: TemplateFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [engines, setEngines] = useState<Engine[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState<TemplateFormInput>({
    name: template?.name || '',
    description: template?.description || '',
    goal: template?.goal || 'budget',
    engine_id: template?.engine_id || null,
    parts: template?.parts || {},
    total_price: template?.total_price || null,
    estimated_hp: template?.estimated_hp || null,
    estimated_torque: template?.estimated_torque || null,
    is_public: template?.is_public ?? true,
    is_active: template?.is_active ?? true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [enginesResult, partsResult] = await Promise.all([
        getAdminEngines(),
        getAdminParts(),
      ]);

      if (enginesResult.success && enginesResult.data) {
        setEngines(enginesResult.data);
      }
      if (partsResult.success && partsResult.data) {
        setParts(partsResult.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handlePartChange = (category: string, partId: string) => {
    setFormData((prev) => {
      const newParts = { ...prev.parts };
      if (partId) {
        newParts[category] = partId;
      } else {
        delete newParts[category];
      }
      return {
        ...prev,
        parts: newParts,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Clean up empty part selections
      const cleanedParts = Object.fromEntries(
        Object.entries(formData.parts).filter(([_, id]) => id && id !== '')
      );

      const input = {
        name: formData.name,
        description: formData.description || undefined,
        goal: formData.goal,
        engine_id: formData.engine_id || null,
        parts: cleanedParts,
        total_price: formData.total_price || null,
        estimated_hp: formData.estimated_hp || null,
        estimated_torque: formData.estimated_torque || null,
        is_public: formData.is_public ?? true,
        is_active: formData.is_active ?? true,
      };

      let result;
      if (mode === 'create') {
        result = await createTemplate(input);
      } else if (template) {
        result = await updateTemplate(template.id, {
          name: formData.name,
          description: formData.description || undefined,
          goal: formData.goal,
          engine_id: formData.engine_id || null,
          parts: cleanedParts,
          total_price: formData.total_price || null,
          estimated_hp: formData.estimated_hp || null,
          estimated_torque: formData.estimated_torque || null,
          is_public: formData.is_public,
          is_active: formData.is_active,
        });
      } else {
        throw new Error('Template ID required for edit mode');
      }

      if (result.success) {
        router.push('/admin/templates');
      } else if (!result.success) {
        setError('error' in result ? result.error : `Failed to ${mode} template`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${mode} template`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    );
  }

  const partsByCategory = parts.reduce((acc, part) => {
    if (!acc[part.category]) {
      acc[part.category] = [];
    }
    acc[part.category].push(part);
    return acc;
  }, {} as Record<string, Part[]>);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Basic Information</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Template Name"
            placeholder="e.g., Budget Racer"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-cream-200 mb-2">
              Description
            </label>
            <textarea
              className="w-full px-4 py-2 bg-olive-800 border border-olive-600 rounded-md text-cream-100 placeholder-cream-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              placeholder="Template description..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <Select
            label="Goal"
            value={formData.goal}
            onChange={(e) => setFormData({ ...formData, goal: e.target.value as typeof formData.goal })}
            required
          >
            {TEMPLATE_GOALS.map((goal) => (
              <option key={goal} value={goal}>
                {GOAL_LABELS[goal] || goal}
              </option>
            ))}
          </Select>

          <Select
            label="Engine"
            value={formData.engine_id || ''}
            onChange={(e) => setFormData({ ...formData, engine_id: e.target.value || null })}
          >
            <option value="">No Engine</option>
            {engines
              .filter((e) => e.is_active)
              .map((engine) => (
                <option key={engine.id} value={engine.id}>
                  {engine.name}
                </option>
              ))}
          </Select>
        </CardContent>
      </Card>

      {/* Parts Selection */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Parts</h2>
          <p className="text-sm text-cream-400 mt-1">
            Select parts for each category (optional)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {PART_CATEGORIES.map((category) => {
            const categoryParts = partsByCategory[category] || [];
            const selectedPartId = formData.parts[category] || '';

            return (
              <div key={category}>
                <label className="block text-sm font-medium text-cream-200 mb-2">
                  {getCategoryLabel(category)}
                </label>
                <Select
                  value={selectedPartId}
                  onChange={(e) => handlePartChange(category, e.target.value)}
                >
                  <option value="">No {getCategoryLabel(category)}</option>
                  {categoryParts
                    .filter((p) => p.is_active)
                    .map((part) => (
                      <option key={part.id} value={part.id}>
                        {part.name} {part.brand ? `(${part.brand})` : ''}
                      </option>
                    ))}
                </Select>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Estimated Values */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Estimated Values</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Total Price"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.total_price || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  total_price: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
            />
            <Input
              label="Estimated HP"
              type="number"
              step="0.1"
              placeholder="0.0"
              value={formData.estimated_hp || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  estimated_hp: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
            />
            <Input
              label="Estimated Torque"
              type="number"
              step="0.1"
              placeholder="0.0"
              value={formData.estimated_torque || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  estimated_torque: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Settings</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_public ?? true}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                className="w-4 h-4 text-orange-400 bg-olive-800 border-olive-600 rounded focus:ring-orange-400 focus:ring-2"
              />
              <span className="text-cream-200">Public (visible to users)</span>
            </label>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active ?? true}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-orange-400 bg-olive-800 border-olive-600 rounded focus:ring-orange-400 focus:ring-2"
              />
              <span className="text-cream-200">Active</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button
          type="submit"
          disabled={loading}
          loading={loading}
          variant="primary"
        >
          {mode === 'create' ? 'Create Template' : 'Update Template'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/admin/templates')}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
