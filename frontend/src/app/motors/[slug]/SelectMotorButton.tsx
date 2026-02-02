'use client';

import { useBuildStore } from '@/store/build-store';
import { Button } from '@/components/ui/Button';
import { Plus, Check } from 'lucide-react';
import type { ElectricMotor } from '@/types/database';

interface SelectMotorButtonProps {
  motor: ElectricMotor;
}

/**
 * Client component for selecting a motor for the build
 * Uses Zustand store for state management
 */
export function SelectMotorButton({ motor }: SelectMotorButtonProps) {
  const { selectedMotor, setMotor, setPowerSourceType } = useBuildStore();
  const isSelected = selectedMotor?.id === motor.id;
  
  const handleClick = () => {
    if (isSelected) {
      setMotor(null);
    } else {
      setMotor(motor);
      setPowerSourceType('electric');
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
      {isSelected ? 'Selected for Build' : 'Select This Motor'}
    </Button>
  );
}
