"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { clamp } from "./utils";

/** A `useId` value that is safe inside `url(#…)` references. */
export function useSvgId(prefix = "kc"): string {
  const id = useId();
  return `${prefix}${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Flips to `true` two frames after `ready`, so elements first paint in their
 * "before" state and then transition in. Immediately `true` when animation is
 * off or the user prefers reduced motion.
 */
export function useEntered(ready: boolean, animate = true): boolean {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (!ready || entered) return;
    if (!animate || prefersReducedMotion()) {
      setEntered(true);
      return;
    }
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [ready, animate, entered]);
  return entered || !animate;
}

export interface UseActiveIndexOptions {
  count: number;
  /** Controlled active index (`null` = none). Leave `undefined` for uncontrolled. */
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (index: number | null) => void;
  /** Index selected when the chart receives keyboard focus. Default: `0`. */
  focusIndex?: number;
}

/**
 * Shared hover / keyboard / touch state for 1-D charts. Returns the active
 * index, whether the chart has keyboard focus, props for the focusable plot
 * and a pointer helper that maps a horizontal position to an index.
 */
export function useActiveIndex({
  count,
  value,
  defaultValue = null,
  onChange,
  focusIndex = 0,
}: UseActiveIndexOptions) {
  const [inner, setInner] = useState<number | null>(defaultValue);
  const [focused, setFocused] = useState(false);
  const controlled = value !== undefined;
  const active = controlled ? value : inner;
  const activeRef = useRef(active);
  activeRef.current = active;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setActive = useCallback(
    (next: number | null) => {
      const resolved = next === null || count <= 0 ? null : clamp(Math.round(next), 0, count - 1);
      if (resolved === activeRef.current) return;
      activeRef.current = resolved;
      if (!controlled) setInner(resolved);
      onChangeRef.current?.(resolved);
    },
    [controlled, count]
  );

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (count <= 0) return;
    const cur = activeRef.current;
    let next: number | null;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = cur === null ? 0 : Math.min(count - 1, cur + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = cur === null ? count - 1 : Math.max(0, cur - 1);
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = count - 1;
        break;
      case "Escape":
        next = null;
        break;
      default:
        return;
    }
    e.preventDefault();
    setActive(next);
  };

  const onFocus = (e: FocusEvent<HTMLElement>) => {
    if (e.target !== e.currentTarget) return;
    setFocused(true);
    // Only auto-select on keyboard focus; pointer focus selects from position.
    let keyboard = true;
    try {
      keyboard = e.currentTarget.matches(":focus-visible");
    } catch {
      /* older browsers: assume keyboard */
    }
    if (keyboard && activeRef.current === null) setActive(focusIndex);
  };

  const onBlur = (e: FocusEvent<HTMLElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    setFocused(false);
    setActive(null);
  };

  /** Pointer handlers for an overlay that spans `count` evenly spaced points. */
  const pointerProps = (mode: "point" | "band") => {
    const pick = (e: PointerEvent<Element>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      if (rect.width <= 0) return;
      const rel = clamp((e.clientX - rect.left) / rect.width, 0, 1);
      setActive(mode === "band" ? Math.min(count - 1, Math.floor(rel * count)) : rel * (count - 1));
    };
    return {
      onPointerMove: pick,
      onPointerDown: pick,
      onPointerLeave: (e: PointerEvent<Element>) => {
        if (e.pointerType === "mouse") setActive(null);
      },
      style: { touchAction: "pan-y" as const },
    };
  };

  return {
    active,
    setActive,
    focused,
    pointerProps,
    focusProps: { tabIndex: 0, onKeyDown, onFocus, onBlur },
  };
}
