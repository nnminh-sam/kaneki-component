"use client";

import type { ReactNode } from "react";
import { ChartFrame, chartLabel, type ChartBaseProps } from "./chart-frame";
import { useActiveIndex, useEntered } from "./hooks";
import { Legend, LegendItem } from "./legend";
import { defaultFormatPercent, defaultFormatValue } from "./utils";

export interface DonutSegment {
  /** Stable key; defaults to the index. */
  id?: string;
  label: string;
  value: number;
  /** CSS colour, ideally a theme variable. */
  color: string;
}

export interface DonutCenterContext {
  active: DonutSegment | null;
  activeIndex: number | null;
  total: number;
  /** Active segment's share of the total (0–1), or `null`. */
  fraction: number | null;
}

export interface DonutChartProps extends ChartBaseProps {
  segments: DonutSegment[];
  /** Total the shares are computed against. Default: sum of segment values. */
  total?: number;
  /** Outer diameter in px. Default `220`. */
  size?: number;
  /** Ring thickness in px. Default `26`. */
  thickness?: number;
  /** Controlled active segment (`null` = none). */
  activeIndex?: number | null;
  defaultActiveIndex?: number | null;
  onActiveChange?: (index: number | null) => void;
  /** Centre content. A function receives the active segment and totals. Default: label, value and share. */
  center?: ReactNode | ((ctx: DonutCenterContext) => ReactNode);
  /** Centre label when nothing is active. Default `"Total"`. */
  centerLabel?: string;
  formatValue?: (value: number) => string;
  /** Share formatter for 0–1 fractions. */
  formatPercent?: (fraction: number) => string;
  /** Built-in legend with values; hovering / focusing an item highlights its segment. */
  legend?: boolean;
  legendPosition?: "right" | "bottom";
  /** Legend item click (e.g. navigate to a detail section). Items become buttons when set. */
  onSegmentClick?: (index: number) => void;
}

/** Donut chart with an enlarge-on-hover / focus segment and a centre slot. */
export function DonutChart({
  segments,
  total: totalProp,
  size = 220,
  thickness = 26,
  activeIndex,
  defaultActiveIndex = null,
  onActiveChange,
  center,
  centerLabel = "Total",
  formatValue = defaultFormatValue,
  formatPercent = defaultFormatPercent,
  legend,
  legendPosition = "right",
  onSegmentClick,
  title,
  description,
  showCaption,
  a11yTable,
  animate = true,
  className,
  style,
  footer,
}: DonutChartProps) {
  const total = totalProp ?? segments.reduce((s, d) => s + Math.max(d.value, 0), 0);
  const { active, setActive, focused, focusProps } = useActiveIndex({
    count: segments.length,
    value: activeIndex,
    defaultValue: defaultActiveIndex,
    onChange: onActiveChange,
  });
  const entered = useEntered(true, animate);
  const act = active !== null ? segments[active] ?? null : null;
  const fraction = act && total ? act.value / total : null;

  const r = (size - thickness) / 2 - 6;
  const C = 2 * Math.PI * r;
  const mid = size / 2;
  let offset = 0;

  const ctx: DonutCenterContext = { active: act, activeIndex: active, total, fraction };
  const centerNode =
    typeof center === "function" ? (
      center(ctx)
    ) : center !== undefined ? (
      center
    ) : (
      <>
        <span className="max-w-[110px] truncate text-xs font-medium text-muted">{act ? act.label : centerLabel}</span>
        <span className="text-2xl font-extrabold tracking-tight tabular-nums text-fg">
          {formatValue(act ? act.value : total)}
        </span>
        {fraction !== null && <span className="text-xs font-bold text-accent">{formatPercent(fraction)}</span>}
      </>
    );

  const announcement =
    focused && act ? `${act.label}: ${formatValue(act.value)}${fraction !== null ? `, ${formatPercent(fraction)}` : ""}` : null;

  const legendNode = legend ? (
    <Legend layout={legendPosition === "right" ? "grid" : "row"}>
      {segments.map((s, i) => (
        <LegendItem
          key={s.id ?? i}
          label={s.label}
          color={s.color}
          value={total ? formatPercent(s.value / total) : undefined}
          muted={active !== null && active !== i}
          onClick={onSegmentClick ? () => onSegmentClick(i) : undefined}
          onHighlight={(on) => setActive(on ? i : null)}
          className="text-[13px] text-fg"
        />
      ))}
    </Legend>
  ) : undefined;

  return (
    <ChartFrame
      title={title}
      description={description}
      showCaption={showCaption}
      a11yTable={a11yTable}
      className={className}
      style={style}
      footer={footer}
      height={size}
      plotWidth={size}
      legend={legendNode}
      legendPosition={legendPosition}
      table={{
        columns: ["Segment", "Value", "Share"],
        rows: segments.map((s) => [s.label, formatValue(s.value), total ? formatPercent(s.value / total) : "–"]),
      }}
      announcement={announcement}
      plotProps={{ ...focusProps, className: "mx-auto shrink-0" }}
    >
      {() => (
        <>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            role="img"
            aria-label={chartLabel(title, description)}
            className="block"
          >
            <g transform={`rotate(-90 ${mid} ${mid})`}>
              <circle cx={mid} cy={mid} r={r} fill="none" strokeWidth={thickness} style={{ stroke: "var(--surface-subtle)" }} />
              {segments.map((s, i) => {
                const len = total ? (Math.max(s.value, 0) / total) * C : 0;
                const gap = len > 6 ? 3 : 0;
                const start = offset;
                offset += len;
                const isActive = active === i;
                return (
                  <g
                    key={s.id ?? i}
                    style={{ opacity: entered ? 1 : 0, transitionDelay: `${i * 80}ms` }}
                    className="motion-safe:transition-opacity motion-safe:duration-[600ms]"
                  >
                    <circle
                      cx={mid}
                      cy={mid}
                      r={r}
                      fill="none"
                      strokeWidth={isActive ? thickness + 8 : thickness}
                      strokeDasharray={`${Math.max(len - gap, 0)} ${C}`}
                      strokeDashoffset={-start}
                      className="cursor-pointer transition-[stroke-width,opacity] duration-250 ease-out"
                      style={{ stroke: s.color, opacity: active !== null && !isActive ? 0.3 : 1, touchAction: "manipulation" }}
                      onPointerEnter={() => setActive(i)}
                      onPointerDown={() => setActive(i)}
                      onPointerLeave={(e) => {
                        if (e.pointerType === "mouse") setActive(null);
                      }}
                    />
                  </g>
                );
              })}
            </g>
          </svg>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            {centerNode}
          </div>
        </>
      )}
    </ChartFrame>
  );
}
