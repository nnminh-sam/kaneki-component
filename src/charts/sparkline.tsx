"use client";

import type { CSSProperties } from "react";
import { useSvgId } from "./hooks";
import { linePath, areaPath, isNum, extent, type CurveType } from "./utils";

export interface SparklineProps {
  values: ReadonlyArray<number | null | undefined>;
  /** CSS colour. Default `var(--accent)`. */
  color?: string;
  /** Default `96`. */
  width?: number;
  /** Default `32`. */
  height?: number;
  /** Gradient fill under the line. Default `true`. */
  area?: boolean;
  /** Dot on the last defined point. Default `false`. */
  dot?: boolean;
  /** Default `2`. */
  strokeWidth?: number;
  /** Keep 0 in the domain. Default `true`; `false` scales to the data range. */
  includeZero?: boolean;
  curve?: CurveType;
  /**
   * Accessible label. Without it the sparkline is decorative (`aria-hidden`);
   * with it the svg gets `role="img"`.
   */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

/** Tiny inline trend line, decorative by default. */
export function Sparkline({
  values,
  color = "var(--accent)",
  width = 96,
  height = 32,
  area = true,
  dot = false,
  strokeWidth = 2,
  includeZero = true,
  curve = "linear",
  label,
  className,
  style,
}: SparklineProps) {
  const uid = useSvgId("ks");
  if (values.filter(isNum).length < 2) return null;
  const pad = Math.max(strokeWidth, dot ? 3 : 0);
  const [lo, hi] = extent(includeZero ? [0, ...values] : values) ?? [0, 1];
  const span = hi - lo || 1;
  const x = (i: number) => pad + (i / (values.length - 1)) * (width - pad * 2);
  const y = (v: number) => height - pad - ((v - lo) / span) * (height - pad * 2);
  const points = values.map((v, i) => (isNum(v) ? { x: x(i), y: y(v) } : null));
  let last: { x: number; y: number } | null = null;
  for (let i = points.length - 1; i >= 0 && !last; i--) last = points[i];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ display: "block", overflow: "visible", ...style }}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true, focusable: false })}
    >
      {area && (
        <>
          <defs>
            <linearGradient id={uid} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.35 }} />
              <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <path d={areaPath(points, height, curve)} fill={`url(#${uid})`} />
        </>
      )}
      <path
        d={linePath(points, curve)}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ stroke: color }}
      />
      {dot && last && <circle cx={last.x} cy={last.y} r={2.75} style={{ fill: color }} />}
    </svg>
  );
}
