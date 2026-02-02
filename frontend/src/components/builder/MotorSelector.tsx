'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MotorCard } from '@/components/MotorCard';
import { EngineCardSkeleton } from '@/components/ui/Skeleton';
import { useMotors } from '@/hooks/use-motors';
import type { ElectricMotor } from '@/types/database';

interface MotorSelectorProps {
  selectedMotor: ElectricMotor | null;
  onSelectMotor: (motor: ElectricMotor) => void;
}

/**
 * Motor selector component for the builder
 * Displays motor cards in a grid with selection state
 */
export function MotorSelector({ selectedMotor, onSelectMotor }: MotorSelectorProps) {
  const { data: motors, isLoading } = useMotors();

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
            {motors?.slice(0, 8).map((motor) => (
              <MotorCard
                key={motor.id}
                motor={motor}
                onAddToBuild={onSelectMotor}
                isSelected={selectedMotor?.id === motor.id}
              />
            ))}
          </div>
          
          <div className="text-center pt-4">
            <Link href="/motors">
              <Button variant="secondary">
                Browse All Motors
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
