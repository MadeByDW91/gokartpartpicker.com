'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { 
  getPartPrices, 
  getMerchants, 
  createProductPrice, 
  updateProductPrice, 
  deleteProductPrice 
} from '@/actions/admin/product-prices';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  DollarSign 
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { ProductPrice, Merchant } from '@/types/database';
import Image from 'next/image';

interface PriceManagementProps {
  partId: string;
}

export function PriceManagement({ partId }: PriceManagementProps) {
  const [prices, setPrices] = useState<ProductPrice[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    merchant_id: '',
    price: '',
    shipping_cost: '0',
    availability_status: 'in_stock' as 'in_stock' | 'out_of_stock',
    product_url: '',
    affiliate_url: '',
  });

  // Load data
  useEffect(() => {
    loadData();
  }, [partId]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [pricesResult, merchantsResult] = await Promise.all([
        getPartPrices(partId),
        getMerchants(),
      ]);

      if (pricesResult.success && pricesResult.data) {
        setPrices(pricesResult.data);
      } else {
        setError('error' in pricesResult ? pricesResult.error : 'Failed to load prices');
      }

      if (merchantsResult.success && merchantsResult.data) {
        setMerchants(merchantsResult.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      merchant_id: '',
      price: '',
      shipping_cost: '0',
      availability_status: 'in_stock',
      product_url: '',
      affiliate_url: '',
    });
    setShowAddForm(false);
    setEditingId(null);
  }

  function startEdit(price: ProductPrice) {
    setFormData({
      merchant_id: price.merchant_id,
      price: price.price.toString(),
      shipping_cost: price.shipping_cost.toString(),
      availability_status: price.availability_status,
      product_url: price.product_url,
      affiliate_url: price.affiliate_url || '',
    });
    setEditingId(price.id);
    setShowAddForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingId) {
        // Update existing
        const result = await updateProductPrice({
          id: editingId,
          price: parseFloat(formData.price),
          shipping_cost: parseFloat(formData.shipping_cost),
          availability_status: formData.availability_status,
          product_url: formData.product_url,
          affiliate_url: formData.affiliate_url || null,
        });

        if (result.success) {
          await loadData();
          resetForm();
        } else {
          setError(result.error || 'Failed to update price');
        }
      } else {
        // Create new
        const result = await createProductPrice({
          part_id: partId,
          merchant_id: formData.merchant_id,
          price: parseFloat(formData.price),
          shipping_cost: parseFloat(formData.shipping_cost),
          availability_status: formData.availability_status,
          product_url: formData.product_url,
          affiliate_url: formData.affiliate_url || null,
        });

        if (result.success) {
          await loadData();
          resetForm();
        } else {
          setError(result.error || 'Failed to create price');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save price');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(priceId: string) {
    if (!confirm('Are you sure you want to delete this price?')) return;

    setSaving(true);
    try {
      const result = await deleteProductPrice(priceId);
      if (result.success) {
        await loadData();
      } else {
        setError(result.error || 'Failed to delete price');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete price');
    } finally {
      setSaving(false);
    }
  }

  // Get merchant name by ID
  const getMerchantName = (merchantId: string) => {
    return merchants.find(m => m.id === merchantId)?.name || 'Unknown';
  };

  // Get merchant logo by ID
  const getMerchantLogo = (merchantId: string) => {
    return merchants.find(m => m.id === merchantId)?.logo_url || null;
  };

  // Check if merchant already has a price
  const merchantHasPrice = (merchantId: string) => {
    return prices.some(p => p.merchant_id === merchantId);
  };

  // Available merchants (ones without prices, or the one being edited)
  const availableMerchants = merchants.filter(m => 
    !merchantHasPrice(m.id) || (editingId && prices.find(p => p.id === editingId)?.merchant_id === m.id)
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-cream-400">Loading prices...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-cream-100">Price Comparison</h2>
            <p className="text-sm text-cream-400 mt-1">
              Manage prices from multiple merchants for this part
            </p>
          </div>
          {!showAddForm && (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowAddForm(true)}
              disabled={availableMerchants.length === 0}
            >
              Add Price
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="bg-olive-800/50 rounded-lg p-4 border border-olive-600/50 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-md font-semibold text-cream-100">
                {editingId ? 'Edit Price' : 'Add New Price'}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetForm}
              >
                Cancel
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Merchant"
                value={formData.merchant_id}
                onChange={(e) => setFormData({ ...formData, merchant_id: e.target.value })}
                required
                disabled={!!editingId} // Can't change merchant when editing
                options={[
                  { value: '', label: 'Select merchant...' },
                  ...availableMerchants.map(m => ({
                    value: m.id,
                    label: m.name,
                  })),
                ]}
              />

              <Input
                label="Price (USD)"
                type="number"
                step="0.01"
                placeholder="49.99"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />

              <Input
                label="Shipping Cost (USD)"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.shipping_cost}
                onChange={(e) => setFormData({ ...formData, shipping_cost: e.target.value })}
                required
              />

              <Select
                label="Availability"
                value={formData.availability_status}
                onChange={(e) => setFormData({ ...formData, availability_status: e.target.value as 'in_stock' | 'out_of_stock' })}
                required
                options={[
                  { value: 'in_stock', label: 'In Stock' },
                  { value: 'out_of_stock', label: 'Out of Stock' },
                ]}
              />

              <Input
                label="Product URL"
                type="url"
                placeholder="https://..."
                value={formData.product_url}
                onChange={(e) => setFormData({ ...formData, product_url: e.target.value })}
                required
              />

              <Input
                label="Affiliate URL (Optional)"
                type="url"
                placeholder="https://..."
                value={formData.affiliate_url}
                onChange={(e) => setFormData({ ...formData, affiliate_url: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={saving}
              >
                {editingId ? 'Update Price' : 'Add Price'}
              </Button>
            </div>
          </form>
        )}

        {/* Prices List */}
        {prices.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-cream-400 mx-auto mb-3 opacity-50" />
            <p className="text-cream-400 mb-2">No merchant prices added yet</p>
            <p className="text-sm text-cream-500">
              Click "Add Price" to add prices from Amazon, eBay, or Harbor Freight
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {prices.map((price) => {
              const merchant = merchants.find(m => m.id === price.merchant_id);
              return (
                <div
                  key={price.id}
                  className="flex items-center justify-between p-4 bg-olive-800/30 rounded-lg border border-olive-600/50 hover:border-olive-500 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Merchant Logo/Name */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {merchant?.logo_url ? (
                        <div className="relative w-10 h-10 rounded border border-olive-600/50 bg-olive-800/50 flex-shrink-0">
                          <Image
                            src={merchant.logo_url}
                            alt={merchant.name}
                            fill
                            className="object-contain p-1"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded border border-olive-600/50 bg-olive-800/50 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-cream-400">
                            {merchant?.name.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-cream-100 truncate">{merchant?.name || 'Unknown'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-bold text-orange-400">
                            {formatPrice(price.total_price)}
                          </span>
                          <span className="text-xs text-cream-500">
                            ({formatPrice(price.price)} + {formatPrice(price.shipping_cost)} shipping)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Availability Badge */}
                    <Badge
                      variant={price.availability_status === 'in_stock' ? 'success' : 'error'}
                      className="flex-shrink-0"
                    >
                      {price.availability_status === 'in_stock' ? (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {price.availability_status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                    </Badge>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={price.product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-olive-700/50 rounded transition-colors"
                        title="View product"
                      >
                        <ExternalLink className="w-4 h-4 text-cream-400" />
                      </a>
                      <button
                        onClick={() => startEdit(price)}
                        className="p-2 hover:bg-olive-700/50 rounded transition-colors"
                        title="Edit price"
                        disabled={saving}
                      >
                        <Edit2 className="w-4 h-4 text-cream-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(price.id)}
                        className="p-2 hover:bg-red-500/20 rounded transition-colors"
                        title="Delete price"
                        disabled={saving}
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
