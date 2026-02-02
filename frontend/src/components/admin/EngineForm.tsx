'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { slugify } from '@/lib/utils';
import { SHAFT_TYPES } from '@/types/database';
import { createEngine, updateEngine } from '@/actions/admin';
import { 
  getEngineSupplierLinks, 
  updateEngineSupplierLinks,
  type EngineSupplierLink 
} from '@/actions/admin/engine-suppliers';
import type { AdminEngine, EngineFormInput } from '@/types/admin';
import { Plus, Trash2, ExternalLink, ArrowUp, ArrowDown } from 'lucide-react';

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
}

export function EngineForm({ engine, mode }: EngineFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [supplierLinks, setSupplierLinks] = useState<SupplierLinkFormData[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);

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

  // Load supplier links when editing, and migrate legacy affiliate_url if it exists
  useEffect(() => {
    if (mode === 'edit' && engine?.id) {
      setLoadingLinks(true);
      getEngineSupplierLinks(engine.id)
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
            }));
            
            // If no supplier links exist but there's a legacy affiliate_url, migrate it
            if (links.length === 0 && engine.affiliate_url && engine.affiliate_url.trim()) {
              // Extract supplier name from URL
              let supplierName = 'Harbor Freight';
              if (engine.affiliate_url.includes('amazon.com') || engine.affiliate_url.includes('amzn.to')) {
                supplierName = 'Amazon';
              } else if (engine.affiliate_url.includes('ebay.com') || engine.affiliate_url.includes('ebay.us')) {
                supplierName = 'eBay';
              } else if (engine.affiliate_url.includes('harborfreight.com')) {
                supplierName = 'Harbor Freight';
              }
              
              setSupplierLinks([{
                supplier_name: supplierName,
                supplier_url: engine.affiliate_url,
                price: engine.price,
                shipping_cost: 0,
                availability_status: 'in_stock',
                display_order: 0,
                is_active: true,
                notes: 'Migrated from legacy affiliate_url',
              }]);
            } else {
              setSupplierLinks(links);
            }
          } else if (engine.affiliate_url && engine.affiliate_url.trim()) {
            // No supplier links found, but legacy affiliate_url exists - migrate it
            let supplierName = 'Harbor Freight';
            if (engine.affiliate_url.includes('amazon.com') || engine.affiliate_url.includes('amzn.to')) {
              supplierName = 'Amazon';
            } else if (engine.affiliate_url.includes('ebay.com') || engine.affiliate_url.includes('ebay.us')) {
              supplierName = 'eBay';
            } else if (engine.affiliate_url.includes('harborfreight.com')) {
              supplierName = 'Harbor Freight';
            }
            
            setSupplierLinks([{
              supplier_name: supplierName,
              supplier_url: engine.affiliate_url,
              price: engine.price,
              shipping_cost: 0,
              availability_status: 'in_stock',
              display_order: 0,
              is_active: true,
              notes: 'Migrated from legacy affiliate_url',
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
  }, [mode, engine?.id, engine?.affiliate_url, engine?.price]);

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: mode === 'create' ? slugify(name) : prev.slug,
    }));
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
      // Validate required fields
      if (!formData.name || !formData.brand || !formData.slug) {
        throw new Error('Name, brand, and slug are required');
      }

      // Prepare data - convert empty strings to null and only include schema fields
      // Note: affiliate_url is deprecated - use supplier links instead
      // We set it to null to clear any legacy data
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
        affiliate_url: null, // Deprecated - use supplier links instead
        notes: formData.notes || null,
        is_active: formData.is_active ?? true,
      };

      let engineId: string;
      
      if (mode === 'create') {
        const result = await createEngine(data);
        if (!result.success) {
          throw new Error(result.error || 'Failed to create engine');
        }
        engineId = result.data.id;
      } else if (engine) {
        const result = await updateEngine({ ...data, id: engine.id });
        if (!result.success) {
          throw new Error(result.error || 'Failed to update engine');
        }
        engineId = engine.id;
      } else {
        throw new Error('Invalid form state');
      }

      // Save supplier links
      if (engineId) {
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
          }));
        
        const linksResult = await updateEngineSupplierLinks(engineId, validLinks);
        if (!linksResult.success) {
          console.error('Failed to save supplier links:', linksResult.error);
          // Don't throw - engine was saved, links can be fixed later
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/engines');
        router.refresh();
      }, 1000);
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
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
            <Input
              label="Base Price (USD)"
              type="number"
              step="0.01"
              placeholder="299.99"
              value={formData.price || ''}
              onChange={(e) => setFormData({ ...formData, price: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
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
                Add supplier links for price comparison. These will display when there are multiple sellers. Each supplier can have its own price, shipping cost, and availability.
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
                  Add supplier links to enable price comparison. Users will see all active suppliers with their prices, shipping costs, and availability.
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
                      placeholder="e.g., Harbor Freight, Amazon, eBay"
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
                      placeholder="299.99"
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
                </div>
              ))}
            </div>
          )}
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
