'use client';

import { useBuildStore } from '@/store/build-store';
import { Button } from '@/components/ui/Button';
import { Plus, Check } from 'lucide-react';
import type { Engine } from '@/types/database';

interface SelectEngineButtonProps {
  engine: Engine;
}

/**
 * Client component for selecting an engine for the build
 * Uses Zustand store for state management
 */
export function SelectEngineButton({ engine }: SelectEngineButtonProps) {
  const { selectedEngine, setEngine } = useBuildStore();
  const isSelected = selectedEngine?.id === engine.id;
  
  const handleClick = () => {
    if (isSelected) {
      setEngine(null);
    } else {
      setEngine(engine);
    }
  };
  
  return (
    <Button
      variant={isSelected ? 'secondary' : 'primary'}
      size="lg"
      onClick={handleClick}
      icon={isSelected ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
      className="w-full"
    >
      {isSelected ? 'Selected for Build' : 'Select This Engine'}
    </Button>
  );
}
