'use client'

import Image from 'next/image'

interface ProductImageProps {
  src: string
  alt: string
  fill?: boolean
  className?: string
  width?: number
  height?: number
}

export default function ProductImage({ src, alt, fill, className, width, height }: ProductImageProps) {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement
    if (target.src !== '/images/placeholder-product.png') {
      target.src = '/images/placeholder-product.png'
    }
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        onError={handleError}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 400}
      height={height || 400}
      className={className}
      onError={handleError}
    />
  )
}


