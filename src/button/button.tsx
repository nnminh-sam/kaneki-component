"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "warn"
  | "success";

export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:brightness-110 active:scale-[0.98] shadow-xs disabled:opacity-50",
  secondary:
    "bg-surface-subtle text-fg border border-border hover:bg-surface hover:border-accent active:scale-[0.98] disabled:opacity-50",
  outline:
    "bg-transparent text-fg border border-border hover:border-accent hover:bg-surface-subtle active:scale-[0.98] disabled:opacity-50",
  ghost:
    "bg-transparent text-fg hover:bg-surface-subtle active:scale-[0.98] disabled:opacity-50",
  danger:
    "bg-danger text-white hover:brightness-110 active:scale-[0.98] shadow-xs disabled:opacity-50",
  warn:
    "bg-warn text-white hover:brightness-110 active:scale-[0.98] shadow-xs disabled:opacity-50",
  success:
    "bg-ok text-white hover:brightness-110 active:scale-[0.98] shadow-xs disabled:opacity-50",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "px-2 py-1 text-xs gap-1 rounded-md",
  sm: "px-3 py-1.5 text-xs font-medium gap-1.5 rounded-lg",
  md: "px-4 py-2 text-sm font-medium gap-2 rounded-lg",
  lg: "px-5 py-2.5 text-base font-medium gap-2.5 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer disabled:cursor-not-allowed select-none ${
          variantClasses[variant]
        } ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export interface SubmitButtonProps extends ButtonProps {
  pendingText?: string;
  isPending?: boolean;
}

export function SubmitButton({
  children,
  pendingText,
  isPending = false,
  isLoading,
  disabled,
  ...props
}: SubmitButtonProps) {
  const pending = isLoading ?? isPending;

  return (
    <Button
      type="submit"
      isLoading={pending}
      disabled={disabled || pending}
      {...props}
    >
      {pending && pendingText ? pendingText : children}
    </Button>
  );
}
