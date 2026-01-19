'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { DataTable, TableActions } from '@/components/admin/DataTable';
import { formatDate, formatPrice } from '@/lib/utils';
import { ChevronLeft, DollarSign, AlertCircle, Loader2, Check, X, RefreshCw } from 'lucide-react';
import {
  getItemsWithMissingPrices,
  updateItemPrice,
  bulkUpdatePrices,
} from '@/actions/admin/pricing';

interface MissingPriceItem {
  id: string;
  name: string;
  currentPrice: number | null;
  itemType?: 'engine' | 'part';
}

export default function PriceMonitorPage() {
  const router = useRouter();
  const [missingPrices, setMissingPrices] = useState<{
    engines: MissingPriceItem[];
    parts: MissingPriceItem[];
  }>({ engines: [], parts: [] });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMissingPrices();
  }, []);

  const fetchMissingPrices = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getItemsWithMissingPrices();
      
      if (result.success && result.data) {
        const engines = result.data.engines.map(e => ({ ...e, itemType: 'engine' as const }));
        const parts = result.data.parts.map(p => ({ ...p, itemType: 'part' as const }));
        setMissingPrices({ engines, parts });

        // Initialize price inputs
        const inputs: Record<string, string> = {};
        [...engines, ...parts].forEach(item => {
          inputs[item.id] = '';
        });
        setPriceInputs(inputs);
      } else if (!result.success) {
        setError('error' in result ? result.error : 'Failed to load missing prices');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load missing prices');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceUpdate = async (item: MissingPriceItem) => {
    if (!item.itemType) return;

    const priceStr = priceInputs[item.id];
    if (!priceStr || isNaN(parseFloat(priceStr))) {
      alert('Please enter a valid price');
      return;
    }

    const newPrice = parseFloat(priceStr);
    setUpdating({ ...updating, [item.id]: true });
    setError(null);

    try {
      const result = await updateItemPrice(item.id, item.itemType, newPrice);
      
      if (result.success) {
        // Remove from missing prices list
        if (item.itemType === 'engine') {
          setMissingPrices({
            ...missingPrices,
            engines: missingPrices.engines.filter(e => e.id !== item.id),
          });
        } else {
          setMissingPrices({
            ...missingPrices,
            parts: missingPrices.parts.filter(p => p.id !== item.id),
          });
        }
        setPriceInputs({ ...priceInputs, [item.id]: '' });
      } else if (!result.success) {
        setError('error' in result ? result.error : 'Failed to update price');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update price');
    } finally {
      setUpdating(prev => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    }
  };

  const allItems = [...missingPrices.engines, ...missingPrices.parts];

  const columns = [
    {
      key: 'name',
      header: 'Item',
      render: (item: MissingPriceItem) => (
        <div>
          <p className="font-medium text-cream-100">{item.name}</p>
          <p className="text-xs text-cream-400">
            {item.itemType === 'engine' ? 'Engine' : 'Part'}
          </p>
        </div>
      ),
    },
    {
      key: 'currentPrice',
      header: 'Current Price',
      render: (item: MissingPriceItem) => (
        <span className="text-cream-300">
          {item.currentPrice ? formatPrice(item.currentPrice) : 'No price set'}
        </span>
      ),
    },
    {
      key: 'newPrice',
      header: 'New Price',
      render: (item: MissingPriceItem) => (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={priceInputs[item.id] || ''}
            onChange={(e) => setPriceInputs({ ...priceInputs, [item.id]: e.target.value })}
            className="w-32"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handlePriceUpdate(item);
              }
            }}
          />
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (item: MissingPriceItem) => (
        <TableActions>
          <button
            onClick={() => handlePriceUpdate(item)}
            disabled={updating[item.id] || !priceInputs[item.id]}
            className="p-2 text-green-400 hover:text-green-300 hover:bg-olive-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Update Price"
          >
            {updating[item.id] ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </button>
          <Link href={item.itemType === 'engine' ? `/admin/engines/${item.id}` : `/admin/parts/${item.id}`}>
            <button
              className="p-2 text-cream-400 hover:text-orange-400 hover:bg-olive-600 rounded transition-colors"
              title="Edit Item"
            >
              <AlertCircle className="w-4 h-4" />
            </button>
          </Link>
        </TableActions>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-orange-400" />
            <div>
              <h1 className="text-display text-3xl text-cream-100">Price Monitoring</h1>
              <p className="text-cream-300 mt-1">
                Track and update prices for engines and parts
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={fetchMissingPrices}
          disabled={loading}
          icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        >
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cream-400 uppercase tracking-wide">Engines Missing Price</p>
                <p className="text-3xl font-bold text-cream-100 mt-1">
                  {missingPrices.engines.length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/10">
                <AlertCircle className="w-8 h-8 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cream-400 uppercase tracking-wide">Parts Missing Price</p>
                <p className="text-3xl font-bold text-cream-100 mt-1">
                  {missingPrices.parts.length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10">
                <AlertCircle className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items Missing Prices */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Items Missing Prices</h2>
          <p className="text-sm text-cream-400 mt-1">
            {allItems.length} item{allItems.length !== 1 ? 's' : ''} need price updates
          </p>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={allItems}
            loading={loading}
            emptyMessage="All items have prices set. Great job!"
            keyExtractor={(item) => item.id}
          />
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-olive-700/30 border-olive-600">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-cream-100 mb-2">Price Monitoring</h3>
          <p className="text-xs text-cream-400">
            This page shows items that are missing prices. Enter a new price and click the checkmark to update.
            Price monitoring automation (scheduled checks, price scraping) will be available in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
