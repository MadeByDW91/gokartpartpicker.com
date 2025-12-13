/**
 * Local Build Storage (No Accounts)
 * 
 * Manages named builds stored locally in localStorage.
 * Separate from the active build state in buildStore.
 */

import type { Engine, Part, VendorOffer } from '@prisma/client'
import type { PartWithOffer } from './calculations'

export interface LocalBuild {
  id: string
  name: string
  createdAt: number
  lastOpened: number
  data: {
    engine: Engine | null
    parts: PartWithOffer[]
  }
}

interface LocalBuildsStorage {
  builds: LocalBuild[]
  lastOpenedBuildId: string | null
}

const STORAGE_KEY = 'gokart-local-builds'

function loadStorage(): LocalBuildsStorage {
  if (typeof window === 'undefined') {
    return { builds: [], lastOpenedBuildId: null }
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load local builds from localStorage', e)
  }
  return { builds: [], lastOpenedBuildId: null }
}

function saveStorage(storage: LocalBuildsStorage): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
  } catch (e) {
    console.error('Failed to save local builds to localStorage', e)
  }
}

/**
 * Generate a simple ID (cuid-like but simpler for local storage)
 */
function generateId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get all local builds
 */
export function getLocalBuilds(): LocalBuild[] {
  const storage = loadStorage()
  return storage.builds.sort((a, b) => b.lastOpened - a.lastOpened)
}

/**
 * Get a specific local build by ID
 */
export function getLocalBuild(id: string): LocalBuild | null {
  const storage = loadStorage()
  return storage.builds.find((b) => b.id === id) || null
}

/**
 * Save a new build
 */
export function saveLocalBuild(
  name: string,
  engine: Engine | null,
  parts: PartWithOffer[]
): LocalBuild {
  const storage = loadStorage()
  const build: LocalBuild = {
    id: generateId(),
    name,
    createdAt: Date.now(),
    lastOpened: Date.now(),
    data: { engine, parts },
  }
  storage.builds.push(build)
  storage.lastOpenedBuildId = build.id
  saveStorage(storage)
  return build
}

/**
 * Update an existing build
 */
export function updateLocalBuild(
  id: string,
  updates: {
    name?: string
    engine?: Engine | null
    parts?: PartWithOffer[]
  }
): LocalBuild | null {
  const storage = loadStorage()
  const build = storage.builds.find((b) => b.id === id)
  if (!build) return null

  if (updates.name) build.name = updates.name
  if (updates.engine !== undefined) build.data.engine = updates.engine
  if (updates.parts !== undefined) build.data.parts = updates.parts

  build.lastOpened = Date.now()
  storage.lastOpenedBuildId = id
  saveStorage(storage)
  return build
}

/**
 * Delete a build
 */
export function deleteLocalBuild(id: string): boolean {
  const storage = loadStorage()
  const index = storage.builds.findIndex((b) => b.id === id)
  if (index === -1) return false

  storage.builds.splice(index, 1)
  if (storage.lastOpenedBuildId === id) {
    storage.lastOpenedBuildId = storage.builds.length > 0 ? storage.builds[0].id : null
  }
  saveStorage(storage)
  return true
}

/**
 * Duplicate a build
 */
export function duplicateLocalBuild(id: string, newName?: string): LocalBuild | null {
  const build = getLocalBuild(id)
  if (!build) return null

  const storage = loadStorage()
  const duplicated: LocalBuild = {
    id: generateId(),
    name: newName || `${build.name} (Copy)`,
    createdAt: Date.now(),
    lastOpened: Date.now(),
    data: {
      engine: build.data.engine ? { ...build.data.engine } : null,
      parts: build.data.parts.map((p) => ({ ...p })),
    },
  }
  storage.builds.push(duplicated)
  storage.lastOpenedBuildId = duplicated.id
  saveStorage(storage)
  return duplicated
}

/**
 * Get the last opened build
 */
export function getLastOpenedBuild(): LocalBuild | null {
  const storage = loadStorage()
  if (!storage.lastOpenedBuildId) return null
  return getLocalBuild(storage.lastOpenedBuildId)
}

/**
 * Mark a build as opened
 */
export function markBuildOpened(id: string): void {
  const storage = loadStorage()
  const build = storage.builds.find((b) => b.id === id)
  if (build) {
    build.lastOpened = Date.now()
    storage.lastOpenedBuildId = id
    saveStorage(storage)
  }
}

