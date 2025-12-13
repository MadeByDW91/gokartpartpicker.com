/**
 * Theme Store (Dark Mode)
 * 
 * Manages dark mode preference with localStorage persistence
 */

import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  effectiveTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  initialize: () => void
}

const STORAGE_KEY = 'gokart-theme-preference'

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function loadTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && (stored === 'light' || stored === 'dark' || stored === 'system')) {
      return stored
    }
  } catch (e) {
    console.error('Failed to load theme preference', e)
  }
  return 'system'
}

function saveTheme(theme: Theme): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch (e) {
    console.error('Failed to save theme preference', e)
  }
}

function applyTheme(effectiveTheme: 'light' | 'dark'): void {
  if (typeof window === 'undefined') return
  const root = document.documentElement
  if (effectiveTheme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export const useThemeStore = create<ThemeState>()((set, get) => {
  // Safe initial state (only runs on client)
  const getInitialState = () => {
    if (typeof window === 'undefined') {
      return { theme: 'system' as Theme, effectiveTheme: 'light' as const }
    }
    const initialTheme = loadTheme()
    const initialEffective = initialTheme === 'system' ? getSystemTheme() : initialTheme
    return { theme: initialTheme, effectiveTheme: initialEffective }
  }

  const initialState = getInitialState()

  return {
    theme: initialState.theme,
    effectiveTheme: initialState.effectiveTheme,
    setTheme: (theme: Theme) => {
      if (typeof window === 'undefined') return
      const effective = theme === 'system' ? getSystemTheme() : theme
      saveTheme(theme)
      applyTheme(effective)
      set({ theme, effectiveTheme: effective })
    },
    initialize: () => {
      if (typeof window === 'undefined') return
      const theme = loadTheme()
      const effective = theme === 'system' ? getSystemTheme() : theme
      applyTheme(effective)
      set({ theme, effectiveTheme: effective })

      // Listen for system theme changes
      if (theme === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = () => {
          const currentTheme = get().theme
          if (currentTheme === 'system') {
            const newEffective = getSystemTheme()
            applyTheme(newEffective)
            set({ effectiveTheme: newEffective })
          }
        }
        mediaQuery.addEventListener('change', handleChange)
        // Note: Cleanup handled by component unmount
      }
    },
  }
})

