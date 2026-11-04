"use client";

import { forwardRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../utils/cn";

export type ChipVariant = "default" | "accent";
export type ChipSize = "sm" | "md" | "lg";

export interface ChipProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-pressed"> {
  /** Visual style. Default `default`. */
  variant?: ChipVariant;
  /** Chip size: sm 28px, md 32px, lg 40px (touch target). Default `md`. */
  size?: ChipSize;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Controlled pressed state. Setting `pressed`, `defaultPressed` or `onPressedChange` makes it a toggle (aria-pressed); otherwise it is an action chip. */
  pressed?: boolean;
  /** Initial pressed state when uncontrolled. */
  defaultPressed?: boolean;
  /** Called with the new pressed state when toggled. */
  onPressedChange?: (pressed: boolean) => void;
}

const sizeClasses: Record<ChipSize, string> = {
  sm: "h-7 px-2.5 text-xs gap-1",
  md: "h-8 px-3 text-sm gap-1.5",
  lg: "h-10 px-4 text-sm gap-2",
};

const variantClasses: Record<ChipVariant, { off: string; on: string }> = {
  default: {
    off: "border-border bg-surface text-fg hover:border-accent",
    on: "border-accent bg-accent-soft text-accent",
  },
  accent: {
    off: "border-transparent bg-accent-soft text-accent hover:border-accent",
    on: "border-accent bg-accent text-accent-fg",
  },
};

/** Pill button used as a toggle chip or a quick-action chip. */
export const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  (
    {
      variant = "default",
      size = "md",
      icon,
      pressed,
      defaultPressed,
      onPressedChange,
      onClick,
      type = "button",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isToggle =
      pressed !== undefined || defaultPressed !== undefined || onPressedChange !== undefined;
    const [internal, setInternal] = useState(defaultPressed ?? false);
    const isPressed = isToggle && (pressed ?? internal);

    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={isToggle ? isPressed : undefined}
        onClick={(event) => {
          onClick?.(event);
          if (!isToggle || event.defaultPrevented) return;
          const next = !isPressed;
          if (pressed === undefined) setInternal(next);
          onPressedChange?.(next);
        }}
        className={cn(
          "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-full border font-medium transition-colors motion-reduce:transition-none",
          "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isPressed ? variantClasses[variant].on : variantClasses[variant].off,
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {icon && (
          <span aria-hidden="true" className="inline-flex shrink-0">
            {icon}
          </span>
        )}
        {children}
      </button>
    );
  }
);
Chip.displayName = "Chip";
