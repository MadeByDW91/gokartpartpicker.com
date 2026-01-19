'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { slugify } from '@/lib/utils';
import { SHAFT_TYPES } from '@/types/database';
import { createEngine, updateEngine } from '@/actions/admin';
import type { AdminEngine, EngineFormInput } from '@/types/admin';

interface EngineFormProps {
  engine?: AdminEngine;
  mode: 'create' | 'edit';
}

// Common engine brands
const ENGINE_BRANDS = [
  'Predator',
  'Honda',
  'Briggs & Stratton',
  'Tillotson',
  'Clone',
  'Ducar',
  'Lifan',
  'Other',
];

export function EngineForm({ engine, mode }: EngineFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState<EngineFormInput>({
    slug: engine?.slug || '',
    name: engine?.name || '',
    brand: engine?.brand || '',
    model: engine?.model || '',
    variant: engine?.variant || '',
    displacement_cc: engine?.displacement_cc || 212,
    horsepower: engine?.horsepower || 6.5,
    torque: engine?.torque || null,
    shaft_diameter: engine?.shaft_diameter || 0.75,
    shaft_length: engine?.shaft_length || null,
    shaft_type: engine?.shaft_type || 'straight',
    shaft_keyway: engine?.shaft_keyway || null,
    mount_type: engine?.mount_type || '',
    oil_capacity_oz: engine?.oil_capacity_oz || null,
    fuel_tank_oz: engine?.fuel_tank_oz || null,
    weight_lbs: engine?.weight_lbs || null,
    price: engine?.price || null,
    image_url: engine?.image_url || '',
    affiliate_url: engine?.affiliate_url || '',
    is_active: engine?.is_active ?? true,
    notes: engine?.notes || '',
  });

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: mode === 'create' ? slugify(name) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name || !formData.brand || !formData.slug) {
        throw new Error('Name, brand, and slug are required');
      }

      // Prepare data - convert empty strings to null and only include schema fields
      const data = {
        slug: formData.slug,
        name: formData.name,
        brand: formData.brand,
        model: formData.model || null,
        variant: formData.variant || null,
        displacement_cc: formData.displacement_cc,
        horsepower: formData.horsepower,
        torque: formData.torque || null,
        shaft_diameter: formData.shaft_diameter,
        shaft_length: formData.shaft_length || null,
        shaft_type: formData.shaft_type,
        shaft_keyway: formData.shaft_keyway || null,
        mount_type: formData.mount_type || null,
        price: formData.price || null,
        image_url: formData.image_url || null,
        affiliate_url: formData.affiliate_url || null,
        notes: formData.notes || null,
        is_active: formData.is_active ?? true,
      };

      if (mode === 'create') {
        const result = await createEngine(data);
        if (!result.success) {
          throw new Error(result.error || 'Failed to create engine');
        }
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/engines');
          router.refresh();
        }, 1000);
      } else if (engine) {
        const result = await updateEngine({ ...data, id: engine.id });
        if (!result.success) {
          throw new Error(result.error || 'Failed to update engine');
        }
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/engines');
          router.refresh();
        }, 1000);
      }
    } catch (err) {
      console.error('Error saving engine:', err);
      setError(err instanceof Error ? err.message : 'Failed to save engine');
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
            {mode === 'create' ? 'Engine created successfully!' : 'Engine updated successfully!'}
          </p>
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
              label="Engine Name"
              placeholder="e.g., Predator 212 Hemi"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
            <Input
              label="URL Slug"
              placeholder="e.g., predator-212-hemi"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Brand"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              required
            >
              <option value="">Select Brand</option>
              {ENGINE_BRANDS.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </Select>
            <Input
              label="Model"
              placeholder="e.g., 212"
              value={formData.model || ''}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            />
            <Input
              label="Variant"
              placeholder="e.g., Hemi, Non-Hemi"
              value={formData.variant || ''}
              onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Engine Specs */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Engine Specifications</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Displacement (cc)"
              type="number"
              placeholder="212"
              value={formData.displacement_cc}
              onChange={(e) => setFormData({ ...formData, displacement_cc: Number(e.target.value) })}
              required
            />
            <Input
              label="Horsepower"
              type="number"
              step="0.1"
              placeholder="6.5"
              value={formData.horsepower}
              onChange={(e) => setFormData({ ...formData, horsepower: Number(e.target.value) })}
              required
            />
            <Input
              label="Torque (lb-ft)"
              type="number"
              step="0.1"
              placeholder="8.1"
              value={formData.torque || ''}
              onChange={(e) => setFormData({ ...formData, torque: e.target.value ? Number(e.target.value) : null })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Shaft Diameter (inches)"
              type="number"
              step="0.001"
              placeholder="0.750"
              value={formData.shaft_diameter}
              onChange={(e) => setFormData({ ...formData, shaft_diameter: Number(e.target.value) })}
              required
            />
            <Input
              label="Shaft Length (inches)"
              type="number"
              step="0.001"
              placeholder="2.43"
              value={formData.shaft_length || ''}
              onChange={(e) => setFormData({ ...formData, shaft_length: e.target.value ? Number(e.target.value) : null })}
            />
            <Select
              label="Shaft Type"
              value={formData.shaft_type}
              onChange={(e) => setFormData({ ...formData, shaft_type: e.target.value as typeof formData.shaft_type })}
            >
              {SHAFT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </Select>
            <Input
              label="Keyway (inches)"
              type="number"
              step="0.001"
              placeholder="0.188"
              value={formData.shaft_keyway || ''}
              onChange={(e) => setFormData({ ...formData, shaft_keyway: e.target.value ? Number(e.target.value) : null })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Mount Type"
              placeholder="e.g., 6.5x7.5 inch"
              value={formData.mount_type || ''}
              onChange={(e) => setFormData({ ...formData, mount_type: e.target.value })}
            />
            <Input
              label="Oil Capacity (oz)"
              type="number"
              step="0.1"
              placeholder="20"
              value={formData.oil_capacity_oz || ''}
              onChange={(e) => setFormData({ ...formData, oil_capacity_oz: e.target.value ? Number(e.target.value) : null })}
            />
            <Input
              label="Fuel Tank (oz)"
              type="number"
              step="0.1"
              placeholder="96"
              value={formData.fuel_tank_oz || ''}
              onChange={(e) => setFormData({ ...formData, fuel_tank_oz: e.target.value ? Number(e.target.value) : null })}
            />
            <Input
              label="Weight (lbs)"
              type="number"
              step="0.1"
              placeholder="38"
              value={formData.weight_lbs || ''}
              onChange={(e) => setFormData({ ...formData, weight_lbs: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Links */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Pricing & Links</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Price (USD)"
              type="number"
              step="0.01"
              placeholder="299.99"
              value={formData.price || ''}
              onChange={(e) => setFormData({ ...formData, price: e.target.value ? Number(e.target.value) : null })}
            />
            <Input
              label="Image URL"
              type="url"
              placeholder="https://..."
              value={formData.image_url || ''}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
            <div>
              <Input
                label="Harbor Freight Link"
                type="url"
                placeholder="https://www.harborfreight.com/..."
                value={formData.affiliate_url || ''}
                onChange={(e) => setFormData({ ...formData, affiliate_url: e.target.value })}
              />
              <p className="mt-1 text-xs text-cream-400">
                Direct link to Harbor Freight product page (not an affiliate link)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clone Engines */}
      {mode === 'edit' && engine && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-cream-100">Clone Engines</h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-cream-400 mb-4">
              Manage engines that are clones or compatible with this engine. Clone engines share the same parts compatibility.
            </p>
            <Link href={`/admin/engines/${engine.id}/clones`}>
              <Button variant="secondary" className="w-full">
                Manage Clone Engines
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Notes & Status */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Notes & Status</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-cream-200 mb-1.5">
              Notes
            </label>
            <textarea
              className="w-full px-4 py-3 bg-olive-800 border-2 border-olive-600 rounded-md text-cream-100 placeholder:text-cream-400 transition-colors focus:outline-none focus:border-orange-500 min-h-[100px]"
              placeholder="Additional notes about this engine..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 rounded border-olive-600 bg-olive-800 text-orange-500 focus:ring-orange-500 focus:ring-offset-olive-800"
            />
            <label htmlFor="is_active" className="text-cream-200">
              Active (visible in public catalog)
            </label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/admin/engines')}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {mode === 'create' ? 'Create Engine' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
