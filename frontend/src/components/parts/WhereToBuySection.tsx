'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ExternalLink, Wrench } from 'lucide-react';
import type { PartSupplierLink } from '@/actions/admin/part-suppliers';
import { cn } from '@/lib/utils';

interface WhereToBuySectionProps {
  affiliateUrl: string | null;
  supplierLinks: PartSupplierLink[];
  /** When provided, variant selector is controlled by parent (e.g. to swap main image). */
  selectedVariant?: string | null;
  onVariantChange?: (variantLabel: string | null) => void;
}

/**
 * Where to buy: primary CTA, optional variant swatches, and secondary supplier buttons.
 * When supplier links have variant_label, shows color/variant selector and filters links.
 */
export function WhereToBuySection({
  affiliateUrl,
  supplierLinks,
  selectedVariant: controlledVariant,
  onVariantChange,
}: WhereToBuySectionProps) {
  const hasVariants = useMemo(
    () => supplierLinks.some((l) => l.variant_label?.trim()),
    [supplierLinks]
  );
  const variantOptions = useMemo(() => {
    if (!hasVariants) return [];
    const set = new Set<string>();
    supplierLinks.forEach((l) => {
      if (l.variant_label?.trim()) set.add(l.variant_label.trim());
    });
    return Array.from(set).sort();
  }, [supplierLinks, hasVariants]);

  const [internalVariant, setInternalVariant] = useState<string | null>(
    variantOptions[0] ?? null
  );
  const selectedVariant =
    controlledVariant !== undefined ? controlledVariant : internalVariant;
  const setSelectedVariant = (v: string | null) => {
    if (onVariantChange) onVariantChange(v);
    else setInternalVariant(v);
  };

  const filteredLinks = useMemo(() => {
    if (!selectedVariant) return supplierLinks;
    return supplierLinks.filter(
      (l) => l.variant_label?.trim() === selectedVariant
    );
  }, [supplierLinks, selectedVariant]);

  const primaryLink = affiliateUrl
    ? { url: affiliateUrl, label: 'Buy Now' }
    : filteredLinks.length > 0
      ? {
          url: filteredLinks[0].supplier_url,
          label: `Buy at ${filteredLinks[0].supplier_name}`,
        }
      : null;
  const otherLinks = affiliateUrl
    ? filteredLinks.slice(0, 5)
    : filteredLinks.length > 1
      ? filteredLinks.slice(1, 6)
      : [];

  const hasAnyBuyLink = !!(affiliateUrl || supplierLinks.length > 0);

  return (
    <div className="w-full space-y-3">
      {hasVariants && variantOptions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-cream-400">Variant:</span>
          {variantOptions.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setSelectedVariant(v)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                selectedVariant === v
                  ? 'bg-orange-500 text-white'
                  : 'bg-olive-700/80 text-cream-200 hover:bg-olive-600'
              )}
            >
              {v}
            </button>
          ))}
        </div>
      )}

      {/* Match engine page: secondary actions row (View on X + Open Builder) */}
      <div className="flex flex-col sm:flex-row gap-2">
        {primaryLink && (
          <a
            href={primaryLink.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex-1"
            aria-label={primaryLink.label}
          >
            <Button
              variant="secondary"
              size="md"
              icon={<ExternalLink className="w-4 h-4" />}
              className="w-full text-sm"
            >
              {primaryLink.label}
            </Button>
          </a>
        )}
        {otherLinks.map((link) => (
          <a
            key={link.id}
            href={link.supplier_url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex-1"
            aria-label={`Buy at ${link.supplier_name}`}
          >
            <Button variant="secondary" size="md" className="w-full text-sm">
              {link.supplier_name}
            </Button>
          </a>
        ))}
        <Link href="/builder" className="flex-1">
          <Button
            variant="secondary"
            size="md"
            icon={<Wrench className="w-4 h-4" />}
            className="w-full text-sm"
          >
            Open Builder
          </Button>
        </Link>
      </div>
    </div>
  );
}
