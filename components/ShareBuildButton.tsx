'use client'

import { useState } from 'react'
import { useBuildStore } from '@/lib/buildStore'
import { generateBuildUrl } from '@/lib/buildEncoder'

export default function ShareBuildButton() {
  const engine = useBuildStore((state) => state.engine)
  const parts = useBuildStore((state) => state.parts)
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (!engine && parts.length === 0) {
      alert('No build to share. Add an engine or parts first.')
      return
    }

    try {
      const url = generateBuildUrl(engine, parts)
      
      // Try to use Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else {
        // Fallback: select text in a temporary input
        const input = document.createElement('input')
        input.value = url
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (error) {
      console.error('Failed to copy URL:', error)
      alert('Failed to copy URL. Please try again.')
    }
  }

  const hasBuild = engine || parts.length > 0

  return (
    <button
      onClick={handleShare}
      disabled={!hasBuild}
      className="w-full bg-blue-600 text-white py-2 rounded-lg font-heading hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {copied ? (
        <>
          <span>✓</span>
          <span>Copied!</span>
        </>
      ) : (
        <>
          <span>🔗</span>
          <span>Share Build</span>
        </>
      )}
    </button>
  )
}

