'use client';

import Link from 'next/link';
import { useEngines } from '@/hooks/use-engines';
import { EngineCard } from '@/components/EngineCard';
import { EngineCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { ChevronRight } from 'lucide-react';
import type { Engine } from '@/types/database';

interface EngineSelectorProps {
  selectedEngine: Engine | null;
  onSelectEngine: (engine: Engine) => void;
}

/**
 * Engine selector component for the builder
 * Displays engine cards in a grid with selection state
 */
export function EngineSelector({ selectedEngine, onSelectEngine }: EngineSelectorProps) {
  const { data: engines, isLoading } = useEngines();

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <EngineCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
            {engines?.slice(0, 8).map((engine) => (
              <EngineCard
                key={engine.id}
                engine={engine}
                onAddToBuild={onSelectEngine}
                isSelected={selectedEngine?.id === engine.id}
              />
            ))}
          </div>
          
          <div className="text-center pt-4">
            <Link href="/engines">
              <Button variant="secondary">
                Browse All Engines
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
