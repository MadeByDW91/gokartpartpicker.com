'use client'

import { useEffect, useState } from 'react'
import { useThemeStore } from '@/lib/themeStore'
import ThemeToggle from './ThemeToggle'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const initialize = useThemeStore((state) => state.initialize)

  useEffect(() => {
    setMounted(true)
    initialize()
  }, [initialize])

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <ThemeToggle />
      </div>
      {children}
    </>
  )
}

