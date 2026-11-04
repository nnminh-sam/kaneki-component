"use client";

import { forwardRef, type ElementType,
  type ForwardedRef, type ReactNode } from "react";
import { cn } from "../utils/cn";
import type {
  PolymorphicComponent,
  PolymorphicImplProps,
  PolymorphicProps,
} from "./polymorphic";
import { focusRing } from "./styles";

export type NavItemLayout = "inline" | "stacked";

export interface NavItemOwnProps {
  /** Marks the current page: sets `aria-current="page"` and the active pill style. */
  active?: boolean;
  /** Leading icon (decorative; hidden from assistive tech). */
  icon?: ReactNode;
  /** Trailing badge, e.g. a count. Give it accessible text if it is not obvious. */
  badge?: ReactNode;
  /**
   * `"inline"`: icon beside the label (default).
   * `"stacked"`: icon over a small label, for compact mobile rows.
   */
  layout?: NavItemLayout;
  /** Label content. */
  children?: ReactNode;
  className?: string;
}

export type NavItemProps<E extends ElementType = "a"> = PolymorphicProps<
  E,
  NavItemOwnProps
>;

/**
 * A pill-shaped navigation link. Renders an `<a>` by default; pass `as={Link}`
 * (e.g. from next/link) to use a router link, and all other props are forwarded.
 */
export const NavItem = forwardRef(function NavItem(
  {
    as,
    active = false,
    icon,
    badge,
    layout = "inline",
    className,
    children,
    ...props
  }: PolymorphicImplProps<NavItemOwnProps>,
  ref: ForwardedRef<Element>
) {
  const Comp: ElementType = as ?? "a";
  const stacked = layout === "stacked";
  return (
    <Comp
      ref={ref}
      aria-current={active ? "page" : undefined}
      data-active={active || undefined}
      className={cn(
        "group relative inline-flex shrink-0 select-none items-center whitespace-nowrap rounded-full font-medium transition-colors motion-reduce:transition-none",
        focusRing,
        stacked
          ? "flex-col gap-0.5 px-3 py-1.5 text-[11px]"
          : "gap-2 px-3.5 py-1.5 text-sm",
        active
          ? "bg-accent-soft text-accent font-semibold"
          : "text-muted hover:bg-surface-subtle hover:text-fg",
        className
      )}
      {...props}
    >
      {icon && (
        <span
          aria-hidden="true"
          className={cn(
            "flex shrink-0 items-center justify-center [&>svg]:h-4 [&>svg]:w-4",
            stacked && "[&>svg]:h-5 [&>svg]:w-5"
          )}
        >
          {icon}
        </span>
      )}
      <span className="truncate">{children}</span>
      {badge !== undefined && badge !== null && (
        <span
          className={cn(
            "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
            active ? "bg-accent text-accent-fg" : "bg-accent-soft text-accent",
            stacked && "absolute right-1 top-0.5"
          )}
        >
          {badge}
        </span>
      )}
    </Comp>
  );
}) as PolymorphicComponent<"a", NavItemOwnProps>;
NavItem.displayName = "NavItem";
