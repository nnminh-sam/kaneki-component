import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";
import { badgeClasses, type BadgeVariant } from "../classes";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Colour variant. Default "default". */
  variant?: BadgeVariant;
  /** Badge text. */
  children: ReactNode;
  /** Optional leading icon. */
  icon?: ReactNode;
}

/** Small pill label. Use `badgeClasses()` to style other elements the same way. */
export function Badge({ variant = "default", icon, className, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeClasses({ variant }), className)} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
