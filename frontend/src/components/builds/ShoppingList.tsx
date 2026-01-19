'use client';

import { useState, useMemo } from 'react';
import { ShoppingListItem } from './ShoppingListItem';
import { AffiliateDisclosure } from '@/components/affiliate/AffiliateDisclosure';
import { formatPrice, formatDate, getCategoryLabel } from '@/lib/utils';
import type { Build, Part } from '@/types/database';

interface ShoppingListProps {
  build: Build;
  allParts: Part[];
}

/**
 * Shopping List Component
 * 
 * Displays a printable shopping list for a build with:
 * - Engine and all parts grouped by category
 * - Checkboxes to mark items as purchased
 * - Prices and affiliate URLs
 * - Total cost
 */
export function ShoppingList({ build, allParts }: ShoppingListProps) {
  const [purchasedItems, setPurchasedItems] = useState<Set<string>>(new Set());
  
  // Group items by category
  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, Array<{ id: string; name: string; brand: string | null; price: number | null; url: string | null; type: 'engine' | 'part' }>> = {};
    
    // Add engine
    if (build.engine) {
      grouped['Engine'] = [{
        id: `engine-${build.engine.id}`,
        name: build.engine.name,
        brand: build.engine.brand,
        price: build.engine.price,
        url: build.engine.affiliate_url || null,
        type: 'engine',
      }];
    }
    
    // Add parts
    if (build.parts && allParts) {
      Object.entries(build.parts).forEach(([category, partId]) => {
        const part = allParts.find(p => p.id === partId);
        if (part) {
          const categoryLabel = getCategoryLabel(category);
          if (!grouped[categoryLabel]) {
            grouped[categoryLabel] = [];
          }
          grouped[categoryLabel].push({
            id: `part-${part.id}`,
            name: part.name,
            brand: part.brand || null,
            price: part.price,
            url: part.affiliate_url || null,
            type: 'part',
          });
        }
      });
    }
    
    return grouped;
  }, [build, allParts]);
  
  // Calculate totals
  const { totalCost, purchasedCost, remainingCost } = useMemo(() => {
    let total = 0;
    let purchased = 0;
    
    // Engine
    if (build.engine && build.engine.price) {
      total += build.engine.price;
      if (purchasedItems.has(`engine-${build.engine.id}`)) {
        purchased += build.engine.price;
      }
    }
    
    // Parts
    if (build.parts && allParts) {
      Object.values(build.parts).forEach(partId => {
        const part = allParts.find(p => p.id === partId);
        if (part && part.price) {
          total += part.price;
          if (purchasedItems.has(`part-${part.id}`)) {
            purchased += part.price;
          }
        }
      });
    }
    
    return {
      totalCost: total,
      purchasedCost: purchased,
      remainingCost: total - purchased,
    };
  }, [build, allParts, purchasedItems]);
  
  const togglePurchased = (id: string) => {
    setPurchasedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  
  const allPurchased = purchasedItems.size > 0 && 
    Object.values(itemsByCategory).flat().every(item => purchasedItems.has(item.id));
  
  return (
    <div className="shopping-list space-y-8 print:space-y-6">
      {/* Header */}
      <div className="print:mb-6">
        <h1 className="text-display text-3xl sm:text-4xl text-cream-100 mb-2">
          Shopping List
        </h1>
        <div className="flex items-center gap-4 text-sm text-cream-400">
          <span>Build: <strong className="text-cream-200">{build.name}</strong></span>
          <span>•</span>
          <span>Generated: {formatDate(new Date().toISOString())}</span>
        </div>
      </div>
      
      {/* Categories */}
      <div className="space-y-6 print:space-y-4">
        {Object.entries(itemsByCategory).map(([category, items]) => (
          <div key={category} className="category-section">
            <h2 className="text-xl font-semibold text-cream-100 mb-3 print:text-lg print:mb-2 border-b border-olive-600 pb-2">
              {category}
            </h2>
            <div className="space-y-2">
              {items.map(item => (
                <ShoppingListItem
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  brand={item.brand}
                  price={item.price}
                  url={item.url}
                  purchased={purchasedItems.has(item.id)}
                  onToggle={togglePurchased}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Total Summary */}
      <div className="pt-6 border-t-2 border-olive-600 print:pt-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-lg">
            <span className="text-cream-300">Total Cost:</span>
            <span className="text-2xl font-bold text-orange-400">
              {formatPrice(totalCost)}
            </span>
          </div>
          
          {purchasedItems.size > 0 && (
            <>
              <div className="flex items-center justify-between text-sm text-cream-400">
                <span>Purchased:</span>
                <span className="text-green-400">{formatPrice(purchasedCost)}</span>
              </div>
              <div className="flex items-center justify-between text-lg font-semibold">
                <span className="text-cream-300">Remaining:</span>
                <span className="text-xl text-orange-400">
                  {formatPrice(remainingCost)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Affiliate Disclosure - Banner variant for shopping lists */}
      <div className="mt-8 print:hidden">
        <AffiliateDisclosure variant="banner" />
      </div>
      
      {/* Print-only footer */}
      <div className="hidden print:block text-xs text-cream-500 text-center pt-4 border-t border-olive-600">
        Generated from GoKartPartPicker.com - {formatDate(new Date().toISOString())}
        <br />
        <span className="text-xs">As an Amazon Associate, we earn from qualifying purchases.</span>
      </div>
    </div>
  );
}
