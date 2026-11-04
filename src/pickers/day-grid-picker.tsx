"use client";

import { useId, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { Chip } from "../chips/chip";
import { useControllable } from "../utils/use-controllable";
import { useRoving } from "./roving";

export interface DayGridPreset {
  /** Chip text. */
  label: ReactNode;
  /** Day selected by the preset. */
  value: number;
}

export interface DayGridPickerProps {
  /** Controlled selected day (`null` = none). */
  value?: number | null;
  /** Initial day when uncontrolled. */
  defaultValue?: number | null;
  /** Called with the new day. */
  onChange?: (day: number) => void;
  /** Called when a day is chosen deliberately (click, Enter/Space or a preset), not on arrow-key moves. Use it to close a surrounding popover. */
  onCommit?: (day: number) => void;
  /** Highest selectable day. Default 31. */
  max?: number;
  /** Grid columns (Up/Down step). Default 7. */
  columns?: number;
  /** Shortcut chips shown above the grid. */
  presets?: DayGridPreset[];
  /** Returns true for days that cannot be picked. */
  disabledDays?: (day: number) => boolean;
  /** Accessible name for a day cell. Default: the number. */
  getDayLabel?: (day: number) => string;
  /** Group label; visually hidden with `hideLabel`. */
  label?: ReactNode;
  /** Keep `label` for screen readers only. */
  hideLabel?: boolean;
  /** Accessible name when there is no `label`. */
  "aria-label"?: string;
  /** Disables the picker. */
  disabled?: boolean;
  className?: string;
}

/** Day-of-month picker (1..max) with optional presets and 2-D arrow-key navigation. */
export function DayGridPicker({
  value,
  defaultValue = null,
  onChange,
  onCommit,
  max = 31,
  columns = 7,
  presets,
  disabledDays,
  getDayLabel,
  label,
  hideLabel = false,
  "aria-label": ariaLabel,
  disabled = false,
  className,
}: DayGridPickerProps) {
  const labelId = `${useId()}-label`;
  const [selected, setSelected] = useControllable<number | null>(
    value,
    defaultValue,
    onChange as ((v: number | null) => void) | undefined
  );
  const days = Array.from({ length: Math.max(0, max) }, (_, i) => i + 1);
  const isDayDisabled = (day: number) => disabled || !!disabledDays?.(day);
  const { getItemProps } = useRoving({
    count: days.length,
    columns,
    isDisabled: (index) => isDayDisabled(days[index]),
    selectedIndex: selected == null ? -1 : selected - 1,
    onMove: (index) => setSelected(days[index]),
  });

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <span id={labelId} className={hideLabel ? "sr-only" : "text-xs font-semibold text-fg"}>
          {label}
        </span>
      )}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => (
            <Chip
              key={preset.value}
              size="sm"
              pressed={selected === preset.value}
              disabled={isDayDisabled(preset.value)}
              onPressedChange={() => {
                setSelected(preset.value);
                onCommit?.(preset.value);
              }}
            >
              {preset.label}
            </Chip>
          ))}
        </div>
      )}
      <div
        role="radiogroup"
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : ariaLabel}
        aria-disabled={disabled || undefined}
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {days.map((day, index) => {
          const isSelected = selected === day;
          return (
            <button
              key={day}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={getDayLabel?.(day)}
              disabled={isDayDisabled(day)}
              onClick={() => {
                setSelected(day);
                onCommit?.(day);
              }}
              className={cn(
                "inline-flex h-8 min-w-8 items-center justify-center rounded-lg text-xs tabular-nums transition-colors motion-reduce:transition-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                "disabled:cursor-not-allowed disabled:opacity-40",
                isSelected
                  ? "bg-accent font-semibold text-accent-fg"
                  : "cursor-pointer text-fg hover:bg-surface-subtle"
              )}
              {...getItemProps(index)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
