'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import type { BuildTemplate } from '@/types/database';
import { Package, Rocket, Wallet, GraduationCap, Trophy, Baby, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplateCardProps {
  template: BuildTemplate;
  onApply?: (template: BuildTemplate) => void;
}

const GOAL_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  speed: { label: 'Speed', icon: Rocket, color: 'bg-orange-500' },
  torque: { label: 'Torque', icon: Zap, color: 'bg-blue-500' },
  budget: { label: 'Budget', icon: Wallet, color: 'bg-green-500' },
  beginner: { label: 'Beginner', icon: GraduationCap, color: 'bg-purple-500' },
  competition: { label: 'Competition', icon: Trophy, color: 'bg-yellow-500' },
  kids: { label: 'Kids', icon: Baby, color: 'bg-pink-500' },
};

export function TemplateCard({ template, onApply }: TemplateCardProps) {
  const goalConfig = GOAL_CONFIG[template.goal] || { label: template.goal, icon: Package, color: 'bg-olive-600' };
  const GoalIcon = goalConfig.icon;
  const partCount = Object.keys(template.parts || {}).length;

  // One concise stat line: price + HP or parts (engine is already in the template name)
  const statPieces: string[] = [];
  if (template.total_price) statPieces.push(`From ${formatPrice(template.total_price)}`);
  if (template.estimated_hp) statPieces.push(`~${template.estimated_hp} HP`);
  if (partCount > 0 && statPieces.length < 2) statPieces.push(`${partCount} parts`);
  const statLine = statPieces.join(' · ');

  return (
    <Card hoverable className="h-full flex flex-col">
      <CardContent className="flex flex-col h-full p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-bold text-cream-100 line-clamp-2 leading-snug">
            {template.name}
          </h3>
          <Badge variant="default" size="sm" className={cn('flex-shrink-0', goalConfig.color, 'text-cream-100')}>
            <GoalIcon className="w-3 h-3 mr-1" />
            {goalConfig.label}
          </Badge>
        </div>

        {template.description && (
          <p className="text-sm text-cream-400 line-clamp-2 mb-4 flex-1">
            {template.description}
          </p>
        )}

        {statLine && (
          <p className="text-sm text-cream-300 mb-4">
            {statLine}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-olive-600">
          {onApply ? (
            <Button variant="primary" className="w-full" onClick={() => onApply(template)}>
              Use template
            </Button>
          ) : (
            <Link href={`/builder?template=${template.id}`} className="block">
              <Button variant="primary" className="w-full">Use template</Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
