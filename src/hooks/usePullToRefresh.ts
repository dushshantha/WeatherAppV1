import { useState, useRef, useCallback } from 'react';

const PULL_THRESHOLD = 80;

export interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
}

export interface UsePullToRefreshResult {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
}

export function usePullToRefresh({ onRefresh }: UsePullToRefreshOptions): UsePullToRefreshResult {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startYRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const el = e.currentTarget as HTMLElement;
    // Only trigger pull-to-refresh when scrolled to top
    if (el.scrollTop > 0) return;
    startYRef.current = e.touches[0].clientY;
    containerRef.current = el;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (startYRef.current === null) return;
    const el = e.currentTarget as HTMLElement;
    if (el.scrollTop > 0) {
      // User scrolled down — cancel pull gesture
      startYRef.current = null;
      setIsPulling(false);
      setPullDistance(0);
      return;
    }

    const delta = e.touches[0].clientY - startYRef.current;
    if (delta <= 0) return;

    // Apply rubber-band resistance
    const resistance = 0.45;
    const capped = Math.min(delta * resistance, PULL_THRESHOLD * 1.5);
    setIsPulling(true);
    setPullDistance(capped);
  }, []);

  const onTouchEnd = useCallback(async () => {
    if (startYRef.current === null) return;
    startYRef.current = null;

    if (pullDistance >= PULL_THRESHOLD * 0.45) {
      setIsRefreshing(true);
      setIsPulling(false);
      setPullDistance(0);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    } else {
      setIsPulling(false);
      setPullDistance(0);
    }
  }, [pullDistance, onRefresh]);

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
}
