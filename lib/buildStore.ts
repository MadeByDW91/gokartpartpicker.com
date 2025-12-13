import { create } from 'zustand'
import type { Engine, Part, VendorOffer } from '@prisma/client'
import type { PartWithOffer } from './calculations'

interface BuildState {
  engine: Engine | null
  parts: PartWithOffer[]
  currentSavedBuildId: string | null
  addEngine: (engine: Engine) => void
  removeEngine: () => void
  addPart: (part: Part, offer?: VendorOffer & { vendor: { name: string; priority: number } }) => void
  removePart: (partId: string) => void
  updatePartOffer: (partId: string, offer: VendorOffer & { vendor: { name: string; priority: number } }) => void
  clearBuild: () => void
  loadBuild: (engine: Engine | null, parts: PartWithOffer[], savedBuildId?: string | null) => void
  setSavedBuildId: (id: string | null) => void
}

// Build storage schema version
const BUILD_STORAGE_VERSION = 1

interface StoredBuildState {
  version?: number
  engine: Engine | null
  parts: PartWithOffer[]
  lastModified?: number
}

// Load from localStorage on init with version migration
const loadFromStorage = (): { engine: Engine | null; parts: PartWithOffer[] } => {
  if (typeof window === 'undefined') {
    return { engine: null, parts: [] }
  }
  try {
    const stored = localStorage.getItem('gokart-build-storage')
    if (stored) {
      const parsed: StoredBuildState = JSON.parse(stored)
      
      // Handle version migration (future-proof)
      if (!parsed.version || parsed.version < BUILD_STORAGE_VERSION) {
        // For now, just extract engine and parts
        return {
          engine: parsed.engine || null,
          parts: parsed.parts || [],
        }
      }
      
      return {
        engine: parsed.engine || null,
        parts: parsed.parts || [],
      }
    }
  } catch (e) {
    console.error('Failed to load build from localStorage', e)
  }
  return { engine: null, parts: [] }
}

// Save to localStorage with versioning
const saveToStorage = (state: { engine: Engine | null; parts: PartWithOffer[] }) => {
  if (typeof window === 'undefined') return
  try {
    const storedState: StoredBuildState = {
      version: BUILD_STORAGE_VERSION,
      engine: state.engine,
      parts: state.parts,
      lastModified: Date.now(),
    }
    localStorage.setItem('gokart-build-storage', JSON.stringify(storedState))
  } catch (e) {
    console.error('Failed to save build to localStorage', e)
  }
}

// Safe initial state for SSR
const getInitialState = () => {
  if (typeof window === 'undefined') {
    return { engine: null, parts: [] }
  }
  return loadFromStorage()
}

const initialState = getInitialState()

export const useBuildStore = create<BuildState>()((set) => ({
  engine: initialState.engine,
  parts: initialState.parts,
  currentSavedBuildId: null,
  addEngine: (engine) => {
    set((state) => {
      const newState = { ...state, engine }
      saveToStorage({ engine, parts: state.parts })
      return newState
    })
  },
  removeEngine: () => {
    set((state) => {
      const newState = { ...state, engine: null }
      saveToStorage({ engine: null, parts: state.parts })
      return newState
    })
  },
  addPart: (part, offer) => {
    set((state) => {
      // Don't add if already in build
      if (state.parts.some((p) => p.id === part.id)) {
        return state
      }
      const newParts = [...state.parts, { ...part, selectedOffer: offer }]
      const newState = { ...state, parts: newParts }
      saveToStorage({ engine: state.engine, parts: newParts })
      return newState
    })
  },
  removePart: (partId) => {
    set((state) => {
      const newParts = state.parts.filter((p) => p.id !== partId)
      const newState = { ...state, parts: newParts }
      saveToStorage({ engine: state.engine, parts: newParts })
      return newState
    })
  },
  updatePartOffer: (partId, offer) => {
    set((state) => {
      const newParts = state.parts.map((p) =>
        p.id === partId ? { ...p, selectedOffer: offer } : p
      )
      const newState = { ...state, parts: newParts }
      saveToStorage({ engine: state.engine, parts: newParts })
      return newState
    })
  },
  clearBuild: () => {
    const newState = { engine: null, parts: [], currentSavedBuildId: null }
    saveToStorage({ engine: null, parts: [] })
    set(newState)
  },
  loadBuild: (engine, parts, savedBuildId = null) => {
    const newState = { engine, parts, currentSavedBuildId: savedBuildId }
    saveToStorage({ engine, parts })
    set(newState)
  },
  setSavedBuildId: (id) => {
    set((state) => ({ ...state, currentSavedBuildId: id }))
  },
}))

