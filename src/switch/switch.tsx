"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "../utils/cn";

export interface SwitchProps {
  /** Controlled on state. */
  checked?: boolean;
  /** Initial state when uncontrolled. Default false. */
  defaultChecked?: boolean;
  /** Called with the new state. */
  onCheckedChange?: (checked: boolean) => void;
  /** Disables the switch. */
  disabled?: boolean;
  /** Visible label, linked to the switch with `htmlFor`. */
  label?: ReactNode;
  /** Helper text under the label, linked with `aria-describedby`. */
  description?: ReactNode;
  /** Id of the switch button. Generated when omitted. */
  id?: string;
  /** Class names for the wrapper. */
  className?: string;
}

/** On / off toggle (`role="switch"`) with an optional label and description. */
export function Switch({
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  label,
  description,
  id,
  className,
}: SwitchProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = controlledChecked ?? internalChecked;
  const generatedId = useId();
  const switchId = id ?? generatedId;
  const descriptionId = `${switchId}-description`;

  const toggle = () => {
    if (disabled) return;
    const next = !isChecked;
    if (controlledChecked === undefined) {
      setInternalChecked(next);
    }
    onCheckedChange?.(next);
  };

  return (
    <div className={cn("flex items-start justify-between gap-4 select-none", className)}>
      {(label || description) && (
        <div className="flex-1">
          {label && (
            // The native label click already activates the button via htmlFor.
            <label
              htmlFor={switchId}
              className={cn(
                "text-xs font-semibold text-fg cursor-pointer",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p id={descriptionId} className="text-[11px] text-muted leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}

      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-describedby={description ? descriptionId : undefined}
        disabled={disabled}
        onClick={toggle}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50",
          isChecked ? "bg-accent" : "bg-surface-subtle"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out",
            isChecked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}
