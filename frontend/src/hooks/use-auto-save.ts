'use client';

import { useEffect, useState, useCallback } from 'react';
import { useBuildStore } from '@/store/build-store';
import { useDebounce } from '@/hooks/use-debounce';

/**
 * Hook to provide auto-save functionality with visual feedback
 * Build store already persists, but this adds UI feedback
 */
export function useAutoSave() {
  const selectedEngine = useBuildStore((state) => state.selectedEngine);
  const selectedParts = useBuildStore((state) => state.selectedParts);
  const buildName = useBuildStore((state) => state.buildName);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Debounce the save indicator
  const debouncedSaving = useDebounce(isSaving, 300);

  useEffect(() => {
    // Build store automatically persists, just update our indicator
    setIsSaving(true);
    const timer = setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedEngine, selectedParts, buildName]);

  const hasUnsavedChanges = useCallback(() => {
    return !!(selectedEngine || selectedParts.size > 0 || buildName);
  }, [selectedEngine, selectedParts, buildName]);

  return {
    isSaving: debouncedSaving,
    lastSaved,
    hasUnsavedChanges: hasUnsavedChanges(),
  };
}
