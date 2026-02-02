import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Engine, ElectricMotor, Part, BuildParts, CompatibilityWarning, PartCategory, PowerSourceType } from '@/types/database';

interface BuildState {
  // Power source
  powerSourceType: PowerSourceType;
  
  // Selected items
  selectedEngine: Engine | null;
  selectedMotor: ElectricMotor | null;
  selectedParts: Map<PartCategory, Part[]>; // Changed to support multiple parts per category
  
  // Compatibility
  warnings: CompatibilityWarning[];
  
  // Build metadata
  buildName: string;
  buildDescription: string;
  
  // Actions
  setPowerSourceType: (type: PowerSourceType) => void;
  setEngine: (engine: Engine | null) => void;
  setMotor: (motor: ElectricMotor | null) => void;
  addPart: (category: PartCategory, part: Part) => void; // Add part to category (allows multiple)
  removePart: (category: PartCategory, partId: string) => void; // Remove specific part by ID
  clearBuild: () => void;
  setWarnings: (warnings: CompatibilityWarning[]) => void;
  setBuildName: (name: string) => void;
  setBuildDescription: (description: string) => void;
  
  // Computed
  getTotalPrice: () => number;
  getPartIds: () => BuildParts;
  hasIncompatibilities: () => boolean;
  
  // Legacy support - for backward compatibility
  setPart: (category: PartCategory, part: Part | null) => void; // Replaces all parts in category
}

export const useBuildStore = create<BuildState>()(
  persist(
    (set, get) => ({
      powerSourceType: 'gas',
      selectedEngine: null,
      selectedMotor: null,
      selectedParts: new Map(),
      warnings: [],
      buildName: '',
      buildDescription: '',
      
      setPowerSourceType: (type) => {
        // When switching power source, clear incompatible selections
        set({
          powerSourceType: type,
          selectedEngine: type === 'gas' ? get().selectedEngine : null,
          selectedMotor: type === 'electric' ? get().selectedMotor : null,
          // Clear parts that are incompatible with the new power source
          // (This will be handled by compatibility checking)
        });
      },
      
      setEngine: (engine) => {
        // Only allow setting engine if power source is gas
        if (get().powerSourceType === 'gas') {
          set({ selectedEngine: engine });
        }
      },
      
      setMotor: (motor) => {
        // Only allow setting motor if power source is electric
        if (get().powerSourceType === 'electric') {
          set({ selectedMotor: motor });
        }
      },
      
      // Add a part to a category (allows multiple parts per category)
      addPart: (category, part) => {
        const newParts = new Map(get().selectedParts);
        const existingParts = newParts.get(category) || [];
        
        // Check if part is already in the array
        if (!existingParts.some(p => p.id === part.id)) {
          newParts.set(category, [...existingParts, part]);
          set({ selectedParts: newParts });
        }
      },
      
      // Remove a specific part from a category by ID
      removePart: (category, partId) => {
        const newParts = new Map(get().selectedParts);
        const existingParts = newParts.get(category) || [];
        const filteredParts = existingParts.filter(p => p.id !== partId);
        
        if (filteredParts.length > 0) {
          newParts.set(category, filteredParts);
        } else {
          newParts.delete(category);
        }
        set({ selectedParts: newParts });
      },
      
      // Legacy: Set/replace all parts in a category (for backward compatibility)
      setPart: (category, part) => {
        const newParts = new Map(get().selectedParts);
        if (part) {
          newParts.set(category, [part]); // Replace with single part array
        } else {
          newParts.delete(category);
        }
        set({ selectedParts: newParts });
      },
      
      clearBuild: () => set({
        powerSourceType: 'gas',
        selectedEngine: null,
        selectedMotor: null,
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
        let total = 0;
        
        // Add engine or motor price
        if (state.powerSourceType === 'gas' && state.selectedEngine) {
          total += state.selectedEngine.price || 0;
        } else if (state.powerSourceType === 'electric' && state.selectedMotor) {
          total += state.selectedMotor.price || 0;
        }
        
        // Add parts prices (now iterating over arrays)
        state.selectedParts.forEach((partsArray) => {
          partsArray.forEach((part) => {
            total += part.price || 0;
          });
        });
        
        return total;
      },
      
      getPartIds: () => {
        const parts: BuildParts = {};
        get().selectedParts.forEach((partsArray, category) => {
          // API expects one part id per category (Record<string, string>); use first part
          if (partsArray.length > 0) {
            parts[category] = partsArray[0].id;
          }
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
        powerSourceType: state.powerSourceType,
        selectedEngine: state.selectedEngine,
        selectedMotor: state.selectedMotor,
        selectedParts: Array.from(state.selectedParts.entries()),
        buildName: state.buildName,
        buildDescription: state.buildDescription,
      }),
      merge: (persisted, current) => {
        const persistedState = persisted as {
          powerSourceType?: PowerSourceType;
          selectedEngine?: Engine | null;
          selectedMotor?: ElectricMotor | null;
          selectedParts?: [PartCategory, Part | Part[]][]; // Support both old (single) and new (array) format
          buildName?: string;
          buildDescription?: string;
        };
        
        // Convert persisted parts to new format (arrays)
        const selectedParts = new Map<PartCategory, Part[]>();
        if (persistedState?.selectedParts) {
          persistedState.selectedParts.forEach(([category, partOrArray]) => {
            // Handle both old format (single Part) and new format (Part[])
            if (Array.isArray(partOrArray)) {
              selectedParts.set(category, partOrArray);
            } else {
              // Old format: single part, convert to array
              selectedParts.set(category, [partOrArray]);
            }
          });
        }
        
        return {
          ...current,
          powerSourceType: persistedState?.powerSourceType ?? 'gas',
          selectedEngine: persistedState?.selectedEngine ?? null,
          selectedMotor: persistedState?.selectedMotor ?? null,
          selectedParts,
          buildName: persistedState?.buildName ?? '',
          buildDescription: persistedState?.buildDescription ?? '',
        };
      },
    }
  )
);
