/* Shared, framework-free math for the chart components. */

export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface NiceScale {
  /** Rounded lower bound (a multiple of `step`). */
  min: number;
  /** Rounded upper bound (a multiple of `step`). */
  max: number;
  step: number;
  /** Tick values from `min` to `max` inclusive. */
  ticks: number[];
}

/** A point in plot coordinates, or `null` for a gap. */
export type PlotPoint = { x: number; y: number } | null;

export type CurveType = "linear" | "monotone";

/** Default categorical colours, all theme-aware CSS variables. */
export const CHART_PALETTE = [
  "var(--accent)",
  "var(--ok)",
  "var(--warn)",
  "var(--danger)",
  "var(--muted)",
] as const;

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Removes floating point noise such as 0.30000000000000004. */
const tidy = (v: number) => parseFloat(v.toPrecision(12));

/**
 * Rounds a value domain out to "nice" bounds with a 1 / 2 / 2.5 / 5 / 10 step,
 * aiming for roughly `ticks` intervals.
 */
export function niceScale(min: number, max: number, ticks = 4): NiceScale {
  let lo = Number.isFinite(min) ? min : 0;
  let hi = Number.isFinite(max) ? max : 1;
  if (lo > hi) [lo, hi] = [hi, lo];
  if (lo === hi) {
    if (lo === 0) hi = 1;
    else if (lo > 0) lo = 0;
    else hi = 0;
  }
  const count = Math.max(1, Math.round(ticks));
  const raw = (hi - lo) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = tidy((norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag);
  const niceMin = tidy(Math.floor(lo / step) * step);
  const niceMax = tidy(Math.ceil(hi / step) * step);
  const out: number[] = [];
  for (let i = 0, v = niceMin; v <= niceMax + step / 2; i++, v = tidy(niceMin + i * step)) out.push(v);
  return { min: niceMin, max: niceMax, step, ticks: out };
}

/** Linear mapping from a value domain to a pixel range. */
export function linearScale(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  return (v: number) => r0 + ((v - d0) / span) * (r1 - r0);
}

export const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/** Min / max of the finite numbers in `values`; `undefined` when there are none. */
export function extent(values: Iterable<number | null | undefined>): [number, number] | undefined {
  let lo = Infinity;
  let hi = -Infinity;
  for (const v of values) {
    if (!isNum(v)) continue;
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  return lo <= hi ? [lo, hi] : undefined;
}

/** Splits points into runs of consecutive non-null points. */
export function segments(points: PlotPoint[]): { x: number; y: number }[][] {
  const out: { x: number; y: number }[][] = [];
  let run: { x: number; y: number }[] = [];
  for (const p of points) {
    if (p) run.push(p);
    else if (run.length) {
      out.push(run);
      run = [];
    }
  }
  if (run.length) out.push(run);
  return out;
}

const fmt = (n: number) => tidy(n).toString();

/** Monotone cubic (Fritsch–Carlson) path through one run of points; never overshoots. */
function monotonePath(run: { x: number; y: number }[]): string {
  const n = run.length;
  if (n < 3) return run.map((p, i) => `${i ? "L" : "M"}${fmt(p.x)},${fmt(p.y)}`).join("");
  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = run[i + 1].x - run[i].x;
    slope[i] = dx[i] ? (run[i + 1].y - run[i].y) / dx[i] : 0;
  }
  const t: number[] = [slope[0]];
  for (let i = 1; i < n - 1; i++) {
    t[i] = slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2;
  }
  t[n - 1] = slope[n - 2];
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      t[i] = 0;
      t[i + 1] = 0;
      continue;
    }
    const a = t[i] / slope[i];
    const b = t[i + 1] / slope[i];
    const h = a * a + b * b;
    if (h > 9) {
      const k = 3 / Math.sqrt(h);
      t[i] = k * a * slope[i];
      t[i + 1] = k * b * slope[i];
    }
  }
  let d = `M${fmt(run[0].x)},${fmt(run[0].y)}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += `C${fmt(run[i].x + h)},${fmt(run[i].y + t[i] * h)},${fmt(run[i + 1].x - h)},${fmt(
      run[i + 1].y - t[i + 1] * h
    )},${fmt(run[i + 1].x)},${fmt(run[i + 1].y)}`;
  }
  return d;
}

function runPath(run: { x: number; y: number }[], curve: CurveType): string {
  if (curve === "monotone") return monotonePath(run);
  return run.map((p, i) => `${i ? "L" : "M"}${fmt(p.x)},${fmt(p.y)}`).join("");
}

/** SVG path for a line; `null` points break the line into separate segments. */
export function linePath(points: PlotPoint[], curve: CurveType = "linear"): string {
  return segments(points)
    .map((run) => runPath(run, curve))
    .join("");
}

/** SVG path for the area between a line and a horizontal baseline at `baseY`. */
export function areaPath(points: PlotPoint[], baseY: number, curve: CurveType = "linear"): string {
  return segments(points)
    .map((run) => {
      const first = run[0];
      const last = run[run.length - 1];
      return `${runPath(run, curve)}L${fmt(last.x)},${fmt(baseY)}L${fmt(first.x)},${fmt(baseY)}Z`;
    })
    .join("");
}

/** SVG path for a band between two lines (e.g. a confidence interval). */
export function bandPath(highs: PlotPoint[], lows: PlotPoint[], curve: CurveType = "linear"): string {
  type P = { x: number; y: number };
  let out = "";
  let start = -1;
  const flush = (end: number) => {
    if (start < 0) return;
    const top = highs.slice(start, end) as P[];
    const bottom = (lows.slice(start, end) as P[]).reverse();
    out += `${runPath(top, curve)}${runPath(bottom, curve).replace(/^M/, "L")}Z`;
    start = -1;
  };
  for (let i = 0; i < highs.length; i++) {
    if (highs[i] && lows[i]) {
      if (start < 0) start = i;
    } else flush(i);
  }
  flush(highs.length);
  return out;
}

/** Evenly spaced tick indices for `count` points that fit in `width` pixels. */
export function autoTicks(count: number, width: number, minSpacing = 64): number[] {
  if (count <= 0) return [];
  if (count === 1) return [0];
  const maxTicks = Math.max(2, Math.floor(width / minSpacing));
  const step = Math.max(1, Math.ceil((count - 1) / (maxTicks - 1)));
  const out: number[] = [];
  for (let i = 0; i < count; i += step) out.push(i);
  const last = count - 1;
  if (out[out.length - 1] !== last) {
    // Replace the final tick when it would crowd the last label.
    if (last - out[out.length - 1] < step / 2 && out.length > 1) out.pop();
    out.push(last);
  }
  return out;
}

/** Fills a partial margin with defaults. */
export const resolveMargin = (base: ChartMargin, override?: Partial<ChartMargin>): ChartMargin => ({
  ...base,
  ...override,
});

/** `color-mix` of `color` at `pct`% over transparent. */
export const mix = (color: string, pct: number) =>
  `color-mix(in srgb, ${color} ${Math.round(clamp(pct, 0, 100))}%, transparent)`;

const numberFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
const compactFormat = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 });

/** Default value formatter (locale-aware, up to two decimals). */
export const defaultFormatValue = (n: number) => numberFormat.format(n);
/** Default axis tick formatter (compact notation: 1.2K, 3M). */
export const defaultFormatTick = (n: number) => compactFormat.format(n);
/** Default share formatter for 0–1 fractions. */
export const defaultFormatPercent = (n: number) =>
  `${(Math.round(n * 1000) / 10).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;
