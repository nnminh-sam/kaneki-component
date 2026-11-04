"use client";

import type { ReactNode } from "react";
import { ChartAxisX, ChartAxisY } from "./chart-axis";
import { ChartFrame, chartLabel, type ChartBaseProps } from "./chart-frame";
import { ChartTooltip, ChartTooltipNote, ChartTooltipRow, ChartTooltipTitle } from "./chart-tooltip";
import { useActiveIndex, useEntered, useSvgId } from "./hooks";
import { Legend, type LegendItemData } from "./legend";
import { GlowFilter, GROW_CLASS, PulseDot, ReferenceLines, VerticalGradient, drawIn } from "./svg-parts";
import type { OverlayLine, ReferenceLine } from "./types";
import {
  CHART_PALETTE,
  autoTicks,
  defaultFormatTick,
  defaultFormatValue,
  extent,
  isNum,
  linePath,
  linearScale,
  niceScale,
  resolveMargin,
  type ChartMargin,
} from "./utils";

export interface BarMarker {
  /** Glyph drawn in the marker badge. Default `"!"`. */
  symbol?: string;
  /** Default `var(--danger)`. */
  color?: string;
  /** Glow the bar itself. Default `true`. */
  glow?: boolean;
  /** Line shown at the bottom of the default tooltip (e.g. "Outlier"). */
  note?: string;
}

export interface BarDatum {
  /** `null` draws no bar (see `placeholder`). */
  value: number | null;
  /** Overrides the chart colour for this bar. */
  color?: string;
  /** 0–1 opacity, e.g. to encode volume. */
  opacity?: number;
  /** Projected value drawn as a dashed outline bar behind the real one. */
  ghost?: number;
  /** Badge above the bar (e.g. an anomaly "!") with an optional glow. */
  marker?: boolean | BarMarker;
  /** Draw a thin stub on the baseline (a slot with no data yet). */
  placeholder?: boolean;
}

export interface BarChartProps extends ChartBaseProps {
  /** One entry per bar: a plain number or a `BarDatum` with per-bar overrides. */
  data: ReadonlyArray<number | null | BarDatum>;
  xLabels?: ReadonlyArray<string>;
  formatX?: (index: number) => string;
  /** Indices to label on the x axis. Default: every bar if it fits, else evenly spaced. */
  xTicks?: number[];
  /** Header of the first data-table column. Default `"Label"`. */
  xTitle?: string;
  /** Series name used in the legend, tooltip and data table. Default `"Value"`. */
  seriesLabel?: string;
  /** Bar colour. Default `var(--accent)`. */
  color?: string;
  /** Fill bars with a top-to-bottom fade. */
  gradient?: boolean;
  /** Label for ghost values in the tooltip / table. Default `"Projected"`. */
  ghostLabel?: string;
  referenceLines?: ReferenceLine[];
  /** Lines drawn over the bars (e.g. a moving average), aligned with the bar indices. */
  lines?: OverlayLine[];
  /** Emphasise the largest bar: `true` uses `var(--warn)`, or pass a colour. */
  highlightMax?: boolean | string;
  /** Emphasise a specific bar (bold label, value shown with `showValues="hover"`). */
  highlightIndex?: number;
  /** Value labels above bars: `hover` = active + highlighted bars. Default `none`. */
  showValues?: "none" | "hover" | "all";
  /** Hide the y axis (gridlines and labels). */
  hideYAxis?: boolean;
  /** Bar width as a fraction of its slot. Default `0.62`. */
  barWidthRatio?: number;
  /** Default `48`. */
  maxBarWidth?: number;
  /** Corner radius. Default `4` (clamped to half the bar width). */
  radius?: number;
  /** Dim other bars while one is active. Default `true`. */
  dimOnHover?: boolean;
  yMax?: number;
  /** Approximate number of y intervals. Default `4`. */
  ticks?: number;
  /** Plot height in px. Default `260`. */
  height?: number;
  margin?: Partial<ChartMargin>;
  formatValue?: (value: number) => string;
  formatTick?: (value: number) => string;
  /** Built-in static legend (bars + overlay lines). */
  legend?: boolean;
  legendPosition?: "top" | "bottom";
  /** Custom tooltip body. Return `null` to hide the tooltip for that bar. */
  renderTooltip?: (index: number) => ReactNode;
  disableTooltip?: boolean;
  onActiveChange?: (index: number | null) => void;
}

const toDatum = (d: number | null | BarDatum): BarDatum => (d !== null && typeof d === "object" ? d : { value: d });
const markerOf = (m: BarDatum["marker"]): Required<Omit<BarMarker, "note">> & { note?: string } | null =>
  m ? { symbol: "!", color: "var(--danger)", glow: true, ...(m === true ? {} : m) } : null;

/** Bar chart with per-bar overrides, ghost projections, markers, reference and overlay lines. */
export function BarChart({
  data,
  xLabels,
  formatX,
  xTicks,
  xTitle = "Label",
  seriesLabel = "Value",
  color = "var(--accent)",
  gradient,
  ghostLabel = "Projected",
  referenceLines = [],
  lines = [],
  highlightMax,
  highlightIndex,
  showValues = "none",
  hideYAxis,
  barWidthRatio = 0.62,
  maxBarWidth = 48,
  radius = 4,
  dimOnHover = true,
  yMax,
  ticks = 4,
  height = 260,
  margin,
  formatValue = defaultFormatValue,
  formatTick = defaultFormatTick,
  legend,
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
}: BarChartProps) {
  const uid = useSvgId();
  const bars = data.map(toDatum);
  const n = bars.length;
  const overlays = lines.map((l, i) => ({ ...l, color: l.color ?? CHART_PALETTE[(i + 1) % CHART_PALETTE.length] }));
  const label = (i: number) => formatX?.(i) ?? xLabels?.[i] ?? String(i + 1);

  let maxIndex = -1;
  if (highlightMax) {
    let best = -Infinity;
    bars.forEach((b, i) => {
      if (isNum(b.value) && b.value > best && b.value > 0) {
        best = b.value;
        maxIndex = i;
      }
    });
  }
  const highlightColor = typeof highlightMax === "string" ? highlightMax : "var(--warn)";
  const emphasized = (i: number) => i === highlightIndex || i === maxIndex;
  const barColor = (b: BarDatum, i: number) => b.color ?? (i === maxIndex ? highlightColor : color);

  const { active, focused, focusProps, pointerProps } = useActiveIndex({ count: n, onChange: onActiveChange });

  const m = resolveMargin(
    hideYAxis ? { top: 24, right: 8, bottom: 26, left: 8 } : { top: 20, right: 16, bottom: 28, left: 52 },
    margin
  );
  const ih = Math.max(height - m.top - m.bottom, 0);
  const range = extent([
    0,
    ...bars.flatMap((b) => [b.value, b.ghost]),
    ...overlays.flatMap((l) => l.data),
    ...referenceLines.map((r) => r.value),
  ]) ?? [0, 1];
  // Axis mode rounds to nice ticks; axis-less mode keeps headroom for value labels.
  const scale = hideYAxis
    ? { min: range[0] < 0 ? range[0] * 1.12 : 0, max: yMax ?? (range[1] > 0 ? range[1] * 1.12 : 1), ticks: [] as number[] }
    : niceScale(range[0] < 0 ? range[0] * 1.08 : 0, yMax ?? range[1] * 1.08, ticks);
  const y = linearScale([scale.min, scale.max], [ih, 0]);
  const clampY = (v: number) => y(Math.max(scale.min, Math.min(scale.max, v)));

  const tooltipBody = (i: number): ReactNode => {
    if (renderTooltip) return renderTooltip(i);
    const b = bars[i];
    if (!isNum(b.value) && !isNum(b.ghost)) return null;
    const marker = markerOf(b.marker);
    return (
      <>
        <ChartTooltipTitle>{label(i)}</ChartTooltipTitle>
        {isNum(b.value) && <ChartTooltipRow color={barColor(b, i)} label={seriesLabel} value={formatValue(b.value)} />}
        {isNum(b.ghost) && <ChartTooltipRow color={color} label={ghostLabel} value={formatValue(b.ghost)} dashed />}
        {overlays
          .filter((l) => l.showInTooltip !== false && isNum(l.data[i]))
          .map((l) => (
            <ChartTooltipRow key={l.id} color={l.color} label={l.label} value={formatValue(l.data[i] as number)} dashed={l.dashed} />
          ))}
        {marker?.note && <ChartTooltipNote color={marker.color}>{marker.note}</ChartTooltipNote>}
      </>
    );
  };
  const activeBody = active !== null && !disableTooltip ? tooltipBody(active) : null;

  const legendItems: LegendItemData[] = [
    { id: "__bars", label: seriesLabel, color },
    ...overlays.map((l) => ({ id: l.id, label: l.label, color: l.color, swatch: l.dashed ? ("dashed" as const) : ("solid" as const) })),
  ];

  const table = {
    columns: [
      xTitle,
      seriesLabel,
      ...(bars.some((b) => isNum(b.ghost)) ? [ghostLabel] : []),
      ...overlays.map((l) => l.label),
    ],
    rows: bars.map((b, i) => [
      label(i),
      isNum(b.value) ? formatValue(b.value) : "–",
      ...(bars.some((d) => isNum(d.ghost)) ? [isNum(b.ghost) ? formatValue(b.ghost) : "–"] : []),
      ...overlays.map((l) => (isNum(l.data[i]) ? formatValue(l.data[i] as number) : "–")),
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
      legend={legend ? <Legend items={legendItems} /> : undefined}
      legendPosition={legendPosition}
      table={table}
      announcement={focused ? activeBody : null}
      plotProps={disableTooltip ? undefined : focusProps}
    >
      {(width) => {
        const iw = Math.max(width - m.left - m.right, 0);
        const slot = n ? iw / n : iw;
        const bw = Math.min(Math.max(slot * barWidthRatio, 2), maxBarWidth);
        const cx = (i: number) => i * slot + slot / 2;
        const anchor = active !== null ? bars[active] : null;
        const anchorTop = anchor ? Math.max(isNum(anchor.value) ? anchor.value : 0, isNum(anchor.ghost) ? anchor.ghost : 0) : 0;
        const defaultTicks = n * 28 <= iw ? bars.map((_, i) => i) : autoTicks(n, iw, 36);
        return (
          <>
            <BarPlot
              uid={uid}
              width={width}
              height={height}
              m={m}
              iw={iw}
              ih={ih}
              bars={bars}
              bw={bw}
              cx={cx}
              y={y}
              clampY={clampY}
              scale={scale}
              color={color}
              gradient={gradient}
              barColor={barColor}
              radius={radius}
              overlays={overlays}
              referenceLines={referenceLines}
              hideYAxis={hideYAxis}
              formatTick={formatTick}
              formatValue={formatValue}
              xTicks={xTicks ?? defaultTicks}
              label={label}
              emphasized={emphasized}
              showValues={showValues}
              active={disableTooltip ? null : active}
              dimOnHover={dimOnHover}
              animate={animate}
              overlay={disableTooltip ? undefined : pointerProps("band")}
              ariaLabel={chartLabel(title, description)}
            />
            {active !== null && activeBody && (
              <ChartTooltip x={m.left + cx(active)} y={m.top + clampY(anchorTop)} containerWidth={width}>
                {activeBody}
              </ChartTooltip>
            )}
          </>
        );
      }}
    </ChartFrame>
  );
}

interface BarPlotProps {
  uid: string;
  width: number;
  height: number;
  m: ChartMargin;
  iw: number;
  ih: number;
  bars: BarDatum[];
  bw: number;
  cx: (i: number) => number;
  y: (v: number) => number;
  clampY: (v: number) => number;
  scale: { min: number; max: number; ticks: number[] };
  color: string;
  gradient?: boolean;
  barColor: (b: BarDatum, i: number) => string;
  radius: number;
  overlays: (OverlayLine & { color: string })[];
  referenceLines: ReferenceLine[];
  hideYAxis?: boolean;
  formatTick: (v: number) => string;
  formatValue: (v: number) => string;
  xTicks: number[];
  label: (i: number) => string;
  emphasized: (i: number) => boolean;
  showValues: "none" | "hover" | "all";
  active: number | null;
  dimOnHover: boolean;
  animate: boolean;
  overlay?: ReturnType<ReturnType<typeof useActiveIndex>["pointerProps"]>;
  ariaLabel?: string;
}

function BarPlot({
  uid,
  width,
  height,
  m,
  iw,
  ih,
  bars,
  bw,
  cx,
  y,
  clampY,
  scale,
  gradient,
  barColor,
  radius,
  overlays,
  referenceLines,
  hideYAxis,
  formatTick,
  formatValue,
  xTicks,
  label,
  emphasized,
  showValues,
  active,
  dimOnHover,
  animate,
  overlay,
  ariaLabel,
}: BarPlotProps) {
  const entered = useEntered(true, animate);
  const base = clampY(0);
  const rx = Math.min(bw / 2, radius);
  const colors = Array.from(new Set(bars.map(barColor)));
  const gradId = (c: string) => `${uid}-g${colors.indexOf(c)}`;
  const stagger = Math.min(18, 600 / Math.max(bars.length, 1));

  return (
    <svg width={width} height={height} role="img" aria-label={ariaLabel} className="block overflow-visible">
      <defs>
        <GlowFilter id={`${uid}-glow`} />
        {gradient && colors.map((c) => <VerticalGradient key={c} id={gradId(c)} color={c} from={1} to={0.25} />)}
      </defs>
      <g transform={`translate(${m.left},${m.top})`}>
        {!hideYAxis && <ChartAxisY ticks={scale.ticks} y={y} width={iw} format={formatTick} />}
        <ChartAxisX ticks={xTicks} x={cx} y={ih + 18} format={label} emphasize={emphasized} />

        {bars.map((b, i) => {
          const x0 = cx(i) - bw / 2;
          const c = barColor(b, i);
          const dim = dimOnHover && active !== null && active !== i ? 0.4 : 1;
          const marker = markerOf(b.marker);
          const ghost = isNum(b.ghost) && (!isNum(b.value) || Math.abs(b.ghost) > Math.abs(b.value)) ? b.ghost : null;
          return (
            <g key={i}>
              {ghost !== null && (
                <rect
                  x={x0}
                  y={Math.min(clampY(ghost), base)}
                  width={bw}
                  height={Math.abs(base - clampY(ghost))}
                  rx={rx}
                  fill="transparent"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  style={{ stroke: c, opacity: entered ? 0.8 : 0 }}
                  className="motion-safe:transition-opacity motion-safe:duration-500"
                />
              )}
              {b.placeholder && !isNum(b.value) && (
                <rect x={x0} y={base - 3} width={bw} height={3} rx={1.5} style={{ fill: "var(--border)", opacity: 0.8 }} />
              )}
              {isNum(b.value) && (
                <g
                  className={GROW_CLASS}
                  style={{
                    transformBox: "fill-box",
                    transformOrigin: b.value >= 0 ? "bottom" : "top",
                    transform: entered ? "scaleY(1)" : "scaleY(0)",
                    transitionDelay: `${i * stagger}ms`,
                  }}
                >
                  <rect
                    x={x0}
                    y={Math.min(clampY(b.value), base)}
                    width={bw}
                    height={Math.max(Math.abs(base - clampY(b.value)), b.value !== 0 ? 2 : 0)}
                    rx={rx}
                    fill={gradient ? `url(#${gradId(c)})` : undefined}
                    filter={marker?.glow ? `url(#${uid}-glow)` : undefined}
                    style={{ fill: gradient ? undefined : c, opacity: (b.opacity ?? 1) * dim }}
                    className="transition-opacity duration-200"
                  />
                </g>
              )}
            </g>
          );
        })}

        <ReferenceLines lines={referenceLines} y={y} width={iw} min={scale.min} max={scale.max} />

        {overlays.map((l) => (
          <path
            key={l.id}
            d={linePath(bars.map((_, i) => (isNum(l.data[i]) ? { x: cx(i), y: clampY(l.data[i] as number) } : null)))}
            fill="none"
            strokeWidth={l.strokeWidth ?? 2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            pointerEvents="none"
            style={{ stroke: l.color }}
            {...drawIn(entered, l.dashed)}
          />
        ))}

        {bars.map((b, i) => {
          const marker = markerOf(b.marker);
          if (!marker || !isNum(b.value)) return null;
          return (
            <g key={`mk-${i}`} transform={`translate(${cx(i)}, ${Math.max(clampY(Math.max(b.value, 0)) - 12, 6)})`} pointerEvents="none">
              <PulseDot cx={0} cy={0} r={7} color={marker.color} />
              <text textAnchor="middle" dy="0.35em" fontSize={10} fontWeight={900} style={{ fill: "var(--surface)" }}>
                {marker.symbol}
              </text>
            </g>
          );
        })}

        {showValues !== "none" &&
          bars.map((b, i) => {
            if (!isNum(b.value)) return null;
            const show = showValues === "all" || active === i || emphasized(i);
            if (!show || bars[i].marker) return null;
            const top = Math.max(b.value, isNum(b.ghost) ? b.ghost : -Infinity);
            const text =
              isNum(b.ghost) && active === i ? `${formatValue(b.value)} → ${formatValue(b.ghost)}` : formatValue(b.value);
            return (
              <text
                key={`v-${i}`}
                x={cx(i)}
                y={clampY(Math.max(top, 0)) - 7}
                textAnchor="middle"
                fontSize={11}
                fontWeight={700}
                pointerEvents="none"
                style={{ fill: "var(--fg)", paintOrder: "stroke", stroke: "var(--surface)", strokeWidth: 3 }}
              >
                {text}
              </text>
            );
          })}

        {overlay && <rect width={iw} height={ih} fill="transparent" {...overlay} />}
      </g>
    </svg>
  );
}
