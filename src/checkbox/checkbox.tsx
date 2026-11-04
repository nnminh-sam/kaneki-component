"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "../utils/cn";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** Visible label, wired to the input with `htmlFor`. */
  label?: ReactNode;
  /** Secondary text under the label, linked with `aria-describedby`. */
  description?: ReactNode;
  /** Shows a dash and exposes the native mixed state. */
  indeterminate?: boolean;
  /** Called with the new checked state (in addition to `onChange`). */
  onCheckedChange?: (checked: boolean) => void;
  /** Class for the outer wrapper (`className` goes on the input). */
  wrapperClassName?: string;
}

/** Native checkbox with custom visuals, label, description and indeterminate support. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      indeterminate = false,
      onCheckedChange,
      onChange,
      id,
      disabled,
      className,
      wrapperClassName,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const autoId = useId();
    const inputId = id ?? `${autoId}-checkbox`;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const innerRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    useEffect(() => {
      if (innerRef.current) innerRef.current.indeterminate = indeterminate;
    }, [indeterminate]);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
      onCheckedChange?.(event.target.checked);
    };

    return (
      <div className={cn("flex items-start gap-2.5", wrapperClassName)}>
        <span className="relative mt-0.5 inline-flex h-4 w-4 shrink-0">
          <input
            ref={innerRef}
            id={inputId}
            type="checkbox"
            disabled={disabled}
            aria-describedby={cn(descriptionId, ariaDescribedBy) || undefined}
            onChange={handleChange}
            className={cn(
              "peer h-4 w-4 cursor-pointer appearance-none rounded border border-border bg-surface transition-colors motion-reduce:transition-none",
              "hover:border-accent checked:border-accent checked:bg-accent indeterminate:border-accent indeterminate:bg-accent",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            {...props}
          />
          <Check
            aria-hidden="true"
            strokeWidth={3}
            className="pointer-events-none absolute inset-0 m-auto h-3 w-3 text-accent-fg opacity-0 peer-checked:opacity-100 peer-indeterminate:opacity-0"
          />
          <Minus
            aria-hidden="true"
            strokeWidth={3}
            className="pointer-events-none absolute inset-0 m-auto h-3 w-3 text-accent-fg opacity-0 peer-indeterminate:opacity-100"
          />
        </span>
        {(label || description) && (
          <div className="min-w-0 flex-1">
            {label && (
              <label
                htmlFor={inputId}
                className={cn(
                  "text-sm font-medium text-fg",
                  disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p id={descriptionId} className="text-xs leading-relaxed text-muted">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export type CheckboxChipSize = "sm" | "md" | "lg";

export interface CheckboxChipProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "size" | "checked" | "defaultChecked" | "children"
  > {
  /** Chip text; also the accessible name. */
  label: ReactNode;
  /** Optional leading icon shown when unchecked (a check replaces it when checked). */
  icon?: ReactNode;
  /** Controlled checked state. */
  checked?: boolean;
  /** Initial checked state when uncontrolled. */
  defaultChecked?: boolean;
  /** Called with the new checked state. */
  onCheckedChange?: (checked: boolean) => void;
  /** Chip size. Default `md`; `lg` gives a 40px touch target. */
  size?: CheckboxChipSize;
  /** Hover hint, shown on the visible pill (not the hidden input). */
  title?: string;
}

const chipSizeClasses: Record<CheckboxChipSize, string> = {
  sm: "h-7 px-2.5 text-xs gap-1",
  md: "h-8 px-3 text-sm gap-1.5",
  lg: "h-10 px-4 text-sm gap-1.5",
};

/** Pill-shaped option toggle backed by a real (visually hidden) checkbox. */
export const CheckboxChip = forwardRef<HTMLInputElement, CheckboxChipProps>(
  (
    {
      label,
      icon,
      checked,
      defaultChecked = false,
      onCheckedChange,
      onChange,
      size = "md",
      disabled,
      className,
      title,
      ...props
    },
    ref
  ) => {
    const [internal, setInternal] = useState(defaultChecked);
    const isChecked = checked ?? internal;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (checked === undefined) setInternal(event.target.checked);
      onChange?.(event);
      onCheckedChange?.(event.target.checked);
    };

    return (
      <label
        title={title}
        className={cn(
          "inline-flex select-none items-center rounded-full border font-medium transition-colors motion-reduce:transition-none",
          "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-bg",
          isChecked
            ? "border-accent bg-accent-soft text-accent"
            : "border-border bg-surface text-fg hover:border-accent",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          chipSizeClasses[size],
          className
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          className="sr-only"
          checked={isChecked}
          disabled={disabled}
          onChange={handleChange}
          {...props}
        />
        {isChecked ? (
          <Check aria-hidden="true" className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
        ) : (
          icon && <span aria-hidden="true" className="inline-flex shrink-0">{icon}</span>
        )}
        <span>{label}</span>
      </label>
    );
  }
);
CheckboxChip.displayName = "CheckboxChip";
