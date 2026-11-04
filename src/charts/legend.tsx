"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

export type LegendSwatch = "solid" | "dashed" | "dot";

export interface LegendItemProps {
  label: ReactNode;
  color: string;
  /** Swatch shape. `dashed` draws a dashed line, `dot` a circle. Default `solid`. */
  swatch?: LegendSwatch;
  /** Trailing text such as a share or total. */
  value?: ReactNode;
  /**
   * Makes the item a toggle button (`aria-pressed`). `true` = series shown /
   * highlighted. Leave `undefined` for a static item.
   */
  pressed?: boolean;
  /** Turns the item into a button. */
  onClick?: () => void;
  /** Hover / focus callbacks for highlighting a series from the legend. */
  onHighlight?: (on: boolean) => void;
  /** Dim the item (e.g. its series is hidden or another item is highlighted). */
  muted?: boolean;
  title?: string;
  className?: string;
}

function Swatch({ color, swatch = "solid" }: { color: string; swatch?: LegendSwatch }) {
  if (swatch === "dashed") {
    return <span aria-hidden="true" className="h-0 w-4 shrink-0 border-t-[1.5px] border-dashed" style={{ borderColor: color }} />;
  }
  return (
    <span
      aria-hidden="true"
      className={cn("size-2.5 shrink-0", swatch === "dot" ? "rounded-full" : "rounded-[3px]")}
      style={{ background: color }}
    />
  );
}

/** One legend entry. Renders a `<button>` when `onClick` or `pressed` is set. */
export function LegendItem({
  label,
  color,
  swatch,
  value,
  pressed,
  onClick,
  onHighlight,
  muted,
  title,
  className,
}: LegendItemProps) {
  const interactive = onClick !== undefined || pressed !== undefined;
  const body = (
    <>
      <Swatch color={color} swatch={swatch} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {value !== undefined && <span className="shrink-0 text-muted tabular-nums">{value}</span>}
    </>
  );
  const base = cn(
    "inline-flex min-w-0 items-center gap-1.5 text-xs text-muted transition-opacity",
    (muted || pressed === false) && "opacity-45",
    className
  );
  const highlight = onHighlight
    ? {
        onPointerEnter: () => onHighlight(true),
        onPointerLeave: () => onHighlight(false),
        onFocus: () => onHighlight(true),
        onBlur: () => onHighlight(false),
      }
    : {};
  if (!interactive) {
    return (
      <li className={base} title={title} {...highlight}>
        {body}
      </li>
    );
  }
  return (
    <li className="flex min-w-0">
      <button
        type="button"
        aria-pressed={pressed}
        title={title}
        onClick={onClick}
        className={cn(
          base,
          "w-full cursor-pointer rounded-md px-1 py-0.5 text-left hover:text-fg",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        )}
        {...highlight}
      >
        {body}
      </button>
    </li>
  );
}

export interface LegendItemData extends Omit<LegendItemProps, "onClick" | "pressed" | "onHighlight" | "muted"> {
  id: string;
}

export interface LegendProps extends Omit<HTMLAttributes<HTMLUListElement>, "onToggle"> {
  /** Data-driven items. Alternatively pass `<LegendItem>` children. */
  items?: LegendItemData[];
  /** Interactive mode: items become `aria-pressed` buttons toggling ids in `inactive`. */
  onToggle?: (id: string) => void;
  /** Ids currently switched off (interactive mode). */
  inactive?: ReadonlySet<string> | string[];
  /** Hover / focus highlighting; called with the id or `null`. */
  onHighlight?: (id: string | null) => void;
  /** Id currently highlighted; other items are dimmed. */
  highlighted?: string | null;
  /** `grid` lays items out in two columns. Default `row`. */
  layout?: "row" | "grid";
}

/** Chart legend. Static by default; pass `onToggle` for toggle buttons. */
export function Legend({
  items,
  onToggle,
  inactive,
  onHighlight,
  highlighted,
  layout = "row",
  className,
  children,
  ...props
}: LegendProps) {
  const off = inactive instanceof Set ? inactive : new Set(inactive ?? []);
  return (
    <ul
      className={cn(
        "m-0 list-none p-0",
        layout === "grid" ? "grid grid-cols-2 gap-x-4 gap-y-2" : "flex flex-wrap items-center gap-x-3.5 gap-y-1.5",
        className
      )}
      {...props}
    >
      {items?.map(({ id, ...item }) => (
        <LegendItem
          key={id}
          {...item}
          pressed={onToggle ? !off.has(id) : undefined}
          onClick={onToggle ? () => onToggle(id) : undefined}
          onHighlight={onHighlight ? (on) => onHighlight(on ? id : null) : undefined}
          muted={highlighted != null && highlighted !== id}
        />
      ))}
      {children}
    </ul>
  );
}
