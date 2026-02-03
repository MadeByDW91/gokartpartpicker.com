'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, getCategoryLabel, getPartBrandDisplay } from '@/lib/utils';
import type { Part } from '@/types/database';
import type { PartSupplierLink } from '@/actions/admin/part-suppliers';
import { PartImage } from '@/components/parts/PartImage';
import { WhereToBuySection } from '@/components/parts/WhereToBuySection';
import { SelectPartButton } from '@/app/parts/[slug]/SelectPartButton';

interface PartDetailHeroProps {
  part: Part;
  supplierLinks: PartSupplierLink[];
  children?: React.ReactNode;
}

/**
 * Part detail hero: main image (swaps by variant when available) and price/actions card.
 * Owns selected variant state so the hero image updates when user picks a color/variant.
 */
export function PartDetailHero({
  part,
  supplierLinks,
  children,
}: PartDetailHeroProps) {
  const variantOptions = useMemo(() => {
    const set = new Set<string>();
    supplierLinks.forEach((l) => {
      if (l.variant_label?.trim()) set.add(l.variant_label.trim());
    });
    return Array.from(set).sort();
  }, [supplierLinks]);

  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    variantOptions[0] ?? null
  );

  const resolvedImageUrl = useMemo(() => {
    if (!selectedVariant) return part.image_url;
    const link = supplierLinks.find(
      (l) =>
        l.variant_label?.trim() === selectedVariant &&
        l.variant_image_url?.trim()
    );
    return link?.variant_image_url?.trim() || part.image_url;
  }, [part.image_url, supplierLinks, selectedVariant]);

  const brandDisplay = getPartBrandDisplay(part.brand);
  const alt = `${brandDisplay} ${part.name}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 lg:items-start">
      {/* Image — swaps to variant image when user selects a variant that has one */}
      <div className="relative w-full lg:max-w-[min(100%,640px)] mx-auto lg:mx-0">
        <div className="sticky top-24">
          <PartImage
            imageUrl={resolvedImageUrl}
            alt={alt}
            priority
          />
        </div>
      </div>

      {/* Details */}
      <div className="space-y-4 min-w-0">
        <div className="flex items-start gap-4 mb-6">
          <Badge variant="default" className="text-sm shrink-0 mt-0.5">
            {getCategoryLabel(part.category)}
          </Badge>
          <div className="flex-1 min-w-0">
            <h1 className="text-display text-2xl sm:text-3xl lg:text-4xl font-bold text-cream-100 tracking-tight mb-1">
              {part.name}
            </h1>
            <p className="text-sm text-cream-400 font-medium">{brandDisplay}</p>
          </div>
        </div>

        <div className="rounded-xl border border-olive-600/50 bg-gradient-to-br from-olive-800/40 to-olive-900/30 p-5 shadow-lg">
          {part.price != null && (
            <div className="mb-5 pb-5 border-b border-olive-600/30">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl sm:text-4xl font-bold text-orange-400 tabular-nums">
                  {formatPrice(part.price)}
                </span>
                <span
                  className="text-xs text-cream-500/70 font-medium uppercase tracking-wide"
                  title="Prices vary by retailer"
                >
                  Est.
                </span>
              </div>
              <p className="text-xs text-cream-500/60">Prices may vary by retailer</p>
            </div>
          )}

          <div className="mb-3">
            <SelectPartButton part={part} />
          </div>

          <WhereToBuySection
            affiliateUrl={part.affiliate_url}
            supplierLinks={supplierLinks}
            selectedVariant={selectedVariant}
            onVariantChange={setSelectedVariant}
          />
        </div>

        {children}
      </div>
    </div>
  );
}
