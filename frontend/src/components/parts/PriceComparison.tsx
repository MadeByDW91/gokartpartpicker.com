'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getPartPricesAll } from '@/actions/prices';
import { formatPrice } from '@/lib/utils';
import { 
  DollarSign, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ShoppingCart,
  Filter,
} from 'lucide-react';
import type { ProductPrice } from '@/types/database';
import { cn } from '@/lib/utils';

interface PriceComparisonProps {
  partId: string;
  fallbackPrice?: number | null; // Single price from parts.price if no comparison data
}

export function PriceComparison({ partId, fallbackPrice }: PriceComparisonProps) {
  const [prices, setPrices] = useState<ProductPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOutOfStock, setShowOutOfStock] = useState(false);

  useEffect(() => {
    loadPrices();
  }, [partId, showOutOfStock]);

  async function loadPrices() {
    setLoading(true);
    setError(null);
    try {
      const result = await getPartPricesAll(partId);
      if (result.success && result.data) {
        // Filter based on showOutOfStock preference
        const filtered = showOutOfStock 
          ? result.data 
          : result.data.filter(p => p.availability_status === 'in_stock');
        setPrices(filtered);
      } else {
        setError('error' in result ? result.error : 'Failed to load prices');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prices');
    } finally {
      setLoading(false);
    }
  }

  // Find best price (lowest total)
  const bestPrice = prices.length > 0 
    ? prices.reduce((best, current) => 
        current.total_price < best.total_price ? current : best
      )
    : null;

  // Only show comparison if there are 2+ prices to compare
  // If 0 or 1 prices, don't show anything (price is already shown at top of page)
  if (!loading && prices.length < 2) {
    return null;
  }

  if (loading) {
    return (
      <Card className="mt-8">
        <CardContent className="py-12 text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-cream-400">Loading prices...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-8">
        <CardContent className="py-8 text-center">
          <p className="text-red-400 text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-orange-400" />
            <h2 className="text-display text-xl text-cream-100">Prices</h2>
            <Badge variant="default" className="ml-2">
              {prices.length} merchant{prices.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <button
            onClick={() => setShowOutOfStock(!showOutOfStock)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-cream-400 hover:text-cream-100 bg-olive-800/50 hover:bg-olive-700/50 rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4" />
            {showOutOfStock ? 'Hide Out of Stock' : 'Show All'}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-olive-600/50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-cream-200">Merchant</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-cream-200">Price</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-cream-200">Shipping</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-cream-200">Total</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-cream-200">Availability</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-cream-200">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive-700/30">
              {prices.map((price) => {
                const merchant = price.merchant as any;
                const isBestPrice = bestPrice?.id === price.id;
                const isOutOfStock = price.availability_status === 'out_of_stock';
                
                return (
                  <tr
                    key={price.id}
                    className={cn(
                      "hover:bg-olive-800/30 transition-colors",
                      isBestPrice && "bg-orange-500/10 border-l-2 border-orange-500"
                    )}
                  >
                    {/* Merchant */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {merchant?.logo_url ? (
                          <div className="relative w-10 h-10 rounded border border-olive-600/50 bg-olive-800/50 flex-shrink-0">
                            <Image
                              src={merchant.logo_url}
                              alt={merchant.name || 'Merchant'}
                              fill
                              className="object-contain p-1.5"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded border border-olive-600/50 bg-olive-800/50 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-cream-400">
                              {merchant?.name?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                        )}
                        <span className={cn(
                          "font-medium text-cream-100",
                          isOutOfStock && "opacity-60"
                        )}>
                          {merchant?.name || 'Unknown'}
                        </span>
                        {isBestPrice && (
                          <Badge variant="success" className="text-xs">
                            Best Price
                          </Badge>
                        )}
                      </div>
                    </td>
                    
                    {/* Price */}
                    <td className="py-4 px-4 text-right">
                      <span className={cn(
                        "font-semibold text-cream-100",
                        isOutOfStock && "opacity-60"
                      )}>
                        {formatPrice(price.price)}
                      </span>
                    </td>
                    
                    {/* Shipping */}
                    <td className="py-4 px-4 text-right">
                      <span className={cn(
                        "text-cream-300",
                        isOutOfStock && "opacity-60"
                      )}>
                        {price.shipping_cost === 0 ? (
                          <span className="text-green-400 font-medium">Free</span>
                        ) : (
                          formatPrice(price.shipping_cost)
                        )}
                      </span>
                    </td>
                    
                    {/* Total */}
                    <td className="py-4 px-4 text-right">
                      <span className={cn(
                        "text-lg font-bold",
                        isBestPrice ? "text-orange-400" : "text-cream-100",
                        isOutOfStock && "opacity-60"
                      )}>
                        {formatPrice(price.total_price)}
                      </span>
                    </td>
                    
                    {/* Availability */}
                    <td className="py-4 px-4 text-center">
                      <Badge
                        variant={price.availability_status === 'in_stock' ? 'success' : 'error'}
                        className="text-xs"
                      >
                        {price.availability_status === 'in_stock' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            In Stock
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Out of Stock
                          </>
                        )}
                      </Badge>
                    </td>
                    
                    {/* Buy Button */}
                    <td className="py-4 px-4 text-center">
                      <a
                        href={price.affiliate_url || price.product_url}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="inline-block"
                      >
                        <Button
                          variant={isBestPrice ? "primary" : "secondary"}
                          size="sm"
                          icon={<ShoppingCart className="w-4 h-4" />}
                          disabled={isOutOfStock}
                          className={isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          Buy
                        </Button>
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {prices.map((price) => {
            const merchant = price.merchant as any;
            const isBestPrice = bestPrice?.id === price.id;
            const isOutOfStock = price.availability_status === 'out_of_stock';
            
            return (
              <div
                key={price.id}
                className={cn(
                  "p-4 rounded-lg border",
                  isBestPrice 
                    ? "bg-orange-500/10 border-orange-500/50" 
                    : "bg-olive-800/30 border-olive-600/50",
                  isOutOfStock && "opacity-60"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {merchant?.logo_url ? (
                      <div className="relative w-12 h-12 rounded border border-olive-600/50 bg-olive-800/50 flex-shrink-0">
                        <Image
                          src={merchant.logo_url}
                          alt={merchant.name || 'Merchant'}
                          fill
                          className="object-contain p-1.5"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded border border-olive-600/50 bg-olive-800/50 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-cream-400">
                          {merchant?.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-cream-100 truncate">
                        {merchant?.name || 'Unknown'}
                      </p>
                      {isBestPrice && (
                        <Badge variant="success" className="text-xs mt-1">
                          Best Price
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={price.availability_status === 'in_stock' ? 'success' : 'error'}
                    className="text-xs flex-shrink-0"
                  >
                    {price.availability_status === 'in_stock' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        In Stock
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 mr-1" />
                        Out
                      </>
                    )}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-cream-400 text-xs mb-1">Price</p>
                    <p className="font-semibold text-cream-100">{formatPrice(price.price)}</p>
                  </div>
                  <div>
                    <p className="text-cream-400 text-xs mb-1">Shipping</p>
                    <p className={cn(
                      "font-semibold",
                      price.shipping_cost === 0 ? "text-green-400" : "text-cream-100"
                    )}>
                      {price.shipping_cost === 0 ? 'Free' : formatPrice(price.shipping_cost)}
                    </p>
                  </div>
                  <div>
                    <p className="text-cream-400 text-xs mb-1">Total</p>
                    <p className={cn(
                      "font-bold text-lg",
                      isBestPrice ? "text-orange-400" : "text-cream-100"
                    )}>
                      {formatPrice(price.total_price)}
                    </p>
                  </div>
                </div>

                <a
                  href={price.affiliate_url || price.product_url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="block"
                >
                  <Button
                    variant={isBestPrice ? "primary" : "secondary"}
                    size="sm"
                    icon={<ShoppingCart className="w-4 h-4" />}
                    disabled={isOutOfStock}
                    className={cn(
                      "w-full",
                      isOutOfStock && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    Buy from {merchant?.name || 'Merchant'}
                  </Button>
                </a>
              </div>
            );
          })}
        </div>

      </CardContent>
    </Card>
  );
}
