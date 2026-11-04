"use client";

import { useId, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { useControllable } from "../utils/use-controllable";
import { useRoving } from "./roving";

export interface IconPickerOption {
  /** Value reported to `onChange`. */
  value: string;
  /** Accessible name and tooltip. */
  label: string;
  /** Icon element. */
  icon: ReactNode;
}

export interface IconPickerProps {
  /** Icons to offer. */
  icons: IconPickerOption[];
  /** Controlled selected value (`null` = none). */
  value?: string | null;
  /** Initial value when uncontrolled. */
  defaultValue?: string | null;
  /** Called with the new value. */
  onChange?: (value: string) => void;
  /** Grid columns; also the Up/Down step. Default 6. */
  columns?: number;
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

/** Grid of icons with radiogroup semantics and 2-D arrow-key navigation. */
export function IconPicker({
  icons,
  value,
  defaultValue = null,
  onChange,
  columns = 6,
  label,
  hideLabel = false,
  "aria-label": ariaLabel,
  disabled = false,
  className,
}: IconPickerProps) {
  const labelId = `${useId()}-label`;
  const [selected, setSelected] = useControllable<string | null>(
    value,
    defaultValue,
    onChange as ((v: string | null) => void) | undefined
  );
  const selectedIndex = icons.findIndex((i) => i.value === selected);
  const { getItemProps } = useRoving({
    count: icons.length,
    columns,
    isDisabled: () => disabled,
    selectedIndex,
    onMove: (index) => setSelected(icons[index].value),
  });

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <span id={labelId} className={hideLabel ? "sr-only" : "text-xs font-semibold text-fg"}>
          {label}
        </span>
      )}
      <div
        role="radiogroup"
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : ariaLabel}
        aria-disabled={disabled || undefined}
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 2.5rem))` }}
      >
        {icons.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <button
              key={item.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={item.label}
              title={item.label}
              disabled={disabled}
              onClick={() => setSelected(item.value)}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors motion-reduce:transition-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                "disabled:cursor-not-allowed disabled:opacity-50",
                isSelected
                  ? "border-accent bg-accent-soft text-accent"
                  : "cursor-pointer border-border bg-surface text-muted hover:border-accent hover:text-fg"
              )}
              {...getItemProps(index)}
            >
              <span aria-hidden="true" className="inline-flex">
                {item.icon}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
