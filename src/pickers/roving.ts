"use client";

import { useRef, type KeyboardEvent } from "react";

function findNext(
  count: number,
  isDisabled: (index: number) => boolean,
  start: number,
  step: number,
  wrap: boolean
): number {
  let i = start;
  for (let n = 0; n < count; n++) {
    i += step;
    if (wrap) i = ((i % count) + count) % count;
    else if (i < 0 || i >= count) return start;
    if (!isDisabled(i)) return i;
  }
  return start;
}

export interface RovingOptions {
  count: number;
  /** Columns for 2-D navigation (Up/Down move by this). 0 = 1-D list. */
  columns?: number;
  isDisabled?: (index: number) => boolean;
  /** Index of the checked item, or -1. */
  selectedIndex: number;
  /** Called when arrow keys move to an item (radio semantics: move = select). */
  onMove: (index: number) => void;
}

/**
 * Roving tabindex for radiogroup-like grids. Left/Right wrap through the list,
 * Up/Down move by `columns` (no wrap), Home/End go to the first/last enabled item.
 */
export function useRoving({
  count,
  columns = 0,
  isDisabled = () => false,
  selectedIndex,
  onMove,
}: RovingOptions) {
  const refs = useRef<(HTMLElement | null)[]>([]);

  let tabIndexTarget = selectedIndex;
  if (tabIndexTarget < 0 || tabIndexTarget >= count || isDisabled(tabIndexTarget)) {
    tabIndexTarget = findNext(count, isDisabled, -1, 1, false);
    if (tabIndexTarget === -1) tabIndexTarget = 0;
  }

  const handleKeyDown = (event: KeyboardEvent, index: number) => {
    const vertical = columns > 0 ? columns : 1;
    let next = index;
    switch (event.key) {
      case "ArrowRight":
        next = findNext(count, isDisabled, index, 1, true);
        break;
      case "ArrowLeft":
        next = findNext(count, isDisabled, index, -1, true);
        break;
      case "ArrowDown":
        next = findNext(count, isDisabled, index, vertical, columns === 0);
        break;
      case "ArrowUp":
        next = findNext(count, isDisabled, index, -vertical, columns === 0);
        break;
      case "Home":
        next = findNext(count, isDisabled, -1, 1, false);
        break;
      case "End":
        next = findNext(count, isDisabled, count, -1, false);
        break;
      default:
        return;
    }
    event.preventDefault();
    if (next < 0 || next >= count || next === index) return;
    refs.current[next]?.focus();
    onMove(next);
  };

  const getItemProps = (index: number) => ({
    ref: (el: HTMLElement | null) => {
      refs.current[index] = el;
    },
    tabIndex: index === tabIndexTarget ? 0 : -1,
    onKeyDown: (event: KeyboardEvent) => handleKeyDown(event, index),
  });

  return { getItemProps };
}
