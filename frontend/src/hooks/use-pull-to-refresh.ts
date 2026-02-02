'use client';

import { useEffect, useRef, useState } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => void | Promise<void>;
  threshold?: number; // Distance in pixels to trigger refresh
  enabled?: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  enabled = true,
}: UsePullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger if at the top of the page
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        touchStartTime.current = Date.now();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY.current === null || window.scrollY > 0) {
        if (startY.current !== null) {
          startY.current = null;
          setPullDistance(0);
        }
        return;
      }

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY.current;

      // Only allow pull down when at top
      if (deltaY > 0) {
        e.preventDefault();
        const distance = Math.min(deltaY, threshold * 1.5); // Allow slight overscroll
        setPullDistance(distance);
        setIsPulling(distance >= threshold);
      }
    };

    const handleTouchEnd = async () => {
      if (startY.current === null) return;

      if (isPulling && pullDistance >= threshold) {
        setIsRefreshing(true);
        setPullDistance(0);
        setIsPulling(false);
        try {
          await Promise.resolve(onRefresh());
        } finally {
          // Small delay to show refresh state
          setTimeout(() => {
            setIsRefreshing(false);
          }, 500);
        }
      } else {
        setPullDistance(0);
        setIsPulling(false);
      }

      startY.current = null;
      touchStartTime.current = null;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, onRefresh, threshold, isPulling, pullDistance]);

  return {
    isPulling,
    isRefreshing,
    pullDistance,
    pullProgress: Math.min(pullDistance / threshold, 1),
  };
}
