'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Copy, ExternalLink, Info } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import type { Engine } from '@/types/database';

interface EngineClone {
  id: string;
  clone_engine: Engine;
  relationship_type: 'clone' | 'compatible' | 'similar';
  notes: string | null;
}

interface EngineClonesListProps {
  clones: EngineClone[];
  currentEngineName: string;
}

const relationshipLabels = {
  clone: 'Clone',
  compatible: 'Compatible',
  similar: 'Similar',
};

const relationshipColors = {
  clone: 'default',
  compatible: 'success',
  similar: 'warning',
} as const;

export function EngineClonesList({ clones, currentEngineName }: EngineClonesListProps) {
  if (!clones || clones.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Copy className="w-5 h-5 text-orange-400" />
          <h2 className="text-lg font-semibold text-cream-100">
            Compatible Engines
          </h2>
        </div>
        <p className="text-sm text-cream-400 mt-1">
          These engines are clones or compatible with {currentEngineName} and accept the same parts
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clones.map((clone) => {
            const engine = clone.clone_engine;
            return (
              <Link
                key={clone.id}
                href={`/engines/${engine.slug}`}
                className="block p-4 bg-olive-800/50 rounded-lg border border-olive-600 hover:border-orange-500 transition-colors group"
              >
                <div className="flex gap-4">
                  {/* Engine Image */}
                  <div className="relative w-24 h-24 flex-shrink-0 bg-olive-900 rounded border border-olive-700 overflow-hidden">
                    {engine.image_url ? (
                      <Image
                        src={engine.image_url}
                        alt={engine.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        unoptimized={engine.image_url.includes('harborfreight.com') || engine.image_url.includes('amazon.com')}
                      />
                    ) : (
                      <Image
                        src="/placeholders/placeholder-engine-v1.svg"
                        alt="Engine placeholder"
                        fill
                        className="object-contain p-2 opacity-60"
                      />
                    )}
                  </div>

                  {/* Engine Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-cream-100 group-hover:text-orange-400 transition-colors line-clamp-1">
                          {engine.name}
                        </h3>
                        <p className="text-sm text-cream-400">{engine.brand}</p>
                      </div>
                      <Badge variant={relationshipColors[clone.relationship_type]}>
                        {relationshipLabels[clone.relationship_type]}
                      </Badge>
                    </div>

                    {/* Specs */}
                    <div className="flex flex-wrap gap-4 text-sm text-cream-300 mb-2">
                      <span>{engine.displacement_cc}cc</span>
                      <span>{engine.horsepower} HP</span>
                      {engine.shaft_diameter && (
                        <span>{engine.shaft_diameter}&quot; shaft</span>
                      )}
                      {engine.price && (
                        <span className="text-orange-400 font-semibold">
                          {formatPrice(engine.price)}
                        </span>
                      )}
                    </div>

                    {/* Notes */}
                    {clone.notes && (
                      <div className="flex items-start gap-2 mt-2 p-2 bg-olive-700/30 rounded text-xs text-cream-400">
                        <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <span>{clone.notes}</span>
                      </div>
                    )}

                    {/* View Link */}
                    <div className="flex items-center gap-1 text-xs text-orange-400 mt-2 group-hover:text-orange-300 transition-colors">
                      <span>View Engine</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="mt-4 p-3 bg-olive-700/30 rounded border border-olive-600">
          <p className="text-xs text-cream-400">
            <strong className="text-cream-300">Note:</strong> Clone engines share the same parts compatibility. 
            Parts that fit {currentEngineName} will also fit these compatible engines.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
