/** A horizontal line at a fixed value (target, average, threshold). */
export interface ReferenceLine {
  value: number;
  label?: string;
  /** CSS colour. Default `var(--muted)`. */
  color?: string;
  /** Default `true`. */
  dashed?: boolean;
  /** Also list the line in the default tooltip. Default `false`. */
  showInTooltip?: boolean;
}

/** A `{ low, high }` pair for confidence / prediction bands. */
export interface BandPoint {
  low: number;
  high: number;
}

/** A value per x position; `null` / `undefined` leaves a gap. */
export type SeriesData = ReadonlyArray<number | null | undefined>;

/** A line drawn on top of another chart (e.g. a moving average over bars). */
export interface OverlayLine {
  id: string;
  label: string;
  data: SeriesData;
  /** CSS colour. Defaults to the palette. */
  color?: string;
  dashed?: boolean;
  /** Default `2.5`. */
  strokeWidth?: number;
  /** List in the default tooltip. Default `true`. */
  showInTooltip?: boolean;
}
