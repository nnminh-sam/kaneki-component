"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../utils/cn";
import { useControllable } from "../utils/use-controllable";
import {
  addDays,
  addMonths,
  clampDate,
  dateKey,
  getMonthWeeks,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  weekdayIndex,
} from "./date-utils";

export type MiniCalendarHighlight = "default" | "nominal";

export interface MiniCalendarProps {
  /** Controlled selected date (`null` = none). */
  value?: Date | null;
  /** Initial date when uncontrolled. */
  defaultValue?: Date | null;
  /** Called with the picked date (local midnight). */
  onChange?: (date: Date) => void;
  /** Controlled visible month (any date inside it). */
  month?: Date;
  /** Initial visible month when uncontrolled. Defaults to the value, then today. */
  defaultMonth?: Date;
  /** Called with the first day of the newly visible month. */
  onMonthChange?: (month: Date) => void;
  /** Hide the built-in previous / next month buttons. */
  hideNavigation?: boolean;
  /** First day of the week: 0 = Sunday, 1 = Monday. Default 0. */
  weekStartsOn?: 0 | 1;
  /** Earliest selectable date. */
  minDate?: Date;
  /** Latest selectable date. */
  maxDate?: Date;
  /** Returns true for dates that cannot be picked. */
  isDisabled?: (date: Date) => boolean;
  /** Marks a date: `default` = soft accent fill, `nominal` = dashed accent outline. */
  highlighted?: (date: Date) => MiniCalendarHighlight | undefined;
  /** Title / accessible name of a day. Default: full localized date. */
  getDayLabel?: (date: Date) => string;
  /** BCP 47 locale for month and weekday names. Pass it explicitly for SSR-stable output. */
  locale?: string;
  /** Accessible name of the previous-month button. Default "Previous month". */
  prevLabel?: string;
  /** Accessible name of the next-month button. Default "Next month". */
  nextLabel?: string;
  className?: string;
}

/** Month grid date picker with full keyboard support (role="grid"). */
export function MiniCalendar({
  value,
  defaultValue = null,
  onChange,
  month,
  defaultMonth,
  onMonthChange,
  hideNavigation = false,
  weekStartsOn = 0,
  minDate,
  maxDate,
  isDisabled,
  highlighted,
  getDayLabel,
  locale,
  prevLabel = "Previous month",
  nextLabel = "Next month",
  className,
}: MiniCalendarProps) {
  const titleId = `${useId()}-title`;
  const gridRef = useRef<HTMLTableElement>(null);
  const pendingFocus = useRef(false);
  const [today] = useState(() => startOfDay(new Date()));

  const [selected, setSelected] = useControllable<Date | null>(
    value,
    defaultValue,
    onChange as ((d: Date | null) => void) | undefined
  );
  const [visibleMonth, setVisibleMonth] = useControllable<Date>(
    month ? startOfMonth(month) : undefined,
    startOfMonth(defaultMonth ?? value ?? defaultValue ?? today),
    onMonthChange
  );
  const [focused, setFocused] = useState<Date | null>(null);

  const fmt = useMemo(
    () => ({
      title: new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }),
      weekdayShort: new Intl.DateTimeFormat(locale, { weekday: "short" }),
      weekdayLong: new Intl.DateTimeFormat(locale, { weekday: "long" }),
      full: new Intl.DateTimeFormat(locale, { dateStyle: "full" }),
    }),
    [locale]
  );

  const weeks = getMonthWeeks(visibleMonth, weekStartsOn);
  // 2021-01-03 was a Sunday.
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2021, 0, 3 + weekStartsOn + i));

  const isDateDisabled = (d: Date) =>
    (!!minDate && d < startOfDay(minDate)) ||
    (!!maxDate && d > startOfDay(maxDate)) ||
    !!isDisabled?.(d);

  // The single cell in the tab sequence.
  const tabTarget = [focused, selected, today].find(
    (d): d is Date => !!d && isSameMonth(d, visibleMonth)
  ) ?? visibleMonth;

  const prevDisabled = !!minDate && addDays(visibleMonth, -1) < startOfDay(minDate);
  const nextDisabled = !!maxDate && addMonths(visibleMonth, 1) > startOfDay(maxDate);

  useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    gridRef.current
      ?.querySelector<HTMLElement>(`[data-date="${dateKey(tabTarget)}"]`)
      ?.focus();
  });

  const goToMonth = (next: Date) => setVisibleMonth(startOfMonth(next));

  const select = (d: Date) => {
    if (isDateDisabled(d)) return;
    setFocused(d);
    setSelected(d);
    if (!isSameMonth(d, visibleMonth)) goToMonth(d);
  };

  const handleKeyDown = (event: KeyboardEvent, d: Date) => {
    let next: Date;
    switch (event.key) {
      case "ArrowLeft": next = addDays(d, -1); break;
      case "ArrowRight": next = addDays(d, 1); break;
      case "ArrowUp": next = addDays(d, -7); break;
      case "ArrowDown": next = addDays(d, 7); break;
      case "PageUp": next = addMonths(d, event.shiftKey ? -12 : -1); break;
      case "PageDown": next = addMonths(d, event.shiftKey ? 12 : 1); break;
      case "Home": next = addDays(d, -weekdayIndex(d, weekStartsOn)); break;
      case "End": next = addDays(d, 6 - weekdayIndex(d, weekStartsOn)); break;
      case "Enter":
      case " ":
        event.preventDefault();
        select(d);
        return;
      default:
        return;
    }
    event.preventDefault();
    next = clampDate(next, minDate, maxDate);
    setFocused(next);
    pendingFocus.current = true;
    if (!isSameMonth(next, visibleMonth)) goToMonth(next);
  };

  const navButton =
    "inline-flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-subtle hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer";

  return (
    <div className={cn("inline-flex flex-col gap-2 select-none", className)}>
      <div className="flex items-center justify-between gap-2">
        {!hideNavigation && (
          <button
            type="button"
            aria-label={prevLabel}
            disabled={prevDisabled}
            onClick={() => goToMonth(addMonths(visibleMonth, -1))}
            className={navButton}
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
        <span id={titleId} aria-live="polite" className="flex-1 text-center text-sm font-semibold text-fg">
          {fmt.title.format(visibleMonth)}
        </span>
        {!hideNavigation && (
          <button
            type="button"
            aria-label={nextLabel}
            disabled={nextDisabled}
            onClick={() => goToMonth(addMonths(visibleMonth, 1))}
            className={navButton}
          >
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>

      <table ref={gridRef} role="grid" aria-labelledby={titleId} className="border-collapse">
        <thead>
          <tr>
            {weekdays.map((d) => (
              <th
                key={d.getDay()}
                scope="col"
                abbr={fmt.weekdayLong.format(d)}
                className="h-7 w-9 text-center text-[11px] font-medium text-muted"
              >
                {fmt.weekdayShort.format(d)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={dateKey(week[0])}>
              {week.map((d) => {
                const outside = !isSameMonth(d, visibleMonth);
                const isSelected = isSameDay(d, selected);
                const disabled = isDateDisabled(d);
                const mark = highlighted?.(d);
                const dayLabel = getDayLabel?.(d) ?? fmt.full.format(d);
                return (
                  <td
                    key={dateKey(d)}
                    data-date={dateKey(d)}
                    tabIndex={!outside && isSameDay(d, tabTarget) ? 0 : -1}
                    aria-selected={isSelected}
                    aria-disabled={disabled || undefined}
                    aria-current={isSameDay(d, today) ? "date" : undefined}
                    aria-label={dayLabel}
                    title={dayLabel}
                    onClick={() => select(d)}
                    onKeyDown={(event) => handleKeyDown(event, d)}
                    className="group p-0.5 text-center focus-visible:outline-none"
                  >
                    <span
                      className={cn(
                        "mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-xs tabular-nums transition-colors motion-reduce:transition-none",
                        "group-focus-visible:ring-2 group-focus-visible:ring-accent",
                        mark === "nominal" && "outline-1 -outline-offset-2 outline-dashed outline-accent",
                        isSelected
                          ? "bg-accent font-semibold text-accent-fg"
                          : mark === "default"
                            ? "bg-accent-soft font-medium text-accent"
                            : outside
                              ? "text-muted opacity-60"
                              : "text-fg",
                        !isSelected && isSameDay(d, today) && "font-bold underline underline-offset-2",
                        disabled
                          ? "cursor-not-allowed opacity-40 line-through"
                          : !isSelected && "cursor-pointer hover:bg-surface-subtle"
                      )}
                    >
                      {d.getDate()}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
