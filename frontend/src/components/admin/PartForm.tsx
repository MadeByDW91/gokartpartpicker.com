'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { slugify, getCategoryLabel, GAS_ONLY_CATEGORIES, ELECTRIC_ONLY_CATEGORIES } from '@/lib/utils';
import { getSpecFieldsForCategory } from '@/lib/part-category-specs';
import { PART_CATEGORIES } from '@/types/database';
import type { PartCategory } from '@/types/database';
import { createPart, updatePart } from '@/actions/admin';
import { getPartCategories } from '@/actions/parts';
import { autoSearchAndAddVideosForPart } from '@/actions/admin/auto-video-linker';
import { 
  getPartSupplierLinks, 
  updatePartSupplierLinks,
  type PartSupplierLink 
} from '@/actions/admin/part-suppliers';
import type { Part } from '@/types/database';
import { Plus, Trash2, ArrowUp, ArrowDown, Cog, Battery, Layers } from 'lucide-react';

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

/** Category list item (from getPartCategories); PartCategory from database is the slug union. */
interface PartCategoryOption {
  id?: string;
  slug: string;
  name: string;
}

interface SupplierLinkFormData {
  id?: string;
  supplier_name: string;
  supplier_url: string;
  price: number | null;
  shipping_cost: number;
  availability_status: 'in_stock' | 'out_of_stock' | 'unknown';
  display_order: number;
  is_active: boolean;
  notes: string | null;
  variant_label?: string | null;
  variant_image_url?: string | null;
}

export function PartForm({ part, mode }: PartFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<PartCategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [autoAddVideos, setAutoAddVideos] = useState(false);
  const [videoStatus, setVideoStatus] = useState<string | null>(null);
  const [supplierLinks, setSupplierLinks] = useState<SupplierLinkFormData[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);

  // Part type: Gas, Electric (EV), or Both (universal). Drives which categories are shown.
  type PartTypeFilter = 'gas' | 'electric' | 'both';
  const inferPartType = (category: PartCategory): PartTypeFilter => {
    if (GAS_ONLY_CATEGORIES.includes(category)) return 'gas';
    if (ELECTRIC_ONLY_CATEGORIES.includes(category)) return 'electric';
    return 'both';
  };
  const [partType, setPartType] = useState<PartTypeFilter>(() =>
    part?.category ? inferPartType(part.category as PartCategory) : 'both'
  );

  // Categories allowed for current part type
  const allowedCategories: PartCategory[] =
    partType === 'gas'
      ? PART_CATEGORIES.filter((c) => !ELECTRIC_ONLY_CATEGORIES.includes(c))
      : partType === 'electric'
        ? PART_CATEGORIES.filter((c) => !GAS_ONLY_CATEGORIES.includes(c))
        : [...PART_CATEGORIES];

  // When part type changes, clear category if it's no longer allowed
  const handlePartTypeChange = (value: PartTypeFilter) => {
    setPartType(value);
    const nextAllowed: PartCategory[] =
      value === 'gas'
        ? PART_CATEGORIES.filter((c) => !ELECTRIC_ONLY_CATEGORIES.includes(c))
        : value === 'electric'
          ? PART_CATEGORIES.filter((c) => !GAS_ONLY_CATEGORIES.includes(c))
          : [...PART_CATEGORIES];
    const current = formData.category as PartCategory;
    if (current && !nextAllowed.includes(current)) {
      setFormData((prev) => ({ ...prev, category: (nextAllowed[0] as PartCategory) || '', category_id: null }));
    }
  };

  // No-brand checkbox: when checked, part is unbranded and brand input is disabled
  const [noBrand, setNoBrand] = useState(() => !part?.brand || part.brand.trim() === '');

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

  // Load supplier links when editing, and migrate legacy affiliate_url if it exists
  useEffect(() => {
    if (mode === 'edit' && part?.id) {
      setLoadingLinks(true);
      getPartSupplierLinks(part.id)
        .then((result) => {
          if (result.success && result.data) {
            const links = result.data.map((link) => ({
              id: link.id,
              supplier_name: link.supplier_name,
              supplier_url: link.supplier_url,
              price: link.price,
              shipping_cost: link.shipping_cost,
              availability_status: link.availability_status,
              display_order: link.display_order,
              is_active: link.is_active,
              notes: link.notes,
              variant_label: link.variant_label ?? null,
              variant_image_url: link.variant_image_url ?? null,
            }));
            
            // If no supplier links exist but there's a legacy affiliate_url, migrate it
            if (links.length === 0 && part.affiliate_url && part.affiliate_url.trim()) {
              // Extract supplier name from URL
              let supplierName = 'Amazon';
              if (part.affiliate_url.includes('amazon.com') || part.affiliate_url.includes('amzn.to')) {
                supplierName = 'Amazon';
              } else if (part.affiliate_url.includes('ebay.com') || part.affiliate_url.includes('ebay.us')) {
                supplierName = 'eBay';
              } else if (part.affiliate_url.includes('harborfreight.com')) {
                supplierName = 'Harbor Freight';
              }
              
              setSupplierLinks([{
                supplier_name: supplierName,
                supplier_url: part.affiliate_url,
                price: part.price,
                shipping_cost: 0,
                availability_status: 'in_stock',
                display_order: 0,
                is_active: true,
                notes: 'Migrated from legacy affiliate_url',
                variant_label: null,
                variant_image_url: null,
              }]);
            } else {
              setSupplierLinks(links);
            }
          } else if (part.affiliate_url && part.affiliate_url.trim()) {
            // No supplier links found, but legacy affiliate_url exists - migrate it
            let supplierName = 'Amazon';
            if (part.affiliate_url.includes('amazon.com') || part.affiliate_url.includes('amzn.to')) {
              supplierName = 'Amazon';
            } else if (part.affiliate_url.includes('ebay.com') || part.affiliate_url.includes('ebay.us')) {
              supplierName = 'eBay';
            } else if (part.affiliate_url.includes('harborfreight.com')) {
              supplierName = 'Harbor Freight';
            }
            
            setSupplierLinks([{
              supplier_name: supplierName,
              supplier_url: part.affiliate_url,
              price: part.price,
              shipping_cost: 0,
              availability_status: 'in_stock',
              display_order: 0,
              is_active: true,
              notes: 'Migrated from legacy affiliate_url',
              variant_label: null,
              variant_image_url: null,
            }]);
          }
        })
        .catch((err) => {
          console.error('Error loading supplier links:', err);
        })
        .finally(() => {
          setLoadingLinks(false);
        });
    }
  }, [mode, part?.id, part?.affiliate_url, part?.price]);

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
    const nextCategory = categorySlug as PartCategory;
    const specFields = getSpecFieldsForCategory(nextCategory);
    const validKeys = new Set(specFields.map((f) => f.key));
    setFormData((prev) => {
      const prunedSpecs: Record<string, unknown> = {};
      for (const key of validKeys) {
        const v = prev.specifications?.[key];
        if (v !== undefined && v !== null && v !== '') prunedSpecs[key] = v;
      }
      return {
        ...prev,
        category: nextCategory,
        category_id: matched?.id || null,
        specifications: prunedSpecs,
      };
    });
  };

  const setSpecValue = (key: string, value: string | number | boolean) => {
    setFormData((prev) => {
      const next = { ...prev.specifications };
      const isEmpty = value === '' || value === null || value === undefined;
      if (isEmpty) delete next[key];
      else next[key] = value;
      return { ...prev, specifications: next };
    });
  };

  const addSupplierLink = () => {
    setSupplierLinks([
      ...supplierLinks,
      {
        supplier_name: '',
        supplier_url: '',
        price: null,
        shipping_cost: 0,
        availability_status: 'in_stock',
        display_order: supplierLinks.length,
        is_active: true,
        notes: null,
        variant_label: null,
        variant_image_url: null,
      },
    ]);
  };

  const removeSupplierLink = (index: number) => {
    setSupplierLinks(supplierLinks.filter((_, i) => i !== index));
  };

  const updateSupplierLink = (index: number, updates: Partial<SupplierLinkFormData>) => {
    setSupplierLinks(
      supplierLinks.map((link, i) => (i === index ? { ...link, ...updates } : link))
    );
  };

  const moveSupplierLink = (index: number, direction: 'up' | 'down') => {
    const newLinks = [...supplierLinks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newLinks.length) return;
    
    [newLinks[index], newLinks[newIndex]] = [newLinks[newIndex], newLinks[index]];
    newLinks[index].display_order = index;
    newLinks[newIndex].display_order = newIndex;
    setSupplierLinks(newLinks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields (brand is optional — display as "Unbranded" when empty)
      if (!formData.name || !formData.slug || !formData.category) {
        throw new Error('Name, slug, and category are required');
      }

      // Prepare data - convert empty strings to null
      const data = {
        slug: formData.slug,
        name: formData.name,
        category: formData.category,
        category_id: formData.category_id,
        brand: noBrand ? null : (formData.brand?.trim() || null),
        description: formData.description || null,
        price: formData.price || null,
        image_url: formData.image_url || null,
        affiliate_url: formData.affiliate_url?.trim() || null,
        specifications: formData.specifications,
        is_active: formData.is_active,
      };

      let partId: string;

      if (mode === 'create') {
        const result = await createPart(data);
        if (!result.success) {
          throw new Error(result.error || 'Failed to create part');
        }
        partId = result.data.id;
        
        // Auto-add videos if enabled
        if (autoAddVideos && result.data) {
          setVideoStatus('Searching for videos...');
          const videoResult = await autoSearchAndAddVideosForPart(
            result.data.id,
            result.data.name,
            result.data.brand,
            result.data.category,
            5 // Max 5 videos
          );
          
          if (videoResult.success) {
            setVideoStatus(`Added ${videoResult.data.added} video(s) automatically!`);
          } else {
            setVideoStatus(`Video search: ${videoResult.error}`);
          }
        }
      } else if (part) {
        const result = await updatePart({ ...data, id: part.id });
        if (!result.success) {
          throw new Error(result.error || 'Failed to update part');
        }
        partId = part.id;
      } else {
        throw new Error('Invalid form state');
      }

      // Save supplier links
      if (partId) {
        const validLinks = supplierLinks
          .filter((link) => link.supplier_name.trim() && link.supplier_url.trim())
          .map((link, idx) => ({
            id: link.id,
            supplier_name: link.supplier_name,
            supplier_url: link.supplier_url,
            price: link.price,
            shipping_cost: link.shipping_cost,
            availability_status: link.availability_status,
            display_order: link.display_order ?? idx,
            is_active: link.is_active,
            notes: link.notes,
            variant_label: link.variant_label?.trim() || null,
            variant_image_url: link.variant_image_url?.trim() || null,
          }));
        
        const linksResult = await updatePartSupplierLinks(partId, validLinks);
        if (!linksResult.success) {
          console.error('Failed to save supplier links:', linksResult.error);
          // Don't throw - part was saved, links can be fixed later
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/parts');
        router.refresh();
      }, mode === 'create' && autoAddVideos ? 2000 : 1000);
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
          <p className="text-sm text-cream-400 mt-1">
            Parts can be from any retailer or manufacturer (Amazon, Harbor Freight, eBay, OEM, etc.). Add supplier links below.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Part type: Gas / EV / Both — filters category list */}
          <div>
            <label className="block text-sm font-medium text-cream-200 mb-2">Part type</label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { value: 'gas' as const, label: 'Gas only', icon: Cog },
                  { value: 'electric' as const, label: 'Electric (EV) only', icon: Battery },
                  { value: 'both' as const, label: 'Both (universal)', icon: Layers },
                ]
              ).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handlePartTypeChange(value)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                    partType === value
                      ? 'border-orange-500 bg-orange-500/20 text-orange-400'
                      : 'border-olive-600 bg-olive-800/50 text-cream-300 hover:border-olive-500 hover:text-cream-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-cream-500 mt-1.5">
              {partType === 'gas' && 'Category list shows gas-engine parts (drivetrain, chassis, engine parts).'}
              {partType === 'electric' && 'Category list shows EV parts (drivetrain, chassis, EV system).'}
              {partType === 'both' && 'Category list shows all categories (universal parts like clutch, chain, tire).'}
            </p>
          </div>

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
              {allowedCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat)}
                </option>
              ))}
            </Select>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noBrand}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setNoBrand(checked);
                    if (checked) setFormData((prev) => ({ ...prev, brand: '' }));
                  }}
                  className="rounded border-olive-500 bg-olive-800 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-cream-200">No brand (unbranded part)</span>
              </label>
              <Input
                label="Brand"
                placeholder="Enter brand name, or check above for unbranded"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                disabled={noBrand}
              />
            </div>
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

      {/* Category-specific Specifications */}
      {(() => {
        const specFields = getSpecFieldsForCategory(formData.category as PartCategory);
        if (specFields.length === 0) return null;
        return (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-cream-100">Specifications</h2>
              <p className="text-sm text-cream-400 mt-1">
                Fields for {getCategoryLabel(formData.category)}. Optional unless marked required.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {specFields.map((field) => {
                  const value = formData.specifications?.[field.key];
                  const labelSuffix = field.unit ? ` (${field.unit})` : '';
                  if (field.type === 'boolean') {
                    return (
                      <div key={field.key} className="flex items-center gap-3 md:col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value === true || value === 'true'}
                            onChange={(e) => setSpecValue(field.key, e.target.checked)}
                            className="rounded border-olive-500 bg-olive-800 text-orange-500 focus:ring-orange-500"
                          />
                          <span className="text-sm font-medium text-cream-200">
                            {field.label}
                            {field.required && <span className="text-orange-400 ml-0.5">*</span>}
                          </span>
                        </label>
                        {field.hint && (
                          <span className="text-xs text-cream-500">{field.hint}</span>
                        )}
                      </div>
                    );
                  }
                  if (field.type === 'number') {
                    const numVal = value !== undefined && value !== null && value !== '' ? Number(value) : '';
                    return (
                      <Input
                        key={field.key}
                        label={`${field.label}${labelSuffix}`}
                        type="number"
                        step="any"
                        placeholder={field.placeholder}
                        value={numVal === '' ? '' : numVal}
                        onChange={(e) => {
                          const v = e.target.value;
                          setSpecValue(field.key, v === '' ? '' : Number(v));
                        }}
                        required={field.required}
                      />
                    );
                  }
                  return (
                    <Input
                      key={field.key}
                      label={field.label + labelSuffix}
                      type="text"
                      placeholder={field.placeholder}
                      value={typeof value === 'string' ? value : value != null ? String(value) : ''}
                      onChange={(e) => setSpecValue(field.key, e.target.value)}
                      required={field.required}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Media & Pricing */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Media & Pricing</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Image URL"
              type="url"
              placeholder="https://..."
              value={formData.image_url || ''}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value || null })}
            />
            <Input
              label="Base Price (USD)"
              type="number"
              step="0.01"
              placeholder="49.99"
              value={formData.price || ''}
              onChange={(e) => setFormData({ ...formData, price: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
          <Input
            label="Affiliate link"
            type="url"
            placeholder="https://... (Amazon, Harbor Freight, eBay, etc.)"
            value={formData.affiliate_url || ''}
            onChange={(e) => setFormData({ ...formData, affiliate_url: e.target.value?.trim() || null })}
          />
          <p className="text-xs text-cream-400">
            Primary buy link shown on the part page. Optional. You can also add multiple retailer links in Supplier Links below.
          </p>
          <p className="text-xs text-cream-400">
            Base price is optional. Add supplier-specific pricing in the Supplier Links section below.
          </p>
        </CardContent>
      </Card>

      {/* Supplier Links & Price Comparison */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-cream-100">Supplier Links & Price Comparison</h2>
              <p className="text-sm text-cream-400 mt-1">
                Add links from any retailer or source (Amazon, Harbor Freight, eBay, OEM, etc.). Each supplier can have its own price, shipping cost, and availability.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={addSupplierLink}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Supplier
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingLinks ? (
            <div className="text-center py-8">
              <p className="text-cream-400">Loading supplier links...</p>
            </div>
          ) : supplierLinks.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-olive-600/50 rounded-lg bg-olive-800/20">
              <div className="max-w-md mx-auto space-y-3">
                <p className="text-cream-300 font-medium">No supplier links added yet</p>
                <p className="text-sm text-cream-400">
                  Add links from any retailer. Users will see all active suppliers with their prices, shipping costs, and availability.
                </p>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={addSupplierLink}
                  icon={<Plus className="w-4 h-4" />}
                  className="mt-4"
                >
                  Add First Supplier
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {supplierLinks.map((link, index) => (
                <div
                  key={index}
                  className="p-5 border-2 border-olive-600/50 rounded-lg bg-olive-800/40 space-y-4 hover:border-olive-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-olive-600/30">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-olive-700/50 text-cream-300 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-cream-100">
                          {link.supplier_name || `Supplier #${index + 1}`}
                        </span>
                        {link.is_active ? (
                          <Badge variant="success" size="sm" className="ml-2">Active</Badge>
                        ) : (
                          <Badge variant="error" size="sm" className="ml-2">Inactive</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveSupplierLink(index, 'up')}
                        disabled={index === 0}
                        icon={<ArrowUp className="w-3 h-3" />}
                        title="Move up"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveSupplierLink(index, 'down')}
                        disabled={index === supplierLinks.length - 1}
                        icon={<ArrowDown className="w-3 h-3" />}
                        title="Move down"
                      />
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removeSupplierLink(index)}
                        icon={<Trash2 className="w-4 h-4" />}
                        title="Remove supplier"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Supplier Name *"
                      placeholder="e.g., Amazon, eBay, Harbor Freight, OEM"
                      value={link.supplier_name}
                      onChange={(e) => updateSupplierLink(index, { supplier_name: e.target.value })}
                      required
                    />
                    <Input
                      label="Product URL *"
                      type="url"
                      placeholder="https://..."
                      value={link.supplier_url}
                      onChange={(e) => updateSupplierLink(index, { supplier_url: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Price (USD)"
                      type="number"
                      step="0.01"
                      placeholder="49.99"
                      value={link.price || ''}
                      onChange={(e) => updateSupplierLink(index, { price: e.target.value ? Number(e.target.value) : null })}
                    />
                    <Input
                      label="Shipping Cost (USD)"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={link.shipping_cost}
                      onChange={(e) => updateSupplierLink(index, { shipping_cost: Number(e.target.value) || 0 })}
                    />
                    <Select
                      label="Availability"
                      value={link.availability_status}
                      onChange={(e) => updateSupplierLink(index, { availability_status: e.target.value as typeof link.availability_status })}
                    >
                      <option value="in_stock">In Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="unknown">Unknown</option>
                    </Select>
                  </div>
                  
                  {link.price && (
                    <div className="p-3 bg-olive-700/30 rounded border border-olive-600/30">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-cream-400">Total Price:</span>
                        <span className="text-orange-400 font-semibold">
                          ${((link.price || 0) + (link.shipping_cost || 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-cream-200 mb-1.5">
                        Notes (optional)
                      </label>
                      <textarea
                        className="w-full px-4 py-2 bg-olive-800 border-2 border-olive-600 rounded-md text-cream-100 placeholder:text-cream-400 transition-colors focus:outline-none focus:border-orange-500 min-h-[60px] text-sm"
                        placeholder="Optional notes about this supplier..."
                        value={link.notes || ''}
                        onChange={(e) => updateSupplierLink(index, { notes: e.target.value || null })}
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-7">
                      <input
                        type="checkbox"
                        id={`supplier-active-${index}`}
                        checked={link.is_active}
                        onChange={(e) => updateSupplierLink(index, { is_active: e.target.checked })}
                        className="w-5 h-5 rounded border-olive-600 bg-olive-800 text-orange-500 focus:ring-orange-500 focus:ring-offset-olive-800"
                      />
                      <label htmlFor={`supplier-active-${index}`} className="text-cream-200 text-sm cursor-pointer">
                        Show in price comparison
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-olive-600/50">
                    <Input
                      label="Variant (e.g. color)"
                      placeholder="Red, Black, Silver..."
                      value={link.variant_label || ''}
                      onChange={(e) => updateSupplierLink(index, { variant_label: e.target.value || null })}
                    />
                    <Input
                      label="Variant image URL"
                      type="url"
                      placeholder="https://... (image for this variant)"
                      value={link.variant_image_url || ''}
                      onChange={(e) => updateSupplierLink(index, { variant_image_url: e.target.value || null })}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
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
          
          {mode === 'create' && (
            <div className="flex items-center gap-3 pt-2 border-t border-olive-600">
              <input
                type="checkbox"
                id="auto_add_videos"
                checked={autoAddVideos}
                onChange={(e) => setAutoAddVideos(e.target.checked)}
                className="w-5 h-5 rounded border-olive-600 bg-olive-800 text-orange-500 focus:ring-orange-500 focus:ring-offset-olive-800"
              />
              <label htmlFor="auto_add_videos" className="text-cream-200">
                Auto-add videos (searches YouTube for relevant videos)
              </label>
            </div>
          )}
          
          {videoStatus && (
            <div className={`p-3 rounded-lg ${
              videoStatus.includes('Added') 
                ? 'bg-[rgba(74,124,89,0.1)] border border-[rgba(74,124,89,0.3)] text-[var(--success)]'
                : 'bg-[rgba(166,61,64,0.1)] border border-[rgba(166,61,64,0.3)] text-[var(--error)]'
            }`}>
              <p className="text-sm">{videoStatus}</p>
            </div>
          )}
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
