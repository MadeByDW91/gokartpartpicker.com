'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import type { BuildTemplate } from '@/types/database';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplateCardProps {
  template: BuildTemplate;
  onApply?: (template: BuildTemplate) => void;
}

const GOAL_ACCENT: Record<string, string> = {
  speed: 'border-l-orange-500',
  torque: 'border-l-blue-500',
  budget: 'border-l-green-500',
  beginner: 'border-l-purple-500',
  competition: 'border-l-amber-500',
  kids: 'border-l-pink-500',
};

export function TemplateCard({ template, onApply }: TemplateCardProps) {
  const engine = template.engine;
  const imageUrl = engine?.image_url;
  const partCount = Object.keys(template.parts || {}).length;
  const statPieces: string[] = [];
  if (template.total_price) statPieces.push(`From ${formatPrice(template.total_price)}`);
  if (template.estimated_hp) statPieces.push(`~${template.estimated_hp} HP`);
  if (partCount > 0 && statPieces.length < 2) statPieces.push(`${partCount} parts`);

  const nameParts = (template.name || '').includes(' – ')
    ? (template.name || '').split(' – ')
    : null;

  return (
    <Card
      hoverable
      className={cn(
        'h-full flex flex-col overflow-hidden border-l-4',
        GOAL_ACCENT[template.goal] || 'border-l-olive-500'
      )}
    >
      {/* Image or placeholder */}
      <div className="relative h-28 w-full flex-shrink-0 bg-olive-800 flex items-center justify-center rounded-t-lg overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-contain p-2"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <Package className="w-12 h-12 text-cream-500/25" aria-hidden />
        )}
      </div>

      <CardContent className="flex flex-col flex-1 p-5">
        {/* Title: split "X Build" / "Engine" when present */}
        {nameParts && nameParts.length >= 2 ? (
          <div className="mb-2">
            <p className="text-sm text-cream-400 truncate">{nameParts[0]}</p>
            <h3 className="text-lg font-bold text-cream-100 leading-tight truncate">
              {nameParts.slice(1).join(' – ')}
            </h3>
          </div>
        ) : (
          <h3 className="text-lg font-bold text-cream-100 line-clamp-2 leading-snug mb-2">
            {template.name}
          </h3>
        )}

        {statPieces.length > 0 && (
          <p className="text-sm text-cream-500 mb-4">
            <span className="text-cream-400">{statPieces[0]}</span>
            {statPieces.length > 1 && (
              <span> · {statPieces.slice(1).join(' · ')}</span>
            )}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-olive-600">
          {onApply ? (
            <Button
              variant="primary"
              className="w-full normal-case tracking-normal"
              onClick={() => onApply(template)}
            >
              Use template
            </Button>
          ) : (
            <Link href={`/builder?template=${template.id}`} className="block">
              <Button variant="primary" className="w-full normal-case tracking-normal">
                Use template
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
