'use client';

import { useRef, useEffect, useState } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Minimum distance in pixels to trigger swipe
  velocityThreshold?: number; // Minimum velocity to trigger swipe
}

interface SwipeState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTime: number;
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  velocityThreshold = 0.3,
}: SwipeHandlers) {
  const elementRef = useRef<HTMLElement | null>(null);
  const [swipeState, setSwipeState] = useState<SwipeState | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let startState: SwipeState | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startState = {
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        startTime: Date.now(),
      };
      setSwipeState(startState);
      setIsSwiping(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!startState) return;
      const touch = e.touches[0];
      setSwipeState({
        ...startState,
        currentX: touch.clientX,
        currentY: touch.clientY,
      });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startState) return;

      const deltaX = startState.currentX - startState.startX;
      const deltaY = startState.currentY - startState.startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const duration = Date.now() - startState.startTime;
      const velocity = distance / duration; // pixels per ms

      // Determine primary direction
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (distance >= threshold && velocity >= velocityThreshold) {
        if (absX > absY) {
          // Horizontal swipe
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      }

      setSwipeState(null);
      setIsSwiping(false);
      startState = null;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, velocityThreshold]);

  return {
    ref: elementRef,
    isSwiping,
    swipeState,
  };
}
