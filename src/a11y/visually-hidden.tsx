import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Become visible when focused (for "skip to content" links placed inside).
   * Default false.
   */
  focusable?: boolean;
}

/** Content readable by screen readers but hidden visually (`sr-only`). */
export const VisuallyHidden = forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  ({ focusable = false, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "sr-only",
        focusable &&
          "focus-within:not-sr-only focus-within:absolute focus-within:z-50 focus-within:rounded-lg focus-within:bg-surface focus-within:p-2 focus-within:text-fg focus-within:shadow-sm",
        className
      )}
      {...props}
    />
  )
);
VisuallyHidden.displayName = "VisuallyHidden";
