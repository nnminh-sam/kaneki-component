"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "../utils/cn";

export interface ChartTooltipProps {
  /** Anchor x in px, relative to the chart container. */
  x: number;
  /** Anchor y in px, relative to the chart container (tooltip is vertically centred on it). */
  y: number;
  /** Container width; the tooltip flips to the left of the anchor past `flipAt`. */
  containerWidth: number;
  /** Fraction of `containerWidth` after which the tooltip flips side. Default `0.6`. */
  flipAt?: number;
  /** Gap between anchor and tooltip in px. Default `14`. */
  offset?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * Floating readout absolutely positioned inside a `relative` chart container.
 * Purely visual (`aria-hidden`): charts announce the same content through a
 * live region, see `ChartFrame`'s `announcement`.
 */
export function ChartTooltip({
  x,
  y,
  containerWidth,
  flipAt = 0.6,
  offset = 14,
  className,
  style,
  children,
}: ChartTooltipProps) {
  const flip = x > containerWidth * flipAt;
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute z-10 min-w-[180px] max-w-[280px] rounded-xl border border-border",
        "bg-surface/90 px-3 py-2.5 text-xs text-fg shadow-lg backdrop-blur-md motion-safe:animate-fade-in",
        className
      )}
      style={{
        left: x,
        top: y,
        transform: `translate(${flip ? `calc(-100% - ${offset}px)` : `${offset}px`}, -50%)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function ChartTooltipTitle({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mb-1.5 font-semibold text-fg", className)}>{children}</div>;
}

export interface ChartTooltipRowProps {
  color: string;
  label: ReactNode;
  value: ReactNode;
  /** Outline-only (dashed) swatch, for projections and reference values. */
  dashed?: boolean;
  className?: string;
}

export function ChartTooltipRow({ color, label, value, dashed, className }: ChartTooltipRowProps) {
  return (
    <div className={cn("flex items-center gap-2 py-0.5", className)}>
      <span
        className={cn("size-2.5 shrink-0 rounded-[3px] border-2", dashed ? "border-dashed" : "border-solid")}
        style={{ background: dashed ? "transparent" : color, borderColor: color }}
      />
      <span className="flex-1 text-muted">{label}</span>
      <span className="font-semibold tabular-nums text-fg">{value}</span>
    </div>
  );
}

/** Emphasised footnote line, e.g. an outlier flag. Defaults to the danger colour. */
export function ChartTooltipNote({
  className,
  color = "var(--danger)",
  children,
}: {
  className?: string;
  color?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mt-1.5 font-semibold", className)} style={{ color }}>
      {children}
    </div>
  );
}
