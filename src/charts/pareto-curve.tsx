"use client";

import type { ReactNode } from "react";
import { ChartAxisX, ChartAxisY } from "./chart-axis";
import { ChartFrame, chartLabel, type ChartBaseProps } from "./chart-frame";
import { ChartTooltip, ChartTooltipRow, ChartTooltipTitle } from "./chart-tooltip";
import { useActiveIndex, useEntered, useSvgId } from "./hooks";
import { Crosshair, FADE_CLASS, HoverDot, PulseDot, drawIn } from "./svg-parts";
import { defaultFormatPercent, linePath, linearScale, resolveMargin, type ChartMargin } from "./utils";

export interface ParetoPoint {
  /** Cumulative share of items, 0–1. */
  x: number;
  /** Cumulative share of the total, 0–1. */
  y: number;
}

export interface ParetoCurveProps extends ChartBaseProps {
  /** Points sorted by `x`, from (0, 0) to (1, 1). */
  points: ParetoPoint[];
  /** Highlighted threshold, e.g. `{ y: 0.8, x: 0.2 }` for "20% of items → 80%". */
  threshold?: { x: number; y: number; label?: string; color?: string };
  /** Draw the equal-distribution diagonal. Default `true`. */
  diagonal?: boolean;
  /** Default `var(--accent)`. */
  color?: string;
  /** Formatter for both axes (0–1). Default: percent. */
  formatX?: (value: number) => string;
  formatY?: (value: number) => string;
  /** Tooltip labels. Defaults `"Items"` / `"Share of total"`. */
  xLabel?: string;
  yLabel?: string;
  /** Plot height in px. Default `200`. */
  height?: number;
  margin?: Partial<ChartMargin>;
  renderTooltip?: (point: ParetoPoint, index: number) => ReactNode;
}

/**
 * Cumulative concentration (Pareto / Lorenz) curve on a 0–1 × 0–1 domain,
 * with an optional threshold marker and equality diagonal.
 */
export function ParetoCurve({
  points,
  threshold,
  diagonal = true,
  color = "var(--accent)",
  formatX = defaultFormatPercent,
  formatY = defaultFormatPercent,
  xLabel = "Items",
  yLabel = "Share of total",
  height = 200,
  margin,
  renderTooltip,
  title,
  description,
  showCaption,
  a11yTable,
  animate = true,
  className,
  style,
  footer,
}: ParetoCurveProps) {
  const uid = useSvgId();
  const entered = useEntered(true, animate);
  const { active, focused, focusProps, setActive } = useActiveIndex({ count: points.length });
  const m = resolveMargin({ top: 12, right: 12, bottom: 24, left: 40 }, margin);
  const ih = Math.max(height - m.top - m.bottom, 0);
  const y = linearScale([0, 1], [ih, 0]);
  const tColor = threshold?.color ?? "var(--warn)";

  const body = (i: number): ReactNode => {
    const p = points[i];
    if (!p) return null;
    if (renderTooltip) return renderTooltip(p, i);
    return (
      <>
        <ChartTooltipTitle>
          {xLabel}: {formatX(p.x)}
        </ChartTooltipTitle>
        <ChartTooltipRow color={color} label={yLabel} value={formatY(p.y)} />
      </>
    );
  };
  const activeBody = active !== null ? body(active) : null;

  return (
    <ChartFrame
      title={title}
      description={description}
      showCaption={showCaption}
      a11yTable={a11yTable}
      className={className}
      style={style}
      footer={footer}
      height={height}
      table={{ columns: [xLabel, yLabel], rows: points.map((p) => [formatX(p.x), formatY(p.y)]) }}
      announcement={focused ? activeBody : null}
      plotProps={focusProps}
    >
      {(width) => {
        const iw = Math.max(width - m.left - m.right, 0);
        const x = linearScale([0, 1], [0, iw]);
        const plotted = points.map((p) => ({ x: x(p.x), y: y(p.y) }));
        const line = linePath(plotted);
        const ap = active !== null ? points[active] : null;
        const nearest = (clientX: number, rect: DOMRect) => {
          const v = (clientX - rect.left) / rect.width;
          let best = 0;
          points.forEach((p, i) => {
            if (Math.abs(p.x - v) < Math.abs(points[best].x - v)) best = i;
          });
          setActive(best);
        };
        return (
          <>
            <svg width={width} height={height} role="img" aria-label={chartLabel(title, description)} className="block overflow-visible">
              <defs>
                <linearGradient id={`${uid}-p`} x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.35 }} />
                  <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.06 }} />
                </linearGradient>
              </defs>
              <g transform={`translate(${m.left},${m.top})`}>
                <ChartAxisY ticks={[0, 0.5, 1]} y={y} width={iw} format={formatY} />
                <ChartAxisX ticks={[0, 0.5, 1]} x={x} y={ih + 16} format={formatX} edgeAnchor width={iw} />
                {points.length > 1 && (
                  <path
                    d={`${line}L${x(1)},${y(1)}L${x(0)},${y(0)}Z`}
                    fill={`url(#${uid}-p)`}
                    opacity={entered ? 1 : 0}
                    className={FADE_CLASS}
                  />
                )}
                {diagonal && (
                  <line x1={0} y1={ih} x2={iw} y2={0} strokeWidth={1.25} strokeDasharray="5 5" style={{ stroke: "var(--muted)", opacity: 0.8 }} />
                )}
                <path d={line} fill="none" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ stroke: color }} {...drawIn(entered)} />
                {threshold && threshold.x > 0 && (
                  <g pointerEvents="none">
                    <path
                      d={`M${x(threshold.x)},${ih}L${x(threshold.x)},${y(threshold.y)}L0,${y(threshold.y)}`}
                      fill="none"
                      strokeWidth={1.25}
                      strokeDasharray="5 5"
                      style={{ stroke: tColor }}
                    />
                    <PulseDot cx={x(threshold.x)} cy={y(threshold.y)} color={tColor} />
                    <text
                      x={x(threshold.x) + 8}
                      y={y(threshold.y) + 16}
                      fontSize={10}
                      fontWeight={700}
                      style={{ fill: tColor, paintOrder: "stroke", stroke: "var(--surface)", strokeWidth: 3 }}
                    >
                      {threshold.label ?? `${formatX(threshold.x)} → ${formatY(threshold.y)}`}
                    </text>
                  </g>
                )}
                {ap && (
                  <g pointerEvents="none">
                    <Crosshair x={x(ap.x)} height={ih} />
                    <HoverDot cx={x(ap.x)} cy={y(ap.y)} color={color} />
                  </g>
                )}
                <rect
                  width={iw}
                  height={ih}
                  fill="transparent"
                  style={{ touchAction: "pan-y" }}
                  onPointerMove={(e) => nearest(e.clientX, e.currentTarget.getBoundingClientRect())}
                  onPointerDown={(e) => nearest(e.clientX, e.currentTarget.getBoundingClientRect())}
                  onPointerLeave={(e) => {
                    if (e.pointerType === "mouse") setActive(null);
                  }}
                />
              </g>
            </svg>
            {ap && activeBody && (
              <ChartTooltip x={m.left + x(ap.x)} y={m.top + y(ap.y)} containerWidth={width}>
                {activeBody}
              </ChartTooltip>
            )}
          </>
        );
      }}
    </ChartFrame>
  );
}
