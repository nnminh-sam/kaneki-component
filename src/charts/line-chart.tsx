"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChartAxisX, ChartAxisY } from "./chart-axis";
import { ChartFrame, chartLabel, type ChartBaseProps } from "./chart-frame";
import { ChartTooltip, ChartTooltipRow, ChartTooltipTitle } from "./chart-tooltip";
import { useActiveIndex, useEntered, useSvgId } from "./hooks";
import { Legend } from "./legend";
import { Crosshair, HoverDot, PulseDot, ReferenceLines, VerticalGradient, drawIn, FADE_CLASS } from "./svg-parts";
import type { BandPoint, ReferenceLine, SeriesData } from "./types";
import {
  CHART_PALETTE,
  areaPath,
  autoTicks,
  bandPath,
  defaultFormatTick,
  defaultFormatValue,
  extent,
  isNum,
  linePath,
  linearScale,
  niceScale,
  resolveMargin,
  type ChartMargin,
  type CurveType,
  type PlotPoint,
} from "./utils";

export interface LineSeries {
  id: string;
  label: string;
  /** One value per x index; `null` / `undefined` leaves a gap (e.g. a forecast starting mid-way). */
  data: SeriesData;
  /** CSS colour. Defaults to the palette (`var(--accent)`, `var(--ok)`, …). */
  color?: string;
  dashed?: boolean;
  /** Fill the area under the line with a fading gradient. */
  area?: boolean;
  /** Default `3` (solid) / `2.5` (dashed). */
  strokeWidth?: number;
  /** Start hidden (uncontrolled; the interactive legend can toggle it). */
  hidden?: boolean;
  /** List in the default tooltip. Default `true`. */
  showInTooltip?: boolean;
  /** List in the built-in legend. Default `true`. */
  showInLegend?: boolean;
}

export interface LineChartProps extends ChartBaseProps {
  series: LineSeries[];
  /** Label per x index, used by the axis, tooltip and data table. */
  xLabels?: ReadonlyArray<string>;
  /** Label for an x index; takes precedence over `xLabels`. */
  formatX?: (index: number) => string;
  /** Indices to label on the x axis. Default: evenly spaced to fit the width. */
  xTicks?: number[];
  /** Header of the first data-table column. Default `"Label"`. */
  xTitle?: string;
  /** Confidence / prediction band, aligned with the x indices. */
  band?: ReadonlyArray<BandPoint | null | undefined>;
  /** Default `var(--accent)`. */
  bandColor?: string;
  /** Tooltip / legend label for the band; the band is listed only when set. */
  bandLabel?: string;
  referenceLines?: ReferenceLine[];
  /** Pulsing dot on the last defined point: `true` for the first series, or a series id. */
  pulseLast?: boolean | string;
  /** Default `linear`. */
  curve?: CurveType;
  /** Force the y domain; each side falls back to the data (always including 0). */
  yMin?: number;
  yMax?: number;
  /** Approximate number of y intervals. Default `4`. */
  ticks?: number;
  /** Plot height in px. Default `280`. */
  height?: number;
  margin?: Partial<ChartMargin>;
  formatValue?: (value: number) => string;
  /** Y-axis tick formatter. Default: compact notation. */
  formatTick?: (value: number) => string;
  /** Hide the y axis labels (gridlines stay). */
  hideYAxis?: boolean;
  /** Built-in legend: `true` static, `"interactive"` toggle buttons that show / hide series. */
  legend?: boolean | "interactive";
  legendPosition?: "top" | "bottom";
  /** Custom tooltip body for an index. Return `null` to hide the tooltip there. */
  renderTooltip?: (index: number) => ReactNode;
  /** Disable hover / keyboard tooltips. */
  disableTooltip?: boolean;
  /** Called when the active (hovered / focused) index changes. */
  onActiveChange?: (index: number | null) => void;
}

const BASE_MARGIN: ChartMargin = { top: 16, right: 16, bottom: 28, left: 52 };

/** Multi-series line chart with optional areas, band, reference lines, crosshair tooltip and pulse dot. */
export function LineChart({
  series,
  xLabels,
  formatX,
  xTicks,
  xTitle = "Label",
  band,
  bandColor = "var(--accent)",
  bandLabel,
  referenceLines = [],
  pulseLast = false,
  curve = "linear",
  yMin,
  yMax,
  ticks = 4,
  height = 280,
  margin,
  formatValue = defaultFormatValue,
  formatTick = defaultFormatTick,
  hideYAxis,
  legend = false,
  legendPosition = "bottom",
  renderTooltip,
  disableTooltip,
  onActiveChange,
  title,
  description,
  showCaption,
  a11yTable,
  animate = true,
  className,
  style,
  footer,
}: LineChartProps) {
  const uid = useSvgId();
  const [hidden, setHidden] = useState<Set<string>>(
    () => new Set(series.filter((s) => s.hidden).map((s) => s.id))
  );
  const colored = useMemo(
    () => series.map((s, i) => ({ ...s, color: s.color ?? CHART_PALETTE[i % CHART_PALETTE.length] })),
    [series]
  );
  const visible = colored.filter((s) => !hidden.has(s.id));
  const n = Math.max(0, ...series.map((s) => s.data.length), band?.length ?? 0, xLabels?.length ?? 0);
  const label = (i: number) => formatX?.(i) ?? xLabels?.[i] ?? String(i + 1);

  const { active, focused, focusProps, pointerProps } = useActiveIndex({
    count: n,
    onChange: onActiveChange,
  });

  const m = resolveMargin(hideYAxis ? { ...BASE_MARGIN, left: 12 } : BASE_MARGIN, margin);
  const ih = Math.max(height - m.top - m.bottom, 0);

  const range = extent([
    0,
    ...visible.flatMap((s) => s.data),
    ...(band ?? []).flatMap((b) => (b ? [b.low, b.high] : [])),
    ...referenceLines.map((r) => r.value),
  ]) ?? [0, 1];
  const scale = niceScale(yMin ?? range[0], yMax ?? range[1], ticks);
  const y = linearScale([scale.min, scale.max], [ih, 0]);

  const tooltipBody = (i: number): ReactNode => {
    if (renderTooltip) return renderTooltip(i);
    const rows = visible
      .filter((s) => s.showInTooltip !== false && isNum(s.data[i]))
      .map((s) => (
        <ChartTooltipRow key={s.id} color={s.color} label={s.label} value={formatValue(s.data[i] as number)} dashed={s.dashed} />
      ));
    const b = band?.[i];
    if (b && bandLabel) {
      rows.push(
        <ChartTooltipRow key="__band" color={bandColor} label={bandLabel} value={`${formatValue(b.low)} – ${formatValue(b.high)}`} dashed />
      );
    }
    referenceLines
      .filter((r) => r.showInTooltip)
      .forEach((r, k) =>
        rows.push(
          <ChartTooltipRow key={`__ref${k}`} color={r.color ?? "var(--muted)"} label={r.label ?? ""} value={formatValue(r.value)} dashed />
        )
      );
    if (!rows.length) return null;
    return (
      <>
        <ChartTooltipTitle>{label(i)}</ChartTooltipTitle>
        {rows}
      </>
    );
  };

  const activeBody = active !== null && !disableTooltip ? tooltipBody(active) : null;

  const legendItems = colored
    .filter((s) => s.showInLegend !== false)
    .map((s) => ({ id: s.id, label: s.label, color: s.color, swatch: s.dashed ? ("dashed" as const) : ("solid" as const) }));
  if (bandLabel && band) legendItems.push({ id: "__band", label: bandLabel, color: bandColor, swatch: "solid" });
  const legendNode = legend ? (
    <Legend
      items={legendItems}
      onToggle={
        legend === "interactive"
          ? (id) =>
              setHidden((prev) => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              })
          : undefined
      }
      inactive={hidden}
    />
  ) : undefined;

  const table = {
    columns: [xTitle, ...colored.map((s) => s.label), ...(band && bandLabel ? [bandLabel] : [])],
    rows: Array.from({ length: n }, (_, i) => [
      label(i),
      ...colored.map((s) => (isNum(s.data[i]) ? formatValue(s.data[i] as number) : "–")),
      ...(band && bandLabel ? [band[i] ? `${formatValue(band[i]!.low)} – ${formatValue(band[i]!.high)}` : "–"] : []),
    ]),
  };

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
      legend={legendNode}
      legendPosition={legendPosition}
      table={table}
      announcement={focused ? activeBody : null}
      plotProps={disableTooltip ? undefined : focusProps}
    >
      {(width) => (
        <LinePlot
          uid={uid}
          width={width}
          height={height}
          m={m}
          ih={ih}
          n={n}
          y={y}
          scale={scale}
          visible={visible}
          band={band}
          bandColor={bandColor}
          referenceLines={referenceLines}
          pulseSeries={pulseLast === true ? visible[0]?.id : pulseLast || undefined}
          curve={curve}
          xTicks={xTicks}
          label={label}
          formatTick={formatTick}
          hideYAxis={hideYAxis}
          animate={animate}
          active={disableTooltip ? null : active}
          activeBody={activeBody}
          overlay={disableTooltip ? undefined : pointerProps("point")}
          ariaLabel={chartLabel(title, description)}
        />
      )}
    </ChartFrame>
  );
}

interface LinePlotProps {
  uid: string;
  width: number;
  height: number;
  m: ChartMargin;
  ih: number;
  n: number;
  y: (v: number) => number;
  scale: { min: number; max: number; ticks: number[] };
  visible: (LineSeries & { color: string })[];
  band?: ReadonlyArray<BandPoint | null | undefined>;
  bandColor: string;
  referenceLines: ReferenceLine[];
  pulseSeries?: string;
  curve: CurveType;
  xTicks?: number[];
  label: (i: number) => string;
  formatTick: (v: number) => string;
  hideYAxis?: boolean;
  animate: boolean;
  active: number | null;
  activeBody: ReactNode;
  overlay?: ReturnType<ReturnType<typeof useActiveIndex>["pointerProps"]>;
  ariaLabel?: string;
}

function LinePlot({
  uid,
  width,
  height,
  m,
  ih,
  n,
  y,
  scale,
  visible,
  band,
  bandColor,
  referenceLines,
  pulseSeries,
  curve,
  xTicks,
  label,
  formatTick,
  hideYAxis,
  animate,
  active,
  activeBody,
  overlay,
  ariaLabel,
}: LinePlotProps) {
  const entered = useEntered(true, animate);
  const iw = Math.max(width - m.left - m.right, 0);
  const x = (i: number) => (n <= 1 ? iw / 2 : (i / (n - 1)) * iw);
  const points = (data: SeriesData): PlotPoint[] =>
    Array.from({ length: n }, (_, i) => (isNum(data[i]) ? { x: x(i), y: y(data[i] as number) } : null));
  const baseY = y(Math.max(scale.min, Math.min(0, scale.max)));

  const bandD = band
    ? bandPath(
        Array.from({ length: n }, (_, i) => (band[i] ? { x: x(i), y: y(band[i]!.high) } : null)),
        Array.from({ length: n }, (_, i) => (band[i] ? { x: x(i), y: y(band[i]!.low) } : null)),
        curve
      )
    : "";

  const pulse = visible.find((s) => s.id === pulseSeries);
  let pulsePoint: { x: number; y: number } | null = null;
  if (pulse) {
    for (let i = n - 1; i >= 0; i--) {
      const v = pulse.data[i];
      if (isNum(v)) {
        pulsePoint = { x: x(i), y: y(v) };
        break;
      }
    }
  }

  const activeValues =
    active === null ? [] : visible.filter((s) => isNum(s.data[active])).map((s) => ({ s, py: y(s.data[active] as number) }));
  const anchorY = activeValues[0]?.py ?? ih / 2;

  return (
    <>
      <svg width={width} height={height} role="img" aria-label={ariaLabel} className="block overflow-visible">
        <defs>
          {visible
            .filter((s) => s.area)
            .map((s) => (
              <VerticalGradient key={s.id} id={`${uid}-a-${s.id.replace(/[^a-zA-Z0-9_-]/g, "")}`} color={s.color} />
            ))}
        </defs>
        <g transform={`translate(${m.left},${m.top})`}>
          <ChartAxisY ticks={scale.ticks} y={y} width={iw} format={formatTick} hideLabels={hideYAxis} />
          <ChartAxisX ticks={xTicks ?? autoTicks(n, iw)} x={x} y={ih + 18} format={label} />
          <ReferenceLines lines={referenceLines} y={y} width={iw} min={scale.min} max={scale.max} />
          {bandD && (
            <path d={bandD} style={{ fill: bandColor }} opacity={entered ? 0.14 : 0} className={FADE_CLASS} />
          )}
          {visible.map((s) =>
            s.area ? (
              <path
                key={`area-${s.id}`}
                d={areaPath(points(s.data), baseY, curve)}
                fill={`url(#${uid}-a-${s.id.replace(/[^a-zA-Z0-9_-]/g, "")})`}
                opacity={entered ? 1 : 0}
                className={FADE_CLASS}
              />
            ) : null
          )}
          {visible.map((s) => (
            <path
              key={`line-${s.id}`}
              d={linePath(points(s.data), curve)}
              fill="none"
              strokeWidth={s.strokeWidth ?? (s.dashed ? 2.5 : 3)}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ stroke: s.color }}
              {...drawIn(entered, s.dashed)}
            />
          ))}
          {pulse && pulsePoint && <PulseDot cx={pulsePoint.x} cy={pulsePoint.y} color={pulse.color} />}
          {active !== null && (
            <g pointerEvents="none">
              <Crosshair x={x(active)} height={ih} />
              {activeValues.map(({ s, py }) => (
                <HoverDot key={s.id} cx={x(active)} cy={py} color={s.color} />
              ))}
            </g>
          )}
          {overlay && <rect width={iw} height={ih} fill="transparent" {...overlay} />}
        </g>
      </svg>
      {active !== null && activeBody && (
        <ChartTooltip x={m.left + x(active)} y={m.top + anchorY} containerWidth={width}>
          {activeBody}
        </ChartTooltip>
      )}
    </>
  );
}

export type AreaChartProps = LineChartProps;

/** `LineChart` whose series default to `area: true`. */
export function AreaChart({ series, ...props }: AreaChartProps) {
  const withArea = useMemo(() => series.map((s) => ({ area: true, ...s })), [series]);
  return <LineChart series={withArea} {...props} />;
}
