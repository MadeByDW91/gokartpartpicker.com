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
import { createMotor, updateMotor } from '@/actions/admin';
import type { AdminElectricMotor, MotorFormInput } from '@/types/admin';

interface MotorFormProps {
  motor?: AdminElectricMotor;
  mode: 'create' | 'edit';
}

// Common motor brands
const MOTOR_BRANDS = [
  'Amped Motors',
  'MY1020',
  'MY1016',
  'QS Motor',
  'Hub Motor',
  'Other',
];

// Common voltages
const VOLTAGES = [12, 24, 36, 48, 72, 96];

// Cooling types
const COOLING_TYPES = ['air', 'liquid', 'passive'];

export function MotorForm({ motor, mode }: MotorFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState<MotorFormInput>({
    slug: motor?.slug || '',
    name: motor?.name || '',
    brand: motor?.brand || '',
    model: motor?.model || '',
    variant: motor?.variant || '',
    voltage: motor?.voltage || 48,
    power_kw: motor?.power_kw || 5,
    peak_power_kw: motor?.peak_power_kw || null,
    horsepower: motor?.horsepower || 6.7,
    torque_lbft: motor?.torque_lbft || 10,
    rpm_max: motor?.rpm_max || null,
    rpm_rated: motor?.rpm_rated || null,
    efficiency: motor?.efficiency || null,
    shaft_diameter: motor?.shaft_diameter || null,
    shaft_length: motor?.shaft_length || null,
    shaft_type: motor?.shaft_type || 'straight',
    mount_type: motor?.mount_type || '',
    controller_required: motor?.controller_required ?? true,
    cooling_type: motor?.cooling_type || '',
    weight_lbs: motor?.weight_lbs || null,
    price: motor?.price || null,
    image_url: motor?.image_url || '',
    affiliate_url: motor?.affiliate_url || '',
    is_active: motor?.is_active ?? true,
    notes: motor?.notes || '',
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

      // Prepare data - convert empty strings to null
      const data = {
        slug: formData.slug,
        name: formData.name,
        brand: formData.brand,
        model: formData.model || null,
        variant: formData.variant || null,
        voltage: formData.voltage,
        power_kw: formData.power_kw,
        peak_power_kw: formData.peak_power_kw || null,
        horsepower: formData.horsepower,
        torque_lbft: formData.torque_lbft,
        rpm_max: formData.rpm_max || null,
        rpm_rated: formData.rpm_rated || null,
        efficiency: formData.efficiency || null,
        shaft_diameter: formData.shaft_diameter || null,
        shaft_length: formData.shaft_length || null,
        shaft_type: formData.shaft_type,
        mount_type: formData.mount_type || null,
        controller_required: formData.controller_required,
        cooling_type: formData.cooling_type || null,
        weight_lbs: formData.weight_lbs || null,
        price: formData.price || null,
        image_url: formData.image_url || null,
        affiliate_url: formData.affiliate_url || null,
        notes: formData.notes || null,
        is_active: formData.is_active ?? true,
      };

      if (mode === 'create') {
        const result = await createMotor(data);
        if (!result.success) {
          throw new Error(result.error || 'Failed to create motor');
        }
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/motors');
          router.refresh();
        }, 1000);
      } else if (motor) {
        const result = await updateMotor({ ...data, id: motor.id });
        if (!result.success) {
          throw new Error(result.error || 'Failed to update motor');
        }
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/motors');
          router.refresh();
        }, 1000);
      }
    } catch (err) {
      console.error('Error saving motor:', err);
      setError(err instanceof Error ? err.message : 'Failed to save motor');
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
            {mode === 'create' ? 'Motor created successfully!' : 'Motor updated successfully!'}
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
              label="Motor Name"
              placeholder="e.g., Amped Motors 48V 5kW"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
            <Input
              label="URL Slug"
              placeholder="e.g., amped-motors-48v-5kw"
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
              {MOTOR_BRANDS.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </Select>
            <Input
              label="Model"
              placeholder="e.g., MY1020"
              value={formData.model || ''}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            />
            <Input
              label="Variant"
              placeholder="e.g., ZD, ZD-R"
              value={formData.variant || ''}
              onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Motor Specs */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Motor Specifications</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Voltage (V)"
              value={formData.voltage}
              onChange={(e) => setFormData({ ...formData, voltage: Number(e.target.value) })}
              required
            >
              {VOLTAGES.map((v) => (
                <option key={v} value={v}>{v}V</option>
              ))}
            </Select>
            <Input
              label="Power (kW)"
              type="number"
              step="0.1"
              placeholder="5.0"
              value={formData.power_kw}
              onChange={(e) => setFormData({ ...formData, power_kw: Number(e.target.value) })}
              required
            />
            <Input
              label="Peak Power (kW)"
              type="number"
              step="0.1"
              placeholder="10.0"
              value={formData.peak_power_kw || ''}
              onChange={(e) => setFormData({ ...formData, peak_power_kw: e.target.value ? Number(e.target.value) : null })}
            />
            <Input
              label="Horsepower"
              type="number"
              step="0.1"
              placeholder="6.7"
              value={formData.horsepower}
              onChange={(e) => setFormData({ ...formData, horsepower: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Torque (lb-ft)"
              type="number"
              step="0.1"
              placeholder="10.0"
              value={formData.torque_lbft}
              onChange={(e) => setFormData({ ...formData, torque_lbft: Number(e.target.value) })}
              required
            />
            <Input
              label="Max RPM"
              type="number"
              placeholder="3000"
              value={formData.rpm_max || ''}
              onChange={(e) => setFormData({ ...formData, rpm_max: e.target.value ? Number(e.target.value) : null })}
            />
            <Input
              label="Rated RPM"
              type="number"
              placeholder="2500"
              value={formData.rpm_rated || ''}
              onChange={(e) => setFormData({ ...formData, rpm_rated: e.target.value ? Number(e.target.value) : null })}
            />
            <Input
              label="Efficiency (0-1)"
              type="number"
              step="0.01"
              min="0"
              max="1"
              placeholder="0.85"
              value={formData.efficiency || ''}
              onChange={(e) => setFormData({ ...formData, efficiency: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Shaft & Mount */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Shaft & Mounting</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Shaft Diameter (inches)"
              type="number"
              step="0.001"
              placeholder="0.750"
              value={formData.shaft_diameter || ''}
              onChange={(e) => setFormData({ ...formData, shaft_diameter: e.target.value ? Number(e.target.value) : null })}
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
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
            <Input
              label="Mount Type"
              placeholder="e.g., Standard"
              value={formData.mount_type || ''}
              onChange={(e) => setFormData({ ...formData, mount_type: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Motor Features */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Motor Features</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="controller_required"
                checked={formData.controller_required}
                onChange={(e) => setFormData({ ...formData, controller_required: e.target.checked })}
                className="w-4 h-4 rounded border-olive-600 bg-olive-800 text-orange-500 focus:ring-orange-500"
              />
              <label htmlFor="controller_required" className="text-sm text-cream-200">
                Controller Required
              </label>
            </div>
            <Select
              label="Cooling Type"
              value={formData.cooling_type || ''}
              onChange={(e) => setFormData({ ...formData, cooling_type: e.target.value || null })}
            >
              <option value="">None</option>
              {COOLING_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
            <Input
              label="Weight (lbs)"
              type="number"
              step="0.1"
              placeholder="15.0"
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
              label="Price ($)"
              type="number"
              step="0.01"
              placeholder="299.99"
              value={formData.price || ''}
              onChange={(e) => setFormData({ ...formData, price: e.target.value ? Number(e.target.value) : null })}
            />
            <Input
              label="Image URL"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.image_url || ''}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
            <Input
              label="Affiliate URL"
              type="url"
              placeholder="https://amazon.com/dp/..."
              value={formData.affiliate_url || ''}
              onChange={(e) => setFormData({ ...formData, affiliate_url: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Status & Notes */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Status & Notes</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-olive-600 bg-olive-800 text-orange-500 focus:ring-orange-500"
            />
            <label htmlFor="is_active" className="text-sm text-cream-200">
              Active (visible in catalog)
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-cream-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 bg-olive-800 border border-olive-600 rounded-md text-cream-200 placeholder-cream-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Internal notes about this motor..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <CardFooter className="flex justify-end gap-3">
        <Link href="/admin/motors">
          <Button type="button" variant="secondary" disabled={loading}>
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : mode === 'create' ? 'Create Motor' : 'Update Motor'}
        </Button>
      </CardFooter>
    </form>
  );
}
