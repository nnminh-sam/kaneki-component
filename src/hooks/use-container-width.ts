"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefCallback,
} from "react";

/**
 * Tracks the content-box width of an element with a ResizeObserver.
 * Returns a callback ref to attach and the current width in px (0 until
 * measured, and always 0 during SSR).
 *
 * @example
 * const [ref, width] = useContainerWidth<HTMLDivElement>();
 * return <div ref={ref}>{width > 0 && <Chart width={width} />}</div>;
 */
export function useContainerWidth<T extends HTMLElement = HTMLDivElement>(): [
  RefCallback<T>,
  number,
] {
  const [width, setWidth] = useState(0);
  const observerRef = useRef<ResizeObserver | null>(null);
  const frameRef = useRef<number | null>(null);

  const ref = useCallback<RefCallback<T>>((node) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!node) return;

    const measure = (w: number) => {
      const next = Math.round(w);
      setWidth((prev) => (prev === next ? prev : next));
    };
    measure(node.getBoundingClientRect().width);

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = entry.contentRect.width;
      // Defer to the next frame to avoid "ResizeObserver loop" warnings.
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        measure(w);
      });
    });
    observer.observe(node);
    observerRef.current = observer;
  }, []);

  useEffect(
    () => () => {
      observerRef.current?.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    []
  );

  return [ref, width];
}
