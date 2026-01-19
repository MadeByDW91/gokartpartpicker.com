'use client';

import { Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface AffiliateDisclosureProps {
  variant?: 'banner' | 'inline' | 'compact';
  className?: string;
}

/**
 * Amazon Associates Program Disclosure Component
 * 
 * Required by Amazon Associates Operating Agreement:
 * - Must be "clear and conspicuous"
 * - Must appear on every page with affiliate links
 * - Must comply with FTC guidelines
 */
export function AffiliateDisclosure({ variant = 'banner', className }: AffiliateDisclosureProps) {
  const disclosureText = "As an Amazon Associate, we earn from qualifying purchases.";

  if (variant === 'compact') {
    return (
      <p className={cn("text-xs text-cream-400", className)}>
        {disclosureText}
      </p>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn("flex items-start gap-2 text-sm text-cream-400", className)}>
        <Info className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
        <p>{disclosureText}</p>
      </div>
    );
  }

  // Banner variant (default)
  return (
    <Card className={cn("bg-olive-800/50 border-olive-600", className)}>
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-cream-300 font-medium mb-1">
              Affiliate Disclosure
            </p>
            <p className="text-xs text-cream-400 leading-relaxed">
              {disclosureText} When you click on links to various merchants on this site and make a purchase, 
              this can result in this site earning a commission. Affiliate programs and affiliations include, 
              but are not limited to, the Amazon Associates Program.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
