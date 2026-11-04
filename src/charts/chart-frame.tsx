"use client";

import { useId, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { useContainerWidth } from "../hooks/use-container-width";
import { cn } from "../utils/cn";

/** Props shared by every chart. */
export interface ChartBaseProps {
  /** Accessible name of the chart (the svg's aria-label). Also shown when `showCaption`. */
  title?: string;
  /** Longer accessible description, appended to the aria-label. */
  description?: string;
  /** Render `title` / `description` as a visible `<figcaption>`. Default `false`. */
  showCaption?: boolean;
  /** Render a visually hidden data table listing every data point. Default `true`. */
  a11yTable?: boolean;
  /** Enable the draw-in animations (also disabled by `prefers-reduced-motion`). Default `true`. */
  animate?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Extra content under the chart (stats, notes). */
  footer?: ReactNode;
}

export interface ChartTableData {
  columns: ReactNode[];
  rows: ReactNode[][];
}

export interface ChartFrameProps
  extends ChartBaseProps,
    Omit<HTMLAttributes<HTMLElement>, "title" | "children" | "className" | "style"> {
  /** Plot height in px. The plot reserves this height before it is measured (no layout shift). */
  height: number;
  legend?: ReactNode;
  legendPosition?: "top" | "bottom" | "right";
  /** Rows for the hidden data table (shown when `a11yTable`). */
  table?: ChartTableData;
  /** Text read by screen readers when the active point changes via the keyboard. */
  announcement?: ReactNode;
  /** Props for the focusable plot element (keyboard handlers, tabIndex). */
  plotProps?: HTMLAttributes<HTMLDivElement>;
  /** Fixed plot width; when omitted the plot fills the container and is measured. */
  plotWidth?: number;
  /** Hint read when the interactive plot receives focus. */
  keyboardHint?: string;
  /** Renders the plot for the measured width (only called once width > 0). */
  children: (width: number) => ReactNode;
}

/** Joins title and description into one aria-label. */
export const chartLabel = (title?: string, description?: string) =>
  [title, description].filter(Boolean).join(". ") || "Chart";

/**
 * Figure wrapper for all charts: caption, legend slot, responsive width
 * measurement, keyboard-focusable plot, live region and the sr-only data table.
 */
export function ChartFrame({
  title,
  description,
  showCaption = false,
  a11yTable = true,
  animate: _animate,
  className,
  style,
  footer,
  height,
  legend,
  legendPosition = "bottom",
  table,
  announcement,
  plotProps,
  plotWidth,
  keyboardHint = "Use the arrow keys to move between data points.",
  children,
  ...props
}: ChartFrameProps) {
  const [ref, measured] = useContainerWidth<HTMLDivElement>();
  const hintId = useId();
  const width = plotWidth ?? measured;
  const interactive = plotProps?.tabIndex !== undefined;

  const plot = (
    <div
      ref={plotWidth === undefined ? ref : undefined}
      role={interactive ? "group" : undefined}
      aria-label={interactive ? title ?? "Chart" : undefined}
      aria-describedby={interactive ? hintId : undefined}
      {...plotProps}
      className={cn(
        "relative rounded-lg outline-none",
        plotWidth === undefined && "w-full",
        interactive && "focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        plotProps?.className
      )}
      style={{ height, width: plotWidth, ...plotProps?.style }}
    >
      {width > 0 && children(width)}
    </div>
  );

  return (
    <figure className={cn("m-0 flex min-w-0 flex-col gap-3 text-fg", className)} style={style} {...props}>
      {showCaption && (title || description) && (
        <figcaption className="flex flex-col gap-1">
          {title && <span className="text-sm font-semibold text-fg">{title}</span>}
          {description && <span className="text-xs text-muted">{description}</span>}
        </figcaption>
      )}
      {legend && legendPosition === "top" && legend}
      {legendPosition === "right" && legend ? (
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
          {plot}
          <div className="min-w-0 flex-[1_1_220px]">{legend}</div>
        </div>
      ) : (
        plot
      )}
      {legend && legendPosition === "bottom" && legend}
      {footer}
      {interactive && (
        <span id={hintId} className="sr-only">
          {keyboardHint}
        </span>
      )}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
      {a11yTable && table && table.rows.length > 0 && (
        <table className="sr-only">
          {title && <caption>{title}</caption>}
          <thead>
            <tr>
              {table.columns.map((c, i) => (
                <th key={i} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) =>
                  c === 0 ? (
                    <th key={c} scope="row">
                      {cell}
                    </th>
                  ) : (
                    <td key={c}>{cell}</td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </figure>
  );
}
