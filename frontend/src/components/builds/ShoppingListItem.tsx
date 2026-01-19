'use client';

import { ExternalLink } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ShoppingListItemProps {
  id: string;
  name: string;
  brand: string | null;
  price: number | null;
  url: string | null;
  purchased: boolean;
  onToggle: (id: string) => void;
}

/**
 * Individual Shopping List Item Component
 * 
 * Displays a single item with checkbox, name, brand, price, and purchase link
 */
export function ShoppingListItem({
  id,
  name,
  brand,
  price,
  url,
  purchased,
  onToggle,
}: ShoppingListItemProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border transition-colors print:border-none print:p-2',
        purchased
          ? 'bg-olive-700/30 border-olive-500 text-cream-500'
          : 'bg-olive-800/50 border-olive-600 text-cream-100'
      )}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        id={id}
        checked={purchased}
        onChange={() => onToggle(id)}
        className="mt-1 w-5 h-5 rounded border-olive-600 bg-olive-900 text-orange-500 focus:ring-orange-500 cursor-pointer print:appearance-none print:border print:rounded print:w-4 print:h-4"
      />
      
      {/* Item Info */}
      <div className="flex-1 min-w-0">
        <label
          htmlFor={id}
          className={cn(
            'block font-medium cursor-pointer',
            purchased && 'line-through'
          )}
        >
          {name}
        </label>
        
        {brand && (
          <p className="text-sm text-cream-400 mt-0.5">
            Brand: {brand}
          </p>
        )}
        
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={cn(
              'inline-flex items-center gap-1 text-sm mt-1 transition-colors print:text-black',
              purchased
                ? 'text-cream-500'
                : 'text-orange-400 hover:text-orange-300'
            )}
            onClick={(e) => e.stopPropagation()}
            aria-label="Buy Now (affiliate link)"
          >
            Buy Now
            <ExternalLink className="w-3 h-3 print:hidden" />
          </a>
        )}
      </div>
      
      {/* Price */}
      <div className="text-right">
        <span
          className={cn(
            'font-semibold text-lg',
            purchased ? 'text-cream-500' : 'text-orange-400'
          )}
        >
          {price ? formatPrice(price) : '—'}
        </span>
      </div>
    </div>
  );
}
