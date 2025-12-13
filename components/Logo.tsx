'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface LogoProps {
  className?: string
  width?: number
  height?: number
  priority?: boolean
}

export default function Logo({ className = '', width = 200, height = 80, priority = false }: LogoProps) {
  const [imageError, setImageError] = useState(false)

  // If image fails to load, show text fallback
  if (imageError) {
    return (
      <Link href="/" className={`flex items-center ${className}`}>
        <span className="text-2xl font-heading font-bold text-garage-orange">
          GoKart Part Picker
        </span>
      </Link>
    )
  }

  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <Image
        src="/images/logo.png"
        alt="GoKart Part Picker"
        width={width}
        height={height}
        priority={priority}
        className="h-auto w-auto object-contain"
        style={{ imageRendering: 'auto', maxHeight: `${height}px` }}
        onError={() => setImageError(true)}
      />
    </Link>
  )
}

