'use client'

import { useEffect, useState } from 'react'
import { useThemeStore } from '@/lib/themeStore'

export default function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  const initialize = useThemeStore((state) => state.initialize)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    initialize()
  }, [initialize])

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    if (theme === 'dark') return '🌙'
    if (theme === 'system') return '💻'
    return '☀️'
  }

  const getLabel = () => {
    if (theme === 'dark') return 'Dark'
    if (theme === 'system') return 'Auto'
    return 'Light'
  }

  if (!mounted) {
    return (
      <button
        className="px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center gap-2"
        aria-label="Theme toggle"
      >
        <span className="text-xl">☀️</span>
        <span className="hidden sm:inline text-sm">Light</span>
      </button>
    )
  }

  return (
    <button
      onClick={cycleTheme}
      className="px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center gap-2"
      title={`Theme: ${getLabel()}`}
      aria-label={`Switch theme (currently ${getLabel()})`}
    >
      <span className="text-xl">{getIcon()}</span>
      <span className="hidden sm:inline text-sm">{getLabel()}</span>
    </button>
  )
}

