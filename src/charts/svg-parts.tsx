"use client";

import type { SVGProps } from "react";
import type { ReferenceLine } from "./types";

/* Small SVG building blocks shared by the charts (not exported from the package). */

export const DRAW_CLASS =
  "motion-safe:transition-[stroke-dashoffset] motion-safe:duration-[1600ms] motion-safe:ease-[cubic-bezier(0.65,0,0.35,1)]";
export const FADE_CLASS = "motion-safe:transition-opacity motion-safe:duration-[900ms] motion-safe:delay-500 ease-out";
export const GROW_CLASS = "motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]";

/** Props that draw a solid stroke in from start to end once `entered`. Dashed strokes fade instead. */
export function drawIn(entered: boolean, dashed?: boolean): SVGProps<SVGPathElement> {
  if (dashed) {
    return { strokeDasharray: "6 5", opacity: entered ? 1 : 0, className: FADE_CLASS };
  }
  return { pathLength: 1, strokeDasharray: "1 1", strokeDashoffset: entered ? 0 : 1, className: DRAW_CLASS };
}

export function VerticalGradient({
  id,
  color,
  from = 0.45,
  to = 0,
  toColor,
}: {
  id: string;
  color: string;
  from?: number;
  to?: number;
  toColor?: string;
}) {
  return (
    <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" style={{ stopColor: color, stopOpacity: from }} />
      <stop offset="100%" style={{ stopColor: toColor ?? color, stopOpacity: to }} />
    </linearGradient>
  );
}

export function GlowFilter({ id, blur = 3 }: { id: string; blur?: number }) {
  return (
    <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation={blur} result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
}

/** Pulsing dot with a soft halo (e.g. the latest data point). */
export function PulseDot({ cx, cy, color, r = 5 }: { cx: number; cy: number; color: string; r?: number }) {
  return (
    <g pointerEvents="none">
      <circle cx={cx} cy={cy} r={r * 1.4} style={{ fill: color, opacity: 0.25 }} className="motion-safe:animate-ping [transform-box:fill-box] [transform-origin:center]" />
      <circle cx={cx} cy={cy} r={r} style={{ fill: color }} className="motion-safe:animate-pulse" />
    </g>
  );
}

/** Horizontal reference lines with right-aligned labels. Render inside the plot `<g>`. */
export function ReferenceLines({
  lines,
  y,
  width,
  min,
  max,
}: {
  lines: ReferenceLine[];
  y: (v: number) => number;
  width: number;
  min: number;
  max: number;
}) {
  return (
    <g aria-hidden="true" pointerEvents="none">
      {lines
        .filter((l) => l.value >= min && l.value <= max)
        .map((l, i) => {
          const color = l.color ?? "var(--muted)";
          const py = y(l.value);
          return (
            <g key={`${l.value}-${i}`}>
              <line
                x1={0}
                x2={width}
                y1={py}
                y2={py}
                strokeWidth={1.25}
                strokeDasharray={l.dashed === false ? undefined : "5 5"}
                style={{ stroke: color, opacity: 0.85 }}
              />
              {l.label && (
                <text
                  x={width}
                  y={py - 6}
                  textAnchor="end"
                  fontSize={10}
                  fontWeight={700}
                  letterSpacing="0.02em"
                  style={{ fill: color, paintOrder: "stroke", stroke: "var(--surface)", strokeWidth: 3 }}
                >
                  {l.label}
                </text>
              )}
            </g>
          );
        })}
    </g>
  );
}

/** Dashed vertical crosshair from the top of the plot to its baseline. */
export function Crosshair({ x, height }: { x: number; height: number }) {
  return (
    <line
      x1={x}
      x2={x}
      y1={0}
      y2={height}
      strokeDasharray="3 3"
      pointerEvents="none"
      style={{ stroke: "var(--muted)", opacity: 0.6 }}
    />
  );
}

/** Ring marker at the hovered value. */
export function HoverDot({ cx, cy, color = "var(--fg)" }: { cx: number; cy: number; color?: string }) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4.5}
      strokeWidth={2.5}
      pointerEvents="none"
      style={{ fill: "var(--surface)", stroke: color }}
    />
  );
}
