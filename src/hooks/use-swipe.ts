"use client";

import {
  useCallback,
  useRef,
  type TouchEvent,
  type TouchEventHandler,
} from "react";

export interface UseSwipeOptions {
  /** Called on a leftward swipe (finger moves right to left). */
  onSwipeLeft?: () => void;
  /** Called on a rightward swipe (finger moves left to right). */
  onSwipeRight?: () => void;
  /** Minimum horizontal travel in px to count as a swipe. Default 50. */
  threshold?: number;
  /**
   * How dominant the horizontal axis must be: |dx| must be at least
   * `axisLockRatio` x |dy|. Mostly-vertical gestures (scrolling) are ignored.
   * Default 1.5.
   */
  axisLockRatio?: number;
  /** Disable the gesture without unbinding the handlers. */
  disabled?: boolean;
}

export interface SwipeHandlers<T extends Element = Element> {
  onTouchStart: TouchEventHandler<T>;
  onTouchEnd: TouchEventHandler<T>;
  onTouchCancel: TouchEventHandler<T>;
}

/**
 * Horizontal swipe detection. Spread the returned handlers on the swipeable
 * element. Only single-finger gestures are considered.
 */
export function useSwipe<T extends Element = Element>({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  axisLockRatio = 1.5,
  disabled = false,
}: UseSwipeOptions = {}): SwipeHandlers<T> {
  const start = useRef<{ x: number; y: number } | null>(null);
  const callbacks = useRef({ onSwipeLeft, onSwipeRight });
  callbacks.current = { onSwipeLeft, onSwipeRight };

  const onTouchStart = useCallback(
    (e: TouchEvent<T>) => {
      if (disabled || e.touches.length !== 1) {
        start.current = null;
        return;
      }
      const t = e.touches[0];
      start.current = { x: t.clientX, y: t.clientY };
    },
    [disabled]
  );

  const onTouchEnd = useCallback(
    (e: TouchEvent<T>) => {
      const s = start.current;
      start.current = null;
      if (disabled || !s) return;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - s.x;
      const dy = t.clientY - s.y;
      if (Math.abs(dx) < threshold) return;
      if (Math.abs(dx) < Math.abs(dy) * axisLockRatio) return;
      if (dx < 0) callbacks.current.onSwipeLeft?.();
      else callbacks.current.onSwipeRight?.();
    },
    [disabled, threshold, axisLockRatio]
  );

  const onTouchCancel = useCallback(() => {
    start.current = null;
  }, []);

  return { onTouchStart, onTouchEnd, onTouchCancel };
}
