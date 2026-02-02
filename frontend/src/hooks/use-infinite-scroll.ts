'use client';

import { useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollOptions {
  hasNextPage: boolean;
  fetchNextPage: () => void | Promise<void>;
  threshold?: number; // Distance from bottom in pixels to trigger fetch
  enabled?: boolean;
}

export function useInfiniteScroll({
  hasNextPage,
  fetchNextPage,
  threshold = 200,
  enabled = true,
}: UseInfiniteScrollOptions) {
  const [isFetching, setIsFetching] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetching) {
          setIsFetching(true);
          Promise.resolve(fetchNextPage()).finally(() => {
            setIsFetching(false);
          });
        }
      },
      {
        root: null,
        rootMargin: `${threshold}px`,
        threshold: 0.1,
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, fetchNextPage, threshold, enabled, isFetching]);

  return {
    observerTarget,
    isFetching,
  };
}
