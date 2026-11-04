import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { progressToneBg, type ProgressSize, type ProgressTone } from "./tones";

export interface SegmentBarSegment {
  /** Segment size (any unit; shares are computed against `total`). */
  value: number;
  /** Label used in the legend / accessible summary. */
  label: string;
  /** Custom CSS colour. Takes precedence over `tone`. */
  color?: string;
  /** Token colour when no `color` is given. Defaults cycle through the palette. */
  tone?: ProgressTone;
}

export interface SegmentBarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Segments, drawn left to right. Non-positive values are skipped. */
  segments: SegmentBarSegment[];
  /** Denominator. Default: sum of segments. A larger total leaves empty track. */
  total?: number;
  /** Bar height. Default "md". */
  size?: ProgressSize;
  /** Show a visible legend below the bar. Default false (summary is screen-reader only). */
  showLegend?: boolean;
  /** Formats a segment value for the legend / summary. Default: the raw number. */
  formatValue?: (value: number) => ReactNode;
  /** Accessible name of the summary list, e.g. "Spending by category". */
  "aria-label"?: string;
}

const paletteCycle: ProgressTone[] = ["accent", "ok", "warn", "danger", "neutral"];

const heights: Record<ProgressSize, string> = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };

/**
 * Stacked horizontal bar of segments. The bar itself is decorative; a list
 * (visible legend or `sr-only`) carries the values for assistive tech.
 */
export const SegmentBar = forwardRef<HTMLDivElement, SegmentBarProps>(
  (
    {
      segments,
      total,
      size = "md",
      showLegend = false,
      formatValue,
      className,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const items = segments
      .map((s, i) => ({ ...s, tone: s.tone ?? paletteCycle[i % paletteCycle.length] }))
      .filter((s) => Number.isFinite(s.value) && s.value > 0);
    const sum = items.reduce((a, s) => a + s.value, 0);
    const denom = Math.max(total ?? sum, sum, 0);
    const share = (v: number) => (denom > 0 ? (v / denom) * 100 : 0);
    const fmt = (v: number) => (formatValue ? formatValue(v) : v);

    const swatch = (s: (typeof items)[number]) =>
      cn("inline-block h-2 w-2 shrink-0 rounded-full", !s.color && progressToneBg[s.tone]);

    return (
      <div ref={ref} className={cn("w-full space-y-2", className)} {...props}>
        <div
          aria-hidden="true"
          className={cn(
            "flex w-full gap-0.5 overflow-hidden rounded-full bg-surface-subtle",
            heights[size]
          )}
        >
          {items.map((s, i) => (
            <div
              key={`${s.label}-${i}`}
              title={s.label}
              className={cn(
                "h-full min-w-0.5 transition-[width] duration-500 ease-out first:rounded-l-full last:rounded-r-full motion-reduce:transition-none",
                !s.color && progressToneBg[s.tone]
              )}
              style={{
                width: `${share(s.value)}%`,
                ...(s.color ? { backgroundColor: s.color } : null),
              }}
            />
          ))}
        </div>
        <ul
          aria-label={ariaLabel}
          className={
            showLegend
              ? "flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted"
              : "sr-only"
          }
        >
          {items.map((s, i) => (
            <li key={`${s.label}-${i}`} className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={swatch(s)}
                style={s.color ? { backgroundColor: s.color } : undefined}
              />
              <span className="text-fg">{s.label}</span>
              <span className="tabular-nums">
                {fmt(s.value)} ({Math.round(share(s.value))}%)
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
);
SegmentBar.displayName = "SegmentBar";
