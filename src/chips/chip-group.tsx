"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { Chip, type ChipSize, type ChipVariant } from "./chip";

export interface ChipOption {
  /** Value reported to `onChange`. */
  value: string;
  /** Chip text. */
  label: ReactNode;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Disables this chip. */
  disabled?: boolean;
}

interface ChipGroupBaseProps {
  /** Chips to render. */
  options: ChipOption[];
  /** Group label; visually hidden with `hideLabel`. */
  label?: ReactNode;
  /** Keep `label` for screen readers only. */
  hideLabel?: boolean;
  /** Accessible name when there is no `label`. */
  "aria-label"?: string;
  /** Chip size: sm 28px, md 32px, lg 40px (touch target). Default `md`. */
  size?: ChipSize;
  /** Chip variant. Default `default`. */
  variant?: ChipVariant;
  /** Disables every chip. */
  disabled?: boolean;
  /** Class names for the wrapper. */
  className?: string;
  /** Class names applied to every chip (e.g. `flex-1` for equal widths). */
  chipClassName?: string;
}

export interface ChipGroupSingleProps extends ChipGroupBaseProps {
  /** Single selection (default). */
  multiple?: false;
  /** Controlled value (`null` = none). */
  value?: string | null;
  /** Initial value when uncontrolled. */
  defaultValue?: string | null;
  /** Called with the new value. */
  onChange?: (value: string | null) => void;
  /** Allow pressing the selected chip again to clear the selection. Default false. */
  allowDeselect?: boolean;
}

export interface ChipGroupMultipleProps extends ChipGroupBaseProps {
  /** Multiple selection. */
  multiple: true;
  /** Controlled values. */
  value?: string[];
  /** Initial values when uncontrolled. */
  defaultValue?: string[];
  /** Called with the new values (in option order). */
  onChange?: (value: string[]) => void;
}

export type ChipGroupProps = ChipGroupSingleProps | ChipGroupMultipleProps;

const toArray = (v: string | string[] | null | undefined): string[] =>
  v == null ? [] : Array.isArray(v) ? v : [v];

/** Group of toggle chips (aria-pressed) for single or multiple selection. */
export function ChipGroup(props: ChipGroupProps) {
  const {
    options,
    label,
    hideLabel = false,
    "aria-label": ariaLabel,
    size = "md",
    variant = "default",
    disabled = false,
    className,
    chipClassName,
  } = props;
  const labelId = `${useId()}-label`;
  const [internal, setInternal] = useState<string[]>(() => toArray(props.defaultValue));
  const isControlled = props.value !== undefined;
  const selected = isControlled ? toArray(props.value) : internal;

  const toggle = (optionValue: string) => {
    const isOn = selected.includes(optionValue);
    let next: string[];
    if (props.multiple) {
      next = isOn
        ? selected.filter((v) => v !== optionValue)
        : options.map((o) => o.value).filter((v) => v === optionValue || selected.includes(v));
    } else {
      if (isOn && !props.allowDeselect) return;
      next = isOn ? [] : [optionValue];
    }
    if (!isControlled) setInternal(next);
    if (props.multiple) props.onChange?.(next);
    else props.onChange?.(next[0] ?? null);
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <span id={labelId} className={hideLabel ? "sr-only" : "text-xs font-semibold text-fg"}>
          {label}
        </span>
      )}
      <div
        role="group"
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : ariaLabel}
        className="flex flex-wrap gap-2"
      >
        {options.map((option) => (
          <Chip
            key={option.value}
            size={size}
            variant={variant}
            icon={option.icon}
            disabled={disabled || option.disabled}
            pressed={selected.includes(option.value)}
            onPressedChange={() => toggle(option.value)}
            className={chipClassName}
          >
            {option.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}
