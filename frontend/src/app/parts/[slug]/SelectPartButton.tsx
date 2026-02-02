'use client';

import { useBuildStore } from '@/store/build-store';
import { Button } from '@/components/ui/Button';
import { Plus, Check } from 'lucide-react';
import type { Part } from '@/types/database';

interface SelectPartButtonProps {
  part: Part;
}

/**
 * Client component for selecting a part for the build
 * Uses Zustand store for state management
 */
export function SelectPartButton({ part }: SelectPartButtonProps) {
  const { selectedParts, setPart, addPart, removePart } = useBuildStore();
  const partsArray = selectedParts.get(part.category) || [];
  const isSelected = partsArray.some(p => p.id === part.id);
  
  const handleClick = () => {
    if (isSelected) {
      removePart(part.category, part.id);
    } else {
      addPart(part.category, part);
    }
  };
  
  return (
    <Button
      variant={isSelected ? 'secondary' : 'primary'}
      size="lg"
      onClick={handleClick}
      icon={isSelected ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
      className="flex-1 sm:flex-none min-w-[200px]"
    >
      {isSelected ? 'Selected for Build' : 'Add to Build'}
    </Button>
  );
}
