import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../utils/cn";
import type { ContainerSize } from "./container";

export interface AppHeaderProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Brand mark / logo slot (left). */
  brand?: ReactNode;
  /** Title text or node shown next to the brand. */
  title?: ReactNode;
  /**
   * Centre navigation slot, typically a `TopNav`. On mobile it moves to a
   * second full-width row (unless `collapseNavOnMobile` is false).
   */
  nav?: ReactNode;
  /** Right-aligned actions slot (theme toggle, avatar, buttons). */
  actions?: ReactNode;
  /** Stick to the top of the viewport. Default true. */
  sticky?: boolean;
  /** Max width of the inner row, matching `Container`. Default "xl". */
  size?: ContainerSize;
  /** Render `nav` on its own row below md. Default true. Set false to hide nav on mobile (e.g. when a BottomNav is used). */
  collapseNavOnMobile?: boolean;
  /** Class names for the inner width-constrained wrapper (merged last, so they override defaults). */
  innerClassName?: string;
  /** Full-width second row under the main row (e.g. period navigation or filters), on all breakpoints. */
  secondary?: ReactNode;
}

const sizeStyles: Record<ContainerSize, string> = {
  sm: "max-w-[640px]",
  md: "max-w-[768px]",
  lg: "max-w-[1024px]",
  xl: "max-w-[1280px]",
  full: "max-w-none",
};

/**
 * Sticky, translucent top bar (`<header>`) with brand / title, centre nav and
 * actions. Collapses to two rows on mobile: brand + actions, then nav.
 */
export const AppHeader = forwardRef<HTMLElement, AppHeaderProps>(
  (
    {
      brand,
      title,
      nav,
      actions,
      sticky = true,
      size = "xl",
      collapseNavOnMobile = true,
      className,
      innerClassName,
      secondary,
      children,
      ...props
    },
    ref
  ) => (
    <header
      ref={ref}
      className={cn(
        "z-30 w-full border-b border-border bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/70",
        sticky && "sticky top-0",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "mx-auto grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-2 sm:px-6 md:grid-cols-[auto_minmax(0,1fr)_auto] md:min-h-14 md:grid-rows-[minmax(3.5rem,auto)] md:py-0 lg:px-8",
          sizeStyles[size],
          innerClassName
        )}
      >
        {(brand || title) && (
          <div className="flex min-w-0 items-center gap-2.5 md:col-start-1 md:row-start-1">
            {brand && <div className="flex shrink-0 items-center">{brand}</div>}
            {title && (
              <div className="truncate text-sm font-semibold tracking-tight text-fg">
                {title}
              </div>
            )}
          </div>
        )}
        {actions && (
          <div className="col-start-2 row-start-1 flex shrink-0 items-center justify-end gap-2 md:col-start-3">
            {actions}
          </div>
        )}
        {nav && (
          <div
            className={cn(
              "col-span-2 row-start-2 min-w-0 md:col-span-1 md:col-start-2 md:row-start-1 md:flex md:justify-center",
              !collapseNavOnMobile && "hidden md:flex"
            )}
          >
            {nav}
          </div>
        )}
        {children}
        {secondary && (
          <div className="col-span-full min-w-0 pb-2 md:col-start-1 md:row-start-2">
            {secondary}
          </div>
        )}
      </div>
    </header>
  )
);
AppHeader.displayName = "AppHeader";
