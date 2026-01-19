'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { slugify } from '@/lib/utils';
import { PART_CATEGORIES } from '@/types/database';
import { createPart, updatePart } from '@/actions/admin';
import { getPartCategories } from '@/actions/parts';
import type { Part } from '@/types/database';

interface AdminPart extends Part {
  slug: string;
  category_id: string | null;
  description: string | null;
  is_active: boolean;
  updated_at: string;
}

interface PartFormProps {
  part?: AdminPart;
  mode: 'create' | 'edit';
}

interface PartCategory {
  id?: string;
  slug: string;
  name: string;
}

export function PartForm({ part, mode }: PartFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<PartCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    slug: part?.slug || '',
    name: part?.name || '',
    category: part?.category || 'clutch',
    category_id: part?.category_id || null,
    brand: part?.brand || '',
    description: part?.description || '',
    price: part?.price || null,
    image_url: part?.image_url || null,
    affiliate_url: part?.affiliate_url || null,
    is_active: part?.is_active ?? true,
    specifications: part?.specifications || {},
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await getPartCategories();
        if (result.success && result.data) {
          // Map to PartCategory format (with id if available)
          const mappedCategories = result.data.map(cat => ({
            id: (cat as any).id || null,
            slug: cat.slug,
            name: cat.name,
          }));
          setCategories(mappedCategories);
          
          // Set category_id if we have a category slug match
          if (formData.category && !formData.category_id) {
            const matched = mappedCategories.find(cat => cat.slug === formData.category);
            if (matched && matched.id) {
              setFormData(prev => ({ ...prev, category_id: matched.id! }));
            }
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: mode === 'create' ? slugify(name) : prev.slug,
    }));
  };

  // Handle category change - update both enum and category_id
  const handleCategoryChange = (categorySlug: string) => {
    const matched = categories.find(cat => cat.slug === categorySlug);
    setFormData((prev) => ({
      ...prev,
      category: categorySlug as typeof prev.category,
      category_id: matched?.id || null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name || !formData.brand || !formData.slug || !formData.category) {
        throw new Error('Name, brand, slug, and category are required');
      }

      // Prepare data - convert empty strings to null
      const data = {
        slug: formData.slug,
        name: formData.name,
        category: formData.category,
        category_id: formData.category_id,
        brand: formData.brand,
        description: formData.description || null,
        price: formData.price || null,
        image_url: formData.image_url || null,
        affiliate_url: formData.affiliate_url || null,
        specifications: formData.specifications,
        is_active: formData.is_active,
      };

      if (mode === 'create') {
        const result = await createPart(data);
        if (!result.success) {
          throw new Error(result.error || 'Failed to create part');
        }
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/parts');
          router.refresh();
        }, 1000);
      } else if (part) {
        const result = await updatePart({ ...data, id: part.id });
        if (!result.success) {
          throw new Error(result.error || 'Failed to update part');
        }
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/parts');
          router.refresh();
        }, 1000);
      }
    } catch (err) {
      console.error('Error saving part:', err);
      setError(err instanceof Error ? err.message : 'Failed to save part');
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
            {mode === 'create' ? 'Part created successfully!' : 'Part updated successfully!'}
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
              label="Part Name"
              placeholder="e.g., MaxTorque Clutch 3/4"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
            <Input
              label="URL Slug"
              placeholder="e.g., maxtorque-clutch-3-4"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              required
              disabled={loadingCategories}
            >
              <option value="">Select Category</option>
              {PART_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </Select>
            <Input
              label="Brand"
              placeholder="e.g., MaxTorque, Comet, Hilliard"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cream-200 mb-1.5">
              Description
            </label>
            <textarea
              className="w-full px-4 py-3 bg-olive-800 border-2 border-olive-600 rounded-md text-cream-100 placeholder:text-cream-400 transition-colors focus:outline-none focus:border-orange-500 min-h-[100px]"
              placeholder="Part description..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              placeholder="49.99"
              value={formData.price || ''}
              onChange={(e) => setFormData({ ...formData, price: e.target.value ? Number(e.target.value) : null })}
            />
            <Input
              label="Image URL"
              type="url"
              placeholder="https://..."
              value={formData.image_url || ''}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value || null })}
            />
            <Input
              label="Affiliate URL"
              type="url"
              placeholder="https://..."
              value={formData.affiliate_url || ''}
              onChange={(e) => setFormData({ ...formData, affiliate_url: e.target.value || null })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notes & Status */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Status</h2>
        </CardHeader>
        <CardContent className="space-y-4">
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
            onClick={() => router.push('/admin/parts')}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {mode === 'create' ? 'Create Part' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
