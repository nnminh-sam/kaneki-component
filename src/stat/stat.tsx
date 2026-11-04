"use client";

import {
  Children,
  createContext,
  forwardRef,
  useContext,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";

export type StatIconTone = "accent" | "ok" | "warn" | "danger" | "neutral";
export type StatValueTone = "default" | "accent" | "ok" | "warn" | "danger" | "muted";
export type StatSize = "sm" | "md" | "lg";
export type StatLayout = "stack" | "inline";
export type StatGroupVariant = "plain" | "cards" | "divided";

interface StatGroupContextValue {
  variant: StatGroupVariant;
}
const StatGroupContext = createContext<StatGroupContextValue | null>(null);

export interface StatProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** What is measured. Rendered as the term (`<dt>`) of the value. */
  label: ReactNode;
  /** The figure. Rendered as the description (`<dd>`). Pre-format numbers yourself. */
  value: ReactNode;
  /** Optional icon shown in a tinted chip. Decorative. */
  icon?: ReactNode;
  /** Tint of the icon chip. Default "accent". */
  iconTone?: StatIconTone;
  /** Colour of the value text. Default "default". */
  tone?: StatValueTone;
  /** Trend slot next to / under the value, e.g. a `DeltaBadge`. */
  trend?: ReactNode;
  /** Small helper text under the value. */
  helper?: ReactNode;
  /** Footer content separated by a border (links, sparkline, notes). */
  footer?: ReactNode;
  /** Value size. Default "md". */
  size?: StatSize;
  /** `"stack"`: label above value (default). `"inline"`: icon + label left, value right. */
  layout?: StatLayout;
}

const chipTones: Record<StatIconTone, string> = {
  accent: "bg-accent-soft text-accent",
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-surface-subtle text-muted",
};

const valueTones: Record<StatValueTone, string> = {
  default: "text-fg",
  accent: "text-accent",
  ok: "text-ok",
  warn: "text-warn",
  danger: "text-danger",
  muted: "text-muted",
};

const valueSizes: Record<StatSize, string> = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
};

const chipSizes: Record<StatSize, string> = {
  sm: "h-7 w-7 rounded-lg [&>svg]:h-3.5 [&>svg]:w-3.5",
  md: "h-8 w-8 rounded-lg [&>svg]:h-4 [&>svg]:w-4",
  lg: "h-10 w-10 rounded-xl [&>svg]:h-5 [&>svg]:w-5",
};

/** Left indent for inline-layout helper text so it lines up with the label. */
const helperIndent: Record<StatSize, string> = {
  sm: "pl-10",
  md: "pl-11",
  lg: "pl-13",
};

/**
 * A single metric. Uses `<dt>` / `<dd>` markup: inside a `StatGroup` it renders a
 * `<div>` within the group's `<dl>`; standalone it renders its own `<dl>`.
 */
export const Stat = forwardRef<HTMLElement, StatProps>(
  (
    {
      label,
      value,
      icon,
      iconTone = "accent",
      tone = "default",
      trend,
      helper,
      footer,
      size = "md",
      layout = "stack",
      className,
      ...props
    },
    ref
  ) => {
    const group = useContext(StatGroupContext);
    const Root = (group ? "div" : "dl") as "div";

    const chip = icon ? (
      <span
        aria-hidden="true"
        className={cn(
          "flex shrink-0 items-center justify-center",
          chipSizes[size],
          chipTones[iconTone]
        )}
      >
        {icon}
      </span>
    ) : null;

    const labelText = (
      <span
        className={cn(
          "min-w-0 truncate font-medium text-muted",
          size === "lg" ? "text-sm" : "text-xs"
        )}
      >
        {label}
      </span>
    );

    const valueEl = (
      <span
        className={cn(
          "font-semibold leading-tight tracking-tight tabular-nums",
          valueSizes[size],
          valueTones[tone]
        )}
      >
        {value}
      </span>
    );

    const footerEl = footer ? (
      <dd className="col-span-full mt-3 border-t border-border pt-3 text-xs text-muted">
        {footer}
      </dd>
    ) : null;

    const surface =
      group?.variant === "cards"
        ? "rounded-2xl border border-border bg-surface p-4 shadow-xs"
        : group?.variant === "divided"
          ? "bg-surface p-4"
          : "";

    // dt / dd must be direct children of the group element, so layout is done
    // with CSS grid on the root rather than wrapper divs.
    if (layout === "inline") {
      return (
        <Root
          ref={ref as never}
          className={cn(
            "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3",
            surface,
            className
          )}
          {...props}
        >
          <dt className="col-start-1 row-start-1 flex min-w-0 items-center gap-3">
            {chip}
            {labelText}
          </dt>
          <dd className="col-start-2 row-span-2 row-start-1 flex flex-col items-end gap-0.5 text-right">
            {valueEl}
            {trend}
          </dd>
          {helper && (
            <dd
              className={cn(
                "col-start-1 row-start-2 text-xs leading-relaxed text-muted",
                icon && helperIndent[size]
              )}
            >
              {helper}
            </dd>
          )}
          {footerEl}
        </Root>
      );
    }

    return (
      <Root
        ref={ref as never}
        className={cn("flex min-w-0 flex-col", surface, className)}
        {...props}
      >
        <dt className="flex items-start justify-between gap-3">
          {labelText}
          {chip}
        </dt>
        <dd className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", icon ? "mt-1" : "mt-1.5")}>
          {valueEl}
          {trend}
        </dd>
        {helper && (
          <dd className="mt-1 text-xs leading-relaxed text-muted">{helper}</dd>
        )}
        {footerEl}
      </Root>
    );
  }
);
Stat.displayName = "Stat";

export interface StatGroupProps extends HTMLAttributes<HTMLDListElement> {
  /** `"plain"`: spaced grid (default). `"cards"`: each stat in a card. `"divided"`: one bordered panel with hairline dividers. */
  variant?: StatGroupVariant;
  /** Columns from the `lg` breakpoint (1 on mobile, 2 from `sm`). Default: number of children, max 4. */
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Columns below the `sm` breakpoint. Default 1. */
  mobileColumns?: 1 | 2 | 3;
}

const baseCols: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
};

const lgCols: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

/** A responsive grid of `Stat`s rendered as one `<dl>`. */
export const StatGroup = forwardRef<HTMLDListElement, StatGroupProps>(
  ({ variant = "plain", columns, mobileColumns = 1, className, children, ...props }, ref) => {
    const count = Children.toArray(children).length;
    const cols = columns ?? Math.min(Math.max(count, 1), 4);
    return (
      <StatGroupContext.Provider value={{ variant }}>
        <dl
          ref={ref}
          className={cn(
            "grid",
            baseCols[mobileColumns],
            cols > 1 && "sm:grid-cols-2",
            cols === 1 && mobileColumns > 1 && "sm:grid-cols-1",
            lgCols[cols],
            variant === "plain" && "gap-x-6 gap-y-5",
            variant === "cards" && "gap-3",
            variant === "divided" &&
              "gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-xs",
            className
          )}
          {...props}
        >
          {children}
        </dl>
      </StatGroupContext.Provider>
    );
  }
);
StatGroup.displayName = "StatGroup";
