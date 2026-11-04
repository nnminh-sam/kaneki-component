import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "../utils/cn";

export type DeltaDirection = "up" | "down" | "flat";
export type DeltaTone = "ok" | "danger" | "neutral";

export interface DeltaBadgeProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** The change. Interpreted per `format`. `null` / NaN renders a neutral dash. */
  value: number | null | undefined;
  /** `"fraction"`: 0.12 means 12% (default). `"percent"`: 12 means 12%. */
  format?: "fraction" | "percent";
  /** Set when an increase is bad (e.g. costs): up becomes danger, down becomes ok. */
  invert?: boolean;
  /** Absolute change in percent points at or below which the delta counts as flat. Default 0. */
  neutralThreshold?: number;
  /** Max fraction digits. Default 1. */
  precision?: number;
  /**
   * Visible context after the number, e.g. "vs last month". A string is also read by
   * screen readers; for a ReactNode suffix pass `srLabel`, otherwise a generic
   * "compared with the previous period" is announced.
   */
  suffix?: ReactNode;
  /** Full accessible text, overriding the generated "up 12% vs last month". Recommended whenever `suffix` is not a plain string. */
  srLabel?: string;
  /** Show a leading +/- sign. Default false (the arrow carries the direction). */
  showSign?: boolean;
  /** Visual style. `"soft"`: tinted pill (default). `"plain"`: coloured text only. */
  variant?: "soft" | "plain";
  /** Size. Default "sm". */
  size?: "sm" | "md";
  /** Locale for number formatting. Fixed default ("en-US") avoids SSR hydration mismatches. */
  locale?: string;
}

/** Computes direction and tone for a delta, shared with consumers that need the same logic. */
export function getDeltaInfo(
  value: number | null | undefined,
  {
    format = "fraction",
    invert = false,
    neutralThreshold = 0,
  }: Pick<DeltaBadgeProps, "format" | "invert" | "neutralThreshold"> = {}
): { percent: number | null; direction: DeltaDirection; tone: DeltaTone } {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return { percent: null, direction: "flat", tone: "neutral" };
  }
  const percent = format === "fraction" ? value * 100 : value;
  const direction: DeltaDirection =
    Math.abs(percent) <= neutralThreshold || percent === 0
      ? "flat"
      : percent > 0
        ? "up"
        : "down";
  const tone: DeltaTone =
    direction === "flat"
      ? "neutral"
      : (direction === "up") !== invert
        ? "ok"
        : "danger";
  return { percent, direction, tone };
}

const toneStyles: Record<"soft" | "plain", Record<DeltaTone, string>> = {
  soft: {
    ok: "bg-ok-soft text-ok",
    danger: "bg-danger-soft text-danger",
    neutral: "bg-surface-subtle text-muted",
  },
  plain: { ok: "text-ok", danger: "text-danger", neutral: "text-muted" },
};

const icons = { up: ArrowUpRight, down: ArrowDownRight, flat: Minus };

/** Percentage change with a direction arrow and ok / danger / neutral tone. */
export const DeltaBadge = forwardRef<HTMLSpanElement, DeltaBadgeProps>(
  (
    {
      value,
      format = "fraction",
      invert = false,
      neutralThreshold = 0,
      precision = 1,
      suffix,
      srLabel,
      showSign = false,
      variant = "soft",
      size = "sm",
      locale = "en-US",
      className,
      ...props
    },
    ref
  ) => {
    const { percent, direction, tone } = getDeltaInfo(value, {
      format,
      invert,
      neutralThreshold,
    });
    const nf = new Intl.NumberFormat(locale, {
      maximumFractionDigits: precision,
      minimumFractionDigits: 0,
    });
    const magnitude = percent === null ? null : `${nf.format(Math.abs(percent))}%`;
    const sign = showSign && percent ? (percent > 0 ? "+" : "−") : "";
    const Icon = icons[direction];
    const suffixText =
      typeof suffix === "string" || typeof suffix === "number"
        ? ` ${suffix}`
        : suffix !== undefined && suffix !== null && suffix !== false
          ? " compared with the previous period"
          : "";
    const sr =
      srLabel ??
      (magnitude === null
        ? `no change data${suffixText}`
        : direction === "flat"
          ? `unchanged${suffixText}`
          : `${direction} ${magnitude}${suffixText}`);

    return (
      <span
        ref={ref}
        data-tone={tone}
        data-direction={direction}
        className={cn(
          "inline-flex items-center gap-0.5 whitespace-nowrap font-medium tabular-nums",
          variant === "soft" && "rounded-full",
          variant === "soft" && (size === "sm" ? "px-1.5 py-0.5" : "px-2 py-0.5"),
          size === "sm" ? "text-xs" : "text-sm",
          toneStyles[variant][tone],
          className
        )}
        {...props}
      >
        <span aria-hidden="true" className="inline-flex items-center gap-0.5">
          <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={2.25} />
          <span>{magnitude === null ? "—" : `${sign}${magnitude}`}</span>
          {suffix && <span className="ml-1 font-normal text-muted">{suffix}</span>}
        </span>
        <span className="sr-only">{sr}</span>
      </span>
    );
  }
);
DeltaBadge.displayName = "DeltaBadge";
