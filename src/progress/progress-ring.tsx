import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { progressToneText, type ProgressTone } from "./tones";

export interface ProgressRingProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "color"> {
  /** Progress from 0 to 1 (clamped). */
  value: number;
  /** Outer diameter in px. Default 48. */
  size?: number;
  /** Stroke width in px. Default 4. */
  thickness?: number;
  /** Ring colour from the token palette. Default "accent". Ignored when `color` is set. */
  tone?: ProgressTone;
  /** Custom CSS colour for the ring (e.g. a category colour). */
  color?: string;
  /** Round the stroke ends. Default true. */
  rounded?: boolean;
  /** `aria-valuetext`. Default: rounded percentage. */
  valueText?: string;
  /** Content centred inside the ring (e.g. a percentage or icon). */
  children?: ReactNode;
}

/** Circular progress (SVG) with `role="progressbar"` and centred content. */
export const ProgressRing = forwardRef<HTMLDivElement, ProgressRingProps>(
  (
    {
      value,
      size = 48,
      thickness = 4,
      tone = "accent",
      color,
      rounded = true,
      valueText,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const v = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
    const pct = Math.round(v * 100);
    const r = (size - thickness) / 2;
    const c = 2 * Math.PI * r;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={valueText ?? `${pct}%`}
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center",
          !color && progressToneText[tone],
          className
        )}
        style={{ width: size, height: size, ...(color ? { color } : null), ...style }}
        {...props}
      >
        <svg
          aria-hidden="true"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={thickness}
            className="stroke-surface-subtle"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={thickness}
            strokeLinecap={rounded && v > 0 ? "round" : "butt"}
            strokeDasharray={c}
            strokeDashoffset={c * (1 - v)}
            className="transition-[stroke-dashoffset] duration-500 ease-out motion-reduce:transition-none"
          />
        </svg>
        {children !== undefined && children !== null && (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold tabular-nums text-fg">
            {children}
          </div>
        )}
      </div>
    );
  }
);
ProgressRing.displayName = "ProgressRing";
