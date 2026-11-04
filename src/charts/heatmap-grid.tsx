"use client";

import { useState, type FocusEvent, type KeyboardEvent, type ReactNode } from "react";
import { ChartFrame, chartLabel, type ChartBaseProps } from "./chart-frame";
import { useEntered } from "./hooks";
import { clamp, defaultFormatValue, isNum, mix } from "./utils";

export interface HeatmapCell {
  row: number;
  col: number;
  value: number | null;
  rowLabel: string;
  colLabel: string;
}

export interface HeatmapGridProps extends ChartBaseProps {
  /** `values[row][col]`; `null` / `0` cells render empty. */
  values: ReadonlyArray<ReadonlyArray<number | null | undefined>>;
  rowLabels?: ReadonlyArray<string>;
  /** Column labels; use `""` to leave a column unlabelled (sparse labels). */
  colLabels?: ReadonlyArray<string>;
  /** Full column names for the readout / table when `colLabels` is sparse. */
  colNames?: ReadonlyArray<string>;
  /** Base colour mixed by intensity. Default `var(--accent)`. */
  color?: string;
  /** Intensity domain max. Default: largest value. */
  max?: number;
  /** Lowest non-empty intensity (0–1). Default `0.2`. */
  minIntensity?: number;
  /** Cells above this intensity glow. Default `0.7`; `1` disables. */
  glowAbove?: number;
  /** Cell height in px. Default `22`. */
  cellHeight?: number;
  /** Gap between cells in px. Default `4`. */
  gap?: number;
  /** Width reserved for row labels. Default `36`. */
  rowLabelWidth?: number;
  formatValue?: (value: number) => string;
  /** Readout under the grid for the active cell (or `null`). */
  renderReadout?: (cell: HeatmapCell | null) => ReactNode;
  /** Readout text when no cell is active and `renderReadout` is not set. */
  placeholder?: ReactNode;
  /** Show the Less → More scale. Default `true`. */
  showScale?: boolean;
  lessLabel?: string;
  moreLabel?: string;
  onActiveChange?: (cell: HeatmapCell | null) => void;
}

const COL_LABEL_SPACE = 18;

/** Rows × columns intensity grid (e.g. weekday × hour) with keyboard navigation and a readout. */
export function HeatmapGrid({
  values,
  rowLabels = [],
  colLabels = [],
  colNames,
  color = "var(--accent)",
  max: maxProp,
  minIntensity = 0.2,
  glowAbove = 0.7,
  cellHeight = 22,
  gap = 4,
  rowLabelWidth = 36,
  formatValue = defaultFormatValue,
  renderReadout,
  placeholder,
  showScale = true,
  lessLabel = "Less",
  moreLabel = "More",
  onActiveChange,
  title,
  description,
  showCaption,
  a11yTable,
  animate = true,
  className,
  style,
  footer,
}: HeatmapGridProps) {
  const rows = values.length;
  const cols = Math.max(0, ...values.map((r) => r.length));
  const max = maxProp ?? Math.max(0, ...values.flat().filter(isNum));
  const [active, setActiveState] = useState<{ r: number; c: number } | null>(null);
  const [focused, setFocused] = useState(false);
  const entered = useEntered(true, animate);
  const height = rows * (cellHeight + gap) - gap + COL_LABEL_SPACE;

  const colName = (c: number) => colNames?.[c] ?? colLabels[c] ?? String(c + 1);
  const rowName = (r: number) => rowLabels[r] ?? String(r + 1);
  const cellAt = (pos: { r: number; c: number } | null): HeatmapCell | null => {
    if (!pos) return null;
    const v = values[pos.r]?.[pos.c];
    return { row: pos.r, col: pos.c, value: isNum(v) ? v : null, rowLabel: rowName(pos.r), colLabel: colName(pos.c) };
  };
  const setActive = (pos: { r: number; c: number } | null) => {
    if (pos?.r === active?.r && pos?.c === active?.c) return;
    setActiveState(pos);
    onActiveChange?.(cellAt(pos));
  };

  const intensity = (v: number) => (max > 0 ? clamp(v / max, 0, 1) : 0);
  const fillFor = (v: number | null | undefined) =>
    isNum(v) && v > 0 ? mix(color, (minIntensity + intensity(v) * (1 - minIntensity)) * 100) : "var(--surface-subtle)";

  const cell = cellAt(active);
  const readout = renderReadout
    ? renderReadout(cell)
    : cell
      ? `${cell.rowLabel} · ${cell.colLabel} · ${cell.value !== null ? formatValue(cell.value) : "–"}`
      : placeholder;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!rows || !cols) return;
    const cur = active ?? { r: 0, c: 0 };
    const moves: Record<string, { r: number; c: number } | null> = {
      ArrowRight: { r: cur.r, c: cur.c + 1 },
      ArrowLeft: { r: cur.r, c: cur.c - 1 },
      ArrowDown: { r: cur.r + 1, c: cur.c },
      ArrowUp: { r: cur.r - 1, c: cur.c },
      Home: { r: cur.r, c: 0 },
      End: { r: cur.r, c: cols - 1 },
      Escape: null,
    };
    if (!(e.key in moves)) return;
    e.preventDefault();
    const next = moves[e.key];
    setActive(active === null && next ? cur : next && { r: clamp(next.r, 0, rows - 1), c: clamp(next.c, 0, cols - 1) });
  };

  const plotProps = {
    tabIndex: 0,
    onKeyDown,
    onFocus: (e: FocusEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      setFocused(true);
      let keyboard = true;
      try {
        keyboard = e.currentTarget.matches(":focus-visible");
      } catch {
        /* assume keyboard */
      }
      if (keyboard && !active) setActive({ r: 0, c: 0 });
    },
    onBlur: () => {
      setFocused(false);
      setActive(null);
    },
  };

  const scaleSteps = [0.2, 0.4, 0.6, 0.8, 1];
  const bottom = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="min-h-4 text-xs text-muted" aria-hidden="true">
        {readout}
      </span>
      {showScale && (
        <span className="inline-flex items-center gap-1" aria-hidden="true">
          <span className="mr-0.5 text-xs text-muted">{lessLabel}</span>
          {scaleSteps.map((v) => (
            <span
              key={v}
              className="size-3 rounded-[3px]"
              style={{ background: mix(color, (minIntensity + v * (1 - minIntensity)) * 100) }}
            />
          ))}
          <span className="ml-0.5 text-xs text-muted">{moreLabel}</span>
        </span>
      )}
    </div>
  );

  return (
    <ChartFrame
      title={title}
      description={description}
      showCaption={showCaption}
      a11yTable={a11yTable}
      className={className}
      style={style}
      footer={
        <>
          {bottom}
          {footer}
        </>
      }
      height={height}
      table={{
        columns: ["", ...Array.from({ length: cols }, (_, c) => colName(c))],
        rows: values.map((row, r) => [
          rowName(r),
          ...Array.from({ length: cols }, (_, c) => (isNum(row[c]) ? formatValue(row[c] as number) : "–")),
        ]),
      }}
      announcement={focused && cell ? readout : null}
      plotProps={plotProps}
      keyboardHint="Use the arrow keys to move between cells."
    >
      {(width) => {
        const gridW = Math.max(width - rowLabelWidth, 0);
        const cw = cols ? Math.max((gridW - gap * (cols - 1)) / cols, 1) : 0;
        const cx = (c: number) => rowLabelWidth + c * (cw + gap);
        const cy = (r: number) => r * (cellHeight + gap);
        return (
          <svg width={width} height={height} role="img" aria-label={chartLabel(title, description)} className="block overflow-visible">
            {values.map((row, r) => (
              <g key={r}>
                <text
                  x={0}
                  y={cy(r) + cellHeight / 2}
                  dy="0.35em"
                  fontSize={11}
                  fontWeight={600}
                  aria-hidden="true"
                  style={{ fill: "var(--muted)" }}
                >
                  {rowName(r)}
                </text>
                {Array.from({ length: cols }, (_, c) => {
                  const v = row[c];
                  const isActive = active?.r === r && active?.c === c;
                  const glow = isNum(v) && v > 0 && intensity(v) > glowAbove;
                  return (
                    <rect
                      key={c}
                      x={cx(c)}
                      y={cy(r)}
                      width={cw}
                      height={cellHeight}
                      rx={4}
                      strokeWidth={isActive ? 2 : 0}
                      className="cursor-pointer transition-[transform,opacity] duration-150 motion-safe:ease-out"
                      style={{
                        fill: fillFor(v),
                        stroke: isActive ? "var(--fg)" : undefined,
                        transformBox: "fill-box",
                        transformOrigin: "center",
                        transform: isActive ? "scale(1.2)" : undefined,
                        filter: glow ? `drop-shadow(0 0 5px ${mix(color, 60)})` : undefined,
                        opacity: entered ? 1 : 0,
                        touchAction: "manipulation",
                      }}
                      onPointerEnter={() => setActive({ r, c })}
                      onPointerDown={() => setActive({ r, c })}
                      onPointerLeave={(e) => {
                        if (e.pointerType === "mouse") setActive(null);
                      }}
                    />
                  );
                })}
              </g>
            ))}
            {Array.from({ length: cols }, (_, c) =>
              colLabels[c] ? (
                <text
                  key={`c-${c}`}
                  x={cx(c)}
                  y={height - 4}
                  fontSize={10}
                  aria-hidden="true"
                  style={{ fill: "var(--muted)" }}
                >
                  {colLabels[c]}
                </text>
              ) : null
            )}
          </svg>
        );
      }}
    </ChartFrame>
  );
}
