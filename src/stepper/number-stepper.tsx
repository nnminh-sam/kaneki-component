"use client";

import { useEffect, useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "../utils/cn";
import { useControllable } from "../utils/use-controllable";

export type StepperSize = "sm" | "md" | "lg";

export interface NumberStepperProps {
  /** Controlled value. */
  value?: number;
  /** Initial value when uncontrolled. Default `min` or 0. */
  defaultValue?: number;
  /** Called with the new value. */
  onChange?: (value: number) => void;
  /** Lowest value. */
  min?: number;
  /** Highest value. */
  max?: number;
  /** Increment. Default 1. */
  step?: number;
  /** Display formatter, e.g. `(v) => \`${v} days\``. */
  format?: (value: number) => ReactNode;
  /** Group label; visually hidden with `hideLabel`. */
  label?: ReactNode;
  /** Keep `label` for screen readers only. */
  hideLabel?: boolean;
  /** Accessible name when there is no `label`. */
  "aria-label"?: string;
  /** Accessible name of the − button. Default "Decrease". */
  decrementLabel?: string;
  /** Accessible name of the + button. Default "Increase". */
  incrementLabel?: string;
  /** Button size: sm 28px, md 36px, lg 40px (touch target). Default `md`. */
  size?: StepperSize;
  /** Disables both buttons (and the input when `editable`). */
  disabled?: boolean;
  /**
   * Render the value as a numeric text input (inputMode "numeric") so large ranges
   * (e.g. 1–100) can be typed. The typed value is clamped to `min` / `max` on blur
   * or Enter; Escape reverts it. `format` is not applied while editable.
   */
  editable?: boolean;
  /** Class names for the wrapper. */
  className?: string;
}

const decimals = (n: number) => (String(n).split(".")[1] ?? "").length;

const buttonSize: Record<StepperSize, string> = { sm: "h-7 w-7", md: "h-9 w-9", lg: "h-10 w-10" };
const valueSize: Record<StepperSize, string> = {
  sm: "min-w-10 text-xs",
  md: "min-w-14 text-sm",
  lg: "min-w-16 text-base",
};
const inputSize: Record<StepperSize, string> = { sm: "h-7 w-12", md: "h-9 w-16", lg: "h-10 w-20" };

/** − / + stepper around a number; the value is announced politely. */
export function NumberStepper({
  value,
  defaultValue,
  onChange,
  min,
  max,
  step = 1,
  format,
  label,
  hideLabel = false,
  "aria-label": ariaLabel,
  decrementLabel = "Decrease",
  incrementLabel = "Increase",
  size = "md",
  disabled = false,
  editable = false,
  className,
}: NumberStepperProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const valueId = `${id}-value`;
  const [current, setCurrent] = useControllable<number>(value, defaultValue ?? min ?? 0, onChange);

  const clamp = (n: number) => {
    let next = n;
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    return next;
  };

  // Text being typed in editable mode; re-synced whenever the value changes.
  const [draft, setDraft] = useState(String(current));
  useEffect(() => setDraft(String(current)), [current]);

  const commit = () => {
    const parsed = Number(draft.trim().replace(",", "."));
    if (draft.trim() === "" || !Number.isFinite(parsed)) {
      setDraft(String(current));
      return;
    }
    const next = clamp(parsed);
    setDraft(String(next));
    if (next !== current) setCurrent(next);
  };

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      setDraft(String(current));
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      change(e.key === "ArrowUp" ? 1 : -1);
    }
  };

  const change = (direction: 1 | -1) => {
    const precision = Math.max(decimals(step), decimals(current));
    const next = clamp(Number((current + direction * step).toFixed(precision)));
    if (next !== current) setCurrent(next);
  };

  const btn = cn(
    "inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-fg transition-colors motion-reduce:transition-none",
    "cursor-pointer hover:border-accent hover:bg-surface-subtle active:scale-95 motion-reduce:active:scale-100",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
    "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-surface",
    buttonSize[size]
  );

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
        className="inline-flex items-center gap-2"
      >
        <button
          type="button"
          aria-label={decrementLabel}
          aria-controls={valueId}
          disabled={disabled || (min !== undefined && current <= min)}
          onClick={() => change(-1)}
          className={btn}
        >
          <Minus aria-hidden="true" className="h-4 w-4" />
        </button>
        {editable ? (
          <input
            id={valueId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={draft}
            disabled={disabled}
            aria-labelledby={label ? labelId : undefined}
            aria-label={label ? undefined : ariaLabel}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={onInputKeyDown}
            className={cn(
              "rounded-lg border border-border bg-surface text-center font-semibold tabular-nums text-fg",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent",
              "disabled:cursor-not-allowed disabled:opacity-50",
              size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm",
              inputSize[size]
            )}
          />
        ) : (
          <span
            id={valueId}
            aria-live="polite"
            aria-atomic="true"
            className={cn("text-center font-semibold tabular-nums text-fg", valueSize[size])}
          >
            {format ? format(current) : current}
          </span>
        )}
        <button
          type="button"
          aria-label={incrementLabel}
          aria-controls={valueId}
          disabled={disabled || (max !== undefined && current >= max)}
          onClick={() => change(1)}
          className={btn}
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
