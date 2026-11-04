"use client";

import type { ReactNode } from "react";
import { defaultFormatTick } from "./utils";

export interface ChartAxisYProps {
  ticks: number[];
  /** Maps a value to a y position in plot coordinates. */
  y: (value: number) => number;
  /** Plot width; gridlines span `0 → width`. */
  width: number;
  format?: (value: number) => string;
  /** Hide the tick labels and keep only gridlines. */
  hideLabels?: boolean;
  /** Hide the gridlines and keep only labels. */
  hideGrid?: boolean;
  /** Distance between the plot edge and the labels. Default `8`. */
  labelOffset?: number;
}

/** Horizontal gridlines with right-aligned tick labels left of the plot. Render inside the plot `<g>`. */
export function ChartAxisY({
  ticks,
  y,
  width,
  format = defaultFormatTick,
  hideLabels,
  hideGrid,
  labelOffset = 8,
}: ChartAxisYProps) {
  return (
    <g aria-hidden="true">
      {ticks.map((t) => (
        <g key={t} transform={`translate(0, ${y(t)})`}>
          {!hideGrid && (
            <line
              x1={0}
              x2={width}
              strokeDasharray="2 4"
              style={{ stroke: "var(--border)", strokeOpacity: t === 0 ? 1 : 0.8 }}
            />
          )}
          {!hideLabels && (
            <text
              x={-labelOffset}
              dy="0.32em"
              textAnchor="end"
              fontSize={11}
              fontWeight={500}
              style={{ fill: "var(--muted)" }}
            >
              {format(t)}
            </text>
          )}
        </g>
      ))}
    </g>
  );
}

export interface ChartAxisXProps {
  /** Indices (or values) to label. */
  ticks: number[];
  /** Maps a tick to an x position in plot coordinates. */
  x: (tick: number) => number;
  /** Baseline y of the labels (usually plot height + 18). */
  y: number;
  format: (tick: number) => ReactNode;
  /** Ticks drawn bold in the foreground colour. */
  emphasize?: (tick: number) => boolean;
  /** Anchor first / last labels to the plot edges instead of centring them. */
  edgeAnchor?: boolean;
  /** Plot width, required for `edgeAnchor`. */
  width?: number;
}

/** Tick labels under the plot. Render inside the plot `<g>`. */
export function ChartAxisX({ ticks, x, y, format, emphasize, edgeAnchor, width = 0 }: ChartAxisXProps) {
  return (
    <g aria-hidden="true">
      {ticks.map((t) => {
        const px = x(t);
        const strong = emphasize?.(t);
        const anchor = edgeAnchor && px <= 0 ? "start" : edgeAnchor && px >= width ? "end" : "middle";
        return (
          <text
            key={t}
            x={px}
            y={y}
            textAnchor={anchor}
            fontSize={11}
            fontWeight={strong ? 700 : 500}
            style={{ fill: strong ? "var(--fg)" : "var(--muted)" }}
          >
            {format(t)}
          </text>
        );
      })}
    </g>
  );
}
