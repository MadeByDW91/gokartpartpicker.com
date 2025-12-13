/**
 * Reusable Skeleton Loading Component
 */

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string | number
  height?: string | number
  lines?: number
}

export default function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 rounded'
  
  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  if (variant === 'text' && lines > 1) {
    return (
      <div className={className}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} mb-2 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
            style={i === lines - 1 ? { ...style, width: '75%' } : style}
          />
        ))}
      </div>
    )
  }

  const variantClasses = {
    text: 'h-4',
    rectangular: 'h-24',
    circular: 'rounded-full aspect-square',
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  )
}

/**
 * Card Skeleton - for product/part cards
 */
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <Skeleton variant="rectangular" height={200} className="mb-4" />
      <Skeleton variant="text" width="80%" className="mb-2" />
      <Skeleton variant="text" width="60%" />
    </div>
  )
}

/**
 * Build Summary Skeleton
 */
export function BuildSummarySkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <Skeleton variant="text" width="40%" className="mb-6" />
      <div className="space-y-4">
        <div>
          <Skeleton variant="text" width="30%" className="mb-2" />
          <Skeleton variant="text" width="60%" />
        </div>
        <div>
          <Skeleton variant="text" width="30%" className="mb-2" />
          <Skeleton variant="text" width="60%" />
        </div>
        <div>
          <Skeleton variant="text" width="30%" className="mb-2" />
          <Skeleton variant="text" width="60%" />
        </div>
      </div>
    </div>
  )
}

