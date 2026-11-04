"use client";

import { forwardRef, useId, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../utils/cn";
import {
  progressToneBg,
  progressToneText,
  type ProgressSize,
  type ProgressTone,
} from "./tones";

export type { ProgressTone, ProgressSize } from "./tones";

const trackSizes: Record<ProgressSize, string> = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

export interface ProgressProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "color"> {
  /** Current value, between `min` and `max`. Values outside are clamped visually. */
  value: number;
  /** Lower bound. Default 0. */
  min?: number;
  /** Upper bound. Default 100. */
  max?: number;
  /** Bar colour from the token palette. Default "accent". Ignored when `color` is set. */
  tone?: ProgressTone;
  /** Custom CSS colour (e.g. a category colour) for the bar, the marker and the secondary bar. */
  color?: string;
  /** Track height. Default "md". */
  size?: ProgressSize;
  /** Optional value drawn as a vertical tick (e.g. a projection or target). */
  marker?: number;
  /** Accessible / tooltip text for the marker, e.g. "Projected: 82%". */
  markerLabel?: string;
  /** Optional second value drawn behind the main bar (e.g. previous period). */
  secondary?: number;
  /** Style of the secondary bar. Default "soft". */
  secondaryStyle?: "soft" | "hatched";
  /** Visible label above the bar (left); also used as the accessible name. */
  label?: ReactNode;
  /** Visible text above the bar (right), e.g. "64%" or "3 of 5". */
  valueLabel?: ReactNode;
  /** `aria-valuetext`. Default: rounded percentage, e.g. "64%". */
  valueText?: string;
  /** Class names for the track. */
  trackClassName?: string;
}

function toPercent(v: number, min: number, max: number): number {
  if (!Number.isFinite(v) || max <= min) return 0;
  return Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100));
}

/** Determinate progress bar (`role="progressbar"`) with optional marker and secondary bar. */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      min = 0,
      max = 100,
      tone = "accent",
      color,
      size = "md",
      marker,
      markerLabel,
      secondary,
      secondaryStyle = "soft",
      label,
      valueLabel,
      valueText,
      className,
      trackClassName,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const labelId = useId();
    const pct = toPercent(value, min, max);
    const secondaryPct =
      secondary === undefined ? null : toPercent(secondary, min, max);
    const markerPct = marker === undefined ? null : toPercent(marker, min, max);
    const clampedNow = Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
    const text =
      valueText ??
      `${Math.round(pct)}%${markerLabel ? `, ${markerLabel}` : ""}`;

    const track = (
      <div
        ref={label || valueLabel ? undefined : ref}
        role="progressbar"
        aria-valuenow={clampedNow}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={text}
        aria-label={ariaLabel}
        aria-labelledby={!ariaLabel && label ? labelId : undefined}
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-surface-subtle",
          trackSizes[size],
          trackClassName,
          !(label || valueLabel) && className
        )}
        {...(label || valueLabel ? {} : props)}
      >
        {secondaryPct !== null && (
          <div
            aria-hidden="true"
            className={cn(
              "absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none",
              secondaryStyle === "soft"
                ? cn(!color && progressToneBg[tone], "opacity-25")
                : cn(
                    !color && progressToneText[tone],
                    "opacity-50 bg-[repeating-linear-gradient(135deg,currentColor_0_2px,transparent_2px_6px)]"
                  )
            )}
            style={{
              width: `${secondaryPct}%`,
              ...(color
                ? secondaryStyle === "soft"
                  ? { backgroundColor: color }
                  : { color }
                : null),
            }}
          />
        )}
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none",
            !color && progressToneBg[tone]
          )}
          style={{ width: `${pct}%`, ...(color ? { backgroundColor: color } : null) }}
        />
        {markerPct !== null && (
          <div
            aria-hidden="true"
            title={markerLabel}
            className={cn(
              "absolute inset-y-0 w-0.5 -translate-x-1/2 rounded-full",
              !color && "bg-fg/70"
            )}
            style={{ left: `${markerPct}%`, ...(color ? { backgroundColor: color } : null) }}
          />
        )}
      </div>
    );

    if (!label && !valueLabel) return track;

    return (
      <div ref={ref} className={cn("w-full space-y-1.5", className)} {...props}>
        <div className="flex items-baseline justify-between gap-3 text-xs">
          {label ? (
            <span id={labelId} className="min-w-0 truncate font-medium text-fg">
              {label}
            </span>
          ) : (
            <span />
          )}
          {valueLabel && (
            <span className="shrink-0 tabular-nums text-muted">{valueLabel}</span>
          )}
        </div>
        {track}
      </div>
    );
  }
);
Progress.displayName = "Progress";
