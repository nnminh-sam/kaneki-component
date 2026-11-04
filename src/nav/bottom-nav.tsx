"use client";

import {
  Children,
  forwardRef,
  isValidElement,
  type ElementType,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";
import type {
  PolymorphicComponent,
  PolymorphicImplProps,
  PolymorphicProps,
} from "./polymorphic";
import { focusRing } from "./styles";

export interface BottomNavProps extends HTMLAttributes<HTMLElement> {
  /** Accessible name of the navigation landmark. Default "Primary". */
  "aria-label"?: string;
  /** `BottomNavItem` elements. Each child is wrapped in an `<li>`. */
  children: ReactNode;
  /**
   * Optional prominent action (e.g. a round "add" button) placed in the middle
   * of the bar, between the first and second half of the items.
   */
  centerAction?: ReactNode;
  /** Keep the bar visible on md+ screens too. Default false (hidden from `md` up). */
  showOnDesktop?: boolean;
  /** Position the bar fixed at the bottom of the viewport. Default true. */
  fixed?: boolean;
}

/**
 * A mobile tab bar with icon + label items. Fixed to the bottom, padded for
 * `safe-area-inset-bottom`, hidden from the `md` breakpoint up by default.
 * Add bottom padding to the page (about `pb-20`) so content is not covered.
 */
export const BottomNav = forwardRef<HTMLElement, BottomNavProps>(
  (
    {
      "aria-label": ariaLabel = "Primary",
      children,
      centerAction,
      showOnDesktop = false,
      fixed = true,
      className,
      ...props
    },
    ref
  ) => {
    const items = Children.toArray(children).filter(Boolean);
    const cells: ReactNode[] = items.map((child, i) => (
      <li key={isValidElement(child) && child.key != null ? child.key : i} className="flex min-w-0 flex-1">
        {child}
      </li>
    ));
    if (centerAction) {
      cells.splice(
        Math.ceil(items.length / 2),
        0,
        <li key="__center" className="flex shrink-0 items-center justify-center px-1">
          {centerAction}
        </li>
      );
    }

    return (
      <nav
        ref={ref}
        aria-label={ariaLabel}
        className={cn(
          "z-40 border-t border-border bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/80",
          "pb-[env(safe-area-inset-bottom)]",
          fixed && "fixed inset-x-0 bottom-0",
          !showOnDesktop && "md:hidden",
          className
        )}
        {...props}
      >
        <ul className="mx-auto flex h-16 max-w-xl items-stretch px-1">{cells}</ul>
      </nav>
    );
  }
);
BottomNav.displayName = "BottomNav";

export interface BottomNavItemOwnProps {
  /** Icon shown above the label (decorative). */
  icon: ReactNode;
  /** Visible label. */
  label: ReactNode;
  /** Marks the current page (`aria-current="page"`). */
  active?: boolean;
  /** Small badge over the icon, e.g. a count or a dot (`""`). */
  badge?: ReactNode;
  className?: string;
}

export type BottomNavItemProps<E extends ElementType = "a"> = PolymorphicProps<
  E,
  BottomNavItemOwnProps
>;

/** A tab in `BottomNav`. Renders `<a>` by default; use `as={Link}` for router links. */
export const BottomNavItem = forwardRef(function BottomNavItem(
  {
    as,
    icon,
    label,
    active = false,
    badge,
    className,
    ...props
  }: PolymorphicImplProps<BottomNavItemOwnProps>,
  ref: ForwardedRef<Element>
) {
  const Comp: ElementType = as ?? "a";
  return (
    <Comp
      ref={ref}
      aria-current={active ? "page" : undefined}
      data-active={active || undefined}
      className={cn(
        "group flex min-w-0 flex-1 select-none flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-medium transition-colors motion-reduce:transition-none",
        focusRing,
        active ? "text-accent" : "text-muted hover:text-fg",
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "relative flex h-7 w-12 items-center justify-center rounded-full transition-colors motion-reduce:transition-none [&>svg]:h-5 [&>svg]:w-5",
          active && "bg-accent-soft"
        )}
      >
        {icon}
        {badge !== undefined && badge !== null && (
          <span
            className={cn(
              "absolute -top-0.5 right-1.5 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-semibold leading-4 text-danger-fg",
              badge === "" && "h-2 w-2 min-w-0 px-0"
            )}
          >
            {badge}
          </span>
        )}
      </span>
      <span className="max-w-full truncate">{label}</span>
    </Comp>
  );
}) as PolymorphicComponent<"a", BottomNavItemOwnProps>;
BottomNavItem.displayName = "BottomNavItem";
