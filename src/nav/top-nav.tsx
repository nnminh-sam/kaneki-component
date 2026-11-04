"use client";

import {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";
import { hiddenScrollbar } from "./styles";

export interface TopNavProps extends HTMLAttributes<HTMLElement> {
  /** Accessible name of the navigation landmark. Default "Main". */
  "aria-label"?: string;
  /**
   * Scroll the row horizontally when items overflow (hidden scrollbar). When
   * false, items wrap. Default true.
   */
  scrollable?: boolean;
  /** Scroll the active item (`aria-current="page"`) into view on mount / change. Default true. */
  scrollActiveIntoView?: boolean;
  /** `NavItem` elements. Each child is wrapped in an `<li>`. */
  children: ReactNode;
  /** Class names for the inner `<ul>`. */
  listClassName?: string;
}

/** A horizontal navigation landmark: `<nav aria-label>` with a list of `NavItem`s. */
export const TopNav = forwardRef<HTMLElement, TopNavProps>(
  (
    {
      "aria-label": ariaLabel = "Main",
      scrollable = true,
      scrollActiveIntoView = true,
      children,
      className,
      listClassName,
      ...props
    },
    ref
  ) => {
    const listRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
      if (!scrollable || !scrollActiveIntoView) return;
      const list = listRef.current;
      const active = list?.querySelector<HTMLElement>('[aria-current="page"]');
      if (!list || !active) return;
      // Only scroll the list itself, never the page.
      const listBox = list.getBoundingClientRect();
      const box = active.getBoundingClientRect();
      if (box.left < listBox.left || box.right > listBox.right) {
        list.scrollLeft +=
          box.left - listBox.left - (listBox.width - box.width) / 2;
      }
    });

    return (
      <nav ref={ref} aria-label={ariaLabel} className={cn("min-w-0", className)} {...props}>
        <ul
          ref={listRef}
          className={cn(
            "flex items-center gap-1",
            scrollable
              ? cn("overflow-x-auto overscroll-x-contain scroll-px-2", hiddenScrollbar)
              : "flex-wrap",
            listClassName
          )}
        >
          {Children.map(children, (child, i) =>
            child === null || child === undefined || child === false ? null : (
              <li key={isValidElement(child) && child.key != null ? child.key : i} className="shrink-0">
                {child}
              </li>
            )
          )}
        </ul>
      </nav>
    );
  }
);
TopNav.displayName = "TopNav";
