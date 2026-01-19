import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Engine, Part, BuildParts, CompatibilityWarning, PartCategory } from '@/types/database';

interface BuildState {
  // Selected items
  selectedEngine: Engine | null;
  selectedParts: Map<PartCategory, Part>;
  
  // Compatibility
  warnings: CompatibilityWarning[];
  
  // Build metadata
  buildName: string;
  buildDescription: string;
  
  // Actions
  setEngine: (engine: Engine | null) => void;
  setPart: (category: PartCategory, part: Part | null) => void;
  removePart: (category: PartCategory) => void;
  clearBuild: () => void;
  setWarnings: (warnings: CompatibilityWarning[]) => void;
  setBuildName: (name: string) => void;
  setBuildDescription: (description: string) => void;
  
  // Computed
  getTotalPrice: () => number;
  getPartIds: () => BuildParts;
  hasIncompatibilities: () => boolean;
}

export const useBuildStore = create<BuildState>()(
  persist(
    (set, get) => ({
      selectedEngine: null,
      selectedParts: new Map(),
      warnings: [],
      buildName: '',
      buildDescription: '',
      
      setEngine: (engine) => set({ selectedEngine: engine }),
      
      setPart: (category, part) => {
        const newParts = new Map(get().selectedParts);
        if (part) {
          newParts.set(category, part);
        } else {
          newParts.delete(category);
        }
        set({ selectedParts: newParts });
      },
      
      removePart: (category) => {
        const newParts = new Map(get().selectedParts);
        newParts.delete(category);
        set({ selectedParts: newParts });
      },
      
      clearBuild: () => set({
        selectedEngine: null,
        selectedParts: new Map(),
        warnings: [],
        buildName: '',
        buildDescription: '',
      }),
      
      setWarnings: (warnings) => set({ warnings }),
      
      setBuildName: (name) => set({ buildName: name }),
      
      setBuildDescription: (description) => set({ buildDescription: description }),
      
      getTotalPrice: () => {
        const state = get();
        let total = state.selectedEngine?.price || 0;
        state.selectedParts.forEach((part) => {
          total += part.price || 0;
        });
        return total;
      },
      
      getPartIds: () => {
        const parts: BuildParts = {};
        get().selectedParts.forEach((part, category) => {
          parts[category] = part.id;
        });
        return parts;
      },
      
      hasIncompatibilities: () => {
        return get().warnings.some((w) => w.type === 'error');
      },
    }),
    {
      name: 'gokart-build-storage',
      partialize: (state) => ({
        selectedEngine: state.selectedEngine,
        selectedParts: Array.from(state.selectedParts.entries()),
        buildName: state.buildName,
        buildDescription: state.buildDescription,
      }),
      merge: (persisted, current) => {
        const persistedState = persisted as {
          selectedEngine?: Engine | null;
          selectedParts?: [PartCategory, Part][];
          buildName?: string;
          buildDescription?: string;
        };
        return {
          ...current,
          selectedEngine: persistedState?.selectedEngine ?? null,
          selectedParts: new Map(persistedState?.selectedParts ?? []),
          buildName: persistedState?.buildName ?? '',
          buildDescription: persistedState?.buildDescription ?? '',
        };
      },
    }
  )
);
