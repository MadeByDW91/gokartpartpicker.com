'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import type { BuildTemplate } from '@/types/database';

interface TemplateCardProps {
  template: BuildTemplate;
  onApply?: (template: BuildTemplate) => void;
}

const GOAL_LABELS: Record<string, string> = {
  speed: 'Speed',
  torque: 'Torque',
  budget: 'Budget',
  beginner: 'Beginner',
  competition: 'Competition',
  kids: 'Kids',
};

export function TemplateCard({ template, onApply }: TemplateCardProps) {
  const partCount = Object.keys(template.parts || {}).length;
  const statPieces: string[] = [];
  if (template.total_price) statPieces.push(`From ${formatPrice(template.total_price)}`);
  if (template.estimated_hp) statPieces.push(`~${template.estimated_hp} HP`);
  if (partCount > 0 && statPieces.length < 2) statPieces.push(`${partCount} parts`);
  const statLine = statPieces.join(' · ');
  const goalLabel = GOAL_LABELS[template.goal] || template.goal;

  return (
    <Card hoverable className="h-full flex flex-col">
      <CardContent className="flex flex-col flex-1 p-6">
        <h3 className="text-xl font-bold text-cream-100 line-clamp-2 leading-snug mb-1">
          {template.name}
        </h3>
        <p className="text-xs text-cream-500 uppercase tracking-wider mb-4">
          {goalLabel}
        </p>

        {statLine && (
          <p className="text-sm text-cream-500 mb-5">
            {statLine}
          </p>
        )}

        <div className="mt-auto pt-5 border-t border-olive-600">
          {onApply ? (
            <Button
              variant="secondary"
              className="w-full normal-case tracking-normal"
              onClick={() => onApply(template)}
            >
              Use template
            </Button>
          ) : (
            <Link href={`/builder?template=${template.id}`} className="block">
              <Button variant="secondary" className="w-full normal-case tracking-normal">
                Use template
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
