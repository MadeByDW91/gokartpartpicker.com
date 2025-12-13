import { create } from 'zustand'
import type { Engine, Part, VendorOffer } from '@prisma/client'
import type { PartWithOffer } from './calculations'

interface BuildState {
  engine: Engine | null
  parts: PartWithOffer[]
  addEngine: (engine: Engine) => void
  removeEngine: () => void
  addPart: (part: Part, offer?: VendorOffer & { vendor: { name: string; priority: number } }) => void
  removePart: (partId: string) => void
  updatePartOffer: (partId: string, offer: VendorOffer & { vendor: { name: string; priority: number } }) => void
  clearBuild: () => void
}

// Load from localStorage on init
const loadFromStorage = (): { engine: Engine | null; parts: PartWithOffer[] } => {
  if (typeof window === 'undefined') {
    return { engine: null, parts: [] }
  }
  try {
    const stored = localStorage.getItem('gokart-build-storage')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load build from localStorage', e)
  }
  return { engine: null, parts: [] }
}

// Save to localStorage
const saveToStorage = (state: { engine: Engine | null; parts: PartWithOffer[] }) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('gokart-build-storage', JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save build to localStorage', e)
  }
}

const initialState = loadFromStorage()

export const useBuildStore = create<BuildState>()((set) => ({
  engine: initialState.engine,
  parts: initialState.parts,
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
    const newState = { engine: null, parts: [] }
    saveToStorage(newState)
    set(newState)
  },
}))

