"use client";

import { useState, type ReactNode } from "react";

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  id?: string;
  className?: string;
}

export function Switch({
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  label,
  description,
  id,
  className = "",
}: SwitchProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = controlledChecked ?? internalChecked;

  const toggle = () => {
    if (disabled) return;
    const next = !isChecked;
    if (controlledChecked === undefined) {
      setInternalChecked(next);
    }
    onCheckedChange?.(next);
  };

  return (
    <div className={`flex items-start justify-between gap-4 select-none ${className}`}>
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <label
              htmlFor={id}
              onClick={toggle}
              className={`text-xs font-semibold text-fg cursor-pointer ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-[11px] text-muted leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={isChecked}
        disabled={disabled}
        onClick={toggle}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 ${
          isChecked ? "bg-accent" : "bg-surface-subtle border-border"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
            isChecked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
